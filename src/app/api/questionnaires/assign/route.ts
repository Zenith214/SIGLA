import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * POST /api/questionnaires/assign
 * Assign specific questionnaires to an interviewer
 * Allows flexible slot allocation within a spot
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { questionnaireIds, interviewerId } = body;

    // Validate required fields
    if (!questionnaireIds || !Array.isArray(questionnaireIds) || questionnaireIds.length === 0) {
      throw createValidationError(
        "questionnaireIds must be a non-empty array",
        'questionnaireIds',
        questionnaireIds
      );
    }

    if (!interviewerId || typeof interviewerId !== 'number') {
      throw createValidationError(
        "interviewerId must be a valid number",
        'interviewerId',
        interviewerId
      );
    }

    // Validate questionnaire IDs format
    const invalidIds = questionnaireIds.filter(id => typeof id !== 'string' || !id.trim());
    if (invalidIds.length > 0) {
      throw createValidationError(
        "All questionnaire IDs must be non-empty strings",
        'questionnaireIds',
        invalidIds
      );
    }

    // Verify interviewer exists and has correct role
    const { data: interviewer, error: interviewerError } = await supabaseAdmin
      .from('user')
      .select('id, firstName, lastName, email, role')
      .eq('id', interviewerId)
      .single();

    if (interviewerError) {
      if (interviewerError.code === 'PGRST116') {
        throw createNotFoundError('Interviewer');
      }
      throw handleDatabaseError(interviewerError, 'fetch interviewer');
    }

    if (!interviewer) {
      throw createNotFoundError('Interviewer');
    }

    // Validate interviewer role
    const role = (interviewer.role || '').toLowerCase();
    if (role !== 'interviewer') {
      throw createValidationError(
        "User must have INTERVIEWER role",
        'interviewerId',
        interviewerId
      );
    }

    // Verify all questionnaires exist and are in the same spot
    const { data: questionnaires, error: questionnairesError } = await supabaseAdmin
      .from('questionnaires')
      .select('questionnaire_id, spot_id, status, assigned_interviewer_id')
      .in('questionnaire_id', questionnaireIds);

    if (questionnairesError) {
      throw handleDatabaseError(questionnairesError, 'fetch questionnaires');
    }

    if (!questionnaires || questionnaires.length === 0) {
      throw createNotFoundError('Questionnaires');
    }

    // Check if all requested questionnaires were found
    if (questionnaires.length !== questionnaireIds.length) {
      const foundIds = questionnaires.map(q => q.questionnaire_id);
      const missingIds = questionnaireIds.filter(id => !foundIds.includes(id));
      throw createValidationError(
        `Some questionnaires not found: ${missingIds.join(', ')}`,
        'questionnaireIds',
        missingIds
      );
    }

    // Verify all questionnaires are from the same spot
    const spotIds = [...new Set(questionnaires.map(q => q.spot_id))];
    if (spotIds.length > 1) {
      throw createValidationError(
        "All questionnaires must be from the same spot",
        'questionnaireIds',
        questionnaireIds
      );
    }

    // Check for already assigned questionnaires
    const alreadyAssigned = questionnaires.filter(q => 
      q.assigned_interviewer_id && q.assigned_interviewer_id !== interviewerId
    );

    // Update questionnaires with new assignment
    const { data: updatedQuestionnaires, error: updateError } = await supabaseAdmin
      .from('questionnaires')
      .update({
        assigned_interviewer_id: interviewerId,
        updated_at: new Date().toISOString()
      })
      .in('questionnaire_id', questionnaireIds)
      .select();

    if (updateError) {
      throw handleDatabaseError(updateError, 'assign questionnaires');
    }

    if (!updatedQuestionnaires || updatedQuestionnaires.length === 0) {
      throw new Error('Failed to assign questionnaires: No data returned');
    }

    return NextResponse.json({
      success: true,
      assignedCount: updatedQuestionnaires.length,
      assignedTo: `${interviewer.firstName} ${interviewer.lastName}`,
      assignedToEmail: interviewer.email,
      questionnaireIds: updatedQuestionnaires.map(q => q.questionnaire_id),
      spotId: spotIds[0],
      message: `Successfully assigned ${updatedQuestionnaires.length} questionnaire${updatedQuestionnaires.length !== 1 ? 's' : ''}`,
      ...(alreadyAssigned.length > 0 && {
        warning: `${alreadyAssigned.length} questionnaire${alreadyAssigned.length !== 1 ? 's were' : ' was'} previously assigned to another interviewer`
      })
    });

  } catch (error: any) {
    return createErrorResponse(error, 'POST /api/questionnaires/assign', {
      body: request.body
    });
  }
}

