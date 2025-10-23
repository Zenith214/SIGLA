import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, createAuditLog } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/cycle-awards/[id]
 * Retrieves a specific cycle award by ID
 * 
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  try {
    const awardId = parseInt(params.id, 10);

    // Validate award ID
    if (isNaN(awardId) || awardId <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Award ID must be a positive integer'
        },
        { status: 400 }
      );
    }

    // Fetch the award with barangay details
    const { data: award, error } = await supabaseAdmin
      .from('cycle_awards')
      .select(`
        *,
        barangay:barangay_id (
          barangay_id,
          barangay_name,
          households,
          population
        ),
        survey_cycle:cycle_id (
          cycle_id,
          name,
          year,
          is_active
        )
      `)
      .eq('id', awardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Cycle award not found'
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: award
    });

  } catch (error) {
    console.error("Error fetching cycle award:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch cycle award",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cycle-awards/[id]
 * Updates a specific cycle award
 * Body parameters:
 * - is_awardee (optional): Whether the barangay is an awardee
 * - notes (optional): Notes about the award
 * 
 * Requires admin authentication
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  try {
    const awardId = parseInt(params.id, 10);

    // Validate award ID
    if (isNaN(awardId) || awardId <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Award ID must be a positive integer'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_awardee, notes } = body;

    // Validate input fields
    if (is_awardee !== undefined && typeof is_awardee !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'is_awardee must be a boolean'
        },
        { status: 400 }
      );
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'notes must be a string'
        },
        { status: 400 }
      );
    }

    // Check if at least one field is provided for update
    if (is_awardee === undefined && notes === undefined) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'At least one field (is_awardee or notes) must be provided for update'
        },
        { status: 400 }
      );
    }

    // First, check if the award exists
    const { data: existingAward, error: fetchError } = await supabaseAdmin
      .from('cycle_awards')
      .select('*')
      .eq('id', awardId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Cycle award not found'
          },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (is_awardee !== undefined) {
      updateData.is_awardee = is_awardee;
      updateData.awarded_date = is_awardee ? new Date().toISOString() : null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the award
    const { data: updatedAward, error: updateError } = await supabaseAdmin
      .from('cycle_awards')
      .update(updateData)
      .eq('id', awardId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'UPDATE_CYCLE_AWARD', {
        award_id: awardId,
        barangay_id: existingAward.barangay_id,
        cycle_id: existingAward.cycle_id,
        old_values: {
          is_awardee: existingAward.is_awardee,
          notes: existingAward.notes
        },
        new_values: {
          is_awardee: updatedAward.is_awardee,
          notes: updatedAward.notes
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cycle award updated successfully',
      data: updatedAward
    });

  } catch (error) {
    console.error("Error updating cycle award:", error);
    return NextResponse.json(
      { 
        error: "Failed to update cycle award",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cycle-awards/[id]
 * Deletes a specific cycle award
 * 
 * Requires admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  try {
    const awardId = parseInt(params.id, 10);

    // Validate award ID
    if (isNaN(awardId) || awardId <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Award ID must be a positive integer'
        },
        { status: 400 }
      );
    }

    // First, check if the award exists and get its details for audit logging
    const { data: existingAward, error: fetchError } = await supabaseAdmin
      .from('cycle_awards')
      .select('*')
      .eq('id', awardId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Cycle award not found'
          },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Delete the award
    const { error: deleteError } = await supabaseAdmin
      .from('cycle_awards')
      .delete()
      .eq('id', awardId);

    if (deleteError) {
      throw deleteError;
    }

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'DELETE_CYCLE_AWARD', {
        award_id: awardId,
        barangay_id: existingAward.barangay_id,
        cycle_id: existingAward.cycle_id,
        deleted_award: {
          is_awardee: existingAward.is_awardee,
          notes: existingAward.notes,
          awarded_date: existingAward.awarded_date
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cycle award deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting cycle award:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete cycle award",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}