import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycle } from '@/utils/surveyCycleHelpers';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError,
  logError
} from '@/lib/api-error-handler';
import {
  parsePaginationParams,
  createPaginatedResponse,
  getSupabaseRange
} from '@/utils/pagination';
import { calculateDisplayId } from '@/utils/displayIdCalculator';

/**
 * Generate questionnaire ID in format: {YEAR}-{BARANGAY_ID}-{SPOT_NUMBER}-{QUESTIONNAIRE_NUMBER}
 * Example: 2026-18-01-001 (Year 2026, Barangay 18, Spot 01, Questionnaire 001)
 * 
 * Format breakdown:
 * - YYYY: 4-digit year
 * - BB: Barangay ID (no padding, natural number)
 * - SS: 2-digit spot number within barangay (01, 02, 03...)
 * - QQQ: 3-digit questionnaire number within spot (001, 002, 003...)
 * 
 * Benefits of hyphen-separated format:
 * - Human-readable and unambiguous
 * - Easy to parse: id.split('-') → [year, barangayId, spotNumber, questionnaireNumber]
 * - Prevents confusion (e.g., barangay 1 spot 80 vs barangay 18 spot 0)
 */
function generateQuestionnaireId(
  year: number, 
  barangayId: number, 
  spotNumber: number, 
  questionnaireNumber: number
): string {
  const spotPart = String(spotNumber).padStart(2, '0');
  const questionnairePart = String(questionnaireNumber).padStart(3, '0');
  return `${year}-${barangayId}-${spotPart}-${questionnairePart}`;
}

