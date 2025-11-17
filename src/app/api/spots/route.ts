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

/**
 * Generate questionnaire ID in format: {YEAR}-{SPOT_NUMBER}-{SEQUENCE}
 * Example: 2024-001-003
 */
function generateQuestionnaireId(year: number, spotNumber: number, sequence: number): string {
  return `${year}-${String(spotNumber).padStart(3, '0')}-${sequence}`;
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

    // Get the next spot number for this cycle
    const { count: spotCount, error: countError } = await supabaseAdmin
      .from('spots')
      .select('spot_id', { count: 'exact', head: true })
      .eq('cycle_id', cycleId);

    if (countError) {
      throw handleDatabaseError(countError, 'count spots');
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

    // Generate 5 questionnaire IDs and create questionnaire records
    const questionnaireIds: string[] = [];
    const questionnaireInserts = [];

    for (let sequence = 1; sequence <= 5; sequence++) {
      const questionnaireId = generateQuestionnaireId(cycle.year, spotNumber, sequence);
      questionnaireIds.push(questionnaireId);
      
      questionnaireInserts.push({
        questionnaire_id: questionnaireId,
        spot_id: spot.spot_id,
        cycle_id: cycleId,
        sequence_number: sequence,
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
      message: "Spot created successfully with 5 questionnaires"
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
