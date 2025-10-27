import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/tools/check-cycle-data
 * Diagnostic tool to check which cycle has what data
 */
export async function GET(request: NextRequest) {
  try {
    // Get all cycles
    const { data: cycles, error: cyclesError } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .order('cycle_id', { ascending: false });

    if (cyclesError) {
      throw cyclesError;
    }

    const cycleData = [];

    for (const cycle of cycles || []) {
      // Get responses count
      const { count: responsesCount } = await supabaseAdmin
        .from('survey_response')
        .select('*', { count: 'exact', head: true })
        .eq('survey_cycle_id', cycle.cycle_id);

      // Get assignments count
      const { count: assignmentsCount } = await supabaseAdmin
        .from('assignment')
        .select('*', { count: 'exact', head: true })
        .eq('survey_cycle_id', cycle.cycle_id);

      // Get completed assignments count
      const { count: completedAssignmentsCount } = await supabaseAdmin
        .from('assignment')
        .select('*', { count: 'exact', head: true })
        .eq('survey_cycle_id', cycle.cycle_id)
        .eq('status', 'completed');

      // Get targets count
      const { data: targets } = await supabaseAdmin
        .from('survey_target')
        .select('*')
        .eq('survey_cycle_id', cycle.cycle_id);

      const totalTargets = targets?.reduce((sum, t) => sum + t.target_count, 0) || 0;
      const totalAchieved = targets?.reduce((sum, t) => sum + (t.achieved_count || 0), 0) || 0;

      // Get awardees count
      const { count: awardeesCount } = await supabaseAdmin
        .from('cycle_awards')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', cycle.cycle_id)
        .eq('is_awardee', true);

      // Get awardee barangay IDs
      const { data: awardees } = await supabaseAdmin
        .from('cycle_awards')
        .select('barangay_id, barangay:barangay_id(barangay_name)')
        .eq('cycle_id', cycle.cycle_id)
        .eq('is_awardee', true);

      cycleData.push({
        cycle_id: cycle.cycle_id,
        name: cycle.name,
        year: cycle.year,
        is_active: cycle.is_active,
        responses: responsesCount || 0,
        assignments: {
          total: assignmentsCount || 0,
          completed: completedAssignmentsCount || 0,
          rate: assignmentsCount ? Math.round((completedAssignmentsCount || 0) / assignmentsCount * 100) : 0
        },
        targets: {
          total: totalTargets,
          achieved: totalAchieved,
          rate: totalTargets ? Math.round(totalAchieved / totalTargets * 100) : 0,
          count: targets?.length || 0
        },
        awardees: {
          count: awardeesCount || 0,
          barangays: awardees?.map((a: any) => ({
            id: a.barangay_id,
            name: a.barangay?.barangay_name || 'Unknown'
          })) || []
        }
      });
    }

    return NextResponse.json({
      success: true,
      cycles: cycleData,
      summary: {
        total_cycles: cycles?.length || 0,
        active_cycle: cycles?.find(c => c.is_active),
        cycles_with_data: cycleData.filter(c => c.responses > 0).length
      }
    });

  } catch (error) {
    console.error('Error checking cycle data:', error);
    return NextResponse.json(
      { error: 'Failed to check cycle data' },
      { status: 500 }
    );
  }
}
