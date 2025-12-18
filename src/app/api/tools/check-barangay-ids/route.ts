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

    // Get all barangay IDs and names
    const barangayQuery = `
      SELECT 
        barangay_id,
        barangay_name,
        is_active
      FROM barangay 
      ORDER BY barangay_id ASC
    `;
    
    const barangayResult = await client.query(barangayQuery);

    // Get survey response counts by barangay
    const responseCountQuery = `
      SELECT 
        barangay_id,
        COUNT(*) as response_count
      FROM survey_response 
      GROUP BY barangay_id 
      ORDER BY barangay_id ASC
    `;
    
    const responseCountResult = await client.query(responseCountQuery);

    // Combine the data
    const barangays = barangayResult.rows.map(b => {
      const responseData = responseCountResult.rows.find(r => r.barangay_id === b.barangay_id);
      return {
        barangay_id: b.barangay_id,
        barangay_name: b.barangay_name,
        is_active: b.is_active,
        response_count: responseData ? parseInt(responseData.response_count) : 0
      };
    });

    return NextResponse.json({
      success: true,
      barangays: barangays,
      total_barangays: barangays.length,
      active_barangays: barangays.filter(b => b.is_active).length
    });

  } catch (error) {
    console.error('❌ Failed to check barangay IDs:', error);
    return NextResponse.json(
      { error: `Failed to check barangay IDs: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}