/**
 * Gemini AI Executive Summary Generator
 * Generates comprehensive executive summaries and action plans
 * based on survey data for a specific barangay
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';
import { getCachedOrCompute } from '@/lib/ml-cache';
import { getGeminiApiKey, logTokenUsage, estimateTokens, checkTokenLimit } from '@/lib/gemini-config';
import { calculateServiceFunnelMetrics, ServiceFunnelMetrics } from '@/lib/funnel-calculations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barangayId, cycleId, forceRefresh } = body;

    if (!barangayId || !cycleId) {
      return NextResponse.json(
        { error: 'barangayId and cycleId are required' },
        { status: 400 }
      );
    }

    console.log(`🤖 [GEMINI] Generating executive summary for Barangay ${barangayId}, Cycle ${cycleId}`);

    // Check if survey is complete (100% progress) before generating summary
    const { data: surveyTarget, error: targetError } = await supabaseAdmin
      .from('survey_target')
      .select('percentage')
      .eq('barangay_id', barangayId)
      .eq('survey_cycle_id', cycleId)
      .single();

    if (targetError && targetError.code !== 'PGRST116') {
      console.error('Error checking survey progress:', targetError);
    }

    const progress = surveyTarget?.percentage || 0;

    // If survey is not complete, return a special response
    if (progress < 100) {
      console.log(`⏳ [GEMINI] Survey not complete for barangay ${barangayId} - Progress: ${progress}%`);
      return NextResponse.json({
        success: false,
        surveyIncomplete: true,
        progress: progress,
        message: `Survey is ${progress}% complete. Executive summary will be available when survey reaches 100% completion.`,
        barangay_id: barangayId,
        cycle_id: cycleId
      });
    }

    console.log(`✅ [GEMINI] Survey complete (${progress}%) - Proceeding with AI generation`);

    // Use caching with 7-day TTL (executive summaries don't change often)
    const result = await getCachedOrCompute(
      'ai-executive-summary',
      { barangayId: parseInt(barangayId), cycleId: parseInt(cycleId) },
      async () => {
        // Fetch all necessary data for the barangay
        const data = await fetchBarangayData(barangayId, cycleId);

        // Generate AI summary using Gemini
        const aiSummary = await generateAISummary(data);

        return {
          barangay_id: barangayId,
          cycle_id: cycleId,
          ...aiSummary,
          generated_at: new Date().toISOString()
        };
      },
      {
        ttl: 604800, // 7 days
        staleWhileRevalidate: true,
        forceRefresh: forceRefresh || false
      }
    );

    console.log(`✅ [GEMINI] Executive summary ${result.cached ? 'retrieved from cache' : 'generated'}`);

    return NextResponse.json({
      success: true,
      data: result.data,
      _cache: {
        cached: result.cached,
        stale: result.stale,
        computedAt: result.computedAt,
        expiresAt: result.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ [GEMINI] Error generating executive summary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate executive summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchBarangayData(barangayId: number, cycleId: number) {
  console.log(`📊 [GEMINI] Fetching data for Barangay ${barangayId}...`);

  // Fetch barangay info
  const { data: barangay, error: barangayError } = await supabaseAdmin
    .from('barangay')
    .select('*')
    .eq('barangay_id', barangayId)
    .single();

  if (barangayError) throw new Error('Failed to fetch barangay data');

  // Fetch survey responses
  const { data: responses, error: responsesError } = await supabaseAdmin
    .from('survey_response')
    .select(`
      response_id,
      status,
      submitted_at,
      respondent_age,
      respondent_gender,
      respondent_educational_attainment,
      respondent_household_income,
      survey_section (
        section_key,
        data
      )
    `)
    .eq('barangay_id', barangayId)
    .eq('survey_cycle_id', cycleId)
    .in('status', ['completed', 'submitted']);

  if (responsesError) throw new Error('Failed to fetch survey responses');

  // Fetch cycle info
  const { data: cycle, error: cycleError } = await supabaseAdmin
    .from('survey_cycle')
    .select('*')
    .eq('cycle_id', cycleId)
    .single();

  if (cycleError) throw new Error('Failed to fetch cycle data');

  // Analyze survey data
  const analysis = analyzeSurveyData(responses || []);

  return {
    barangay,
    cycle,
    responses: responses || [],
    responseCount: responses?.length || 0,
    analysis
  };
}

function analyzeSurveyData(responses: any[]) {
  const serviceAreas = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
  const analysis: any = {
    demographics: {
      totalRespondents: responses.length,
      ageGroups: {},
      genderDistribution: {},
      educationLevels: {},
      incomeGroups: {}
    },
    serviceScores: {},
    commonIssues: [],
    strengths: []
  };

  // Analyze demographics
  responses.forEach(r => {
    if (r.respondent_age) {
      const ageGroup = getAgeGroup(r.respondent_age);
      analysis.demographics.ageGroups[ageGroup] = (analysis.demographics.ageGroups[ageGroup] || 0) + 1;
    }
    if (r.respondent_gender) {
      analysis.demographics.genderDistribution[r.respondent_gender] = 
        (analysis.demographics.genderDistribution[r.respondent_gender] || 0) + 1;
    }
    if (r.respondent_educational_attainment) {
      analysis.demographics.educationLevels[r.respondent_educational_attainment] = 
        (analysis.demographics.educationLevels[r.respondent_educational_attainment] || 0) + 1;
    }
    if (r.respondent_household_income) {
      analysis.demographics.incomeGroups[r.respondent_household_income] = 
        (analysis.demographics.incomeGroups[r.respondent_household_income] || 0) + 1;
    }
  });

  // Analyze service areas
  serviceAreas.forEach(service => {
    const serviceResponses = responses.filter(r => 
      r.survey_section?.some((s: any) => s.section_key === service)
    );

    if (serviceResponses.length > 0) {
      const scores = calculateServiceScores(serviceResponses, service);
      analysis.serviceScores[service] = scores;

      // Identify issues and strengths based on satisfaction percentage
      const satisfactionPct = scores.satisfaction.percentage;
      if (satisfactionPct !== null) {
        if (satisfactionPct < 60) {
          analysis.commonIssues.push({
            service,
            score: satisfactionPct,
            severity: 'high'
          });
        } else if (satisfactionPct >= 75) {
          analysis.strengths.push({
            service,
            score: satisfactionPct
          });
        }
      }
    }
  });

  return analysis;
}

function getAgeGroup(age: number): string {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

function calculateServiceScores(responses: any[], serviceKey: string): ServiceFunnelMetrics {
  // Use the shared funnel calculation logic
  return calculateServiceFunnelMetrics(responses, serviceKey);
}

async function generateAISummary(data: any) {
  console.log(`🤖 [GEMINI] Calling Gemini AI...`);

  // Check token limit before generating
  const limitCheck = await checkTokenLimit();
  if (!limitCheck.withinLimit) {
    throw new Error(`Token limit reached: ${limitCheck.tokensUsed}/${limitCheck.tokensLimit} tokens used`);
  }

  // Get API key from database or environment
  const apiKey = await getGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-2.5-flash - the latest stable model
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Prepare service data with MoE for the prompt
  const serviceDataWithMoE = Object.entries(data.analysis.serviceScores).map(([service, scores]: [string, any]) => {
    const satisfactionScore = scores.satisfaction.percentage !== null ? scores.satisfaction.percentage / 100 : null;
    const needForActionScore = scores.needForAction?.percentage !== null ? scores.needForAction.percentage / 100 : null;
    const sampleSize = scores.satisfaction.total || 0;
    const moe = sampleSize > 0 ? 0.98 / Math.sqrt(sampleSize) : 0;

    return {
      service_indicator: service,
      satisfaction: {
        score: satisfactionScore,
        moe: moe
      },
      need_for_action: {
        score: needForActionScore,
        moe: moe
      },
      sample_size: sampleSize
    };
  });

  const prompt = `### ROLE ###
You are an expert data analyst and policy advisor for the Department of the Interior and Local Government (DILG) in the Philippines. You specialize in interpreting Citizen Satisfaction Index System (CSIS) data and writing concise, actionable executive summaries for Local Government Unit (LGU) officials.

### CONTEXT ###
The CSIS measures citizen feedback on LGU services. The goal of this summary is to quickly inform the LGU of its key strengths and critical weaknesses so they can create an effective Citizen Priority Action Plan (CPAP).

### CRITERIA FOR ANALYSIS ###

# 1. Critical Criterion: The Dynamic Cut-Off Rule
To classify any score as "High" or "Low," you MUST NOT use a fixed percentage. You must use the official CSIS Dynamic Cut-Off Algorithm.

Follow these steps precisely for each score (satisfaction and need_for_action):

1. Identify the Inputs: For each score, you will be given the Percentage Score and its MoE (Margin of Error).
2. Calculate the Cut-off: Cut-off = 0.50 + MoE
3. Assign the Rating:
   - If a Percentage Score is greater than or equal to the calculated Cut-off, the rating is "High".
   - If a Percentage Score is less than the calculated Cut-off, the rating is "Low".

# 2. Prioritization Logic: The Official Action Grid Quadrants
After determining the "High" or "Low" ratings for both Satisfaction and Need for Action, you must categorize each service into one of the four official Action Grid quadrants using the exact terminology below.

- "Opportunities for Improvement" (Highest Priority):
  Condition: Satisfaction is "Low" AND Need for Action is "High".

- "Continued Emphasis" (High Importance):
  Condition: Satisfaction is "High" AND Need for Action is "High".

- "Exceeded Expectations" (Key Strength):
  Condition: Satisfaction is "High" AND Need for Action is "Low".

- "Secondary Priority" (Lowest Priority):
  Condition: Satisfaction is "Low" AND Need for Action is "Low".

### TASK ###
Using the input data, perform the following for each service indicator:

1. Apply the Dynamic Cut-Off Rule to determine the adjectival ratings ("High" or "Low") for both its Satisfaction and Need for Action scores, using the provided MoE for each.
2. Use these ratings to classify the service into its correct Action Grid Quadrant.
3. Write a professional and easy-to-understand Executive Summary for an LGU Mayor. The summary must:
   - Start with a brief overview of the LGU's performance.
   - Clearly identify and celebrate the Key Strengths (services in the "Exceeded Expectations" quadrant).
   - Emphasize and detail the Critical Priorities (services in the "Opportunities for Improvement" quadrant), explaining that these are the areas requiring the most urgent attention.
   - Conclude with a forward-looking statement, recommending that the LGU focus its planning and resources on the identified "Opportunities for Improvement" when creating their CPAP.

### BARANGAY INFORMATION ###
- Name: ${data.barangay.barangay_name}
- Population: ${data.barangay.population?.toLocaleString() || 'N/A'}
- Households: ${data.barangay.households?.toLocaleString() || 'N/A'}
- Survey Cycle: ${data.cycle.name} (${data.cycle.year})
- Total Respondents: ${data.responseCount}

### DATA FOR ANALYSIS ###
${JSON.stringify(serviceDataWithMoE, null, 2)}

Note: The MoE is calculated as 0.98 / sqrt(n), where n is the sample size for each service indicator.

### OUTPUT FORMAT ###
Provide your analysis in the following JSON format:

{
  "executiveSummary": "A 3-4 paragraph executive summary following the structure described in the TASK section above",
  "serviceAnalysis": [
    {
      "service": "Service name",
      "satisfactionScore": 0.75,
      "satisfactionMoE": 0.155,
      "satisfactionCutoff": 0.655,
      "satisfactionRating": "High",
      "needForActionScore": 0.375,
      "needForActionMoE": 0.155,
      "needForActionCutoff": 0.655,
      "needForActionRating": "Low",
      "actionGridQuadrant": "Exceeded Expectations",
      "priority": "Key Strength"
    }
  ],
  "keyStrengths": [
    "Service 1 - Exceeded Expectations with high satisfaction and low need for action",
    "Service 2 - Continued Emphasis with high satisfaction and high need for action"
  ],
  "criticalPriorities": [
    {
      "service": "Service name",
      "quadrant": "Opportunities for Improvement",
      "issue": "Detailed description of the issue",
      "recommendation": "Specific actionable recommendation"
    }
  ],
  "actionPlan": {
    "immediate": [
      {
        "action": "Specific action to take",
        "timeline": "1-3 months",
        "priority": "High",
        "targetService": "Service name",
        "expectedOutcome": "Expected result"
      }
    ],
    "shortTerm": [
      {
        "action": "Specific action to take",
        "timeline": "3-6 months",
        "priority": "Medium",
        "targetService": "Service name",
        "expectedOutcome": "Expected result"
      }
    ]
  },
  "cpapRecommendation": "A forward-looking statement recommending focus areas for the CPAP based on the Opportunities for Improvement quadrant"
}

Provide ONLY the JSON response, no additional text.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log(`✅ [GEMINI] AI response received`);

  // Estimate and log token usage
  const estimatedTokens = estimateTokens(prompt + text);
  await logTokenUsage(
    'executive-summary',
    estimatedTokens,
    data.barangay.barangay_id,
    data.cycle.cycle_id,
    'generation'
  );
  console.log(`📊 [GEMINI] Estimated tokens used: ${estimatedTokens}`);

  // Parse JSON response
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResponse = JSON.parse(cleanText);
    return aiResponse;
  } catch (parseError) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to parse AI response');
  }
}
