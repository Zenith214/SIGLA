import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * POST /api/cycle-awards/copy
 * Copies awards from one cycle to another
 * Body parameters:
 * - source_cycle_id: number - Source cycle to copy from
 * - target_cycle_id?: number - Target cycle to copy to (defaults to active cycle)
 * - overwrite?: boolean - Whether to overwrite existing awards (defaults to false)
 * 
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { source_cycle_id, target_cycle_id, overwrite = false } = body;

    // Validate required fields
    if (!source_cycle_id) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'source_cycle_id is required'
        },
        { status: 400 }
      );
    }

    // Copy awards between cycles
    const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(
      parseInt(source_cycle_id, 10),
      target_cycle_id ? parseInt(target_cycle_id, 10) : undefined,
      1 // TODO: Get from auth context
    );

    return NextResponse.json({
      success: true,
      data: copiedAwards,
      message: `Successfully copied ${copiedAwards.length} awards between cycles`
    });

  } catch (error) {
    console.error('❌ Failed to copy awards:', error);
    return NextResponse.json(
      { 
        error: "Failed to copy awards",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}