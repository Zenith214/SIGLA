import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * POST /api/cycle-awards/bulk
 * Performs bulk operations on cycle awards
 * Body parameters:
 * - operation: 'update' | 'export'
 * - cycle_id: number
 * - awards: Array<{barangayId: number, isAwardee: boolean, notes?: string}>
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
    const { operation, cycle_id, awards } = body;

    // Validate required fields
    if (!operation || !cycle_id) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'operation and cycle_id are required'
        },
        { status: 400 }
      );
    }

    if (operation === 'update') {
      if (!Array.isArray(awards) || awards.length === 0) {
        return NextResponse.json(
          { 
            error: 'Invalid input',
            message: 'awards array is required for update operation'
          },
          { status: 400 }
        );
      }

      // Perform bulk update
      const updatedAwards = await CycleAwardsService.bulkUpdateAwards(
        awards.map(award => ({
          barangayId: award.barangayId,
          isAwardee: award.isAwardee,
          notes: award.notes
        })),
        parseInt(cycle_id, 10),
        1 // TODO: Get from auth context
      );

      return NextResponse.json({
        success: true,
        data: updatedAwards,
        message: `Successfully updated ${updatedAwards.length} awards`
      });
    }

    return NextResponse.json(
      { 
        error: 'Invalid operation',
        message: 'Supported operations: update'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Failed to perform bulk operation:', error);
    return NextResponse.json(
      { 
        error: "Failed to perform bulk operation",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}