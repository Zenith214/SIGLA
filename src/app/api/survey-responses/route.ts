import { NextRequest, NextResponse } from "next/server"
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

export async function POST(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json()
    
    const {
      surveyNumber,
      location,
      selectedMember,
      interviewerId,
      barangayId,
      respondentDemographics,
      financialAdmin,
      disasterPrep,
      safetyPeace,
      businessFriendly,
      environmental,
      socialProtection
    } = body

    // Validate required fields
    if (!surveyNumber || !location || !interviewerId || !barangayId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the survey response record
    const insertQuery = `
      INSERT INTO survey_response (
        survey_number, barangay_id, interviewer_id, respondent_name,
        respondent_age, respondent_gender, location_lat, location_lng,
        location_address, location_accuracy, location_timestamp,
        location_barangay, location_municipality, location_province,
        status, progress, completed_at, submitted_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW(), NOW())
      RETURNING response_id
    `;
    
    const responseResult = await client.query(insertQuery, [
      surveyNumber,
      parseInt(barangayId),
      parseInt(interviewerId),
      selectedMember,
      respondentDemographics?.age || null,
      respondentDemographics?.gender || null,
      parseFloat(location.lat),
      parseFloat(location.lng),
      location.address,
      location.accuracy ? parseFloat(location.accuracy) : null,
      location.timestamp ? new Date(location.timestamp) : null,
      location.barangay,
      location.municipality,
      location.province,
      'completed',
      100
    ]);

    const responseId = responseResult.rows[0].response_id;

    // Update survey target progress for the barangay
    const targetQuery = 'SELECT * FROM survey_target WHERE barangay_id = $1 LIMIT 1';
    const targetResult = await client.query(targetQuery, [parseInt(barangayId)]);
    
    if (targetResult.rows.length > 0) {
      const surveyTarget = targetResult.rows[0];
      const newAchieved = (surveyTarget.achieved || 0) + 1;
      const newPercentage = Math.round((newAchieved / surveyTarget.target) * 100);
      
      await client.query(
        'UPDATE survey_target SET achieved = $1, percentage = $2, updated_at = NOW() WHERE target_id = $3',
        [newAchieved, newPercentage, surveyTarget.target_id]
      );
    }

    return NextResponse.json({
      success: true,
      responseId: responseId,
      message: "Survey submitted successfully"
    })

  } catch (error) {
    console.error("Error saving survey response:", error)
    return NextResponse.json(
      { error: "Failed to save survey response" },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url)
    const barangayId = searchParams.get('barangayId')
    const interviewerId = searchParams.get('interviewerId')

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (barangayId) {
      whereConditions.push(`sr.barangay_id = $${paramIndex}`);
      queryParams.push(parseInt(barangayId));
      paramIndex++;
    }
    
    if (interviewerId) {
      whereConditions.push(`sr.interviewer_id = $${paramIndex}`);
      queryParams.push(parseInt(interviewerId));
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        sr.*,
        b.barangay_name,
        u."firstName",
        u."lastName",
        u.email
      FROM survey_response sr
      LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON sr.interviewer_id = u.id
      ${whereClause}
      ORDER BY sr.created_at DESC
    `;

    const result = await client.query(query, queryParams);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Error fetching survey responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey responses" },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release();
    }
  }
}