import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';

/**
 * POST /api/cpap/[id]/mark-done
 * Marks a CPAP as done/completed
 * - ADMIN: Can mark any approved CPAP as done
 * - OFFICER: Can mark their own approved CPAPs as done
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
  if (normalizedRole === 'fs' || normalizedRole === 'interviewer' || normalizedRole === 'viewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to mark CPAPs as done'
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

    // Mark CPAP as done
    await CPAPService.markAsDone(cpapId);

    return NextResponse.json({
      success: true,
      message: 'CPAP marked as done successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/cpap/[id]/mark-done:', error);

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

      if (error.message.includes('Cannot mark')) {
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
        message: error instanceof Error ? error.message : 'Failed to mark CPAP as done'
      },
      { status: 500 }
    );
  }
}
