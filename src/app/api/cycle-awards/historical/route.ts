import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/cycle-awards/historical
 * Retrieves historical cycle awards for non-active cycles
 * Query parameters:
 * - cycle_id?: number - Get awards for specific historical cycle
 * - include_barangays?: boolean - Include barangay details
 * - summary?: boolean - Get summary statistics only
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
    const includeBarangays = searchParams.get('include_barangays') === 'true';
    const summary = searchParams.get('summary') === 'true';

    if (cycleId) {
      // Get awards for specific historical cycle
      const parsedCycleId = parseInt(cycleId, 10);
      
      if (summary) {
        // Return summary for specific cycle
        const summaryData = await CycleAwardsService.getCycleAwardsSummary(parsedCycleId);
        return NextResponse.json({
          success: true,
          data: { summary: summaryData }
        });
      }

      if (includeBarangays) {
        // Return awards with barangay details
        const awards = await CycleAwardsService.getCycleAwardsWithBarangays(parsedCycleId);
        return NextResponse.json({
          success: true,
          data: { awards }
        });
      }

      // Return basic awards
      const awards = await CycleAwardsService.getCycleAwards(parsedCycleId);
      return NextResponse.json({
        success: true,
        data: { awards }
      });
    }

    // Get all historical cycles with their summaries
    const { data: cycles, error } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('is_active', false)
      .order('year', { ascending: false });

    if (error) {
      throw error;
    }

    // Get summaries for each cycle
    const cyclesWithSummaries = await Promise.all(
      (cycles || []).map(async (cycle) => {
        try {
          const summary = await CycleAwardsService.getCycleAwardsSummary(cycle.cycle_id);
          return {
            cycle,
            summary
          };
        } catch (error) {
          console.error(`Error getting summary for cycle ${cycle.cycle_id}:`, error);
          return {
            cycle,
            summary: {
              totalBarangays: 0,
              awardeeCount: 0,
              nonAwardeeCount: 0,
              percentage: 0
            }
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: { cycles: cyclesWithSummaries }
    });

  } catch (error) {
    console.error('❌ Failed to fetch historical cycle awards:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch historical cycle awards",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}