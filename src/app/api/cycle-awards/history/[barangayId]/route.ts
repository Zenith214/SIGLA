import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * GET /api/cycle-awards/history/[barangayId]
 * Retrieves award history for a specific barangay across all cycles
 * 
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { barangayId: string } }
) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  try {
    const barangayId = parseInt(params.barangayId, 10);

    // Validate barangay ID
    if (isNaN(barangayId) || barangayId <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'barangayId must be a positive integer'
        },
        { status: 400 }
      );
    }

    // Get award history for the barangay
    const history = await CycleAwardsService.getAwardHistory(barangayId);

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('❌ Failed to fetch award history:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch award history",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}