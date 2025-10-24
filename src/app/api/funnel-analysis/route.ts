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
    const serviceScores = calculateServiceScores(surveyData);

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

function calculateServiceScores(surveyData: any[]): { [key: string]: any } {
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
  Object.entries(sectionsData).forEach(([sectionKey, responses]) => {
    const scores = calculateSectionScores(responses);
    if (scores) {
      serviceScores[sectionKey] = scores;
    }
  });

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

  // Debug: Track satisfaction questions found
  const satisfactionQuestionsFound: any[] = [];
  
  // Collect quotes and concerns
  const quotes: { awareness: string[], availment: string[], satisfaction: string[] } = {
    awareness: [],
    availment: [],
    satisfaction: []
  };
  const concerns: string[] = [];

  // Process each response
  responses.forEach(response => {
    try {
      const data = typeof response.section_data === 'string'
        ? JSON.parse(response.section_data)
        : response.section_data;

      // Count awareness questions (questions containing 'aware')
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('aware')) {
          totalAwarenessQuestions++;
          // Handle various positive response formats
          const stringValue = String(value).toLowerCase();
          if (value === 1 || value === true || value === '1' || 
              stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true') {
            awarenessCount++;
          }
        }
      });

      // Count availment questions (questions indicating usage/participation/experience)
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('avail') || keyLower.includes('experience') || 
            keyLower.includes('benefited') || keyLower.includes('participated') || 
            keyLower.includes('used') || keyLower.includes('accessed') ||
            keyLower.includes('utilized') || keyLower.includes('received')) {
          totalAvailmentQuestions++;
          // Handle various positive response formats
          const stringValue = String(value).toLowerCase();
          if (value === 1 || value === true || value === '1' || 
              stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true') {
            availmentCount++;
          }
        }
      });

      // Count satisfaction questions (questions containing 'satisf')
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('satisf')) {
          totalSatisfactionQuestions++;
          const numValue = typeof value === 'string' ? parseInt(value) : value;
          if ((typeof numValue === 'number' || typeof value === 'number') &&
              numValue >= 1 && numValue <= 5) {
            satisfactionSum += numValue;
            // Track for debugging
            satisfactionQuestionsFound.push({ key, value, numValue });
          }
        }
      });

      // Count need for action questions (questions containing 'need' or 'action')
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('need') || key.toLowerCase().includes('action')) {
          totalNeedActionQuestions++;
          // Handle various positive response formats
          const stringValue = String(value).toLowerCase();
          if (value === 1 || value === true || value === '1' || 
              stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true') {
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

  const satisfactionScore = totalSatisfactionQuestions > 0
    ? Math.round(((satisfactionSum / totalSatisfactionQuestions) / 5) * 100)
    : 0;

  const needActionScore = totalNeedActionQuestions > 0
    ? Math.round((needActionCount / totalNeedActionQuestions) * 100)
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