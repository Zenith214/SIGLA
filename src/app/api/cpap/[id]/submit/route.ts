import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';

/**
 * POST /api/cpap/[id]/submit
 * Submits a CPAP for DILG review
 * - OFFICER: Can only submit CPAPs for their assigned barangay in Draft or Revision_Requested status
 * - ADMIN: Cannot submit CPAPs
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function POST(
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

  // Viewer role cannot submit CPAPs (read-only)
  if (normalizedRole === 'viewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Viewer role has read-only access. Cannot submit CPAPs.'
      },
      { status: 403 }
    );
  }

  // Only OFFICER users can submit CPAPs
  if (normalizedRole !== 'officer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Only Officer users can submit CPAPs'
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

    // Check if user can submit this CPAP
    const canSubmit = await CPAPPermissionService.canSubmitCPAP(
      user.id,
      user.role,
      cpapId
    );

    if (!canSubmit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to submit this CPAP or it is not in a submittable status'
        },
        { status: 403 }
      );
    }

    // Get CPAP to validate before submission
    const cpap = await CPAPService.getCPAPById(cpapId);

    // Validate CPAP can be submitted
    const validation = CPAPValidationService.validateForSubmission(cpap);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'CPAP validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Submit CPAP
    await CPAPService.submitCPAP(cpapId);

    return NextResponse.json({
      success: true,
      message: 'CPAP submitted successfully for DILG review'
    });
  } catch (error) {
    console.error('Error in POST /api/cpap/[id]/submit:', error);

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

      if (error.message.includes('Cannot submit') || error.message.includes('must have')) {
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
        message: error instanceof Error ? error.message : 'Failed to submit CPAP'
      },
      { status: 500 }
    );
  }
}
