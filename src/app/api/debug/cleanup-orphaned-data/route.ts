import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    
    const { barangayId, cycleId, dryRun = true } = await request.json();

    const results: any = {
      dryRun,
      deletedQuestionnaires: 0,
      deletedResponses: 0,
      deletedSections: 0,
      deletedVisits: 0,
      updatedTargets: 0
    };

    if (dryRun) {
      // Just count what would be deleted
      const orphanedQuestionnairesQuery = `
        SELECT COUNT(*) as count
        FROM questionnaires q
        LEFT JOIN spots s ON q.spot_id = s.spot_id
        WHERE s.spot_id IS NULL
          ${barangayId ? 'AND q.barangay_id = $1' : ''}
          ${cycleId ? `AND q.cycle_id = ${barangayId ? '$2' : '$1'}` : ''}
      `;

      const params = [];
      if (barangayId) params.push(parseInt(barangayId));
      if (cycleId) params.push(parseInt(cycleId));

      const orphanedCount = await client.query(orphanedQuestionnairesQuery, params);
      results.wouldDeleteQuestionnaires = parseInt(orphanedCount.rows[0].count);

      // Count orphaned responses
      const orphanedResponsesQuery = `
        SELECT COUNT(*) as count
        FROM survey_response sr
        LEFT JOIN questionnaires q ON sr.survey_number = q.questionnaire_id
        WHERE q.questionnaire_id IS NULL
          ${barangayId ? 'AND sr.barangay_id = $1' : ''}
          ${cycleId ? `AND sr.survey_cycle_id = ${barangayId ? '$2' : '$1'}` : ''}
      `;

      const orphanedResponseCount = await client.query(orphanedResponsesQuery, params);
      results.wouldDeleteResponses = parseInt(orphanedResponseCount.rows[0].count);

      return NextResponse.json({
        ...results,
        message: 'Dry run completed. Set dryRun=false to actually delete orphaned data.'
      });
    }

    // Begin transaction
    await client.query('BEGIN');

    try {
      const params = [];
      if (barangayId) params.push(parseInt(barangayId));
      if (cycleId) params.push(parseInt(cycleId));

      // 1. Find orphaned questionnaires (questionnaires without spots)
      const orphanedQuestionnairesQuery = `
        SELECT q.questionnaire_id
        FROM questionnaires q
        LEFT JOIN spots s ON q.spot_id = s.spot_id
        WHERE s.spot_id IS NULL
          ${barangayId ? 'AND q.barangay_id = $1' : ''}
          ${cycleId ? `AND q.cycle_id = ${barangayId ? '$2' : '$1'}` : ''}
      `;

      const orphanedQuestionnaires = await client.query(orphanedQuestionnairesQuery, params);
      const orphanedQuestionnaireIds = orphanedQuestionnaires.rows.map(r => r.questionnaire_id);

      if (orphanedQuestionnaireIds.length > 0) {
        // Delete visits for orphaned questionnaires
        const deleteVisitsResult = await client.query(
          'DELETE FROM visits WHERE questionnaire_id = ANY($1::int[])',
          [orphanedQuestionnaireIds]
        );
        results.deletedVisits = deleteVisitsResult.rowCount || 0;

        // Find and delete survey responses for orphaned questionnaires
        const orphanedResponsesQuery = `
          SELECT sr.response_id
          FROM survey_response sr
          WHERE sr.survey_number = ANY($1::int[])
        `;
        const orphanedResponses = await client.query(orphanedResponsesQuery, [orphanedQuestionnaireIds]);
        const orphanedResponseIds = orphanedResponses.rows.map(r => r.response_id);

        if (orphanedResponseIds.length > 0) {
          // Delete survey sections first
          const deleteSectionsResult = await client.query(
            'DELETE FROM survey_section WHERE response_id = ANY($1::int[])',
            [orphanedResponseIds]
          );
          results.deletedSections = deleteSectionsResult.rowCount || 0;

          // Delete survey responses
          const deleteResponsesResult = await client.query(
            'DELETE FROM survey_response WHERE response_id = ANY($1::int[])',
            [orphanedResponseIds]
          );
          results.deletedResponses = deleteResponsesResult.rowCount || 0;
        }

        // Delete orphaned questionnaires
        const deleteQuestionnairesResult = await client.query(
          'DELETE FROM questionnaires WHERE questionnaire_id = ANY($1::int[])',
          [orphanedQuestionnaireIds]
        );
        results.deletedQuestionnaires = deleteQuestionnairesResult.rowCount || 0;
      }

      // 2. Recalculate survey targets
      const whereClause = barangayId && cycleId 
        ? 'WHERE st.barangay_id = $1 AND st.survey_cycle_id = $2'
        : barangayId 
        ? 'WHERE st.barangay_id = $1'
        : cycleId
        ? 'WHERE st.survey_cycle_id = $1'
        : '';

      const updateTargetsQuery = `
        UPDATE survey_target st
        SET 
          achieved = COALESCE(response_counts.count, 0),
          percentage = CASE 
            WHEN st.target > 0 THEN ROUND((COALESCE(response_counts.count, 0)::decimal / st.target::decimal) * 100)
            ELSE 0 
          END,
          updated_at = NOW()
        FROM (
          SELECT 
            sr.barangay_id,
            sr.survey_cycle_id,
            COUNT(*) as count
          FROM survey_response sr
          WHERE sr.status IN ('completed', 'submitted')
            ${barangayId ? 'AND sr.barangay_id = $1' : ''}
            ${cycleId ? `AND sr.survey_cycle_id = ${barangayId ? '$2' : '$1'}` : ''}
          GROUP BY sr.barangay_id, sr.survey_cycle_id
        ) response_counts
        ${whereClause}
          AND st.barangay_id = response_counts.barangay_id
          AND st.survey_cycle_id = response_counts.survey_cycle_id
      `;

      const updateResult = await client.query(updateTargetsQuery, params);
      results.updatedTargets = updateResult.rowCount || 0;

      // Also set targets to 0 where there are no responses
      const zeroTargetsQuery = `
        UPDATE survey_target st
        SET 
          achieved = 0,
          percentage = 0,
          updated_at = NOW()
        ${whereClause}
          AND NOT EXISTS (
            SELECT 1 FROM survey_response sr 
            WHERE sr.barangay_id = st.barangay_id 
              AND sr.survey_cycle_id = st.survey_cycle_id
              AND sr.status IN ('completed', 'submitted')
          )
      `;

      const zeroResult = await client.query(zeroTargetsQuery, params);
      results.updatedTargets += zeroResult.rowCount || 0;

      // Commit transaction
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        ...results,
        message: 'Orphaned data cleaned up successfully and survey targets recalculated.'
      });

    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Error cleaning up orphaned data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
