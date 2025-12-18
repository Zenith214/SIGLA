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
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    client = await pool.connect();
    const interviewId = parseInt(id);

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
        sr.location_lat,
        sr.location_lng,
        sr.location_address,
        sr.location_accuracy,
        sr.location_timestamp,
        sr.verification_location,
        sr.gps_verification_status,
        sr.gps_distance_meters,
        sr.respondent_name,
        sr.respondent_age,
        sr.respondent_gender,
        sr.respondent_educational_attainment,
        sr.respondent_household_income,
        sr.respondent_purok,
        sr.visit_count,
        sr.created_at,
        sr.updated_at,
        CONCAT(u."firstName", ' ', u."lastName") as interviewer_name,
        u.email as interviewer_email,
        b.barangay_name,
        s.spot_name,
        s.starting_point as spot_location
      FROM survey_response sr
      LEFT JOIN "user" u ON sr.interviewer_id = u.id
      LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
      LEFT JOIN spots s ON sr.spot_id = s.spot_id
      WHERE sr.response_id = $1
    `;

    const result = await client.query(query, [interviewId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Transform the data to match the expected format
    const interview = {
      response_id: row.response_id,
      questionnaire_id: row.questionnaire_id,
      survey_number: row.survey_number,
      location: {
        lat: row.location_lat,
        lng: row.location_lng,
        address: row.location_address,
        accuracy: row.location_accuracy,
        timestamp: row.location_timestamp
      },
      verification_location: row.verification_location,
      gps_verification_status: row.gps_verification_status,
      gps_distance_meters: row.gps_distance_meters,
      respondent_name: row.respondent_name,
      respondent_age: row.respondent_age,
      respondent_gender: row.respondent_gender,
      visit_count: row.visit_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      interviewer_name: row.interviewer_name,
      barangay_name: row.barangay_name,
      spot_name: row.spot_name,
      spot_location: row.spot_location // JSONB with {lat, lng}
    };

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
