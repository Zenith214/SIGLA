import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * POST /api/cycle-awards
 * Create or update a cycle award
 * 
 * Body:
 * - barangay_id: number
 * - cycle_id: number
 * - is_awardee: boolean
 * - notes?: string
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
    const { barangay_id, cycle_id, is_awardee, notes } = body;

    // Validate required fields
    if (!barangay_id || !cycle_id || typeof is_awardee !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'barangay_id, cycle_id, and is_awardee are required'
        },
        { status: 400 }
      );
    }

    // Create or update the award
    const award = await CycleAwardsService.setAwardStatus(
      parseInt(barangay_id, 10),
      is_awardee,
      parseInt(cycle_id, 10),
      notes || undefined,
      1 // TODO: Get from auth context
    );

    return NextResponse.json({
      success: true,
      data: award
    });

  } catch (error) {
    console.error('❌ Failed to create/update cycle award:', error);
    return NextResponse.json(
      { 
        error: "Failed to create/update cycle award",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cycle-awards
 * Get cycle awards or summary
 * 
 * Query parameters:
 * - cycle_id?: number - Get awards for specific cycle
 * - barangay_id?: number - Get awards for specific barangay
 * - summary?: boolean - Get summary statistics instead of detailed awards
 * 
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycle_id');
    const barangayId = searchParams.get('barangay_id');
    const summary = searchParams.get('summary') === 'true';

    if (summary) {
      // Return summary statistics
      const summaryData = await CycleAwardsService.getCycleAwardsSummary(
        cycleId ? parseInt(cycleId, 10) : undefined
      );
      
      return NextResponse.json({
        success: true,
        data: summaryData
      });
    }

    let awards;

    if (cycleId) {
      awards = await CycleAwardsService.getCycleAwards(parseInt(cycleId, 10));
    } else if (barangayId) {
      awards = await CycleAwardsService.getBarangayAwards(parseInt(barangayId, 10));
    } else {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Either cycle_id or barangay_id is required'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: awards
    });

  } catch (error) {
    console.error('❌ Failed to fetch cycle awards:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch cycle awards",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}