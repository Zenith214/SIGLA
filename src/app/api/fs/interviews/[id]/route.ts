import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let client;
  try {
    client = await pool.connect();
    const interviewId = parseInt(params.id);

    if (isNaN(interviewId)) {
      return NextResponse.json(
        { error: "Invalid interview ID" },
        { status: 400 }
      );
    }

    // Fetch interview details with related data
    const query = `
      SELECT 
        sr.response_id,
        sr.questionnaire_id,
        sr.survey_number,
        sr.location,
        sr.verification_location,
        sr.gps_verification_status,
        sr.gps_distance_meters,
        sr.selected_member as respondent_name,
        sr.visit_count,
        sr.created_at,
        sr.updated_at,
        u.name as interviewer_name,
        u.email as interviewer_email,
        b.name as barangay_name,
        s.spot_name,
        s.starting_point as spot_location,
        rd.age as respondent_age,
        rd.gender as respondent_gender,
        rd.educational_attainment,
        rd.household_income,
        rd.purok
      FROM survey_response sr
      LEFT JOIN users u ON sr.interviewer_id = u.user_id
      LEFT JOIN barangays b ON sr.barangay_id = b.barangay_id
      LEFT JOIN spots s ON sr.spot_id = s.spot_id
      LEFT JOIN respondent_demographics rd ON sr.response_id = rd.response_id
      WHERE sr.response_id = $1
    `;

    const result = await client.query(query, [interviewId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const interview = result.rows[0];

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview details:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview details" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
