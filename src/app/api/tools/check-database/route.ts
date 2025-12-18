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

    // Check survey_response table structure and data
    const responseCountQuery = `
      SELECT 
        barangay_id,
        COUNT(*) as response_count
      FROM survey_response 
      GROUP BY barangay_id 
      ORDER BY barangay_id
    `;
    
    const responseCountResult = await client.query(responseCountQuery);

    // Get sample survey response data
    const sampleResponseQuery = `
      SELECT 
        response_id,
        survey_number,
        barangay_id,
        respondent_name,
        status,
        created_at
      FROM survey_response 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const sampleResponseResult = await client.query(sampleResponseQuery);

    // Check survey_section table for JSON data
    const sectionDataQuery = `
      SELECT 
        section_id,
        response_id,
        section_key,
        section_name,
        data
      FROM survey_section 
      ORDER BY section_id DESC 
      LIMIT 3
    `;
    
    const sectionDataResult = await client.query(sectionDataQuery);

    // Get total counts
    const totalCountsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM survey_response) as total_responses,
        (SELECT COUNT(*) FROM survey_section) as total_sections,
        (SELECT COUNT(*) FROM barangay WHERE is_active = true) as total_barangays
    `;
    
    const totalCountsResult = await client.query(totalCountsQuery);

    return NextResponse.json({
      success: true,
      database_status: {
        total_counts: totalCountsResult.rows[0],
        responses_by_barangay: responseCountResult.rows,
        sample_responses: sampleResponseResult.rows,
        sample_section_data: sectionDataResult.rows.map(row => ({
          ...row,
          data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        }))
      }
    });

  } catch (error) {
    console.error('❌ Failed to check database:', error);
    return NextResponse.json(
      { 
        error: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}