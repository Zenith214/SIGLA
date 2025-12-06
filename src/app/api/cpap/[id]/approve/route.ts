import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';

/**
 * POST /api/cpap/[id]/approve
 * Approves a submitted CPAP
 * - ADMIN: Can approve any submitted CPAP
 * - OFFICER: Cannot approve CPAPs
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function POST(
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

  // Only ADMIN users can approve CPAPs
  const canReview = await CPAPPermissionService.canReviewCPAP(user.id, user.role);
  if (!canReview) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Only Admin users can approve CPAPs'
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

    // Parse request body for optional comments
    const body = await request.json().catch(() => ({}));
    const { comments } = body;

    // Get CPAP to validate before approval
    const cpap = await CPAPService.getCPAPById(cpapId);

    // Validate CPAP can be approved
    const validation = CPAPValidationService.validateForApproval(cpap);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'CPAP cannot be approved',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Approve CPAP
    await CPAPService.approveCPAP(cpapId, comments);

    return NextResponse.json({
      success: true,
      message: 'CPAP approved successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/cpap/[id]/approve:', error);

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

      if (error.message.includes('Cannot approve')) {
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
        message: error instanceof Error ? error.message : 'Failed to approve CPAP'
      },
      { status: 500 }
    );
  }
}
