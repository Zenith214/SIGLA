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
    const barangayId = searchParams.get('barangayId');
    const confirmWord = searchParams.get('confirmWord');

    if (!barangayId) {
      return NextResponse.json(
        { error: "Missing required parameter: barangayId" },
        { status: 400 }
      );
    }

    if (confirmWord !== 'DELETE') {
      return NextResponse.json(
        { error: "Missing confirmation word. Please provide confirmWord=DELETE" },
        { status: 400 }
      );
    }

    // Verify barangay exists
    const barangayResult = await client.query(
      'SELECT barangay_name FROM barangay WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );

    if (barangayResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Barangay with ID ${barangayId} not found` },
        { status: 404 }
      );
    }

    const barangayName = barangayResult.rows[0].barangay_name;

    // Get active cycle for cycle-scoped deletion
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return NextResponse.json(
        { error: "No active survey cycle found" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting all survey responses for Barangay ${barangayId} (${barangayName}) in cycle ${activeCycle.name}`);

    // Get count of responses before deletion (cycle-scoped)
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2',
      [parseInt(barangayId), activeCycle.cycle_id]
    );
    const responseCount = parseInt(countResult.rows[0].count);

    if (responseCount === 0) {
      return NextResponse.json({
        success: true,
        message: `No survey responses found for ${barangayName} (Barangay ${barangayId})`,
        deletedCount: 0,
        barangayId: parseInt(barangayId),
        barangayName: barangayName
      });
    }

    console.log(`📊 Found ${responseCount} responses to delete for ${barangayName}`);

    // Delete all related data in correct order (foreign key constraints)
    // Start a transaction for data integrity
    await client.query('BEGIN');

    try {
      // Delete survey sections (cycle-scoped)
      const sectionsResult = await client.query(
        'DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      // Delete survey metadata (cycle-scoped)
      const metadataResult = await client.query(
        'DELETE FROM survey_metadata WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      // Delete survey answers (cycle-scoped)
      const answersResult = await client.query(
        'DELETE FROM survey_answer WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      // Delete survey attachments (cycle-scoped)
      const attachmentsResult = await client.query(
        'DELETE FROM survey_attachment WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      // Delete survey validations (cycle-scoped)
      const validationsResult = await client.query(
        'DELETE FROM survey_validation WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      // Finally delete survey responses (cycle-scoped)
      const responsesResult = await client.query(
        'DELETE FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      // Reset survey target progress to 0 for the active cycle
      const targetResult = await client.query(
        'SELECT target_id FROM survey_target WHERE barangay_id = $1 AND survey_cycle_id = $2',
        [parseInt(barangayId), activeCycle.cycle_id]
      );

      if (targetResult.rows.length > 0) {
        await client.query(
          'UPDATE survey_target SET achieved = 0, percentage = 0, updated_at = NOW() WHERE barangay_id = $1 AND survey_cycle_id = $2',
          [parseInt(barangayId), activeCycle.cycle_id]
        );
        console.log(`📈 Reset survey target progress for ${barangayName} in cycle ${activeCycle.name}`);
      }

      // Commit the transaction
      await client.query('COMMIT');

      console.log(`✅ Successfully deleted ${responseCount} responses and all related data for ${barangayName}`);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted all survey responses for ${barangayName} in cycle ${activeCycle.name}`,
        deletedCount: responseCount,
        barangayId: parseInt(barangayId),
        barangayName: barangayName,
        cycleId: activeCycle.cycle_id,
        cycleName: activeCycle.name,
        details: {
          responses: responsesResult.rowCount || 0,
          sections: sectionsResult.rowCount || 0,
          metadata: metadataResult.rowCount || 0,
          answers: answersResult.rowCount || 0,
          attachments: attachmentsResult.rowCount || 0,
          validations: validationsResult.rowCount || 0
        }
      });

    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Survey response deletion failed:', error);
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