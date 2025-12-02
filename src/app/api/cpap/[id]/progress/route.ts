import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';
import { ProgressUpdate } from '@/types/cpap';

/**
 * PUT /api/cpap/[id]/progress
 * Updates progress on approved CPAP items
 * - OFFICER: Can only update progress for their assigned barangay's approved CPAPs
 * - ADMIN: Cannot update progress (they only review)
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

  // Viewer role cannot update progress (read-only)
  if (normalizedRole === 'viewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Viewer role has read-only access. Cannot update progress.'
      },
      { status: 403 }
    );
  }

  // Only OFFICER users can update progress
  if (normalizedRole !== 'officer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Only Officer users can update progress'
      },
      { status: 403 }
    );
  }

  try {
    const cpapId = parseInt(params.id);

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

    // Check if user can update progress for this CPAP
    const canUpdate = await CPAPPermissionService.canUpdateProgress(
      user.id,
      user.role,
      cpapId
    );

    if (!canUpdate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to update progress for this CPAP or it is not in Approved status'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { items } = body;

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

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'At least one item must be updated'
        },
        { status: 400 }
      );
    }

    // Validate each progress update
    for (const item of items) {
      if (!item.id || typeof item.id !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Each item must have a valid id'
          },
          { status: 400 }
        );
      }

      // Check that at least one progress field is being updated
      const hasUpdate = item.actual_output !== undefined ||
                       item.accomplishment_status !== undefined ||
                       item.remarks !== undefined;

      if (!hasUpdate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Each item must have at least one progress field to update'
          },
          { status: 400 }
        );
      }
    }

    // Get CPAP to validate before updating progress
    const cpap = await CPAPService.getCPAPById(cpapId);

    // Validate progress update
    const validation = CPAPValidationService.validateProgressUpdate(cpap, items);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Progress update validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Update progress
    const updatedCPAP = await CPAPService.updateProgress(cpapId, items as ProgressUpdate[]);

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
      cpap: updatedCPAP
    });
  } catch (error) {
    console.error('Error in PUT /api/cpap/[id]/progress:', error);

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

      if (error.message.includes('Cannot update progress')) {
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
        message: error instanceof Error ? error.message : 'Failed to update progress'
      },
      { status: 500 }
    );
  }
}
