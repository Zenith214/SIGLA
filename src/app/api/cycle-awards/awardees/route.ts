import { NextRequest, NextResponse } from "next/server";
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * GET /api/cycle-awards/awardees
 * Get awardee barangay IDs for a specific cycle
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cycleId = searchParams.get('cycleId');

    if (!cycleId) {
      return NextResponse.json(
        { success: false, error: 'cycleId is required' },
        { status: 400 }
      );
    }

    const awardeeIds = await CycleAwardsService.getAwardeeBarangayIds(parseInt(cycleId));

    return NextResponse.json({
      success: true,
      data: awardeeIds
    });
  } catch (error: any) {
    console.error('Error fetching awardee barangay IDs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch awardee barangay IDs' 
      },
      { status: 500 }
    );
  }
}
