import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';

/**
 * GET /api/cpap/ai-suggestions
 * Generates AI-powered action recommendations for CPAP creation
 * - OFFICER: Can only generate suggestions for their assigned barangay
 * - ADMIN: Can generate suggestions for any barangay
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function GET(request: NextRequest) {
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
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const barangayIdParam = searchParams.get('barangay_id');
    const cycleIdParam = searchParams.get('cycle_id');

    // Validate required parameters
    if (!barangayIdParam || !cycleIdParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'barangay_id and cycle_id are required query parameters'
        },
        { status: 400 }
      );
    }

    const barangayId = parseInt(barangayIdParam);
    const cycleId = parseInt(cycleIdParam);

    // Validate parameters are valid numbers
    if (isNaN(barangayId) || isNaN(cycleId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'barangay_id and cycle_id must be valid numbers'
        },
        { status: 400 }
      );
    }

    // For OFFICER users, verify they can access this barangay
    if (normalizedRole === 'officer') {
      const canCreate = await CPAPPermissionService.canCreateCPAPForBarangay(
        user.id,
        user.role,
        barangayId
      );

      if (!canCreate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only generate suggestions for your assigned barangay'
          },
          { status: 403 }
        );
      }
    }

    // Generate AI suggestions
    const result = await CPAPService.generateAISuggestions(barangayId, cycleId);

    return NextResponse.json({
      success: true,
      suggestions: result.suggestions,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error in GET /api/cpap/ai-suggestions:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('No funnel analysis data')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'No survey data available for this barangay and cycle to generate suggestions'
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to generate AI suggestions'
      },
      { status: 500 }
    );
  }
}
