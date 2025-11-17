import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * POST /api/visits
 * Log a visit attempt to a questionnaire
 */
export async function POST(request: NextRequest) {
  let requestBody: any = {};
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      requestBody = body; // Store for error context
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { questionnaireId, outcome, notes, location } = body;

    // Validate required fields
    if (!questionnaireId || !outcome) {
      throw createValidationError("Missing required fields: questionnaireId, outcome");
    }

    // Validate field types
    if (typeof questionnaireId !== 'string' || questionnaireId.trim().length === 0) {
      throw createValidationError('questionnaireId must be a non-empty string', 'questionnaireId');
    }

    if (typeof outcome !== 'string') {
      throw createValidationError('outcome must be a string', 'outcome');
    }

    // Validate outcome value
    const validOutcomes = ['Callback_Needed', 'Interview_Started', 'Interview_Completed', 'Refused', 'Household_Moved'];
    if (!validOutcomes.includes(outcome)) {
      throw createValidationError(
        `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}`,
        'outcome',
        outcome
      );
    }

    // Validate notes if provided
    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      throw createValidationError('notes must be a string', 'notes');
    }

    // Validate location if provided
    if (location !== undefined && location !== null) {
      if (typeof location !== 'object') {
        throw createValidationError('location must be an object', 'location');
      }
      if (location.lat !== undefined && typeof location.lat !== 'number') {
        throw createValidationError('location.lat must be a number', 'location.lat');
      }
      if (location.lng !== undefined && typeof location.lng !== 'number') {
        throw createValidationError('location.lng must be a number', 'location.lng');
      }
    }

    // Verify questionnaire exists
    const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('questionnaire_id, spot_id, cycle_id, status, visit_count')
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

    // Check if questionnaire is already completed
    if (questionnaire.status === 'Completed') {
      throw createValidationError(
        'Cannot log visit for completed questionnaire',
        'questionnaireId',
        questionnaireId
      );
    }

    // Get current visit count
    const currentVisitCount = questionnaire.visit_count || 0;
    const newVisitNumber = currentVisitCount + 1;

    // Create visit record
    const visitData: any = {
      questionnaire_id: questionnaireId,
      visit_number: newVisitNumber,
      visit_timestamp: new Date().toISOString(),
      outcome: outcome,
      notes: notes || null
    };

    // Add location if provided
    if (location && location.lat && location.lng) {
      visitData.location_lat = location.lat;
      visitData.location_lng = location.lng;
    }

    const { data: visit, error: visitError } = await supabaseAdmin
      .from('visits')
      .insert(visitData)
      .select()
      .single();

    if (visitError) {
      throw handleDatabaseError(visitError, 'create visit record');
    }

    if (!visit) {
      throw new Error('Failed to create visit record: No data returned');
    }

    // Increment visit count on questionnaire
    const { error: updateCountError } = await supabaseAdmin
      .from('questionnaires')
      .update({ visit_count: newVisitNumber })
      .eq('questionnaire_id', questionnaireId);

    if (updateCountError) {
      throw handleDatabaseError(updateCountError, 'update visit count');
    }

    // Determine new questionnaire status based on visit count and outcome
    let newStatus = questionnaire.status;
    
    if (outcome === 'Interview_Completed') {
      newStatus = 'Completed';
    } else if (outcome === 'Interview_Started') {
      newStatus = 'In_Progress';
    } else if (outcome === 'Callback_Needed' || outcome === 'Refused' || outcome === 'Household_Moved') {
      // Check if we've reached 3 failed attempts
      const failedAttempts = newVisitNumber;
      
      if (failedAttempts >= 3) {
        newStatus = 'Flagged_For_Substitution';
      } else {
        newStatus = 'In_Progress';
      }
    }

    // Update questionnaire status if it changed
    if (newStatus !== questionnaire.status) {
      const { error: updateStatusError } = await supabaseAdmin
        .from('questionnaires')
        .update({ status: newStatus })
        .eq('questionnaire_id', questionnaireId);

      if (updateStatusError) {
        throw handleDatabaseError(updateStatusError, 'update questionnaire status');
      }
    }

    return NextResponse.json({
      visitId: visit.visit_id,
      visitNumber: newVisitNumber,
      questionnaireStatus: newStatus,
      message: "Visit logged successfully",
      ...(newStatus === 'Flagged_For_Substitution' && {
        warning: 'Questionnaire flagged for substitution after 3 failed attempts'
      })
    }, { status: 201 });

  } catch (error: any) {
    return createErrorResponse(error, 'POST /api/visits', {
      questionnaireId: requestBody.questionnaireId,
      outcome: requestBody.outcome
    });
  }
}