/**
 * GET /api/questionnaires/assign?spotId=X
 * Get assignment status for questionnaires in a spot
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spotId = searchParams.get('spotId');

    if (!spotId) {
      throw createValidationError("spotId query parameter is required");
    }

    const spotIdNum = parseInt(spotId);
    if (isNaN(spotIdNum) || spotIdNum <= 0) {
      throw createValidationError('spotId must be a positive integer', 'spotId', spotId);
    }

    // Fetch questionnaires with assignment info
    const { data: questionnaires, error: questionnairesError } = await supabaseAdmin
      .from('questionnaires')
      .select(`
        questionnaire_id,
        spot_id,
        sequence_number,
        status,
        assigned_interviewer_id
      `)
      .eq('spot_id', spotIdNum)
      .order('sequence_number', { ascending: true });
    
    // Fetch interviewer details separately if needed
    let interviewerMap: Record<number, any> = {};
    if (questionnaires && questionnaires.length > 0) {
      const interviewerIds = [...new Set(questionnaires
        .map(q => q.assigned_interviewer_id)
        .filter(id => id !== null))];
      
      if (interviewerIds.length > 0) {
        const { data: interviewers } = await supabaseAdmin
          .from('user')
          .select('id, firstName, lastName, email')
          .in('id', interviewerIds);
        
        if (interviewers) {
          interviewerMap = Object.fromEntries(
            interviewers.map(i => [i.id, i])
          );
        }
      }
    }

    if (questionnairesError) {
      throw handleDatabaseError(questionnairesError, 'fetch questionnaires');
    }

    if (!questionnaires) {
      return NextResponse.json({
        spotId: spotIdNum,
        questionnaires: [],
        totalCount: 0,
        assignedCount: 0,
        unassignedCount: 0
      });
    }

    const assignedCount = questionnaires.filter(q => q.assigned_interviewer_id).length;
    const unassignedCount = questionnaires.length - assignedCount;

    // Group by interviewer
    const byInterviewer: Record<number, any> = {};
    questionnaires.forEach(q => {
      if (q.assigned_interviewer_id) {
        if (!byInterviewer[q.assigned_interviewer_id]) {
          const interviewer = interviewerMap[q.assigned_interviewer_id];
          byInterviewer[q.assigned_interviewer_id] = {
            interviewerId: q.assigned_interviewer_id,
            interviewerName: interviewer ? `${interviewer.firstName} ${interviewer.lastName}` : 'Unknown',
            interviewerEmail: interviewer?.email,
            questionnaireIds: [],
            count: 0
          };
        }
        byInterviewer[q.assigned_interviewer_id].questionnaireIds.push(q.questionnaire_id);
        byInterviewer[q.assigned_interviewer_id].count++;
      }
    });

    return NextResponse.json({
      spotId: spotIdNum,
      questionnaires: questionnaires.map(q => ({
        questionnaireId: q.questionnaire_id,
        sequenceNumber: q.sequence_number,
        status: q.status,
        assignedInterviewerId: q.assigned_interviewer_id,
        assignedInterviewerName: q.interviewer && Array.isArray(q.interviewer) && q.interviewer.length > 0 
          ? `${q.interviewer[0].firstName} ${q.interviewer[0].lastName}` 
          : null,
        assignedInterviewerEmail: q.interviewer && Array.isArray(q.interviewer) && q.interviewer.length > 0
          ? q.interviewer[0].email
          : null
      })),
      totalCount: questionnaires.length,
      assignedCount,
      unassignedCount,
      assignmentsByInterviewer: Object.values(byInterviewer)
    });

  } catch (error: any) {
    return createErrorResponse(error, 'GET /api/questionnaires/assign', {
      spotId: request.url
    });
  }
}
