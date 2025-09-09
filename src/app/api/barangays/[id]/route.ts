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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    client = await pool.connect();
    const { id } = await params;
    const barangayId = parseInt(id);
    
    if (isNaN(barangayId)) {
      return NextResponse.json({ error: "Invalid barangay ID" }, { status: 400 });
    }

    // Get barangay with survey targets
    const barangayQuery = `
      SELECT 
        b.barangay_id,
        b.barangay_name,
        b."currentStatus",
        b.description,
        b.population,
        b.households,
        b.captain,
        b.seal
      FROM barangay b
      WHERE b.barangay_id = $1 AND b.seal = 'yes'
    `;
    
    const barangayResult = await client.query(barangayQuery, [barangayId]);
    
    if (barangayResult.rows.length === 0) {
      return NextResponse.json({ error: "Barangay not found" }, { status: 404 });
    }

    const barangay = barangayResult.rows[0];

    // Get survey targets for this barangay
    const targetsQuery = `
      SELECT * FROM survey_target WHERE barangay_id = $1
    `;
    
    const targetsResult = await client.query(targetsQuery, [barangayId]);
    const surveyTargets = targetsResult.rows;

    // Transform the data to match the expected format
    const surveyTarget = surveyTargets[0];
    const progress = surveyTarget?.percentage || 0;
    
    let status = "Pending";
    if (progress === 100) {
      status = "Completed";
    } else if (progress > 0) {
      status = "In Progress";
    }

    const transformedBarangay = {
      barangay_id: barangay.barangay_id,
      barangay_name: barangay.barangay_name,
      currentStatus: barangay.currentStatus || status,
      description: barangay.description,
      population: barangay.population || 0,
      households: barangay.households || 0,
      area: null, // Not in current schema
      captain: barangay.captain,
      surveyTargets: surveyTargets || [],
      survey_response: [], // Would need separate query for responses
      seal: barangay.seal
    };

    return NextResponse.json(transformedBarangay);
  } catch (error: any) {
    console.error("Error fetching barangay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}