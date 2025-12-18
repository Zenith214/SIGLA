import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get("cycleId");

    if (!cycleId) {
      return NextResponse.json(
        { error: "Missing cycleId parameter" },
        { status: 400 }
      );
    }

    // Fetch all interviews with GPS verification data for the cycle
    // Note: Using actual table/column names from database schema
    // TODO: Add cycle_id filter once survey_response table has cycle_id column
    const query = `
      SELECT 
        sr.response_id,
        sr.survey_number as questionnaire_id,
        sr.survey_number,
        'pending' as gps_verification_status,
        NULL as gps_distance_meters,
        sr.created_at,
        sr.respondent_name,
        CONCAT(u."firstName", ' ', u."lastName") as interviewer_name,
        b.barangay_name,
        'N/A' as spot_name
      FROM survey_response sr
      LEFT JOIN "user" u ON sr.interviewer_id = u.id
      LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
      WHERE sr.barangay_id IS NOT NULL
        AND sr.location_lat IS NOT NULL
        AND sr.location_lng IS NOT NULL
      ORDER BY sr.created_at DESC
      LIMIT 100
    `;

    const result = await client.query(query);

    // Calculate summary statistics
    const interviews = result.rows || [];
    const summary = {
      total: interviews.length,
      flagged: interviews.filter((i) => i.gps_verification_status === "flagged").length,
      verified: interviews.filter((i) => i.gps_verification_status === "verified").length,
      pending: interviews.filter((i) => i.gps_verification_status === "pending").length,
    };

    // Return success response even if no data
    return NextResponse.json({
      success: true,
      interviews,
      summary,
      message: interviews.length === 0 ? "No GPS verification records found for this cycle" : undefined
    });
  } catch (error) {
    console.error("Error fetching GPS verification data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GPS verification data" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
