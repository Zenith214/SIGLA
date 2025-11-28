import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * GET /api/assignments
 * Retrieve all barangay assignments for field interviewers
 */
export async function GET(request: NextRequest) {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('assignment')
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
          barangay_name,
          population,
          households
        ),
        user:user_id (
          id,
          firstName,
          lastName,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw handleDatabaseError(error, 'fetch assignments');
    }

    // Return empty array if no assignments found (not an error)
    return NextResponse.json(assignments || []);
  } catch (error: any) {
    return createErrorResponse(error, 'GET /api/assignments');
  }
}

/**
 * POST /api/assignments
 * Create a new barangay assignment for a field interviewer
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { user_id, barangay_id, status, progress } = body;

    // Validate required fields
    if (!user_id || !barangay_id) {
      throw createValidationError('user_id and barangay_id are required');
    }

    // Validate field types
    if (typeof user_id !== 'number' || user_id <= 0) {
      throw createValidationError('user_id must be a positive integer', 'user_id', user_id);
    }

    if (typeof barangay_id !== 'number' || barangay_id <= 0) {
      throw createValidationError('barangay_id must be a positive integer', 'barangay_id', barangay_id);
    }

    // Validate status if provided
    const validStatuses = ['Assigned', 'In Progress', 'Completed'];
    const assignmentStatus = status || 'Assigned';
    if (!validStatuses.includes(assignmentStatus)) {
      throw createValidationError(
        `status must be one of: ${validStatuses.join(', ')}`,
        'status',
        assignmentStatus
      );
    }

    // Validate progress if provided
    const assignmentProgress = progress !== undefined ? progress : 0;
    if (typeof assignmentProgress !== 'number' || assignmentProgress < 0 || assignmentProgress > 100) {
      throw createValidationError(
        'progress must be a number between 0 and 100',
        'progress',
        assignmentProgress
      );
    }

    // Verify user exists and is an interviewer
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

    // Check status (case-insensitive to handle 'active' or 'Active')
    if (user.status?.toLowerCase() !== 'active') {
      throw createValidationError(
        `User must be active (current status: ${user.status})`, 
        'user_id', 
        user_id
      );
    }

    // Verify barangay exists
    const { data: barangay, error: barangayError } = await supabaseAdmin
      .from('barangay')
      .select('barangay_id, barangay_name')
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

    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabaseAdmin
      .from('assignment')
      .select('assignment_id')
      .eq('user_id', user_id)
      .eq('barangay_id', barangay_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw handleDatabaseError(checkError, 'check existing assignment');
    }

    if (existingAssignment) {
      throw createValidationError(
        'Assignment already exists for this user and barangay',
        'assignment',
        { user_id, barangay_id }
      );
    }

    // Create the assignment
    const { data: assignment, error: insertError } = await supabaseAdmin
      .from('assignment')
      .insert({
        user_id,
        barangay_id,
        status: assignmentStatus,
        progress: assignmentProgress
      })
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

    if (insertError) {
      throw handleDatabaseError(insertError, 'create assignment');
    }

    if (!assignment) {
      throw new Error('Failed to create assignment: No data returned');
    }

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment
    }, { status: 201 });

  } catch (error: any) {
    return createErrorResponse(error, 'POST /api/assignments', {
      body: request.body
    });
  }
}

/**
 * DELETE /api/assignments/:id
 * Delete a barangay assignment
 * Note: This is handled by a separate route file at /api/assignments/[id]/route.ts
 */
