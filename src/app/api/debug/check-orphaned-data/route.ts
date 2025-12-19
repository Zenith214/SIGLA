import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const cycleId = searchParams.get('cycleId');

    // Check for orphaned questionnaires (questionnaires without spots)
    const params = [];
    let paramIndex = 1;
    let barangayCondition = '';
    let cycleCondition = '';
    
    if (barangayId) {
      params.push(parseInt(barangayId));
      barangayCondition = `AND q.barangay_id = $${paramIndex}`;
      paramIndex++;
    }
    
    if (cycleId) {
      params.push(parseInt(cycleId));
      cycleCondition = `AND q.cycle_id = $${paramIndex}`;
      paramIndex++;
    }

    const orphanedQuestionnairesQuery = `
      SELECT 
        q.questionnaire_id,
        q.spot_id,
        q.status,
        q.barangay_id,
        q.cycle_id,
        s.spot_id as spot_exists
      FROM questionnaires q
      LEFT JOIN spots s ON q.spot_id = s.spot_id
      WHERE s.spot_id IS NULL
        ${barangayCondition}
        ${cycleCondition}
      ORDER BY q.questionnaire_id
    `;

    const orphanedQuestionnaires = await client.query(orphanedQuestionnairesQuery, params);

    // Check for survey responses
    let srBarangayCondition = '';
    let srCycleCondition = '';
    paramIndex = 1;
    
    if (barangayId) {
      srBarangayCondition = `AND sr.barangay_id = $${paramIndex}`;
      paramIndex++;
    }
    
    if (cycleId) {
      srCycleCondition = `AND sr.survey_cycle_id = $${paramIndex}`;
    }

    const surveyResponsesQuery = `
      SELECT 
        sr.response_id,
        sr.survey_number,
        sr.barangay_id,
        sr.survey_cycle_id,
        sr.status,
        q.questionnaire_id as questionnaire_exists,
        s.spot_id as spot_exists
      FROM survey_response sr
      LEFT JOIN questionnaires q ON sr.survey_number = q.questionnaire_id
      LEFT JOIN spots s ON q.spot_id = s.spot_id
      WHERE sr.status IN ('completed', 'submitted')
        ${srBarangayCondition}
        ${srCycleCondition}
      ORDER BY sr.response_id
    `;

    const surveyResponses = await client.query(surveyResponsesQuery, params);

    // Check survey_target table
    let stBarangayCondition = '';
    let stCycleCondition = '';
    paramIndex = 1;
    
    if (barangayId) {
      stBarangayCondition = `AND st.barangay_id = $${paramIndex}`;
      paramIndex++;
    }
    
    if (cycleId) {
      stCycleCondition = `AND st.survey_cycle_id = $${paramIndex}`;
    }

    const surveyTargetQuery = `
      SELECT 
        st.target_id,
        st.barangay_id,
        b.barangay_name,
        st.survey_cycle_id,
        st.target,
        st.achieved,
        st.percentage,
        (SELECT COUNT(*) FROM survey_response sr 
         WHERE sr.barangay_id = st.barangay_id 
           AND sr.survey_cycle_id = st.survey_cycle_id 
           AND sr.status IN ('completed', 'submitted')) as actual_response_count
      FROM survey_target st
      LEFT JOIN barangay b ON st.barangay_id = b.barangay_id
      WHERE 1=1
        ${stBarangayCondition}
        ${stCycleCondition}
      ORDER BY st.barangay_id
    `;

    const surveyTargets = await client.query(surveyTargetQuery, params);

    // Check spots
    let spotBarangayCondition = '';
    let spotCycleCondition = '';
    paramIndex = 1;
    
    if (barangayId) {
      spotBarangayCondition = `AND s.barangay_id = $${paramIndex}`;
      paramIndex++;
    }
    
    if (cycleId) {
      spotCycleCondition = `AND s.cycle_id = $${paramIndex}`;
    }

    const spotsQuery = `
      SELECT 
        s.spot_id,
        s.spot_name,
        s.barangay_id,
        s.cycle_id,
        s.assigned_fi_id,
        COUNT(q.questionnaire_id) as questionnaire_count
      FROM spots s
      LEFT JOIN questionnaires q ON s.spot_id = q.spot_id
      WHERE 1=1
        ${spotBarangayCondition}
        ${spotCycleCondition}
      GROUP BY s.spot_id, s.spot_name, s.barangay_id, s.cycle_id, s.assigned_fi_id
      ORDER BY s.spot_id
    `;

    const spots = await client.query(spotsQuery, params);

    return NextResponse.json({
      orphaned_questionnaires: {
        count: orphanedQuestionnaires.rows.length,
        data: orphanedQuestionnaires.rows
      },
      survey_responses: {
        count: surveyResponses.rows.length,
        orphaned_count: surveyResponses.rows.filter(r => !r.spot_exists).length,
        data: surveyResponses.rows
      },
      survey_targets: {
        count: surveyTargets.rows.length,
        data: surveyTargets.rows,
        mismatches: surveyTargets.rows.filter(t => t.achieved !== t.actual_response_count)
      },
      spots: {
        count: spots.rows.length,
        data: spots.rows
      },
      summary: {
        has_orphaned_questionnaires: orphanedQuestionnaires.rows.length > 0,
        has_orphaned_responses: surveyResponses.rows.filter(r => !r.spot_exists).length > 0,
        has_target_mismatches: surveyTargets.rows.filter(t => t.achieved !== t.actual_response_count).length > 0
      }
    });

  } catch (error: any) {
    console.error('Error checking orphaned data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
