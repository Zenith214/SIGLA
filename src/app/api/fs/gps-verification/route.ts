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
    const query = `
      SELECT 
        sr.response_id,
        sr.questionnaire_id,
        sr.survey_number,
        sr.gps_verification_status,
        sr.gps_distance_meters,
        sr.created_at,
        sr.selected_member as respondent_name,
        u.name as interviewer_name,
        b.name as barangay_name,
        s.spot_name
      FROM survey_response sr
      LEFT JOIN users u ON sr.interviewer_id = u.user_id
      LEFT JOIN barangays b ON sr.barangay_id = b.barangay_id
      LEFT JOIN spots s ON sr.spot_id = s.spot_id
      WHERE sr.survey_cycle_id = $1
        AND sr.verification_location IS NOT NULL
      ORDER BY 
        CASE sr.gps_verification_status
          WHEN 'flagged' THEN 1
          WHEN 'pending' THEN 2
          WHEN 'verified' THEN 3
          ELSE 4
        END,
        sr.created_at DESC
    `;

    const result = await client.query(query, [parseInt(cycleId)]);

    // Calculate summary statistics
    const interviews = result.rows;
    const summary = {
      total: interviews.length,
      flagged: interviews.filter((i) => i.gps_verification_status === "flagged").length,
      verified: interviews.filter((i) => i.gps_verification_status === "verified").length,
      pending: interviews.filter((i) => i.gps_verification_status === "pending").length,
    };

    return NextResponse.json({
      interviews,
      summary,
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
