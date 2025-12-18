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
        { error: "Missing required parameter: barangayId" },
        { status: 400 }
      );
    }

    // Get barangay info from database
    const barangayResult = await client.query(`
      SELECT 
        barangay_id,
        barangay_name,
        households,
        population,
        area,
        "currentStatus" as current_status,
        seal,
        description,
        is_active
      FROM barangay 
      WHERE barangay_id = $1 AND is_active = true
    `, [parseInt(barangayId)]);

    if (barangayResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Barangay with ID ${barangayId} not found` },
        { status: 404 }
      );
    }

    const barangayInfo = barangayResult.rows[0];

    // Get current survey response count from database
    const responseCountResult = await client.query(
      'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );
    const currentResponseCount = parseInt(responseCountResult.rows[0].count);

    // Get survey target info
    const targetResult = await client.query(
      'SELECT target, achieved, percentage FROM survey_target WHERE barangay_id = $1',
      [parseInt(barangayId)]
    );

    let targetInfo = null;
    if (targetResult.rows.length > 0) {
      const target = targetResult.rows[0];
      targetInfo = {
        target: target.target,
        achieved: target.achieved || 0,
        percentage: target.percentage || 0
      };
    }

    return NextResponse.json({
      success: true,
      barangayId: parseInt(barangayId),
      barangayInfo: {
        id: barangayInfo.barangay_id,
        name: barangayInfo.barangay_name,
        population: barangayInfo.population || 0,
        households: barangayInfo.households || 0,
        area: barangayInfo.area || 0,
        status: barangayInfo.current_status || 'Pending',
        seal: barangayInfo.seal === 'yes',
        description: barangayInfo.description || ''
      },
      currentData: {
        responseCount: currentResponseCount,
        target: targetInfo
      }
    });

  } catch (error) {
    console.error('❌ Failed to get barangay info:', error);
    return NextResponse.json(
      { error: `Failed to get barangay info: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}