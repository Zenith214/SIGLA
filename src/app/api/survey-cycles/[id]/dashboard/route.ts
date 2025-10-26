import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * GET /api/survey-cycles/[id]/dashboard
 * Get dashboard data for a specific survey cycle
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    const cycleId = parseInt(id);
    
    if (isNaN(cycleId)) {
      return NextResponse.json(
        { error: 'Invalid cycle ID' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeNonAwardees = searchParams.get('include_non_awardees') === 'true';

    // Verify cycle exists
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', cycleId)
      .single();

    if (cycleError || !cycle) {
      return NextResponse.json(
        { error: 'Survey cycle not found' },
        { status: 404 }
      );
    }

    // Get dashboard data for this specific cycle
    const dashboardData = await getCycleDashboardData(cycleId, includeNonAwardees);

    return NextResponse.json({
      success: true,
      data: {
        cycle: cycle,
        dashboard: dashboardData
      }
    });

  } catch (error) {
    console.error("Error fetching cycle dashboard data:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch cycle dashboard data",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Get comprehensive dashboard data for a specific cycle
 */
async function getCycleDashboardData(cycleId: number, includeNonAwardees: boolean = false) {
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

    // Get survey responses count (filtered by awardees if applicable)
    let responsesQuery = supabaseAdmin
      .from('survey_response')
      .select('*', { count: 'exact', head: true })
      .eq('survey_cycle_id', cycleId);
    
    if (awardeeFilter) {
      responsesQuery = responsesQuery.in('barangay_id', awardeeFilter);
    }

    const { count: responsesCount, error: responsesError } = await responsesQuery;

    if (responsesError) {
      console.error('Error fetching responses count:', responsesError);
    }

    // Get assignments count (filtered by awardees if applicable)
    let assignmentsQuery = supabaseAdmin
      .from('assignment')
      .select('*', { count: 'exact', head: true })
      .eq('survey_cycle_id', cycleId);
    
    if (awardeeFilter) {
      assignmentsQuery = assignmentsQuery.in('barangay_id', awardeeFilter);
    }

    const { count: assignmentsCount, error: assignmentsError } = await assignmentsQuery;

    if (assignmentsError) {
      console.error('Error fetching assignments count:', assignmentsError);
    }

    // Get completed assignments count (filtered by awardees if applicable)
    let completedAssignmentsQuery = supabaseAdmin
      .from('assignment')
      .select('*', { count: 'exact', head: true })
      .eq('survey_cycle_id', cycleId)
      .eq('status', 'completed');
    
    if (awardeeFilter) {
      completedAssignmentsQuery = completedAssignmentsQuery.in('barangay_id', awardeeFilter);
    }

    const { count: completedAssignmentsCount, error: completedError } = await completedAssignmentsQuery;

    if (completedError) {
      console.error('Error fetching completed assignments count:', completedError);
    }

    // Get survey targets (filtered by awardees if applicable)
    let targetsQuery = supabaseAdmin
      .from('survey_target')
      .select(`
        *,
        barangay:barangay_id (
          barangay_id,
          barangay_name
        )
      `)
      .eq('survey_cycle_id', cycleId);
    
    if (awardeeFilter) {
      targetsQuery = targetsQuery.in('barangay_id', awardeeFilter);
    }

    const { data: targets, error: targetsError } = await targetsQuery;

    if (targetsError) {
      console.error('Error fetching targets:', targetsError);
    }

    // Calculate progress metrics
    const totalTargets = targets?.reduce((sum, target) => sum + target.target_count, 0) || 0;
    const totalAchieved = targets?.reduce((sum, target) => sum + (target.achieved_count || 0), 0) || 0;
    const progressPercentage = totalTargets > 0 ? Math.round((totalAchieved / totalTargets) * 100) : 0;

    // Get barangays with data (filtered by awardees if applicable)
    let barangaysWithDataQuery = supabaseAdmin
      .from('survey_response')
      .select('barangay_id')
      .eq('survey_cycle_id', cycleId);
    
    if (awardeeFilter) {
      barangaysWithDataQuery = barangaysWithDataQuery.in('barangay_id', awardeeFilter);
    }

    const { data: barangaysWithData, error: barangaysError } = await barangaysWithDataQuery;

    if (barangaysError) {
      console.error('Error fetching barangays with data:', barangaysError);
    }

    const uniqueBarangays = new Set(barangaysWithData?.map(r => r.barangay_id) || []).size;

    return {
      summary: {
        total_responses: responsesCount || 0,
        total_assignments: assignmentsCount || 0,
        completed_assignments: completedAssignmentsCount || 0,
        assignment_completion_rate: (assignmentsCount || 0) > 0 ? Math.round(((completedAssignmentsCount || 0) / (assignmentsCount || 1)) * 100) : 0,
        total_targets: totalTargets,
        total_achieved: totalAchieved,
        progress_percentage: progressPercentage,
        barangays_with_data: uniqueBarangays
      },
      targets: targets || [],
      cycle_info: {
        cycle_id: cycleId,
        is_historical: true
      }
    };

  } catch (error) {
    console.error('Error getting cycle dashboard data:', error);
    throw error;
  }
}