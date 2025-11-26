import { NextRequest, NextResponse } from "next/server"
import { Pool } from 'pg';
import { getActiveCycle, generateSurveyNumber, getNextSurveySequence } from '@/utils/surveyCycleHelpers';
import { verifyGPSLocation, validateGPSCoordinates, type GPSCoordinates } from '@/app/survey/forms/utils/gpsVerification';

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
      verificationLocation,
      selectedMember,
      interviewerId,
      barangayId,
      respondentDemographics,
      sections,
      questionnaireId,
      spotId
    } = body

    // Validate required fields
    if (!location || !interviewerId || !barangayId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get active survey cycle
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return NextResponse.json(
        { error: "No active survey cycle found. Please set an active cycle before creating survey responses." },
        { status: 400 }
      )
    }

    // Calculate GPS verification if verificationLocation is provided
    let gpsVerificationStatus = 'pending';
    let gpsDistanceMeters: number | null = null;
    let verificationLocationJson: any = null;

    if (verificationLocation && validateGPSCoordinates(verificationLocation)) {
      verificationLocationJson = verificationLocation;

      // Get assigned spot location if spotId is provided
      if (spotId) {
        try {
          const spotQuery = 'SELECT starting_point FROM spots WHERE spot_id = $1';
          const spotResult = await client.query(spotQuery, [parseInt(spotId)]);
          
          if (spotResult.rows.length > 0 && spotResult.rows[0].starting_point) {
            const assignedSpot = spotResult.rows[0].starting_point as GPSCoordinates;
            
            // Verify GPS location against assigned spot
            const verificationResult = verifyGPSLocation(
              assignedSpot,
              verificationLocation,
              { thresholdMeters: parseInt(process.env.GPS_VERIFICATION_THRESHOLD || '200') }
            );

            gpsDistanceMeters = verificationResult.distanceMeters;
            gpsVerificationStatus = verificationResult.flagForReview ? 'flagged' : 'verified';
          }
        } catch (error) {
          console.error('Error calculating GPS verification:', error);
          // Continue with pending status if verification fails
        }
      }
    }

    // Check if this is an update (multi-visit scenario) or new record
    let responseId: number | undefined;
    let isUpdate = false;
    let finalSurveyNumber = surveyNumber;

    if (questionnaireId) {
      // Check if record exists for this questionnaire_id + cycle_id
      const existingQuery = `
        SELECT response_id, survey_number, visit_count 
        FROM survey_response 
        WHERE questionnaire_id = $1 AND survey_cycle_id = $2
        LIMIT 1
      `;
      const existingResult = await client.query(existingQuery, [questionnaireId, activeCycle.cycle_id]);

      if (existingResult.rows.length > 0) {
        // Update existing record (multi-visit scenario)
        isUpdate = true;
        responseId = existingResult.rows[0].response_id;
        finalSurveyNumber = existingResult.rows[0].survey_number;
        const currentVisitCount = existingResult.rows[0].visit_count || 1;

        // Map gender values to match database enum
        let genderValue = respondentDemographics?.gender || null;
        if (genderValue === "LGBTQI+") {
          genderValue = "LGBTQI";
        } else if (genderValue === "Prefer not to say") {
          genderValue = "PreferNotToSay";
        }

        // Update the existing record
        const updateQuery = `
          UPDATE survey_response SET
            respondent_name = $1,
            respondent_age = $2,
            respondent_gender = $3,
            respondent_educational_attainment = $4,
            respondent_household_income = $5,
            respondent_purok = $6,
            location_lat = $7,
            location_lng = $8,
            location_address = $9,
            location_accuracy = $10,
            location_timestamp = $11,
            location_barangay = $12,
            location_municipality = $13,
            location_province = $14,
            verification_location = $15,
            gps_verification_status = $16,
            gps_distance_meters = $17,
            status = $18,
            progress = $19,
            visit_count = $20,
            completed_at = NOW(),
            submitted_at = NOW(),
            updated_at = NOW()
          WHERE response_id = $21
        `;

        await client.query(updateQuery, [
          selectedMember,
          respondentDemographics?.age || null,
          genderValue,
          respondentDemographics?.educationalAttainment || null,
          respondentDemographics?.householdIncome || null,
          respondentDemographics?.purok || null,
          parseFloat(location.lat),
          parseFloat(location.lng),
          location.address,
          location.accuracy ? parseFloat(location.accuracy) : null,
          location.timestamp ? new Date(location.timestamp) : null,
          location.barangay,
          location.municipality,
          location.province,
          verificationLocationJson ? JSON.stringify(verificationLocationJson) : null,
          gpsVerificationStatus,
          gpsDistanceMeters,
          'completed',
          100,
          currentVisitCount + 1,
          responseId
        ]);

        // Delete existing sections before re-inserting
        await client.query('DELETE FROM survey_section WHERE response_id = $1', [responseId]);
      }
    }

    if (!isUpdate) {
      // Generate survey number if not provided, using cycle-aware format
      if (!finalSurveyNumber) {
        const sequenceNumber = await getNextSurveySequence(parseInt(barangayId));
        finalSurveyNumber = await generateSurveyNumber(parseInt(barangayId), sequenceNumber);
      }

      // Create new survey response record
      const insertQuery = `
        INSERT INTO survey_response (
          survey_number, barangay_id, interviewer_id, survey_cycle_id, questionnaire_id, spot_id,
          respondent_name, respondent_age, respondent_gender, respondent_educational_attainment,
          respondent_household_income, respondent_purok, location_lat, location_lng,
          location_address, location_accuracy, location_timestamp,
          location_barangay, location_municipality, location_province,
          verification_location, gps_verification_status, gps_distance_meters,
          status, progress, visit_count, completed_at, submitted_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW(), NOW(), NOW())
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
        finalSurveyNumber,
        parseInt(barangayId),
        parseInt(interviewerId),
        activeCycle.cycle_id,
        questionnaireId || null,
        spotId ? parseInt(spotId) : null,
        selectedMember,
        respondentDemographics?.age || null,
        genderValue,
        respondentDemographics?.educationalAttainment || null,
        respondentDemographics?.householdIncome || null,
        respondentDemographics?.purok || null,
        parseFloat(location.lat),
        parseFloat(location.lng),
        location.address,
        location.accuracy ? parseFloat(location.accuracy) : null,
        location.timestamp ? new Date(location.timestamp) : null,
        location.barangay,
        location.municipality,
        location.province,
        verificationLocationJson ? JSON.stringify(verificationLocationJson) : null,
        gpsVerificationStatus,
        gpsDistanceMeters,
        'completed',
        100,
        1
      ]);

      responseId = responseResult.rows[0].response_id;
    }

    // Ensure responseId is defined before proceeding
    if (!responseId) {
      return NextResponse.json(
        { error: "Failed to create or update survey response" },
        { status: 500 }
      );
    }

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
            environmental: 'Environmental Management',
            overall: 'Overall Evaluation'
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

    // Auto-create visit record with outcome "Interview_Completed" if questionnaireId provided
    if (questionnaireId) {
      // Get current visit count for this questionnaire
      const visitCountQuery = `
        SELECT COALESCE(MAX(visit_number), 0) as max_visit
        FROM visits
        WHERE questionnaire_id = $1
      `;
      const visitCountResult = await client.query(visitCountQuery, [questionnaireId]);
      const nextVisitNumber = visitCountResult.rows[0].max_visit + 1;

      // Insert visit record
      const visitInsertQuery = `
        INSERT INTO visits (
          questionnaire_id, visit_number, visit_timestamp, outcome, notes,
          location_lat, location_lng, created_at
        ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, NOW())
      `;

      await client.query(visitInsertQuery, [
        questionnaireId,
        nextVisitNumber,
        'Interview_Completed',
        'Interview completed successfully',
        parseFloat(location.lat),
        parseFloat(location.lng)
      ]);

      // Update questionnaire status to "Completed" and increment visit_count
      const updateQuestionnaireQuery = `
        UPDATE questionnaires SET
          status = $1,
          visit_count = visit_count + 1,
          updated_at = NOW()
        WHERE questionnaire_id = $2
      `;

      await client.query(updateQuestionnaireQuery, ['Completed', questionnaireId]);
    }

    // Update survey target progress for the barangay in the active cycle (only for new records)
    if (!isUpdate) {
      const targetQuery = 'SELECT * FROM survey_target WHERE barangay_id = $1 AND survey_cycle_id = $2 LIMIT 1';
      const targetResult = await client.query(targetQuery, [parseInt(barangayId), activeCycle.cycle_id]);
      
      if (targetResult.rows.length > 0) {
        const surveyTarget = targetResult.rows[0];
        const newAchieved = (surveyTarget.achieved || 0) + 1;
        const newPercentage = Math.round((newAchieved / surveyTarget.target) * 100);
        
        await client.query(
          'UPDATE survey_target SET achieved = $1, percentage = $2, updated_at = NOW() WHERE target_id = $3',
          [newAchieved, newPercentage, surveyTarget.target_id]
        );
      }
    }

    return NextResponse.json({
      success: true,
      responseId: responseId,
      surveyNumber: finalSurveyNumber,
      cycleId: activeCycle.cycle_id,
      cycleName: activeCycle.name,
      questionnaireId: questionnaireId || null,
      isUpdate: isUpdate,
      gpsVerification: {
        status: gpsVerificationStatus,
        distanceMeters: gpsDistanceMeters,
        flagged: gpsVerificationStatus === 'flagged'
      },
      message: isUpdate ? "Survey updated successfully" : "Survey submitted successfully"
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
      // Get active cycle for cycle-scoped deletion
      const activeCycle = await getActiveCycle();
      if (!activeCycle) {
        return NextResponse.json({ error: "No active survey cycle found" }, { status: 400 });
      }

      // Delete all responses for the barangay in the active cycle
      await client.query('DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)', [parseInt(barangayId), activeCycle.cycle_id]);
      await client.query('DELETE FROM survey_metadata WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)', [parseInt(barangayId), activeCycle.cycle_id]);
      await client.query('DELETE FROM survey_answer WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)', [parseInt(barangayId), activeCycle.cycle_id]);
      await client.query('DELETE FROM survey_attachment WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)', [parseInt(barangayId), activeCycle.cycle_id]);
      await client.query('DELETE FROM survey_validation WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2)', [parseInt(barangayId), activeCycle.cycle_id]);
      const result = await client.query('DELETE FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2', [parseInt(barangayId), activeCycle.cycle_id]);

      // Reset survey target progress for the active cycle
      await client.query('UPDATE survey_target SET achieved = 0, percentage = 0 WHERE barangay_id = $1 AND survey_cycle_id = $2', [parseInt(barangayId), activeCycle.cycle_id]);

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

      // Update survey target progress for the cycle
      if (result.rowCount && result.rowCount > 0) {
        // Get the survey response details to find the cycle
        const responseQuery = 'SELECT barangay_id, survey_cycle_id FROM survey_response WHERE response_id = $1';
        const responseResult = await client.query(responseQuery, [parseInt(responseId)]);
        
        if (responseResult.rows.length > 0) {
          const { barangay_id, survey_cycle_id } = responseResult.rows[0];
          
          const targetQuery = 'SELECT * FROM survey_target WHERE barangay_id = $1 AND survey_cycle_id = $2';
          const targetResult = await client.query(targetQuery, [barangay_id, survey_cycle_id]);
          
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
    const cycleId = searchParams.get('cycleId')

    // Get active cycle if no specific cycle requested
    let targetCycleId = cycleId;
    if (!targetCycleId) {
      const activeCycle = await getActiveCycle();
      if (!activeCycle) {
        return NextResponse.json({ error: "No active survey cycle found" }, { status: 400 });
      }
      targetCycleId = activeCycle.cycle_id.toString();
    }

    let whereConditions = [`sr.survey_cycle_id = $1`];
    let queryParams = [parseInt(targetCycleId)];
    let paramIndex = 2;
    
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

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

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