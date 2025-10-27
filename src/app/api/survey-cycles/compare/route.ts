import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * POST /api/survey-cycles/compare
 * Compare data between multiple survey cycles
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
    const { cycle_ids, metrics, include_non_awardees } = body;

    // Validate input
    if (!cycle_ids || !Array.isArray(cycle_ids) || cycle_ids.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 cycle IDs are required for comparison' },
        { status: 400 }
      );
    }

    if (cycle_ids.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 cycles can be compared at once' },
        { status: 400 }
      );
    }

    // Validate cycle IDs are numbers
    const validCycleIds = cycle_ids.filter(id => Number.isInteger(id));
    if (validCycleIds.length !== cycle_ids.length) {
      return NextResponse.json(
        { error: 'All cycle IDs must be valid integers' },
        { status: 400 }
      );
    }

    // Verify all cycles exist
    const { data: cycles, error: cyclesError } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .in('cycle_id', validCycleIds)
      .order('year', { ascending: true });

    if (cyclesError) {
      throw cyclesError;
    }

    if (!cycles || cycles.length !== validCycleIds.length) {
      return NextResponse.json(
        { error: 'One or more cycle IDs not found' },
        { status: 404 }
      );
    }

    // Get comparison data for each cycle
    const comparisonData = await Promise.all(
      validCycleIds.map(async (cycleId) => {
        const cycleData = await getCycleComparisonData(cycleId, include_non_awardees);
        const cycle = cycles.find(c => c.cycle_id === cycleId);
        return {
          cycle: cycle,
          data: cycleData
        };
      })
    );

    // Calculate trends and insights
    const trends = calculateTrends(comparisonData, metrics);

    console.log('[COMPARE] Final trends object:', trends);
    console.log('[COMPARE] Comparison data summary:', comparisonData.map(d => ({
      cycle: d.cycle.name,
      responses: d.data.responses.total,
      assignments: `${d.data.assignments.completed}/${d.data.assignments.total} (${d.data.assignments.completion_rate}%)`,
      targets: `${d.data.targets.achieved}/${d.data.targets.total} (${d.data.targets.progress_rate}%)`
    })));

    return NextResponse.json({
      success: true,
      data: {
        cycles: comparisonData,
        trends: trends,
        comparison_metrics: metrics || ['responses', 'assignments', 'progress', 'satisfaction']
      }
    });

  } catch (error) {
    console.error("Error comparing survey cycles:", error);
    return NextResponse.json(
      { 
        error: "Failed to compare survey cycles",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Get comparison data for a specific cycle
 */
async function getCycleComparisonData(cycleId: number, includeNonAwardees: boolean = false) {
  try {
    // Get awardee barangay IDs for filtering (unless explicitly including non-awardees)
    let awardeeBarangayIds: number[] = [];
    if (!includeNonAwardees) {
      try {
        awardeeBarangayIds = await CycleAwardsService.getAwardeeBarangayIds(cycleId);
      } catch (error) {
        console.error('Error fetching awardee barangay IDs:', error);
        // If we can't get awardee data, fall back to showing all data
        awardeeBarangayIds = [];
      }
    }

    // Build filter for awardee barangays
    const awardeeFilter = !includeNonAwardees && awardeeBarangayIds.length > 0 
      ? awardeeBarangayIds 
      : undefined;

    // Get basic metrics with awardee filtering
    const responsesQuery = supabaseAdmin
      .from('survey_response')
      .select('*', { count: 'exact', head: true })
      .eq('survey_cycle_id', cycleId);
    
    const assignmentsQuery = supabaseAdmin
      .from('assignment')
      .select('status', { count: 'exact' })
      .eq('survey_cycle_id', cycleId);
    
    const targetsQuery = supabaseAdmin
      .from('survey_target')
      .select('target, achieved')
      .eq('survey_cycle_id', cycleId);

    // Apply awardee filtering if needed
    if (awardeeFilter) {
      responsesQuery.in('barangay_id', awardeeFilter);
      assignmentsQuery.in('barangay_id', awardeeFilter);
      targetsQuery.in('barangay_id', awardeeFilter);
    }

    const [responsesResult, assignmentsResult, targetsResult] = await Promise.all([
      responsesQuery,
      assignmentsQuery,
      targetsQuery
    ]);

    // Log any errors
    if (targetsResult.error) {
      console.error(`[COMPARE] Error fetching targets for cycle ${cycleId}:`, targetsResult.error);
    }

    const responsesCount = responsesResult.count || 0;
    
    // Calculate assignment metrics (case-insensitive status matching)
    const assignments = assignmentsResult.data || [];
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status?.toLowerCase() === 'completed').length;
    const assignmentCompletionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    // Calculate target metrics (handle both column naming conventions)
    const targets = targetsResult.data || [];
    console.log(`[COMPARE] Cycle ${cycleId} targets data:`, targets);
    const totalTargets = targets.reduce((sum, target) => sum + (target.target || target.target_count || 0), 0);
    const totalAchieved = targets.reduce((sum, target) => sum + (target.achieved || target.achieved_count || 0), 0);
    const targetProgressRate = totalTargets > 0 ? (totalAchieved / totalTargets) * 100 : 0;
    console.log(`[COMPARE] Cycle ${cycleId} targets: ${totalAchieved}/${totalTargets} (${targetProgressRate}%)`);

    // Get satisfaction data (simplified - would need actual satisfaction calculation)
    let satisfactionQuery = supabaseAdmin
      .from('survey_response')
      .select('response_id')
      .eq('survey_cycle_id', cycleId)
      .limit(1);
    
    if (awardeeFilter) {
      satisfactionQuery = satisfactionQuery.in('barangay_id', awardeeFilter);
    }

    const { data: satisfactionData, error: satisfactionError } = await satisfactionQuery;

    // For now, return basic satisfaction placeholder
    const averageSatisfaction = 0; // Would calculate from actual survey data

    return {
      responses: {
        total: responsesCount,
        rate_per_day: 0 // Would calculate based on cycle duration
      },
      assignments: {
        total: totalAssignments,
        completed: completedAssignments,
        completion_rate: Math.round(assignmentCompletionRate)
      },
      targets: {
        total: totalTargets,
        achieved: totalAchieved,
        progress_rate: Math.round(targetProgressRate)
      },
      satisfaction: {
        average: averageSatisfaction,
        sample_size: responsesCount
      }
    };

  } catch (error) {
    console.error(`Error getting comparison data for cycle ${cycleId}:`, error);
    throw error;
  }
}

/**
 * Calculate trends between cycles
 */
function calculateTrends(comparisonData: any[], requestedMetrics: string[] = []) {
  const trends: any = {};
  
  if (comparisonData.length < 2) {
    return trends;
  }

  // Sort by year for trend calculation
  const sortedData = comparisonData.sort((a, b) => a.cycle.year - b.cycle.year);

  console.log('[TRENDS] Sorted comparison data:', sortedData.map(d => ({
    cycle: d.cycle.name,
    year: d.cycle.year,
    responses: d.data.responses.total,
    assignments: d.data.assignments.completion_rate,
    targets: d.data.targets.progress_rate
  })));

  // Calculate response trends
  if (!requestedMetrics.length || requestedMetrics.includes('responses')) {
    const responseCounts = sortedData.map(d => d.data.responses.total);
    console.log('[TRENDS] Response counts:', responseCounts);
    trends.responses = {
      direction: getDirection(responseCounts),
      change_percentage: getPercentageChange(responseCounts),
      values: responseCounts
    };
    console.log('[TRENDS] Response trend:', trends.responses);
  }

  // Calculate assignment completion trends
  if (!requestedMetrics.length || requestedMetrics.includes('assignments')) {
    const completionRates = sortedData.map(d => d.data.assignments.completion_rate);
    trends.assignment_completion = {
      direction: getDirection(completionRates),
      change_percentage: getPercentageChange(completionRates),
      values: completionRates
    };
  }

  // Calculate target progress trends
  if (!requestedMetrics.length || requestedMetrics.includes('progress')) {
    const progressRates = sortedData.map(d => d.data.targets.progress_rate);
    trends.target_progress = {
      direction: getDirection(progressRates),
      change_percentage: getPercentageChange(progressRates),
      values: progressRates
    };
  }

  return trends;
}

/**
 * Determine trend direction
 */
function getDirection(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  
  if (last > first * 1.05) return 'increasing'; // 5% threshold
  if (last < first * 0.95) return 'decreasing'; // 5% threshold
  return 'stable';
}

/**
 * Calculate percentage change between first and last values
 */
function getPercentageChange(values: number[]): number {
  if (values.length < 2 || values[0] === 0) return 0;
  
  const first = values[0];
  const last = values[values.length - 1];
  
  return Math.round(((last - first) / first) * 100);
}