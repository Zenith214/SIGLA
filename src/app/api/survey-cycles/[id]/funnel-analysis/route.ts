import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { Pool } from 'pg';
import { getSurveyCycleById } from '@/utils/surveyCycleHelpers';
import { calculateMarginOfError, calculateDynamicCutoff, classifyScore } from '@/lib/funnel-calculations';

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

/**
 * GET /api/survey-cycles/[id]/funnel-analysis
 * Get funnel analysis for a specific survey cycle and barangay
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  let client;
  try {
    const { id } = await params;
    const cycleId = parseInt(id);
    
    if (isNaN(cycleId)) {
      return NextResponse.json(
        { error: 'Invalid cycle ID' },
        { status: 400 }
      );
    }

    // Verify cycle exists
    const cycle = await getSurveyCycleById(cycleId);
    if (!cycle) {
      return NextResponse.json(
        { error: 'Survey cycle not found' },
        { status: 404 }
      );
    }

    client = await pool.connect();
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId parameter is required" },
        { status: 400 }
      );
    }

    // Get funnel analysis for the specific cycle
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

    const surveyResult = await client.query(surveyQuery, [parseInt(barangayId), cycleId]);
    const surveyData = surveyResult.rows;
    
    // Count unique respondents (not section records)
    const uniqueRespondents = [...new Set(surveyData.map(row => row.response_id))].length;

    if (surveyData.length === 0) {
      return NextResponse.json({
        cycle_id: cycleId,
        cycle_info: cycle,
        barangay_id: parseInt(barangayId),
        total_responses: 0,
        service_scores: {},
        action_grid: {},
        overall_satisfaction: 0,
        is_historical: !cycle.is_active,
        message: "No survey data found for this barangay in this cycle"
      });
    }

    // Process survey data to calculate funnel scores
    const serviceScores = calculateServiceScores(surveyData);

    // Calculate Action Grid classifications using total unique respondents
    const actionGrid = calculateActionGrid(serviceScores, uniqueRespondents);

    // Calculate overall satisfaction
    const validScores = Object.values(serviceScores).filter((score: any) =>
      score.satisfaction_score !== null && score.satisfaction_score !== undefined
    );

    const overallSatisfaction = validScores.length > 0
      ? Math.round(validScores.reduce((sum: number, score: any) => sum + score.satisfaction_score, 0) / validScores.length)
      : 0;

    return NextResponse.json({
      cycle_id: cycleId,
      cycle_info: cycle,
      barangay_id: parseInt(barangayId),
      total_responses: uniqueRespondents,
      total_section_responses: surveyData.length,
      service_scores: serviceScores,
      action_grid: actionGrid,
      overall_satisfaction: overallSatisfaction,
      is_historical: !cycle.is_active,
      data_quality: {
        total_responses: uniqueRespondents,
        total_section_responses: surveyData.length,
        services_with_data: Object.keys(serviceScores).length,
        average_sections_per_respondent: Math.round(surveyData.length / Math.max(uniqueRespondents, 1))
      }
    });

  } catch (error) {
    console.error("Error in historical funnel analysis:", error);
    return NextResponse.json(
      { error: "Failed to calculate funnel analysis for historical cycle" },
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
    // Skip demographics section - it doesn't have service scores
    if (sectionKey === 'respondent_demographics' || sectionKey === 'respondent demographics') {
      return;
    }
    
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
          // Handle binary Yes/No responses
          const stringValue = String(value).toLowerCase();
          if (value === 1 || value === true || value === '1' || 
              stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true' ||
              stringValue.includes('yes') || stringValue.includes('oo')) {
            satisfactionSum++; // Count as satisfied
          }
          // For backward compatibility with old Likert scale data (1-5)
          else {
            const numValue = typeof value === 'string' ? parseInt(value) : value;
            if ((typeof numValue === 'number' || typeof value === 'number') &&
                numValue >= 1 && numValue <= 5) {
              // Convert Likert scale to binary: 4-5 = satisfied, 1-3 = not satisfied
              if (numValue >= 4) {
                satisfactionSum++;
              }
            }
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

  // For binary Yes/No responses, satisfactionSum is already a count of "Yes" responses
  // So we calculate percentage directly
  const satisfactionScore = totalSatisfactionQuestions > 0
    ? Math.round((satisfactionSum / totalSatisfactionQuestions) * 100)
    : 0;

  const needActionScore = totalNeedActionQuestions > 0
    ? Math.round((needActionCount / totalNeedActionQuestions) * 100)
    : 0;

  return {
    awareness_score: awarenessScore,
    availment_score: availmentScore,
    satisfaction_score: satisfactionScore,
    need_action_score: needActionScore,
    sample_size: responses.length,
    total_awareness_questions: totalAwarenessQuestions,
    total_availment_questions: totalAvailmentQuestions,
    total_satisfaction_questions: totalSatisfactionQuestions,
    total_need_action_questions: totalNeedActionQuestions
  };
}

function calculateActionGrid(serviceScores: { [key: string]: any }, totalRespondents: number): { [key: string]: any } {
  const actionGrid: { [key: string]: any } = {};

  Object.entries(serviceScores).forEach(([service, scores]) => {
    const satisfaction = scores.satisfaction_score || 0;
    const needAction = scores.need_action_score || 0;

    // Calculate dynamic cut-off using CSIS methodology
    // IMPORTANT: Use total unique respondents, not section response count
    const moe = calculateMarginOfError(totalRespondents);
    const cutoff = calculateDynamicCutoff(moe);
    
    // Convert percentages to decimals for comparison
    const satisfactionDecimal = satisfaction / 100;
    const needActionDecimal = needAction / 100;
    
    // Classify using dynamic cut-off (same MoE for both metrics)
    const satisfactionRating = classifyScore(satisfactionDecimal, moe);
    const needActionRating = classifyScore(needActionDecimal, moe);

    // Determine quadrant based on CSIS methodology
    let quadrant = 'INSUFFICIENT_DATA';
    if (totalRespondents > 0) {
      if (satisfactionRating === 'Low' && needActionRating === 'High') {
        quadrant = 'FIX_NOW';  // Opportunities for Improvement (Highest Priority)
      } else if (satisfactionRating === 'High' && needActionRating === 'High') {
        quadrant = 'OPPORTUNITIES';  // Continued Emphasis (High Importance)
      } else if (satisfactionRating === 'High' && needActionRating === 'Low') {
        quadrant = 'MAINTAIN';  // Exceeded Expectations (Key Strength)
      } else {
        quadrant = 'MONITOR';  // Secondary Priority (Lowest Priority)
      }
    }

    actionGrid[service] = {
      quadrant: quadrant,
      satisfaction_score: satisfaction,
      need_action_score: needAction,
      confidence: totalRespondents >= 30 ? 'high' : totalRespondents >= 10 ? 'medium' : 'low',
      // Include CSIS metadata for transparency
      csis_metadata: {
        sample_size: totalRespondents,
        margin_of_error: Math.round(moe * 1000) / 10, // Convert to percentage
        dynamic_cutoff: Math.round(cutoff * 1000) / 10, // Convert to percentage
        satisfaction_rating: satisfactionRating,
        need_action_rating: needActionRating
      }
    };
  });

  return actionGrid;
}