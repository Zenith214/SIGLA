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

    console.log(`🗑️ Deleting all mock data for Barangay ${barangayId}`);

    // Get counts before deletion
    const responseCountResult = await client.query(
      'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );
    const responseCount = parseInt(responseCountResult.rows[0].count);

    const questionnaireCountResult = await client.query(
      'SELECT COUNT(*) as count FROM questionnaires WHERE spot_id IN (SELECT spot_id FROM spots WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );
    const questionnaireCount = parseInt(questionnaireCountResult.rows[0].count);

    const spotCountResult = await client.query(
      'SELECT COUNT(*) as count FROM spots WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );
    const spotCount = parseInt(spotCountResult.rows[0].count);

    console.log(`📊 Found ${responseCount} responses, ${questionnaireCount} questionnaires, and ${spotCount} spots to delete`);

    if (responseCount === 0 && questionnaireCount === 0 && spotCount === 0) {
      return NextResponse.json({
        success: true,
        message: `No data found for Barangay ${barangayId}`,
        deletedCount: 0,
        barangayId: parseInt(barangayId)
      });
    }

    // Delete all related data in correct order (foreign key constraints)
    
    // 1. Delete survey sections (depends on survey_response)
    const sectionsResult = await client.query(
      'DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // 2. Delete survey metadata (depends on survey_response)
    const metadataResult = await client.query(
      'DELETE FROM survey_metadata WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // 3. Delete survey answers (depends on survey_response)
    const answersResult = await client.query(
      'DELETE FROM survey_answer WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // 4. Delete survey attachments (depends on survey_response)
    const attachmentsResult = await client.query(
      'DELETE FROM survey_attachment WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // 5. Delete survey validations (depends on survey_response)
    const validationsResult = await client.query(
      'DELETE FROM survey_validation WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // 6. Delete survey responses
    const responsesResult = await client.query(
      'DELETE FROM survey_response WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );

    // 7. Delete visits (depends on questionnaires)
    const visitsResult = await client.query(
      'DELETE FROM visits WHERE questionnaire_id IN (SELECT questionnaire_id FROM questionnaires WHERE spot_id IN (SELECT spot_id FROM spots WHERE barangay_id = $1))',
      [parseInt(barangayId)]
    );

    // 8. Delete questionnaires (depends on spots)
    const questionnairesResult = await client.query(
      'DELETE FROM questionnaires WHERE spot_id IN (SELECT spot_id FROM spots WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // 9. Delete spots
    const spotsResult = await client.query(
      'DELETE FROM spots WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );

    // Reset survey target progress to 0
    const targetResult = await client.query(
      'SELECT target_id FROM survey_target WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );

    if (targetResult.rows.length > 0) {
      await client.query(
        'UPDATE survey_target SET achieved = 0, percentage = 0, updated_at = NOW() WHERE barangay_id = $1',
        [parseInt(barangayId)]
      );
      console.log(`📈 Reset survey target progress for Barangay ${barangayId}`);
    }

    const totalDeleted = responseCount + questionnaireCount + spotCount;
    
    console.log(`✅ Successfully deleted ${responseCount} responses, ${questionnaireCount} questionnaires, ${spotCount} spots, and all related data for Barangay ${barangayId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all data for Barangay ${barangayId}`,
      deletedCount: totalDeleted,
      barangayId: parseInt(barangayId),
      details: {
        responses: responsesResult.rowCount || 0,
        questionnaires: questionnairesResult.rowCount || 0,
        spots: spotsResult.rowCount || 0,
        sections: sectionsResult.rowCount || 0,
        metadata: metadataResult.rowCount || 0,
        answers: answersResult.rowCount || 0,
        attachments: attachmentsResult.rowCount || 0,
        validations: validationsResult.rowCount || 0,
        visits: visitsResult.rowCount || 0
      }
    });

  } catch (error) {
    console.error('❌ Mock data deletion failed:', error);
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