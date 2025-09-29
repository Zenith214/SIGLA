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
      sections
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
        respondent_age, respondent_gender, respondent_educational_attainment,
        respondent_household_income, location_lat, location_lng,
        location_address, location_accuracy, location_timestamp,
        location_barangay, location_municipality, location_province,
        status, progress, completed_at, submitted_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW(), NOW())
      RETURNING response_id
    `;
    
    // Map gender values to match database enum
    let genderValue = respondentDemographics?.gender || null;
    if (genderValue === "LGBTQI+") {
      genderValue = "LGBTQI";
    } else if (genderValue === "Prefer not to say") {
      genderValue = "PreferNotToSay";
    }

    const responseResult = await client.query(insertQuery, [
      surveyNumber,
      parseInt(barangayId),
      parseInt(interviewerId),
      selectedMember,
      respondentDemographics?.age || null,
      genderValue,
      respondentDemographics?.educationalAttainment || null,
      respondentDemographics?.householdIncome || null,
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

    // Save survey sections data
    if (sections && typeof sections === 'object') {
      for (const [sectionKey, sectionData] of Object.entries(sections)) {
        if (sectionData && typeof sectionData === 'object' && 'data' in sectionData && sectionData.data) {
          const sectionInsertQuery = `
            INSERT INTO survey_section (
              response_id, section_key, section_name, status, data, started_at, completed_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
          `;

          // Map section keys to readable names
          const sectionNames: Record<string, string> = {
            financial: 'Financial Administration',
            disaster: 'Disaster Preparedness',
            safety: 'Safety & Peace Order',
            social: 'Social Protection',
            business: 'Business Friendliness',
            environmental: 'Environmental Management'
          };

          const sectionName = sectionNames[sectionKey] || sectionKey;

          await client.query(sectionInsertQuery, [
            responseId,
            sectionKey,
            sectionName,
            'completed',
            JSON.stringify((sectionData as any).data)
          ]);
        }
      }
    }

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

export async function DELETE(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url)
    const responseId = searchParams.get('responseId')
    const barangayId = searchParams.get('barangayId')
    const deleteAll = searchParams.get('deleteAll')
    const confirmWord = searchParams.get('confirmWord')

    // Verify confirmation word
    if (confirmWord !== 'DELETE') {
      return NextResponse.json({ error: "Invalid confirmation word" }, { status: 400 })
    }

    if (deleteAll === 'true' && barangayId) {
      // Delete all responses for the barangay
      await client.query('DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)', [parseInt(barangayId)]);
      await client.query('DELETE FROM survey_metadata WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)', [parseInt(barangayId)]);
      await client.query('DELETE FROM survey_answer WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)', [parseInt(barangayId)]);
      await client.query('DELETE FROM survey_attachment WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)', [parseInt(barangayId)]);
      await client.query('DELETE FROM survey_validation WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1)', [parseInt(barangayId)]);
      const result = await client.query('DELETE FROM survey_response WHERE barangay_id = $1', [parseInt(barangayId)]);

      // Reset survey target progress
      await client.query('UPDATE survey_target SET achieved = 0, percentage = 0 WHERE barangay_id = $1', [parseInt(barangayId)]);

      return NextResponse.json({
        success: true,
        message: `Deleted ${result.rowCount} responses for barangay`,
        deletedCount: result.rowCount
      })

    } else if (responseId) {
      // Delete single response
      await client.query('DELETE FROM survey_section WHERE response_id = $1', [parseInt(responseId)]);
      await client.query('DELETE FROM survey_metadata WHERE response_id = $1', [parseInt(responseId)]);
      await client.query('DELETE FROM survey_answer WHERE response_id = $1', [parseInt(responseId)]);
      await client.query('DELETE FROM survey_attachment WHERE response_id = $1', [parseInt(responseId)]);
      await client.query('DELETE FROM survey_validation WHERE response_id = $1', [parseInt(responseId)]);
      const result = await client.query('DELETE FROM survey_response WHERE response_id = $1', [parseInt(responseId)]);

      // Update survey target progress
      if (result.rowCount && result.rowCount > 0) {
        const targetQuery = 'SELECT * FROM survey_target WHERE barangay_id = (SELECT barangay_id FROM survey_response WHERE response_id = $1)';
        const targetResult = await client.query(targetQuery, [parseInt(responseId)]);
        if (targetResult.rows.length > 0) {
          const surveyTarget = targetResult.rows[0];
          const newAchieved = Math.max(0, (surveyTarget.achieved || 0) - 1);
          const newPercentage = Math.round((newAchieved / surveyTarget.target) * 100);

          await client.query(
            'UPDATE survey_target SET achieved = $1, percentage = $2, updated_at = NOW() WHERE target_id = $3',
            [newAchieved, newPercentage, surveyTarget.target_id]
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: "Response deleted successfully",
        deletedCount: result.rowCount
      })
    } else {
      return NextResponse.json({ error: "Missing responseId or barangayId parameter" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error deleting survey response:", error)
    return NextResponse.json(
      { error: "Failed to delete survey response" },
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
        sr.response_id,
        sr.survey_number,
        sr.respondent_name,
        sr.respondent_age,
        sr.respondent_gender,
        sr.respondent_educational_attainment,
        sr.respondent_household_income,
        sr.submitted_at,
        sr.status,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'section_name', ss.section_name,
              'data', ss.data
            )
          ) FILTER (WHERE ss.section_id IS NOT NULL),
          '[]'::json
        ) as survey_section
      FROM survey_response sr
      LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
      ${whereClause}
      GROUP BY sr.response_id, sr.survey_number, sr.respondent_name, sr.respondent_age, sr.respondent_gender, sr.respondent_educational_attainment, sr.respondent_household_income, sr.submitted_at, sr.status
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