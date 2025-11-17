import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * PUT /api/spots/:spotId/assign
 * Assign a spot to a Field Interviewer
 * Note: Spots are cycle-scoped, assignment is within the spot's cycle
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { spotId: string } }
) {
  try {
    // Validate spotId parameter
    const spotId = parseInt(params.spotId);
    if (isNaN(spotId) || spotId <= 0) {
      throw createValidationError('spotId must be a positive integer', 'spotId', params.spotId);
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { fiId } = body;

    // Validate required fields
    if (!fiId) {
      throw createValidationError("Missing required field: fiId");
    }

    // Validate fiId type
    if (typeof fiId !== 'number' || fiId <= 0) {
      throw createValidationError('fiId must be a positive integer', 'fiId', fiId);
    }

    // Verify spot exists and get its cycle
    const { data: spot, error: spotError } = await supabaseAdmin
      .from('spots')
      .select('spot_id, spot_name, cycle_id, assigned_fi_id')
      .eq('spot_id', spotId)
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

    // Verify user exists and has INTERVIEWER role
    const { data: user, error: userError } = await supabaseAdmin
      .from('user')
      .select('id, firstName, lastName, email, role')
      .eq('id', fiId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        throw createNotFoundError('User');
      }
      throw handleDatabaseError(userError, 'fetch user');
    }

    if (!user) {
      throw createNotFoundError('User');
    }

    // Validate user has INTERVIEWER role (case-insensitive)
    const userRole = (user.role || '').toLowerCase();
    if (userRole !== 'interviewer') {
      throw createValidationError(
        "User must have INTERVIEWER role to be assigned to a spot",
        'fiId',
        fiId
      );
    }

    // Update spot assignment
    const { data: updatedSpot, error: updateError } = await supabaseAdmin
      .from('spots')
      .update({
        assigned_fi_id: fiId,
        updated_at: new Date().toISOString()
      })
      .eq('spot_id', spotId)
      .select()
      .single();

    if (updateError) {
      throw handleDatabaseError(updateError, 'update spot assignment');
    }

    if (!updatedSpot) {
      throw new Error('Failed to update spot assignment: No data returned');
    }

    return NextResponse.json({
      success: true,
      spotId: updatedSpot.spot_id,
      spotName: updatedSpot.spot_name,
      assignedTo: `${user.firstName} ${user.lastName}`,
      assignedToEmail: user.email,
      message: "Spot assigned successfully",
      ...(spot.assigned_fi_id && spot.assigned_fi_id !== fiId && {
        warning: 'Spot was previously assigned to another interviewer'
      })
    });

  } catch (error: any) {
    return createErrorResponse(error, 'PUT /api/spots/:spotId/assign', {
      spotId: params.spotId,
      fiId: request.body
    });
  }
}
