import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';

/**
 * POST /api/cpap/[id]/request-revision
 * Requests revisions for a submitted CPAP
 * - ADMIN: Can request revisions for any submitted CPAP
 * - OFFICER: Cannot request revisions
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

  // Only ADMIN users can request revisions
  const canReview = await CPAPPermissionService.canReviewCPAP(user.id, user.role);
  if (!canReview) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Only Admin users can request revisions'
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

    // Parse request body for required comments
    const body = await request.json();
    const { comments } = body;

    // Validate comments are provided
    if (!comments || typeof comments !== 'string' || comments.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Comments are required when requesting revision'
        },
        { status: 400 }
      );
    }

    // Get CPAP to validate before requesting revision
    const cpap = await CPAPService.getCPAPById(cpapId);

    // Validate CPAP can have revision requested
    const validation = CPAPValidationService.validateForRevisionRequest(cpap, comments);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Cannot request revision for this CPAP',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Request revision
    await CPAPService.requestRevision(cpapId, comments);

    return NextResponse.json({
      success: true,
      message: 'Revision requested successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/cpap/[id]/request-revision:', error);

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

      if (error.message.includes('Cannot request revision') || error.message.includes('Comments are required')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: error.message
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to request revision'
      },
      { status: 500 }
    );
  }
}
