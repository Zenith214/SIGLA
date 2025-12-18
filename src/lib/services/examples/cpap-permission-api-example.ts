/**
 * Example API Endpoint Implementation with CPAP Permission Service
 * 
 * This file demonstrates how to use CPAPPermissionService in various API endpoints
 * for the CPAP module. These are example implementations that show the pattern
 * to follow when creating actual API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPService } from '@/lib/services/cpap.service';

/**
 * Example: GET /api/cpap/[id]
 * Fetch a specific CPAP by ID
 */
export async function exampleGetCPAP(
  request: NextRequest,
  params: { id: string }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  const cpapId = parseInt(params.id);
  if (isNaN(cpapId)) {
    return NextResponse.json(
      { error: 'Invalid CPAP ID' },
      { status: 400 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Check if user can access this CPAP
  const canAccess = await CPAPPermissionService.canAccessCPAP(
    userId,
    userRole,
    cpapId
  );

  if (!canAccess) {
    return NextResponse.json(
      { error: 'Access denied', message: 'You do not have permission to access this CPAP' },
      { status: 403 }
    );
  }

  // 3. Fetch the CPAP
  try {
    const cpap = await CPAPService.getCPAPById(cpapId);
    return NextResponse.json({ success: true, cpap });
  } catch (error) {
    console.error('Error fetching CPAP:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CPAP' },
      { status: 500 }
    );
  }
}

/**
 * Example: PUT /api/cpap/[id]
 * Update CPAP items
 */
export async function exampleUpdateCPAP(
  request: NextRequest,
  params: { id: string }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const cpapId = parseInt(params.id);
  if (isNaN(cpapId)) {
    return NextResponse.json(
      { error: 'Invalid CPAP ID' },
      { status: 400 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Check if user can edit this CPAP
  const canEdit = await CPAPPermissionService.canEditCPAP(
    userId,
    userRole,
    cpapId
  );

  if (!canEdit) {
    return NextResponse.json(
      { error: 'Cannot edit this CPAP', message: 'CPAP must be in Draft or Revision_Requested status and belong to your barangay' },
      { status: 403 }
    );
  }

  // 3. Parse request body
  const body = await request.json();
  const { items, deleted_item_ids } = body;

  // 4. Update CPAP items
  try {
    const updatedCPAP = await CPAPService.updateCPAPItems(
      cpapId,
      items,
      deleted_item_ids
    );
    return NextResponse.json({ success: true, cpap: updatedCPAP });
  } catch (error) {
    console.error('Error updating CPAP:', error);
    return NextResponse.json(
      { error: 'Failed to update CPAP' },
      { status: 500 }
    );
  }
}

/**
 * Example: POST /api/cpap/[id]/submit
 * Submit CPAP for review
 */
export async function exampleSubmitCPAP(
  request: NextRequest,
  params: { id: string }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const cpapId = parseInt(params.id);
  if (isNaN(cpapId)) {
    return NextResponse.json(
      { error: 'Invalid CPAP ID' },
      { status: 400 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Check if user can submit this CPAP
  const canSubmit = await CPAPPermissionService.canSubmitCPAP(
    userId,
    userRole,
    cpapId
  );

  if (!canSubmit) {
    return NextResponse.json(
      { error: 'Cannot submit this CPAP', message: 'CPAP must be in Draft or Revision_Requested status and belong to your barangay' },
      { status: 403 }
    );
  }

  // 3. Submit the CPAP
  try {
    await CPAPService.submitCPAP(cpapId);
    return NextResponse.json({
      success: true,
      message: 'CPAP submitted successfully for DILG review'
    });
  } catch (error: any) {
    console.error('Error submitting CPAP:', error);
    return NextResponse.json(
      { error: 'Failed to submit CPAP', message: error.message },
      { status: 400 }
    );
  }
}

/**
 * Example: POST /api/cpap/[id]/approve
 * Approve a submitted CPAP
 */
export async function exampleApproveCPAP(
  request: NextRequest,
  params: { id: string }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Check if user can review CPAPs
  const canReview = await CPAPPermissionService.canReviewCPAP(userId, userRole);

  if (!canReview) {
    return NextResponse.json(
      { error: 'Admin access required', message: 'Only administrators can approve CPAPs' },
      { status: 403 }
    );
  }

  const cpapId = parseInt(params.id);
  if (isNaN(cpapId)) {
    return NextResponse.json(
      { error: 'Invalid CPAP ID' },
      { status: 400 }
    );
  }

  // 3. Parse request body
  const body = await request.json();
  const { comments } = body;

  // 4. Approve the CPAP
  try {
    await CPAPService.approveCPAP(cpapId, comments);
    return NextResponse.json({
      success: true,
      message: 'CPAP approved successfully'
    });
  } catch (error: any) {
    console.error('Error approving CPAP:', error);
    return NextResponse.json(
      { error: 'Failed to approve CPAP', message: error.message },
      { status: 400 }
    );
  }
}

/**
 * Example: POST /api/cpap/[id]/request-revision
 * Request revisions to a submitted CPAP
 */
export async function exampleRequestRevision(
  request: NextRequest,
  params: { id: string }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Check if user can review CPAPs
  const canReview = await CPAPPermissionService.canReviewCPAP(userId, userRole);

  if (!canReview) {
    return NextResponse.json(
      { error: 'Admin access required', message: 'Only administrators can request revisions' },
      { status: 403 }
    );
  }

  const cpapId = parseInt(params.id);
  if (isNaN(cpapId)) {
    return NextResponse.json(
      { error: 'Invalid CPAP ID' },
      { status: 400 }
    );
  }

  // 3. Parse request body
  const body = await request.json();
  const { comments } = body;

  if (!comments || comments.trim() === '') {
    return NextResponse.json(
      { error: 'Comments are required when requesting revision' },
      { status: 400 }
    );
  }

  // 4. Request revision
  try {
    await CPAPService.requestRevision(cpapId, comments);
    return NextResponse.json({
      success: true,
      message: 'Revision requested successfully'
    });
  } catch (error: any) {
    console.error('Error requesting revision:', error);
    return NextResponse.json(
      { error: 'Failed to request revision', message: error.message },
      { status: 400 }
    );
  }
}

/**
 * Example: PUT /api/cpap/[id]/progress
 * Update progress on approved CPAP items
 */
export async function exampleUpdateProgress(
  request: NextRequest,
  params: { id: string }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const cpapId = parseInt(params.id);
  if (isNaN(cpapId)) {
    return NextResponse.json(
      { error: 'Invalid CPAP ID' },
      { status: 400 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Check if user can update progress on this CPAP
  const canUpdate = await CPAPPermissionService.canUpdateProgress(
    userId,
    userRole,
    cpapId
  );

  if (!canUpdate) {
    return NextResponse.json(
      { error: 'Cannot update progress', message: 'CPAP must be approved and belong to your barangay' },
      { status: 403 }
    );
  }

  // 3. Parse request body
  const body = await request.json();
  const { items } = body;

  // 4. Update progress
  try {
    const updatedCPAP = await CPAPService.updateProgress(cpapId, items);
    return NextResponse.json({ success: true, cpap: updatedCPAP });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', message: error.message },
      { status: 400 }
    );
  }
}

/**
 * Example: POST /api/cpap
 * Create a new CPAP
 */
export async function exampleCreateCPAP(request: NextRequest) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Parse request body
  const body = await request.json();
  const { barangay_id, cycle_id } = body;

  if (!barangay_id || !cycle_id) {
    return NextResponse.json(
      { error: 'barangay_id and cycle_id are required' },
      { status: 400 }
    );
  }

  // 3. Check if user can create CPAP for this barangay
  const canCreate = await CPAPPermissionService.canCreateCPAPForBarangay(
    userId,
    userRole,
    barangay_id
  );

  if (!canCreate) {
    return NextResponse.json(
      { error: 'Cannot create CPAP for this barangay', message: 'You can only create CPAPs for your assigned barangay' },
      { status: 403 }
    );
  }

  // 4. Create or get existing CPAP
  try {
    const cpap = await CPAPService.getOrCreateCPAP(barangay_id, cycle_id);
    return NextResponse.json({ success: true, cpap });
  } catch (error: any) {
    console.error('Error creating CPAP:', error);
    return NextResponse.json(
      { error: 'Failed to create CPAP', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Example: GET /api/cpap
 * List CPAPs with role-based filtering
 */
export async function exampleListCPAPs(request: NextRequest) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // 2. Block FS and INTERVIEWER roles
  const normalizedRole = userRole.toLowerCase();
  if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
    return NextResponse.json(
      { error: 'Access denied', message: 'You do not have permission to access CPAPs' },
      { status: 403 }
    );
  }

  // 3. Get user's barangay for OFFICER role
  let userBarangayId: number | null = null;
  if (normalizedRole === 'officer') {
    userBarangayId = await CPAPPermissionService.getUserBarangay(userId);
    if (!userBarangayId) {
      return NextResponse.json(
        { error: 'No barangay assigned', message: 'You must be assigned to a barangay to access CPAPs' },
        { status: 400 }
      );
    }
  }

  // 4. Parse query parameters for filters
  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get('status') || undefined,
    cycle_id: searchParams.get('cycle_id') ? parseInt(searchParams.get('cycle_id')!) : undefined,
    barangay_id: searchParams.get('barangay_id') ? parseInt(searchParams.get('barangay_id')!) : undefined,
    search: searchParams.get('search') || undefined,
  };

  // 5. List CPAPs
  try {
    const cpaps = await CPAPService.listCPAPs(
      userId,
      userRole,
      userBarangayId,
      filters
    );
    return NextResponse.json({ success: true, cpaps });
  } catch (error: any) {
    console.error('Error listing CPAPs:', error);
    return NextResponse.json(
      { error: 'Failed to list CPAPs', message: error.message },
      { status: 500 }
    );
  }
}
