import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';

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

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId parameter is required" },
        { status: 400 }
      );
    }

    // Get survey responses for this barangay
    const surveyQuery = `
      SELECT
        sr.response_id,
        sr.survey_number,
        ss.section_name,
        ss.section_key,
        ss.data as section_data
      FROM survey_response sr
      JOIN survey_section ss ON sr.response_id = ss.response_id
      WHERE sr.barangay_id = $1 AND sr.status IN ('completed', 'submitted')
      ORDER BY sr.created_at DESC
    `;

    const surveyResult = await client.query(surveyQuery, [parseInt(barangayId)]);
    const surveyData = surveyResult.rows;

    if (surveyData.length === 0) {
      return NextResponse.json({
        barangay_id: parseInt(barangayId),
        total_responses: 0,
        service_scores: {},
        action_grid: {},
        overall_satisfaction: 0,
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
      total_responses: surveyData.length,
      service_scores: serviceScores,
      action_grid: actionGrid,
      overall_satisfaction: overallSatisfaction,
      data_quality: {
        total_responses: surveyData.length,
        services_with_data: Object.keys(serviceScores).length,
        average_responses_per_service: Math.round(surveyData.length / Math.max(Object.keys(serviceScores).length, 1))
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
          if (value === 1 || value === true || value === '1') {
            awarenessCount++;
          }
        }
      });

      // Count availment questions (questions containing 'avail')
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('avail')) {
          totalAvailmentQuestions++;
          if (value === 1 || value === true || value === '1') {
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
          }
        }
      });

      // Count need for action questions (questions containing 'need' or 'action')
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.toLowerCase().includes('need') || key.toLowerCase().includes('action')) {
          totalNeedActionQuestions++;
          if (value === 1 || value === true || value === '1') {
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

  const satisfactionScore = totalSatisfactionQuestions > 0
    ? Math.round(((satisfactionSum / totalSatisfactionQuestions) / 5) * 100)
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