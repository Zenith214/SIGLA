import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    // Get GPS coordinates from the most recent visit for each questionnaire
    const query = `
      SELECT 
        sr.response_id,
        sr.survey_number as questionnaire_id,
        sr.survey_number,
        sr.created_at,
        sr.respondent_name,
        v.location_lat,
        v.location_lng,
        CONCAT(u."firstName", ' ', u."lastName") as interviewer_name,
        b.barangay_name,
        s.spot_name,
        s.starting_point
      FROM survey_response sr
      LEFT JOIN "user" u ON sr.interviewer_id = u.id
      LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
      LEFT JOIN spots s ON sr.spot_id = s.spot_id
      LEFT JOIN LATERAL (
        SELECT location_lat, location_lng
        FROM visits
        WHERE visits.questionnaire_id = sr.questionnaire_id
          AND location_lat IS NOT NULL
          AND location_lng IS NOT NULL
        ORDER BY visit_timestamp DESC
        LIMIT 1
      ) v ON true
      WHERE sr.barangay_id IS NOT NULL
        AND v.location_lat IS NOT NULL
        AND v.location_lng IS NOT NULL
      ORDER BY sr.created_at DESC
      LIMIT 100
    `;

    const result = await client.query(query);

    // Calculate GPS distance and status for each interview
    const DISTANCE_THRESHOLD = 200; // 200 meters threshold
    
    const interviews = result.rows.map((row) => {
      let gps_distance_meters = null;
      let gps_verification_status: "pending" | "verified" | "flagged" = "pending";
      
      // Calculate distance if spot location is available
      if (row.starting_point && row.location_lat && row.location_lng) {
        try {
          const spotCoords = typeof row.starting_point === 'string' 
            ? JSON.parse(row.starting_point) 
            : row.starting_point;
          
          if (spotCoords && spotCoords.lat && spotCoords.lng) {
            // Convert to numbers to ensure proper calculation
            const spotLat = Number(spotCoords.lat);
            const spotLng = Number(spotCoords.lng);
            const actualLat = Number(row.location_lat);
            const actualLng = Number(row.location_lng);
            
            // Haversine formula to calculate distance
            const R = 6371e3; // Earth's radius in meters
            const φ1 = spotLat * Math.PI / 180;
            const φ2 = actualLat * Math.PI / 180;
            const Δφ = (actualLat - spotLat) * Math.PI / 180;
            const Δλ = (actualLng - spotLng) * Math.PI / 180;
            
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            
            gps_distance_meters = Math.round(R * c);
            
            // Debug logging for troubleshooting
            console.log(`GPS Calculation for ${row.survey_number}:`, {
              spotCoords: { lat: spotLat, lng: spotLng },
              actualCoords: { lat: actualLat, lng: actualLng },
              distance: gps_distance_meters
            });
            
            // Determine status based on distance
            if (gps_distance_meters <= DISTANCE_THRESHOLD) {
              gps_verification_status = "verified";
            } else {
              gps_verification_status = "flagged";
            }
          }
        } catch (error) {
          console.error("Error calculating GPS distance:", error);
        }
      }
      
      return {
        response_id: row.response_id,
        questionnaire_id: row.questionnaire_id,
        survey_number: row.survey_number,
        gps_verification_status,
        gps_distance_meters,
        created_at: row.created_at,
        respondent_name: row.respondent_name,
        interviewer_name: row.interviewer_name,
        barangay_name: row.barangay_name,
        spot_name: row.spot_name || 'N/A',
      };
    });

    // Calculate summary statistics
    const summary = {
      total: interviews.length,
      flagged: interviews.filter((i) => i.gps_verification_status === "flagged").length,
      verified: interviews.filter((i) => i.gps_verification_status === "verified").length,
      pending: interviews.filter((i) => i.gps_verification_status === "pending").length,
    };

    // Return success response even if no data with cache control headers
    return NextResponse.json({
      success: true,
      interviews,
      summary,
      message: interviews.length === 0 ? "No GPS verification records found for this cycle" : undefined
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
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
