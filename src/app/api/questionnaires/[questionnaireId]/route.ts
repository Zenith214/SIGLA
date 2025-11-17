import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * GET /api/questionnaires/:questionnaireId
 * Get questionnaire details with visit history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { questionnaireId: string } }
) {
  try {
    const { questionnaireId } = params;

    // Validate questionnaireId parameter
    if (!questionnaireId || typeof questionnaireId !== 'string' || questionnaireId.trim().length === 0) {
      throw createValidationError("Questionnaire ID is required and must be a non-empty string", 'questionnaireId');
    }

    // Fetch questionnaire with related data
    const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select(`
        questionnaire_id,
        spot_id,
        cycle_id,
        sequence_number,
        status,
        visit_count,
        created_at,
        updated_at,
        spot:spot_id (
          spot_id,
          spot_name,
          barangay_id,
          starting_point,
          random_start,
          barangay:barangay_id (
            barangay_name
          )
        )
      `)
      .eq('questionnaire_id', questionnaireId.trim())
      .single();

    if (questionnaireError) {
      if (questionnaireError.code === 'PGRST116') {
        throw createNotFoundError('Questionnaire');
      }
      throw handleDatabaseError(questionnaireError, 'fetch questionnaire');
    }

    if (!questionnaire) {
      throw createNotFoundError('Questionnaire');
    }

    // Fetch all visits for this questionnaire, ordered by timestamp
    const { data: visits, error: visitsError } = await supabaseAdmin
      .from('visits')
      .select('visit_id, visit_number, visit_timestamp, outcome, notes, location_lat, location_lng, created_at')
      .eq('questionnaire_id', questionnaireId.trim())
      .order('visit_timestamp', { ascending: true });

    if (visitsError) {
      throw handleDatabaseError(visitsError, 'fetch visits');
    }

    // Fetch survey response if completed
    const { data: surveyResponse, error: surveyError } = await supabaseAdmin
      .from('survey_response')
      .select('response_id, survey_number, status, completed_at, respondent_name, respondent_age, respondent_gender')
      .eq('questionnaire_id', questionnaireId.trim())
      .maybeSingle();

    // Note: maybeSingle() doesn't throw error if no record found, just returns null
    // Only throw if there's an actual database error
    if (surveyError && surveyError.code !== 'PGRST116') {
      throw handleDatabaseError(surveyError, 'fetch survey response');
    }

    // Format the response
    const spot = Array.isArray(questionnaire.spot) ? questionnaire.spot[0] : questionnaire.spot;
    const barangay = spot?.barangay ? (Array.isArray(spot.barangay) ? spot.barangay[0] : spot.barangay) : null;

    const response = {
      questionnaireId: questionnaire.questionnaire_id,
      spotId: questionnaire.spot_id,
      cycleId: questionnaire.cycle_id,
      sequenceNumber: questionnaire.sequence_number,
      status: questionnaire.status,
      visitCount: questionnaire.visit_count || 0,
      createdAt: questionnaire.created_at,
      updatedAt: questionnaire.updated_at,
      spot: spot ? {
        spotId: spot.spot_id,
        spotName: spot.spot_name,
        barangayId: spot.barangay_id,
        barangayName: barangay?.barangay_name || null,
        startingPoint: spot.starting_point,
        randomStart: spot.random_start
      } : null,
      visits: (visits || []).map(visit => ({
        visitId: visit.visit_id,
        visitNumber: visit.visit_number,
        timestamp: visit.visit_timestamp,
        outcome: visit.outcome,
        notes: visit.notes,
        location: (visit.location_lat && visit.location_lng) ? {
          lat: parseFloat(visit.location_lat),
          lng: parseFloat(visit.location_lng)
        } : null,
        createdAt: visit.created_at
      })),
      surveyData: surveyResponse ? {
        responseId: surveyResponse.response_id,
        surveyNumber: surveyResponse.survey_number,
        status: surveyResponse.status,
        completedAt: surveyResponse.completed_at,
        respondentName: surveyResponse.respondent_name,
        respondentAge: surveyResponse.respondent_age,
        respondentGender: surveyResponse.respondent_gender
      } : null
    };

    return NextResponse.json(response);

  } catch (error: any) {
    return createErrorResponse(error, 'GET /api/questionnaires/:questionnaireId', {
      questionnaireId: params.questionnaireId
    });
  }
}