/**
 * POST /api/spots
 * Create a new spot with auto-generated questionnaires
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { cycleId, barangayId, spotName, startingPoint, randomStart } = body;

    // Validate required fields
    if (!cycleId || !barangayId || !spotName || !startingPoint || randomStart === undefined) {
      throw createValidationError(
        "Missing required fields: cycleId, barangayId, spotName, startingPoint, randomStart"
      );
    }

    // Validate field types
    if (typeof cycleId !== 'number' || typeof barangayId !== 'number') {
      throw createValidationError('cycleId and barangayId must be numbers');
    }

    if (typeof spotName !== 'string' || spotName.trim().length === 0) {
      throw createValidationError('spotName must be a non-empty string', 'spotName');
    }

    // Validate randomStart range (1-999)
    if (typeof randomStart !== 'number' || randomStart < 1 || randomStart > 999) {
      throw createValidationError(
        "randomStart must be a number between 1 and 999",
        'randomStart',
        randomStart
      );
    }

    // Validate starting point structure
    if (!startingPoint || typeof startingPoint !== 'object') {
      throw createValidationError('startingPoint must be an object with lat and lng');
    }

    if (typeof startingPoint.lat !== 'number' || typeof startingPoint.lng !== 'number') {
      throw createValidationError(
        'startingPoint must contain numeric lat and lng coordinates',
        'startingPoint'
      );
    }

    // Validate coordinate ranges
    if (startingPoint.lat < -90 || startingPoint.lat > 90) {
      throw createValidationError('Latitude must be between -90 and 90', 'startingPoint.lat', startingPoint.lat);
    }

    if (startingPoint.lng < -180 || startingPoint.lng > 180) {
      throw createValidationError('Longitude must be between -180 and 180', 'startingPoint.lng', startingPoint.lng);
    }

    // Verify cycle exists
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id, year')
      .eq('cycle_id', cycleId)
      .single();

    if (cycleError) {
      if (cycleError.code === 'PGRST116') {
        throw createNotFoundError('Survey cycle');
      }
      throw handleDatabaseError(cycleError, 'fetch survey cycle');
    }

    if (!cycle) {
      throw createNotFoundError('Survey cycle');
    }

    // Verify barangay exists
    const { data: barangay, error: barangayError } = await supabaseAdmin
      .from('barangay')
      .select('barangay_id')
      .eq('barangay_id', barangayId)
      .single();

    if (barangayError) {
      if (barangayError.code === 'PGRST116') {
        throw createNotFoundError('Barangay');
      }
      throw handleDatabaseError(barangayError, 'fetch barangay');
    }

    if (!barangay) {
      throw createNotFoundError('Barangay');
    }

    // Get the spot number for this barangay (how many spots already exist in this barangay for this cycle)
    const { count: spotCount, error: spotCountError } = await supabaseAdmin
      .from('spots')
      .select('spot_id', { count: 'exact', head: true })
      .eq('barangay_id', barangayId)
      .eq('cycle_id', cycleId);

    if (spotCountError) {
      throw handleDatabaseError(spotCountError, 'count spots for barangay');
    }

    const spotNumber = (spotCount || 0) + 1;

    // Create the spot
    const { data: spot, error: spotError } = await supabaseAdmin
      .from('spots')
      .insert({
        cycle_id: cycleId,
        barangay_id: barangayId,
        spot_name: spotName.trim(),
        starting_point: startingPoint,
        random_start: randomStart,
        status: 'Pending'
      })
      .select()
      .single();

    if (spotError) {
      throw handleDatabaseError(spotError, 'create spot');
    }

    if (!spot) {
      throw new Error('Failed to create spot: No data returned');
    }

    // Generate questionnaire IDs based on specified count (default 5 for backward compatibility)
    const numberOfQuestionnaires = body.numberOfQuestionnaires || 5;
    
    // Validate numberOfQuestionnaires
    if (numberOfQuestionnaires < 1 || numberOfQuestionnaires > 50) {
      return NextResponse.json(
        { error: 'Number of questionnaires must be between 1 and 50' },
        { status: 400 }
      );
    }

    const questionnaireIds: string[] = [];
    const questionnaireInserts = [];

    // Generate questionnaires with format: YYYY-BBSS-QQQ
    for (let i = 0; i < numberOfQuestionnaires; i++) {
      const questionnaireNumber = i + 1; // 1, 2, 3, 4, 5 within this spot
      const questionnaireId = generateQuestionnaireId(cycle.year, barangayId, spotNumber, questionnaireNumber);
      questionnaireIds.push(questionnaireId);
      
      questionnaireInserts.push({
        questionnaire_id: questionnaireId,
        spot_id: spot.spot_id,
        cycle_id: cycleId,
        sequence_number: i + 1, // Sequence within the spot (1-5)
        status: 'Pending',
        visit_count: 0
      });
    }

    // Insert all questionnaires
    const { error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .insert(questionnaireInserts);

    if (questionnaireError) {
      // Rollback: delete the spot if questionnaire creation fails
      logError(
        handleDatabaseError(questionnaireError, 'create questionnaires'),
        'POST /api/spots',
        { spotId: spot.spot_id, action: 'rollback' }
      );

      await supabaseAdmin
        .from('spots')
        .delete()
        .eq('spot_id', spot.spot_id);
      
      throw handleDatabaseError(questionnaireError, 'create questionnaires');
    }

    return NextResponse.json({
      spotId: spot.spot_id,
      spotName: spot.spot_name,
      questionnaires: questionnaireIds,
      message: `Spot created successfully with ${numberOfQuestionnaires} questionnaire${numberOfQuestionnaires !== 1 ? 's' : ''}`
    }, { status: 201 });

  } catch (error: any) {
    return createErrorResponse(error, 'POST /api/spots', {
      body: { cycleId: request.body, barangayId: request.body }
    });
  }
}

/**
 * GET /api/spots
 * Retrieve spots with optional filtering and pagination
 * Note: cycleId filter is strongly recommended for performance
 * 
 * Query Parameters:
 * - cycleId: Filter by survey cycle
 * - barangayId: Filter by barangay
 * - assignedFiId: Filter by assigned field interviewer
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');
    const barangayId = searchParams.get('barangayId');
    const assignedFiId = searchParams.get('assignedFiId');
    
    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(searchParams);

    // Validate cycleId if provided
    if (cycleId) {
      const parsedCycleId = parseInt(cycleId);
      if (isNaN(parsedCycleId) || parsedCycleId <= 0) {
        throw createValidationError("cycleId must be a positive integer", 'cycleId', cycleId);
      }

      // Verify cycle exists
      const { data: cycle, error: cycleError } = await supabaseAdmin
        .from('survey_cycle')
        .select('cycle_id')
        .eq('cycle_id', parsedCycleId)
        .single();

      if (cycleError) {
        if (cycleError.code === 'PGRST116') {
          throw createNotFoundError('Survey cycle');
        }
        throw handleDatabaseError(cycleError, 'fetch survey cycle');
      }

      if (!cycle) {
        throw createNotFoundError('Survey cycle');
      }
    }

    // Validate barangayId if provided
    if (barangayId) {
      const parsedBarangayId = parseInt(barangayId);
      if (isNaN(parsedBarangayId) || parsedBarangayId <= 0) {
        throw createValidationError("barangayId must be a positive integer", 'barangayId', barangayId);
      }
    }

    // Validate assignedFiId if provided
    if (assignedFiId) {
      const parsedFiId = parseInt(assignedFiId);
      if (isNaN(parsedFiId) || parsedFiId <= 0) {
        throw createValidationError("assignedFiId must be a positive integer", 'assignedFiId', assignedFiId);
      }
    }

    // Build count query for pagination
    let countQuery = supabaseAdmin
      .from('spots')
      .select('spot_id', { count: 'exact', head: true });

    // Apply filters to count query
    if (cycleId) {
      countQuery = countQuery.eq('cycle_id', parseInt(cycleId));
    }
    if (barangayId) {
      countQuery = countQuery.eq('barangay_id', parseInt(barangayId));
    }
    if (assignedFiId) {
      countQuery = countQuery.eq('assigned_fi_id', parseInt(assignedFiId));
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      throw handleDatabaseError(countError, 'count spots');
    }

    // Build data query with optimized select
    let query = supabaseAdmin
      .from('spots')
      .select(`
        spot_id,
        cycle_id,
        barangay_id,
        spot_name,
        starting_point,
        random_start,
        assigned_fi_id,
        status,
        created_at,
        updated_at,
        barangay:barangay_id (
          barangay_name
        ),
        assigned_fi:assigned_fi_id (
          id,
          firstName,
          lastName,
          email
        ),
        questionnaires (
          questionnaire_id,
          status,
          visit_count
        )
      `);

    // Apply filters
    if (cycleId) {
      query = query.eq('cycle_id', parseInt(cycleId));
    }
    if (barangayId) {
      query = query.eq('barangay_id', parseInt(barangayId));
    }
    if (assignedFiId) {
      query = query.eq('assigned_fi_id', parseInt(assignedFiId));
    }

    // Apply pagination
    const { from, to } = getSupabaseRange(page, limit);
    query = query.range(from, to);

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: spots, error } = await query;

    if (error) {
      throw handleDatabaseError(error, 'fetch spots');
    }

    // Calculate completion status for each spot
    const spotsWithProgress = (spots || []).map(spot => {
      const questionnaires = spot.questionnaires || [];
      const completedCount = questionnaires.filter(q => q.status === 'Completed').length;
      const totalCount = questionnaires.length;
      const inProgressCount = questionnaires.filter(q => q.status === 'In_Progress').length;

      // Determine overall spot status
      let spotStatus = spot.status;
      if (completedCount === totalCount && totalCount > 0) {
        spotStatus = 'Completed';
      } else if (inProgressCount > 0 || completedCount > 0) {
        spotStatus = 'In_Progress';
      }

      const barangay = Array.isArray(spot.barangay) ? spot.barangay[0] : spot.barangay;
      const assignedFi = Array.isArray(spot.assigned_fi) ? spot.assigned_fi[0] : spot.assigned_fi;

      return {
        spotId: spot.spot_id,
        cycleId: spot.cycle_id,
        barangayId: spot.barangay_id,
        barangayName: barangay?.barangay_name || null,
        spotName: spot.spot_name,
        startingPoint: spot.starting_point,
        randomStart: spot.random_start,
        assignedFiId: spot.assigned_fi_id,
        assignedFiName: assignedFi 
          ? `${assignedFi.firstName} ${assignedFi.lastName}`
          : null,
        assignedFiEmail: assignedFi?.email || null,
        status: spotStatus,
        completedCount,
        totalCount,
        questionnaires: questionnaires.map(q => ({
          questionnaireId: q.questionnaire_id,
          displayId: calculateDisplayId(q.questionnaire_id),
          status: q.status,
          visitCount: q.visit_count
        })),
        createdAt: spot.created_at,
        updatedAt: spot.updated_at
      };
    });

    // Create paginated response
    const paginatedResponse = createPaginatedResponse(
      spotsWithProgress,
      page,
      limit,
      totalCount || 0
    );

    return NextResponse.json({
      spots: paginatedResponse.data,
      pagination: paginatedResponse.pagination,
      // Keep legacy 'total' field for backward compatibility
      total: totalCount || 0
    });

  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    return createErrorResponse(error, 'GET /api/spots', {
      queryParams: {
        cycleId: searchParams.get('cycleId'),
        barangayId: searchParams.get('barangayId'),
        assignedFiId: searchParams.get('assignedFiId'),
        page: searchParams.get('page'),
        limit: searchParams.get('limit')
      }
    });
  }
}

/**
 * PATCH /api/spots
 * Update an existing spot (reassign, rename, update location, change status)
 * 
 * Body Parameters:
 * - spotId: (required) ID of the spot to update
 * - spotName: (optional) New name for the spot
 * - assignedFiId: (optional) New field interviewer ID (null to unassign)
 * - startingPoint: (optional) New GPS coordinates { lat, lng }
 * - status: (optional) New status ('Pending', 'In_Progress', 'Completed')
 */
