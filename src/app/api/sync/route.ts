import { NextRequest, NextResponse } from "next/server"
import { Pool } from 'pg';
import { getActiveCycle, generateSurveyNumber, getNextSurveySequence } from '@/utils/surveyCycleHelpers';
import { verifyGPSLocation, GPSCoordinates } from '@/app/survey/forms/utils/gpsVerification';
import { validateSurveyNFAData } from '@/lib/validation/nfa-storage-validation';
import { getClientWithRetry } from '@/lib/db/retry-utils';
import {
  badRequestResponse,
  handleDatabaseError,
  validateRequiredFields
} from '@/lib/api/error-responses';

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

interface SyncResponse {
  questionnaireId: string;
  surveyNumber?: string;
  responseId?: number;
  status: 'success' | 'error';
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    
    const { responses } = body;

    // Requirement 3.1, 3.2: Validate input structure
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return badRequestResponse(
        "Invalid request: 'responses' must be a non-empty array"
      );
    }

    // Requirement 3.3: Get database client with retry logic for connection failures
    client = await getClientWithRetry(pool, { maxAttempts: 3 });

    // Get active survey cycle
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return badRequestResponse(
        "No active survey cycle found. Please set an active cycle before syncing survey responses."
      );
    }

    const results: SyncResponse[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    // Process each response
    for (const response of responses) {
      try {
        const {
          surveyNumber,
          location,
          selectedMember,
          interviewerId,
          barangayId,
          respondentDemographics,
          sections,
          questionnaireId,
          spotId,
          verificationLocation
        } = response;

        // Requirement 3.1, 3.2: Validate required fields for this response
        const missingFields = validateRequiredFields(response, ['location', 'interviewerId', 'barangayId']);
        if (missingFields.length > 0) {
          results.push({
            questionnaireId: questionnaireId || 'unknown',
            status: 'error',
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          failedCount++;
          continue;
        }

        // Requirement 3.3: Validate NFA data structure completeness before storage
        if (sections) {
          const nfaValidation = validateSurveyNFAData(sections);
          if (!nfaValidation.valid) {
            console.warn(`NFA validation errors for ${questionnaireId}:`, nfaValidation.errors);
            results.push({
              questionnaireId: questionnaireId || 'unknown',
              status: 'error',
              error: `NFA validation failed: ${nfaValidation.errors.join('; ')}`
            });
            failedCount++;
            continue;
          }
          
          // Log warnings even if validation passes
          if (nfaValidation.warnings && nfaValidation.warnings.length > 0) {
            console.warn(`NFA validation warnings for ${questionnaireId}:`, nfaValidation.warnings);
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

            // Calculate GPS verification if both locations are available
            let gpsVerificationStatus = 'pending';
            let gpsDistanceMeters: number | null = null;
            
            if (verificationLocation && spotId) {
              // Get assigned spot location
              const spotQuery = 'SELECT location_lat, location_lng FROM spots WHERE spot_id = $1';
              const spotResult = await client.query(spotQuery, [parseInt(spotId)]);
              
              if (spotResult.rows.length > 0 && spotResult.rows[0].location_lat && spotResult.rows[0].location_lng) {
                const assignedSpot: GPSCoordinates = {
                  lat: parseFloat(spotResult.rows[0].location_lat),
                  lng: parseFloat(spotResult.rows[0].location_lng)
                };
                
                const actualLocation: GPSCoordinates = {
                  lat: verificationLocation.lat,
                  lng: verificationLocation.lng,
                  accuracy: verificationLocation.accuracy,
                  timestamp: verificationLocation.timestamp
                };
                
                // Verify GPS location (default threshold: 200m)
                const verification = verifyGPSLocation(assignedSpot, actualLocation);
                gpsDistanceMeters = verification.distanceMeters;
                gpsVerificationStatus = verification.flagForReview ? 'flagged' : 'verified';
                
                console.log(`📍 GPS Verification (Update): ${gpsDistanceMeters}m - Status: ${gpsVerificationStatus}`);
              }
            }

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
              verificationLocation ? JSON.stringify(verificationLocation) : null,
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

          // Calculate GPS verification if both locations are available
          let gpsVerificationStatus = 'pending';
          let gpsDistanceMeters: number | null = null;
          
          if (verificationLocation && spotId) {
            // Get assigned spot location
            const spotQuery = 'SELECT location_lat, location_lng FROM spots WHERE spot_id = $1';
            const spotResult = await client.query(spotQuery, [parseInt(spotId)]);
            
            if (spotResult.rows.length > 0 && spotResult.rows[0].location_lat && spotResult.rows[0].location_lng) {
              const assignedSpot: GPSCoordinates = {
                lat: parseFloat(spotResult.rows[0].location_lat),
                lng: parseFloat(spotResult.rows[0].location_lng)
              };
              
              const actualLocation: GPSCoordinates = {
                lat: verificationLocation.lat,
                lng: verificationLocation.lng,
                accuracy: verificationLocation.accuracy,
                timestamp: verificationLocation.timestamp
              };
              
              // Verify GPS location (default threshold: 200m)
              const verification = verifyGPSLocation(assignedSpot, actualLocation);
              gpsDistanceMeters = verification.distanceMeters;
              gpsVerificationStatus = verification.flagForReview ? 'flagged' : 'verified';
              
              console.log(`📍 GPS Verification: ${gpsDistanceMeters}m - Status: ${gpsVerificationStatus}`);
            }
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
            verificationLocation ? JSON.stringify(verificationLocation) : null,
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
          results.push({
            questionnaireId: questionnaireId || 'unknown',
            status: 'error',
            error: 'Failed to create or update survey response'
          });
          failedCount++;
          continue;
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

        // Success
        results.push({
          questionnaireId: questionnaireId || 'N/A',
          surveyNumber: finalSurveyNumber,
          responseId: responseId,
          status: 'success',
          message: isUpdate ? 'Updated successfully' : 'Created successfully'
        });
        syncedCount++;

      } catch (error) {
        console.error(`Error processing response for questionnaire ${response.questionnaireId}:`, error);
        results.push({
          questionnaireId: response.questionnaireId || 'unknown',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      total: responses.length,
      results: results,
      message: `Synced ${syncedCount} of ${responses.length} responses`
    });

  } catch (error) {
    // Requirement 3.3: Return appropriate HTTP status codes and error messages
    return handleDatabaseError(error, 'process bulk sync');
  } finally {
    if (client) {
      client.release();
    }
  }
}
