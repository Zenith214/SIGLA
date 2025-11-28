import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * DELETE /api/assignments/[id]
 * Delete a specific barangay assignment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = parseInt(params.id);

    if (isNaN(assignmentId) || assignmentId <= 0) {
      throw createValidationError('Assignment ID must be a positive integer', 'id', params.id);
    }

    // Verify assignment exists
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('assignment')
      .select(`
        assignment_id,
        barangay_id,
        user_id,
        barangay:barangay_id (
          barangay_name
        ),
        user:user_id (
          firstName,
          lastName
        )
      `)
      .eq('assignment_id', assignmentId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createNotFoundError('Assignment');
      }
      throw handleDatabaseError(fetchError, 'fetch assignment');
    }

    if (!assignment) {
      throw createNotFoundError('Assignment');
    }

    // Delete the assignment
    const { error: deleteError } = await supabaseAdmin
      .from('assignment')
      .delete()
      .eq('assignment_id', assignmentId);

    if (deleteError) {
      throw handleDatabaseError(deleteError, 'delete assignment');
    }

    const barangay = Array.isArray(assignment.barangay) ? assignment.barangay[0] : assignment.barangay;
    const user = Array.isArray(assignment.user) ? assignment.user[0] : assignment.user;

    return NextResponse.json({
      message: 'Assignment deleted successfully',
      deletedAssignment: {
        assignmentId: assignment.assignment_id,
        barangayId: assignment.barangay_id,
        barangayName: barangay?.barangay_name,
        userId: assignment.user_id,
        userName: user ? `${user.firstName} ${user.lastName}` : null
      }
    });

  } catch (error: any) {
    return createErrorResponse(error, `DELETE /api/assignments/${params.id}`);
  }
}


/**
 * PATCH /api/assignments/[id]
 * Update an existing assignment (change interviewer, status, or progress)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = parseInt(params.id);

    if (isNaN(assignmentId) || assignmentId <= 0) {
      throw createValidationError('Assignment ID must be a positive integer', 'id', params.id);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { user_id, barangay_id, status, progress } = body;

    // Verify assignment exists
    const { data: existingAssignment, error: fetchError } = await supabaseAdmin
      .from('assignment')
      .select('assignment_id, user_id, barangay_id, status, progress')
      .eq('assignment_id', assignmentId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createNotFoundError('Assignment');
      }
      throw handleDatabaseError(fetchError, 'fetch assignment');
    }

    if (!existingAssignment) {
      throw createNotFoundError('Assignment');
    }

    // Build update object
    const updates: any = {};

    // Validate and add user_id if provided
    if (user_id !== undefined) {
      if (typeof user_id !== 'number' || user_id <= 0) {
        throw createValidationError('user_id must be a positive integer', 'user_id', user_id);
      }

      // Verify user exists and is an active interviewer
      const { data: user, error: userError } = await supabaseAdmin
        .from('user')
        .select('id, role, status')
        .eq('id', user_id)
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

      if (user.role !== 'interviewer') {
        throw createValidationError('User must have interviewer role', 'user_id', user_id);
      }

      if (user.status?.toLowerCase() !== 'active') {
        throw createValidationError(
          `User must be active (current status: ${user.status})`,
          'user_id',
          user_id
        );
      }

      updates.user_id = user_id;
    }

    // Validate and add barangay_id if provided
    if (barangay_id !== undefined) {
      if (typeof barangay_id !== 'number' || barangay_id <= 0) {
        throw createValidationError('barangay_id must be a positive integer', 'barangay_id', barangay_id);
      }

      // Verify barangay exists
      const { data: barangay, error: barangayError } = await supabaseAdmin
        .from('barangay')
        .select('barangay_id')
        .eq('barangay_id', barangay_id)
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

      updates.barangay_id = barangay_id;
    }

    // Validate and add status if provided
    if (status !== undefined) {
      const validStatuses = ['Assigned', 'In Progress', 'Completed'];
      if (!validStatuses.includes(status)) {
        throw createValidationError(
          `status must be one of: ${validStatuses.join(', ')}`,
          'status',
          status
        );
      }
      updates.status = status;
    }

    // Validate and add progress if provided
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        throw createValidationError(
          'progress must be a number between 0 and 100',
          'progress',
          progress
        );
      }
      updates.progress = progress;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        message: 'No updates provided',
        assignment: existingAssignment
      });
    }

    // Check for duplicate assignment if user or barangay changed
    if (updates.user_id || updates.barangay_id) {
      const checkUserId = updates.user_id || existingAssignment.user_id;
      const checkBarangayId = updates.barangay_id || existingAssignment.barangay_id;

      const { data: duplicate, error: dupError } = await supabaseAdmin
        .from('assignment')
        .select('assignment_id')
        .eq('user_id', checkUserId)
        .eq('barangay_id', checkBarangayId)
        .neq('assignment_id', assignmentId)
        .maybeSingle();

      if (dupError && dupError.code !== 'PGRST116') {
        throw handleDatabaseError(dupError, 'check duplicate assignment');
      }

      if (duplicate) {
        throw createValidationError(
          'Assignment already exists for this user and barangay combination',
          'assignment',
          { user_id: checkUserId, barangay_id: checkBarangayId }
        );
      }
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Perform update
    const { data: updatedAssignment, error: updateError } = await supabaseAdmin
      .from('assignment')
      .update(updates)
      .eq('assignment_id', assignmentId)
      .select(`
        assignment_id,
        barangay_id,
        user_id,
        status,
        progress,
        created_at,
        updated_at,
        barangay:barangay_id (
          barangay_id,
          barangay_name
        ),
        user:user_id (
          id,
          firstName,
          lastName,
          email
        )
      `)
      .single();

    if (updateError) {
      throw handleDatabaseError(updateError, 'update assignment');
    }

    return NextResponse.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment,
      changes: updates
    });

  } catch (error: any) {
    return createErrorResponse(error, `PATCH /api/assignments/${params.id}`);
  }
}