export async function PATCH(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { spotId, spotName, assignedFiId, startingPoint, status } = body;

    // Validate required field
    if (!spotId) {
      throw createValidationError('spotId is required');
    }

    if (typeof spotId !== 'number' || spotId <= 0) {
      throw createValidationError('spotId must be a positive integer', 'spotId', spotId);
    }

    // Verify spot exists
    const { data: existingSpot, error: spotError } = await supabaseAdmin
      .from('spots')
      .select('spot_id, spot_name, assigned_fi_id, status')
      .eq('spot_id', spotId)
      .single();

    if (spotError) {
      if (spotError.code === 'PGRST116') {
        throw createNotFoundError('Spot');
      }
      throw handleDatabaseError(spotError, 'fetch spot');
    }

    if (!existingSpot) {
      throw createNotFoundError('Spot');
    }

    // Build update object
    const updates: any = {};

    // Validate and add spotName if provided
    if (spotName !== undefined) {
      if (typeof spotName !== 'string' || spotName.trim().length === 0) {
        throw createValidationError('spotName must be a non-empty string', 'spotName');
      }
      updates.spot_name = spotName.trim();
    }

    // Validate and add assignedFiId if provided
    if (assignedFiId !== undefined) {
      if (assignedFiId === null) {
        updates.assigned_fi_id = null;
      } else {
        if (typeof assignedFiId !== 'number' || assignedFiId <= 0) {
          throw createValidationError('assignedFiId must be a positive integer or null', 'assignedFiId', assignedFiId);
        }

        // Verify interviewer exists and is active
        const { data: interviewer, error: interviewerError } = await supabaseAdmin
          .from('user')
          .select('id, role, status')
          .eq('id', assignedFiId)
          .single();

        if (interviewerError || !interviewer) {
          throw createNotFoundError('Field Interviewer');
        }

        if (interviewer.role !== 'interviewer') {
          throw createValidationError('User must have interviewer role', 'assignedFiId', assignedFiId);
        }

        if (interviewer.status?.toLowerCase() !== 'active') {
          throw createValidationError('Interviewer must be active', 'assignedFiId', assignedFiId);
        }

        updates.assigned_fi_id = assignedFiId;
      }
    }

    // Validate and add startingPoint if provided
    if (startingPoint !== undefined) {
      if (!startingPoint || typeof startingPoint !== 'object') {
        throw createValidationError('startingPoint must be an object with lat and lng');
      }

      if (typeof startingPoint.lat !== 'number' || typeof startingPoint.lng !== 'number') {
        throw createValidationError('startingPoint must contain numeric lat and lng coordinates');
      }

      if (startingPoint.lat < -90 || startingPoint.lat > 90) {
        throw createValidationError('Latitude must be between -90 and 90', 'startingPoint.lat', startingPoint.lat);
      }

      if (startingPoint.lng < -180 || startingPoint.lng > 180) {
        throw createValidationError('Longitude must be between -180 and 180', 'startingPoint.lng', startingPoint.lng);
      }

      updates.starting_point = startingPoint;
    }

    // Validate and add status if provided
    if (status !== undefined) {
      const validStatuses = ['Pending', 'In_Progress', 'Completed'];
      if (!validStatuses.includes(status)) {
        throw createValidationError(
          `status must be one of: ${validStatuses.join(', ')}`,
          'status',
          status
        );
      }
      updates.status = status;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        message: 'No updates provided',
        spot: existingSpot
      });
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Perform update
    const { data: updatedSpot, error: updateError } = await supabaseAdmin
      .from('spots')
      .update(updates)
      .eq('spot_id', spotId)
      .select(`
        spot_id,
        cycle_id,
        barangay_id,
        spot_name,
        starting_point,
        random_start,
        assigned_fi_id,
        status,
        created_at,
        updated_at,
        barangay:barangay_id (
          barangay_name
        ),
        assigned_fi:assigned_fi_id (
          id,
          firstName,
          lastName,
          email
        )
      `)
      .single();

    if (updateError) {
      throw handleDatabaseError(updateError, 'update spot');
    }

    const barangay = Array.isArray(updatedSpot.barangay) ? updatedSpot.barangay[0] : updatedSpot.barangay;
    const assignedFi = Array.isArray(updatedSpot.assigned_fi) ? updatedSpot.assigned_fi[0] : updatedSpot.assigned_fi;

    return NextResponse.json({
      message: 'Spot updated successfully',
      spot: {
        spotId: updatedSpot.spot_id,
        cycleId: updatedSpot.cycle_id,
        barangayId: updatedSpot.barangay_id,
        barangayName: barangay?.barangay_name || null,
        spotName: updatedSpot.spot_name,
        startingPoint: updatedSpot.starting_point,
        randomStart: updatedSpot.random_start,
        assignedFiId: updatedSpot.assigned_fi_id,
        assignedFiName: assignedFi 
          ? `${assignedFi.firstName} ${assignedFi.lastName}`
          : null,
        assignedFiEmail: assignedFi?.email || null,
        status: updatedSpot.status,
        createdAt: updatedSpot.created_at,
        updatedAt: updatedSpot.updated_at
      },
      changes: updates
    });

  } catch (error: any) {
    return createErrorResponse(error, 'PATCH /api/spots', {
      body: request.body
    });
  }
}

