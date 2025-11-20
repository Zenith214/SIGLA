import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';
import { CPAPItemInput, ProgressUpdate } from '@/types/cpap';

/**
 * GET /api/cpap/[id]
 * Gets a specific CPAP with all items and details
 * - ADMIN: Can access any CPAP
 * - OFFICER: Can only access CPAPs for their assigned barangay
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required'
      },
      { status: 401 }
    );
  }

  const { user } = authResult;
  const normalizedRole = user.role.toLowerCase();

  // Check if user role has CPAP access
  if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access CPAP functionality'
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const cpapId = parseInt(id);

    // Validate ID is a valid number
    if (isNaN(cpapId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Invalid CPAP ID'
        },
        { status: 400 }
      );
    }

    // Check if user can access this CPAP
    const canAccess = await CPAPPermissionService.canAccessCPAP(
      user.id,
      user.role,
      cpapId
    );

    if (!canAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to access this CPAP'
        },
        { status: 403 }
      );
    }

    // Get CPAP by ID
    const cpap = await CPAPService.getCPAPById(cpapId);

    return NextResponse.json({
      success: true,
      cpap
    });
  } catch (error) {
    console.error('Error in GET /api/cpap/[id]:', error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'CPAP not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch CPAP'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cpap/[id]
 * Updates CPAP items (add, edit, delete)
 * - OFFICER: Can only update CPAPs for their assigned barangay in Draft or Revision_Requested status
 * - ADMIN: Cannot update CPAPs (they only review)
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required'
      },
      { status: 401 }
    );
  }

  const { user } = authResult;
  const normalizedRole = user.role.toLowerCase();

  // Check if user role has CPAP access
  if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access CPAP functionality'
      },
      { status: 403 }
    );
  }

  // Only OFFICER users can update CPAPs
  if (normalizedRole !== 'officer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Only Officer users can update CPAPs'
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const cpapId = parseInt(id);

    // Validate ID is a valid number
    if (isNaN(cpapId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Invalid CPAP ID'
        },
        { status: 400 }
      );
    }

    // Check if user can edit this CPAP
    const canEdit = await CPAPPermissionService.canEditCPAP(
      user.id,
      user.role,
      cpapId
    );

    if (!canEdit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to edit this CPAP or it is not in an editable status'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { items, deleted_item_ids } = body;

    // Validate items array
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'items must be an array'
        },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      const validation = CPAPValidationService.validateItem(item);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Invalid item data',
            details: validation.errors
          },
          { status: 400 }
        );
      }
    }

    // Update CPAP items
    const updatedCPAP = await CPAPService.updateCPAPItems(
      cpapId,
      items as CPAPItemInput[],
      deleted_item_ids
    );

    return NextResponse.json({
      success: true,
      cpap: updatedCPAP
    });
  } catch (error) {
    console.error('Error in PUT /api/cpap/[id]:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'CPAP not found'
          },
          { status: 404 }
        );
      }

      if (error.message.includes('Cannot edit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: error.message
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update CPAP'
      },
      { status: 500 }
    );
  }
}
