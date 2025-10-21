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

    // Get count of responses before deletion
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );
    const responseCount = parseInt(countResult.rows[0].count);

    if (responseCount === 0) {
      return NextResponse.json({
        success: true,
        message: `No survey responses found for Barangay ${barangayId}`,
        deletedCount: 0,
        barangayId: parseInt(barangayId)
      });
    }

    // Delete all related data in correct order (foreign key constraints)
    console.log(`📊 Found ${responseCount} responses to delete`);

    // For mock data, we can identify by the survey number format (BB-YYYY-NNNN)
    // But for now, we'll delete all responses for the barangay as requested
    
    // Delete survey sections
    const sectionsResult = await client.query(
      'DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // Delete survey metadata
    const metadataResult = await client.query(
      'DELETE FROM survey_metadata WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // Delete survey answers
    const answersResult = await client.query(
      'DELETE FROM survey_answer WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // Delete survey attachments
    const attachmentsResult = await client.query(
      'DELETE FROM survey_attachment WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // Delete survey validations
    const validationsResult = await client.query(
      'DELETE FROM survey_validation WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)',
      [parseInt(barangayId)]
    );

    // Finally delete survey responses
    const responsesResult = await client.query(
      'DELETE FROM survey_response WHERE barangay_id = $1',
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

    console.log(`✅ Successfully deleted ${responseCount} responses and all related data for Barangay ${barangayId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all mock data for Barangay ${barangayId}`,
      deletedCount: responseCount,
      barangayId: parseInt(barangayId),
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