import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycle } from '@/utils/surveyCycleHelpers';

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

export async function DELETE(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url);
    const cycleIdParam = searchParams.get('cycleId');
    const confirmWord = searchParams.get('confirmWord');

    if (confirmWord !== 'DELETE') {
      return NextResponse.json(
        { error: "Missing confirmation word. Please provide confirmWord=DELETE" },
        { status: 400 }
      );
    }

    // Get cycle for deletion - use provided cycleId or active cycle
    let targetCycle;
    if (cycleIdParam) {
      const cycleResult = await client.query(
        'SELECT * FROM survey_cycle WHERE cycle_id = $1',
        [parseInt(cycleIdParam)]
      );
      if (cycleResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Survey cycle with ID ${cycleIdParam} not found` },
          { status: 404 }
        );
      }
      targetCycle = cycleResult.rows[0];
    } else {
      targetCycle = await getActiveCycle();
      if (!targetCycle) {
        return NextResponse.json(
          { error: "No active survey cycle found" },
          { status: 400 }
        );
      }
    }

    console.log(`🗑️ Deleting ALL survey responses in cycle ${targetCycle.name} (ID: ${targetCycle.cycle_id})`);

    // Get count of responses before deletion
    const countResult = await client.query(
      'SELECT COUNT(*) as count, COUNT(DISTINCT barangay_id) as barangay_count FROM survey_response WHERE survey_cycle_id = $1',
      [targetCycle.cycle_id]
    );
    const responseCount = parseInt(countResult.rows[0].count);
    const barangayCount = parseInt(countResult.rows[0].barangay_count);

    if (responseCount === 0) {
      return NextResponse.json({
        success: true,
        message: `No survey responses found in ${targetCycle.name}`,
        deletedCount: 0,
        barangaysAffected: 0,
        cycleId: targetCycle.cycle_id,
        cycleName: targetCycle.name
      });
    }

    console.log(`📊 Found ${responseCount} responses across ${barangayCount} barangays to delete in ${targetCycle.name}`);

    // Delete all related data in correct order (foreign key constraints)
    // Start a transaction for data integrity
    await client.query('BEGIN');

    try {
      // Delete survey sections
      const sectionsResult = await client.query(
        'DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE survey_cycle_id = $1)',
        [targetCycle.cycle_id]
      );

      // Delete survey metadata
      const metadataResult = await client.query(
        'DELETE FROM survey_metadata WHERE response_id IN (SELECT response_id FROM survey_response WHERE survey_cycle_id = $1)',
        [targetCycle.cycle_id]
      );

      // Delete survey answers
      const answersResult = await client.query(
        'DELETE FROM survey_answer WHERE response_id IN (SELECT response_id FROM survey_response WHERE survey_cycle_id = $1)',
        [targetCycle.cycle_id]
      );

      // Delete survey attachments
      const attachmentsResult = await client.query(
        'DELETE FROM survey_attachment WHERE response_id IN (SELECT response_id FROM survey_response WHERE survey_cycle_id = $1)',
        [targetCycle.cycle_id]
      );

      // Delete survey validations
      const validationsResult = await client.query(
        'DELETE FROM survey_validation WHERE response_id IN (SELECT response_id FROM survey_response WHERE survey_cycle_id = $1)',
        [targetCycle.cycle_id]
      );

      // Finally delete survey responses
      const responsesResult = await client.query(
        'DELETE FROM survey_response WHERE survey_cycle_id = $1',
        [targetCycle.cycle_id]
      );

      // Reset ALL survey target progress to 0 for this cycle
      const targetUpdateResult = await client.query(
        'UPDATE survey_target SET achieved = 0, percentage = 0, updated_at = NOW() WHERE survey_cycle_id = $1',
        [targetCycle.cycle_id]
      );

      console.log(`📈 Reset survey target progress for ${targetUpdateResult.rowCount} barangays in cycle ${targetCycle.name}`);

      // Reset ALL assignments for this cycle
      const assignmentUpdateResult = await client.query(
        'UPDATE assignment SET progress = 0, status = $1, updated_at = NOW() WHERE survey_cycle_id = $2',
        ['pending', targetCycle.cycle_id]
      );

      console.log(`📋 Reset ${assignmentUpdateResult.rowCount} assignments in cycle ${targetCycle.name}`);

      // Commit the transaction
      await client.query('COMMIT');

      console.log(`✅ Successfully deleted ${responseCount} responses across ${barangayCount} barangays in ${targetCycle.name}`);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted all survey responses in cycle ${targetCycle.name}`,
        deletedCount: responseCount,
        barangaysAffected: barangayCount,
        cycleId: targetCycle.cycle_id,
        cycleName: targetCycle.name,
        details: {
          responses: responsesResult.rowCount || 0,
          sections: sectionsResult.rowCount || 0,
          metadata: metadataResult.rowCount || 0,
          answers: answersResult.rowCount || 0,
          attachments: attachmentsResult.rowCount || 0,
          validations: validationsResult.rowCount || 0,
          targetsReset: targetUpdateResult.rowCount || 0,
          assignmentsReset: assignmentUpdateResult.rowCount || 0
        }
      });

    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Cycle-wide survey response deletion failed:', error);
    return NextResponse.json(
      { error: `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