/**
 * DELETE /api/spots
 * Delete a spot and all its associated questionnaires
 * 
 * Query Parameters:
 * - spotId: (required) ID of the spot to delete
 * - confirm: (required) Must be 'DELETE' to confirm deletion
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spotId = searchParams.get('spotId');
    const confirm = searchParams.get('confirm');
    const force = searchParams.get('force') === 'true';

    // Validate required parameters
    if (!spotId) {
      throw createValidationError('spotId is required');
    }

    if (confirm !== 'DELETE') {
      throw createValidationError('confirm parameter must be "DELETE" to proceed with deletion');
    }

    const parsedSpotId = parseInt(spotId);
    if (isNaN(parsedSpotId) || parsedSpotId <= 0) {
      throw createValidationError('spotId must be a positive integer', 'spotId', spotId);
    }

    // Verify spot exists and get details
    const { data: spot, error: spotError } = await supabaseAdmin
      .from('spots')
      .select(`
        spot_id,
        spot_name,
        barangay_id,
        cycle_id,
        questionnaires (
          questionnaire_id,
          status
        )
      `)
      .eq('spot_id', parsedSpotId)
      .single();

    if (spotError) {
      if (spotError.code === 'PGRST116') {
        throw createNotFoundError('Spot');
      }
      throw handleDatabaseError(spotError, 'fetch spot');
    }

    if (!spot) {
      throw createNotFoundError('Spot');
    }

    // Check if any questionnaires have responses
    const questionnaireIds = spot.questionnaires?.map(q => q.questionnaire_id) || [];
    let deletedResponses = 0;
    let deletedVisits = 0;
    
    if (questionnaireIds.length > 0) {
      const { count: responseCount, error: responseError } = await supabaseAdmin
        .from('survey_response')
        .select('survey_number', { count: 'exact', head: true })
        .in('survey_number', questionnaireIds);

      if (responseError) {
        throw handleDatabaseError(responseError, 'check for survey responses');
      }

      if (responseCount && responseCount > 0) {
        if (!force) {
          throw createValidationError(
            `Cannot delete spot: ${responseCount} survey response(s) exist for this spot's questionnaires. Use force=true to delete anyway.`,
            'spotId',
            parsedSpotId
          );
        }

        // Force delete: First get the response records to find their integer IDs
        const { data: responses, error: getResponsesError } = await supabaseAdmin
          .from('survey_response')
          .select('*')
          .in('survey_number', questionnaireIds);

        if (getResponsesError) {
          console.error('Error fetching survey responses:', getResponsesError);
          throw handleDatabaseError(getResponsesError, 'fetch survey responses');
        }

        // Find the ID column (could be 'response_id', 'id', or similar)
        const responseIds = responses?.map(r => r.response_id || r.id || r.survey_response_id) || [];

        if (responseIds.length > 0 && responseIds[0] !== undefined) {
          // Delete survey sections FIRST (they reference survey_response by integer ID)
          console.log(`⚠️ FORCE DELETE: Deleting survey sections for ${responseIds.length} responses`);
          const { error: deleteSectionsError } = await supabaseAdmin
            .from('survey_section')
            .delete()
            .in('response_id', responseIds);

          if (deleteSectionsError) {
            console.error('Error deleting survey sections:', deleteSectionsError);
            throw handleDatabaseError(deleteSectionsError, 'delete survey sections');
          }
        }

        // Then delete survey responses
        console.log(`⚠️ FORCE DELETE: Deleting ${responseCount} survey responses for spot ${parsedSpotId}`);
        const { error: deleteResponsesError } = await supabaseAdmin
          .from('survey_response')
          .delete()
          .in('survey_number', questionnaireIds);

        if (deleteResponsesError) {
          console.error('Error deleting survey responses:', deleteResponsesError);
          throw handleDatabaseError(deleteResponsesError, 'delete survey responses');
        }

        deletedResponses = responseCount;
      }

    }

    // Delete visits BEFORE deleting questionnaires (foreign key constraint)
    if (questionnaireIds.length > 0) {
      const { count: visitCount, error: visitCountError } = await supabaseAdmin
        .from('visits')
        .select('visit_id', { count: 'exact', head: true })
        .in('questionnaire_id', questionnaireIds);

      if (!visitCountError && visitCount && visitCount > 0) {
        console.log(`⚠️ Deleting ${visitCount} visits for spot ${parsedSpotId}`);
        const { error: deleteVisitsError } = await supabaseAdmin
          .from('visits')
          .delete()
          .in('questionnaire_id', questionnaireIds);

        if (deleteVisitsError) {
          console.error('Error deleting visits:', deleteVisitsError);
          throw handleDatabaseError(deleteVisitsError, 'delete visits');
        }

        deletedVisits = visitCount;
      }

      // Delete questionnaires AFTER visits are deleted
      const { error: deleteQuestionnairesError } = await supabaseAdmin
        .from('questionnaires')
        .delete()
        .eq('spot_id', parsedSpotId);

      if (deleteQuestionnairesError) {
        console.error('Error deleting questionnaires:', deleteQuestionnairesError);
        throw handleDatabaseError(deleteQuestionnairesError, 'delete questionnaires');
      }
    }

    // Delete the spot
    const { error: deleteSpotError } = await supabaseAdmin
      .from('spots')
      .delete()
      .eq('spot_id', parsedSpotId);

    if (deleteSpotError) {
      throw handleDatabaseError(deleteSpotError, 'delete spot');
    }

    // Recalculate survey target progress for the affected barangay
    // This ensures the dashboard shows updated progress after spot deletion
    try {
      const recalcResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/survey-targets/calculate-progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            barangayId: spot.barangay_id,
            cycleId: spot.cycle_id
          })
        }
      );

      if (!recalcResponse.ok) {
        console.warn('Failed to recalculate survey target progress after spot deletion');
      }
    } catch (recalcError) {
      console.error('Error recalculating survey target progress:', recalcError);
      // Don't fail the deletion if recalculation fails
    }

    const response: any = {
      message: force ? 'Spot force deleted successfully (including all survey data)' : 'Spot deleted successfully',
      deletedSpot: {
        spotId: spot.spot_id,
        spotName: spot.spot_name,
        barangayId: spot.barangay_id,
        cycleId: spot.cycle_id
      },
      deletedQuestionnaires: questionnaireIds.length
    };

    if (deletedResponses > 0) {
      response.deletedResponses = deletedResponses;
    }

    if (deletedVisits > 0) {
      response.deletedVisits = deletedVisits;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    return createErrorResponse(error, 'DELETE /api/spots', {
      queryParams: {
        spotId: searchParams.get('spotId'),
        confirm: searchParams.get('confirm'),
        force: searchParams.get('force')
      }
    });
  }
}
