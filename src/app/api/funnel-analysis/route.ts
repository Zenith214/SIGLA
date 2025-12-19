import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const useML = searchParams.get('useML') === 'true';
    const includeNonAwardees = searchParams.get('include_non_awardees') === 'true';

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId parameter is required" },
        { status: 400 }
      );
    }

    // Get the active survey cycle ID
    const activeCycleId = await getActiveCycleId();
    
    if (!activeCycleId) {
      // If no active cycle, return zero data
      return NextResponse.json({
        barangay_id: parseInt(barangayId),
        total_responses: 0,
        service_scores: {},
        action_grid: {},
        overall_satisfaction: 0,
        ml_enhanced: false,
        message: "No active survey cycle found"
      });
    }

    // Check if the barangay is an awardee (unless explicitly including non-awardees)
    if (!includeNonAwardees) {
      const isAwardee = await CycleAwardsService.isBarangayAwardee(parseInt(barangayId), activeCycleId);
      if (!isAwardee) {
        return NextResponse.json({
          barangay_id: parseInt(barangayId),
          total_responses: 0,
          service_scores: {},
          action_grid: {},
          overall_satisfaction: 0,
          ml_enhanced: false,
          message: "Analysis is only available for awardee barangays"
        });
      }
    }

    // If ML is requested, try to get ML-enhanced results first
    if (useML) {
      try {
        const mlResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${activeCycleId}`);
        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          // Add ML flag to indicate this is ML-enhanced data
          mlData.ml_enhanced = true;
          return NextResponse.json(mlData);
        }
      } catch (mlError) {
        console.warn('ML analysis failed, falling back to basic analysis:', mlError);
      }
    }

    // Fallback to basic funnel analysis - filter by active cycle
    const surveyQuery = `
      SELECT
        sr.response_id,
        sr.survey_number,
        ss.section_name,
        ss.section_key,
        ss.data as section_data
      FROM survey_response sr
      JOIN survey_section ss ON sr.response_id = ss.response_id
      WHERE sr.barangay_id = $1 AND sr.survey_cycle_id = $2 AND sr.status IN ('completed', 'submitted')
      ORDER BY sr.created_at DESC
    `;

    const surveyResult = await client.query(surveyQuery, [parseInt(barangayId), activeCycleId]);
    const surveyData = surveyResult.rows;
    
    // Count unique respondents (not section records)
    const uniqueRespondents = [...new Set(surveyData.map(row => row.response_id))].length;

    if (surveyData.length === 0) {
      return NextResponse.json({
        barangay_id: parseInt(barangayId),
        total_responses: 0,
        service_scores: {},
        action_grid: {},
        overall_satisfaction: 0,
        ml_enhanced: false,
        message: "No survey data found for this barangay"
      });
    }

    // Process survey data to calculate funnel scores
    const serviceScores = await calculateServiceScores(surveyData, client, barangayId, activeCycleId);

    // Calculate Action Grid classifications
    const actionGrid = calculateActionGrid(serviceScores);

    // Calculate overall satisfaction
    const validScores = Object.values(serviceScores).filter((score: any) =>
      score.satisfaction_score !== null && score.satisfaction_score !== undefined
    );

    const overallSatisfaction = validScores.length > 0
      ? Math.round(validScores.reduce((sum: number, score: any) => sum + score.satisfaction_score, 0) / validScores.length)
      : 0;

    return NextResponse.json({
      barangay_id: parseInt(barangayId),
      total_responses: uniqueRespondents,  // Now counts unique people, not sections
      total_section_responses: surveyData.length,  // Keep section count for reference
      service_scores: serviceScores,
      action_grid: actionGrid,
      overall_satisfaction: overallSatisfaction,
      ml_enhanced: false,
      data_quality: {
        total_responses: uniqueRespondents,  // Unique respondents
        total_section_responses: surveyData.length,  // Section records
        services_with_data: Object.keys(serviceScores).length,
        average_sections_per_respondent: Math.round(surveyData.length / Math.max(uniqueRespondents, 1))
      }
    });

  } catch (error) {
    console.error("Error in funnel analysis:", error);
    return NextResponse.json(
      { error: "Failed to calculate funnel analysis" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function calculateServiceScores(surveyData: any[], client: any, barangayId: string, activeCycleId: number): Promise<{ [key: string]: any }> {
  const serviceScores: { [key: string]: any } = {};

  // Group data by section
  const sectionsData: { [key: string]: any[] } = {};

  surveyData.forEach(row => {
    const sectionKey = row.section_key;
    if (!sectionsData[sectionKey]) {
      sectionsData[sectionKey] = [];
    }
    sectionsData[sectionKey].push(row);
  });

  // Calculate scores for each section
  for (const [sectionKey, responses] of Object.entries(sectionsData)) {
    // Skip demographics section - it doesn't have service scores
    if (sectionKey === 'respondent_demographics' || sectionKey === 'respondent demographics') {
      continue;
    }
    
    // Handle "overall" section specially as it has different question structure
    if (sectionKey === 'overall') {
      const overallScores = await calculateOverallSectionScores(responses, client, parseInt(barangayId), activeCycleId);
      if (overallScores) {
        serviceScores[sectionKey] = overallScores;
      }
      continue;
    }
    
    const scores = calculateSectionScores(responses);
    if (scores) {
      serviceScores[sectionKey] = scores;
    }
  }

  return serviceScores;
}

function calculateSectionScores(responses: any[]): any {
  if (responses.length === 0) return null;

  let awarenessCount = 0;
  let availmentCount = 0;
  let satisfactionSum = 0;
  let needActionCount = 0;
  let totalAwarenessQuestions = 0;
  let totalAvailmentQuestions = 0;
  let totalSatisfactionQuestions = 0;
  let totalNeedActionQuestions = 0;

  // Track unique respondents who availed (for correct satisfaction denominator)
  const respondentsWhoAvailed = new Set<string>();
  const respondentsWhoAreSatisfied = new Set<string>();
  
  // Debug: Track satisfaction questions found
  const satisfactionQuestionsFound: any[] = [];
  
  // Collect quotes and concerns
  const quotes: { awareness: string[], availment: string[], satisfaction: string[] } = {
    awareness: [],
    availment: [],
    satisfaction: []
  };
  const concerns: string[] = [];

  // Define which services belong to which section
  const sectionServiceMap: Record<string, string[]> = {
    financial: ['projects', 'financial', 'corruption'],
    disaster: ['disasterinfo', 'evacuation'],
    safety: ['tanods', 'lupon', 'antidrug'],
    social: ['socialprograms', 'healthservices', 'womenchildrenprotection', 'communityparticipation'],
    business: ['businessclearance'],
    environmental: ['wastemanagement', 'environmentalprograms']
  };
  
  // Get the section key from first response
  const currentSection = responses[0]?.section_key?.toLowerCase() || '';
  const validServices = sectionServiceMap[currentSection] || [];
  
  console.log(`🔍 [FUNNEL] Section: ${currentSection}, Valid services:`, validServices);
  
  // Helper function to check if a key belongs to this section
  const belongsToSection = (key: string): boolean => {
    const keyLower = key.toLowerCase();
    const belongs = validServices.some(service => keyLower.includes(service));
    if (keyLower.includes('satisfaction') && Math.random() < 0.05) {
      console.log(`🔍 [FUNNEL] Checking key "${key}": belongs=${belongs}`);
    }
    return belongs;
  };

  // Process each response
  responses.forEach(response => {
    try {
      const data = typeof response.section_data === 'string'
        ? JSON.parse(response.section_data)
        : response.section_data;

      // Count awareness questions (questions containing 'aware') - only for this section's services
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('aware') && belongsToSection(key)) {
          totalAwarenessQuestions++;
          // Handle various positive response formats
          const stringValue = String(value).toLowerCase();
          if (value === 1 || value === true || value === '1' || 
              stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true') {
            awarenessCount++;
          }
        }
      });

      // Count availment questions (questions indicating usage/participation/experience) - only for this section's services
      // Also track which respondents availed (for satisfaction denominator)
      let respondentAvailed = false;
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        const keyLower = key.toLowerCase();
        const hasAvailmentKeyword = keyLower.includes('avail') || keyLower.includes('experience') || 
            keyLower.includes('benefited') || keyLower.includes('participated') || 
            keyLower.includes('used') || keyLower.includes('accessed') ||
            keyLower.includes('utilized') || keyLower.includes('received') || keyLower.includes('obtained');
        
        if (hasAvailmentKeyword && belongsToSection(key)) {
          totalAvailmentQuestions++;
          // Handle various positive response formats
          const stringValue = String(value).toLowerCase();
          if (value === 1 || value === true || value === '1' || 
              stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true') {
            availmentCount++;
            respondentAvailed = true; // This respondent availed at least one service in this section
            
            // Debug logging for business section
            if (currentSection === 'business' && Math.random() < 0.1) {
              console.log(`🔍 [FUNNEL AVAILMENT] Business availment found:`, { key, value, respondentAvailed });
            }
          }
        }
      });
      
      // Track this respondent as someone who availed
      if (respondentAvailed) {
        respondentsWhoAvailed.add(response.response_id);
      }

      // Count satisfaction questions (questions containing 'satisf') - only for this section's services
      // IMPORTANT: Satisfaction is calculated from those who AVAILED, not total questions
      // Track if THIS respondent is satisfied (at least one "Yes" to satisfaction questions)
      let respondentSatisfied = false;
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('satisf') && belongsToSection(key)) {
          totalSatisfactionQuestions++;
          
          // Handle binary Yes/No format (new)
          const stringValue = String(value).toLowerCase();
          if (stringValue.includes('yes') || stringValue.includes('oo')) {
            satisfactionSum++; // Count as satisfied
            respondentSatisfied = true; // This respondent is satisfied
            satisfactionQuestionsFound.push({ key, value, satisfied: true, format: 'binary' });
          } else if (stringValue.includes('no') || stringValue.includes('hindi')) {
            // Count as not satisfied (don't increment satisfactionSum)
            satisfactionQuestionsFound.push({ key, value, satisfied: false, format: 'binary' });
          } else {
            // Handle legacy 1-5 scale format
            const numValue = typeof value === 'string' ? parseInt(value) : value;
            if ((typeof numValue === 'number' || typeof value === 'number') &&
                numValue >= 1 && numValue <= 5) {
              // Convert to binary: 4-5 = satisfied, 1-3 = not satisfied
              if (numValue >= 4) {
                satisfactionSum++;
                respondentSatisfied = true;
              }
              satisfactionQuestionsFound.push({ key, value, numValue, satisfied: numValue >= 4, format: 'numeric' });
            }
          }
        }
      });
      
      // Track this respondent as satisfied if they answered "Yes" to any satisfaction question
      if (respondentSatisfied && respondentAvailed) {
        respondentsWhoAreSatisfied.add(response.response_id);
      }

      // Count need for action using binary fields only - only for this section's services
      // Field naming pattern: need_for_action_binary_{indicator}
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if ((key.startsWith('need_for_action_binary_') || key.startsWith('nfaBinary')) && belongsToSection(key)) {
          totalNeedActionQuestions++;
          // Check for "Yes" (English) or "Oo" (Tagalog)
          const stringValue = String(value).toLowerCase().trim();
          if (stringValue === 'yes' || stringValue === 'oo') {
            needActionCount++;
          }
        }
      });

      // Extract quotes from suggestion fields
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'string' && value.trim() !== '') {
          // Suggestions are concerns/feedback
          if (key.toLowerCase().includes('suggestion') || key.toLowerCase().includes('comment')) {
            concerns.push(value.trim());
            
            // Categorize by stage based on context
            if (key.toLowerCase().includes('awareness') || awarenessCount < totalAwarenessQuestions * 0.5) {
              quotes.awareness.push(value.trim());
            } else if (key.toLowerCase().includes('availment') || key.toLowerCase().includes('access')) {
              quotes.availment.push(value.trim());
            } else {
              quotes.satisfaction.push(value.trim());
            }
          }
        }
      });

    } catch (error) {
      console.warn('Error parsing section data:', error);
    }
  });

  // Calculate percentages
  const awarenessScore = totalAwarenessQuestions > 0
    ? Math.round((awarenessCount / totalAwarenessQuestions) * 100)
    : 0;

  const availmentScore = totalAvailmentQuestions > 0
    ? Math.round((availmentCount / totalAvailmentQuestions) * 100)
    : 0;

  // CORRECT: Satisfaction = (number_of_satisfied_respondents / number_of_respondents_who_availed) * 100
  // Use unique respondents who availed as denominator (not total availment question count)
  // This is the correct denominator per the formula documentation
  const satisfactionScore = respondentsWhoAvailed.size > 0
    ? Math.round((respondentsWhoAreSatisfied.size / respondentsWhoAvailed.size) * 100)
    : 0;

  // Need for Action is also calculated from those who availed
  const needActionScore = availmentCount > 0
    ? Math.round((needActionCount / availmentCount) * 100)
    : 0;

  // Identify bottleneck (lowest score in the funnel)
  const funnelStages = [
    { stage: 'awareness', score: awarenessScore },
    { stage: 'availment', score: availmentScore },
    { stage: 'satisfaction', score: satisfactionScore }
  ];
  const bottleneck = funnelStages.reduce((min, current) => 
    current.score < min.score ? current : min
  ).stage;

  // Generate recommendations based on bottleneck and scores
  const recommendations = generateRecommendations(
    awarenessScore,
    availmentScore,
    satisfactionScore,
    needActionScore,
    bottleneck
  );

  // Select representative quotes (one per stage) - use deterministic selection based on scores
  const awarenessIndex = quotes.awareness.length > 0 ? Math.floor(awarenessScore / 100 * quotes.awareness.length) % quotes.awareness.length : -1;
  const availmentIndex = quotes.availment.length > 0 ? Math.floor(availmentScore / 100 * quotes.availment.length) % quotes.availment.length : -1;
  const satisfactionIndex = quotes.satisfaction.length > 0 ? Math.floor(satisfactionScore / 100 * quotes.satisfaction.length) % quotes.satisfaction.length : -1;
  
  const selectedQuotes = {
    awareness: awarenessIndex >= 0 ? quotes.awareness[awarenessIndex] : 
               "More information campaigns needed about available services.",
    availment: availmentIndex >= 0 ? quotes.availment[availmentIndex] : 
               "The process to access services should be simplified.",
    satisfaction: satisfactionIndex >= 0 ? quotes.satisfaction[satisfactionIndex] : 
                  "Service quality needs improvement to better serve residents."
  };

  // Get top 3 most common concerns
  const topConcerns = getTopConcerns(concerns);

  // Debug logging for satisfaction calculation
  if (satisfactionQuestionsFound.length > 0 && Math.random() < 0.1) { // Log 10% of sections
    console.log('🔍 [FUNNEL ANALYSIS] Satisfaction Calculation:', {
      sectionKey: responses[0]?.section_key,
      totalSatisfactionQuestions,
      satisfactionSum,
      satisfactionScore,
      calculation: `((${satisfactionSum} / ${totalSatisfactionQuestions}) / 5) * 100 = ${satisfactionScore}%`,
      sampleQuestions: satisfactionQuestionsFound.slice(0, 3),
      needActionScore,
      totalNeedActionQuestions,
      needActionCount,
      bottleneck,
      topConcerns: topConcerns.length
    });
  }

  return {
    awareness_score: awarenessScore,
    availment_score: availmentScore,
    satisfaction_score: satisfactionScore,
    need_action_score: needActionScore,
    sample_size: responses.length,
    total_awareness_questions: totalAwarenessQuestions,
    total_availment_questions: totalAvailmentQuestions,
    total_satisfaction_questions: totalSatisfactionQuestions,
    total_need_action_questions: totalNeedActionQuestions,
    bottleneck: bottleneck,
    quotes: selectedQuotes,
    concerns: topConcerns,
    recommendations: recommendations
  };
}

async function calculateOverallSectionScores(responses: any[], client: any, barangayId: number, cycleId: number): Promise<any> {
  if (responses.length === 0) return null;

  // Get the target sample size from survey_target table
  let targetSampleSize = responses.length; // Default to actual responses
  try {
    const targetQuery = `
      SELECT target FROM survey_target 
      WHERE barangay_id = $1 AND survey_cycle_id = $2
    `;
    const targetResult = await client.query(targetQuery, [barangayId, cycleId]);
    if (targetResult.rows.length > 0 && targetResult.rows[0].target) {
      targetSampleSize = parseInt(targetResult.rows[0].target);
      console.log(`📊 [OVERALL] Using target sample size: ${targetSampleSize} for barangay ${barangayId}`);
    }
  } catch (error) {
    console.warn('Could not fetch target sample size, using response count:', error);
  }

  let satisfactionSum = 0;
  let satisfactionCount = 0;
  let needActionYesCount = 0;
  let needActionTotalCount = 0;

  // Process each response
  responses.forEach(response => {
    try {
      const data = typeof response.section_data === 'string'
        ? JSON.parse(response.section_data)
        : response.section_data;

      if (!data || typeof data !== 'object') return;

      // Process overallSatisfaction (M1 question)
      // NEW: binary "Yes"/"No" or "Oo"/"Hindi"
      // Count number of satisfied respondents (not sum of ratings)
      if (data.overallSatisfaction) {
        const satisfactionValue = String(data.overallSatisfaction).toLowerCase();
        
        // Check if it's the new binary format
        if (satisfactionValue.includes('yes') || satisfactionValue.includes('oo')) {
          // Binary "Yes" = satisfied
          satisfactionSum++; // Count as 1 satisfied respondent
          satisfactionCount++;
        } else if (satisfactionValue.includes('no') || satisfactionValue.includes('hindi')) {
          // Binary "No" = not satisfied
          // Don't increment satisfactionSum, but count the response
          satisfactionCount++;
        } else {
          // Old format: Extract the numeric value (first character)
          const numericValue = parseInt(satisfactionValue.charAt(0));
          if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
            // Convert to binary: 4-5 = satisfied, 1-3 = not satisfied
            if (numericValue >= 4) {
              satisfactionSum++;
            }
            satisfactionCount++;
          }
        }
      }

      // Process overallNeedForAction (format: "Yes / Oo" or "No / Hindi")
      if (data.overallNeedForAction) {
        needActionTotalCount++;
        const needActionValue = String(data.overallNeedForAction).toLowerCase();
        if (needActionValue.includes('yes') || needActionValue.includes('oo')) {
          needActionYesCount++;
        }
      }
    } catch (error) {
      console.error('Error processing overall section response:', error);
    }
  });

  // CORRECT: Overall Satisfaction = (number_satisfied / total_sample_size) * 100
  // Use target sample size from survey_target table (e.g., 150)
  const satisfactionScore = targetSampleSize > 0
    ? Math.round((satisfactionSum / targetSampleSize) * 100)
    : 0;

  // CORRECT: Overall Need for Action = (number_needs_action / total_sample_size) * 100
  const needActionScore = targetSampleSize > 0
    ? Math.round((needActionYesCount / targetSampleSize) * 100)
    : 0;

  console.log('🔍 [OVERALL SECTION] Calculation:', {
    satisfactionSum,
    satisfactionCount,
    satisfactionScore,
    needActionYesCount,
    needActionTotalCount,
    needActionScore
  });

  return {
    awareness_score: 0, // Not applicable for overall section
    availment_score: 0, // Not applicable for overall section
    satisfaction_score: satisfactionScore,
    need_action_score: needActionScore,
    total_awareness_questions: 0,
    total_availment_questions: 0,
    total_satisfaction_questions: satisfactionCount,
    total_need_action_questions: needActionTotalCount,
    bottleneck: 'N/A',
    quotes: { awareness: [], availment: [], satisfaction: [] },
    concerns: [],
    recommendations: []
  };
}

function generateRecommendations(
  awareness: number,
  availment: number,
  satisfaction: number,
  needAction: number,
  bottleneck: string
): { shortTerm: string[], mediumTerm: string[], longTerm: string[] } {
  const recommendations = {
    shortTerm: [] as string[],
    mediumTerm: [] as string[],
    longTerm: [] as string[]
  };

  // Generate varied short-term recommendations based on bottleneck and scores
  // Use deterministic selection based on scores to ensure consistency
  const shortTermOptions = {
    awareness: [
      'Launch information campaign through barangay announcements',
      'Distribute flyers and posters in high-traffic areas',
      'Conduct house-to-house information drives',
      'Use social media to promote available services',
      'Hold community assemblies to explain programs',
      'Create infographics for easy understanding'
    ],
    availment: [
      'Simplify application and registration processes',
      'Extend service hours to accommodate more residents',
      'Set up mobile service points in different sitios',
      'Reduce documentary requirements for applications',
      'Provide assistance desks for application help',
      'Implement online application systems'
    ],
    satisfaction: [
      'Gather detailed feedback from service users',
      'Address immediate service quality issues',
      'Improve staff training and customer service',
      'Upgrade facilities and equipment',
      'Reduce waiting times and processing delays',
      'Establish complaint resolution mechanisms'
    ]
  };

  // Use deterministic selection based on scores instead of random
  const shortTermPool = shortTermOptions[bottleneck as keyof typeof shortTermOptions] || shortTermOptions.satisfaction;
  const scoreBasedIndex = Math.floor((awareness + availment + satisfaction) / 100 * shortTermPool.length) % shortTermPool.length;
  recommendations.shortTerm = [
    shortTermPool[scoreBasedIndex],
    shortTermPool[(scoreBasedIndex + 1) % shortTermPool.length],
    shortTermPool[(scoreBasedIndex + 2) % shortTermPool.length]
  ];

  // Medium-term recommendations with deterministic selection
  const mediumTermOptions = needAction > 50 ? [
    'Allocate additional budget for service improvements',
    'Upgrade facilities and equipment',
    'Hire additional staff or volunteers',
    'Develop comprehensive training programs',
    'Establish partnerships with NGOs and agencies',
    'Create service quality monitoring systems'
  ] : [
    'Establish regular monitoring and feedback mechanisms',
    'Create service quality standards and benchmarks',
    'Develop partnerships with NGOs and other agencies',
    'Implement continuous improvement processes',
    'Build community engagement programs',
    'Strengthen coordination with other departments'
  ];
  
  const mediumIndex = Math.floor((satisfaction + needAction) / 100 * mediumTermOptions.length) % mediumTermOptions.length;
  recommendations.mediumTerm = [
    mediumTermOptions[mediumIndex],
    mediumTermOptions[(mediumIndex + 1) % mediumTermOptions.length],
    mediumTermOptions[(mediumIndex + 2) % mediumTermOptions.length]
  ];

  // Long-term recommendations with deterministic selection
  const longTermOptions = [
    'Integrate digital solutions for service delivery',
    'Develop comprehensive service improvement plan',
    'Build sustainable funding mechanisms for service continuity',
    'Establish innovation and modernization programs',
    'Create long-term capacity building initiatives',
    'Develop strategic partnerships for sustainability'
  ];
  
  const longIndex = Math.floor((awareness + availment + satisfaction + needAction) / 200 * longTermOptions.length) % longTermOptions.length;
  recommendations.longTerm = [
    longTermOptions[longIndex],
    longTermOptions[(longIndex + 1) % longTermOptions.length],
    longTermOptions[(longIndex + 2) % longTermOptions.length]
  ];

  return recommendations;
}

function getTopConcerns(concerns: string[]): string[] {
  if (concerns.length === 0) {
    return [
      'No specific concerns reported',
      'Continue monitoring service quality',
      'Maintain current service standards'
    ];
  }

  // Normalize and clean concerns
  const normalizedConcerns = concerns.map(c => {
    // Remove common prefixes/suffixes added by variations
    let cleaned = c.trim()
      .replace(/^(I think |In my opinion, )/i, '')
      .replace(/\. (This is important|We hope|Many residents|Thank you).*$/i, '');
    return cleaned;
  });

  // Count frequency of concerns
  const concernCounts: { [key: string]: number } = {};
  normalizedConcerns.forEach(concern => {
    concernCounts[concern] = (concernCounts[concern] || 0) + 1;
  });

  // Sort by frequency and get top 3 unique concerns
  const sortedConcerns = Object.entries(concernCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([concern, count]) => `${concern} (${count} mentions)`);

  // If we have less than 3, pad with generic ones
  while (sortedConcerns.length < 3) {
    sortedConcerns.push('Additional feedback needed for detailed analysis');
  }

  return sortedConcerns;
}

function calculateActionGrid(serviceScores: { [key: string]: any }): { [key: string]: any } {
  const actionGrid: { [key: string]: any } = {};

  Object.entries(serviceScores).forEach(([service, scores]) => {
    const satisfaction = scores.satisfaction_score || 0;
    const needAction = scores.need_action_score || 0;

    // Determine quadrant based on satisfaction and need for action
    let quadrant = 'INSUFFICIENT_DATA';
    if (satisfaction >= 70 && needAction <= 30) {
      quadrant = 'MAINTAIN';  // High satisfaction, low need for action
    } else if (satisfaction >= 70 && needAction > 30) {
      quadrant = 'OPPORTUNITIES';  // High satisfaction, high need for action
    } else if (satisfaction < 70 && needAction <= 30) {
      quadrant = 'MONITOR';  // Low satisfaction, low need for action
    } else if (satisfaction < 70 && needAction > 30) {
      quadrant = 'FIX_NOW';  // Low satisfaction, high need for action
    }

    actionGrid[service] = {
      quadrant: quadrant,
      satisfaction_score: satisfaction,
      need_action_score: needAction,
      confidence: scores.sample_size >= 3 ? 'high' : scores.sample_size >= 2 ? 'medium' : 'low'
    };
  });

  return actionGrid;
}