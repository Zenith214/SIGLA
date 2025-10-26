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

  const prompt = `
You are an expert governance analyst tasked with creating an executive summary and action plan for a Philippine barangay based on survey data.

IMPORTANT: The service scores use a cascading funnel methodology:
- Awareness is calculated from all respondents
- Availment is calculated only from aware respondents (denominator = aware count)
- Satisfaction is calculated only from respondents who availed services (denominator = availed count)
This reflects the true service delivery journey and provides more accurate metrics.

BARANGAY INFORMATION:
- Name: ${data.barangay.barangay_name}
- Population: ${data.barangay.population?.toLocaleString() || 'N/A'}
- Households: ${data.barangay.households?.toLocaleString() || 'N/A'}
- Survey Cycle: ${data.cycle.name} (${data.cycle.year})

SURVEY DATA:
- Total Respondents: ${data.responseCount}
- Demographics: ${JSON.stringify(data.analysis.demographics, null, 2)}

SERVICE AREA SCORES (Cascading Funnel):
${Object.entries(data.analysis.serviceScores).map(([service, scores]: [string, any]) => {
  const awareness = scores.awareness.percentage !== null ? `${scores.awareness.percentage}%` : 'N/A';
  const availment = scores.availment.percentage !== null ? `${scores.availment.percentage}%` : 'N/A';
  const satisfaction = scores.satisfaction.percentage !== null ? `${scores.satisfaction.percentage}%` : 'N/A';
  
  return `- ${service}:
    * Awareness: ${awareness} (${scores.awareness.count}/${scores.awareness.total} respondents)
    * Availment: ${availment} (${scores.availment.count}/${scores.availment.total} aware respondents)
    * Satisfaction: ${satisfaction} (${scores.satisfaction.count}/${scores.satisfaction.total} availed respondents)`;
}).join('\n')}

IDENTIFIED ISSUES:
${data.analysis.commonIssues.map((issue: any) => 
  `- ${issue.service}: ${issue.score}% satisfaction (${issue.severity} priority)`
).join('\n') || 'None identified'}

STRENGTHS:
${data.analysis.strengths.map((strength: any) => 
  `- ${strength.service}: ${strength.score}% satisfaction`
).join('\n') || 'None identified'}

Please provide a comprehensive analysis in the following JSON format:

{
  "executiveSummary": "A 3-4 paragraph executive summary highlighting key findings, overall performance, critical issues, and strengths",
  "keyFindings": [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  "criticalIssues": [
    {
      "issue": "Issue description",
      "impact": "High/Medium/Low",
      "affectedArea": "Service area name",
      "recommendation": "Specific recommendation"
    }
  ],
  "actionPlan": {
    "immediate": [
      {
        "action": "Specific action to take",
        "timeline": "1-3 months",
        "priority": "High/Medium/Low",
        "resources": "Required resources",
        "expectedOutcome": "Expected result"
      }
    ],
    "shortTerm": [
      {
        "action": "Specific action to take",
        "timeline": "3-6 months",
        "priority": "High/Medium/Low",
        "resources": "Required resources",
        "expectedOutcome": "Expected result"
      }
    ],
    "longTerm": [
      {
        "action": "Specific action to take",
        "timeline": "6-12 months",
        "priority": "High/Medium/Low",
        "resources": "Required resources",
        "expectedOutcome": "Expected result"
      }
    ]
  },
  "recommendations": {
    "governance": ["Recommendation 1", "Recommendation 2"],
    "serviceDelivery": ["Recommendation 1", "Recommendation 2"],
    "communityEngagement": ["Recommendation 1", "Recommendation 2"]
  },
  "successMetrics": [
    {
      "metric": "Metric name",
      "target": "Target value",
      "timeline": "When to measure"
    }
  ]
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
