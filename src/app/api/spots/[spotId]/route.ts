import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * DELETE /api/spots/:spotId
 * Delete a spot (only if unassigned)
 * Cascade deletes related questionnaires and visits
 * Note: Spots are cycle-scoped, so deletion only affects the specific cycle
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const { spotId: spotIdParam } = await params;
    // Validate spotId parameter
    const spotId = parseInt(spotIdParam);
    if (isNaN(spotId) || spotId <= 0) {
      throw createValidationError('spotId must be a positive integer', 'spotId', params.spotId);
    }

    // Verify spot exists
    const { data: spot, error: spotError } = await supabaseAdmin
      .from('spots')
      .select('spot_id, spot_name, assigned_fi_id, cycle_id')
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

    // Check if spot is assigned
    if (spot.assigned_fi_id !== null) {
      throw createValidationError(
        "Cannot delete assigned spot. Please unassign the spot first.",
        'assigned_fi_id',
        spot.assigned_fi_id
      );
    }

    // Check if spot has any completed questionnaires
    const { data: questionnaires, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('questionnaire_id, status')
      .eq('spot_id', spotId);

    if (questionnaireError) {
      throw handleDatabaseError(questionnaireError, 'fetch questionnaires');
    }

    const hasCompletedQuestionnaires = questionnaires?.some(q => q.status === 'Completed');
    if (hasCompletedQuestionnaires) {
      throw createValidationError(
        "Cannot delete spot with completed questionnaires. This would result in data loss.",
        'spotId',
        spotId
      );
    }

    // Delete the spot (questionnaires will be cascade deleted due to foreign key constraint)
    const { error: deleteError } = await supabaseAdmin
      .from('spots')
      .delete()
      .eq('spot_id', spotId);

    if (deleteError) {
      throw handleDatabaseError(deleteError, 'delete spot');
    }

    return NextResponse.json({
      success: true,
      spotId: spotId,
      spotName: spot.spot_name,
      message: "Spot and related questionnaires deleted successfully"
    });

  } catch (error: any) {
    const { spotId: spotIdParam } = await params;
    return createErrorResponse(error, 'DELETE /api/spots/:spotId', {
      spotId: spotIdParam
    });
  }
}
