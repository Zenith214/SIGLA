import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/tools/check-survey-targets
 * Check survey targets in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Get all survey targets
    const { data: targets, error } = await supabaseAdmin
      .from('survey_target')
      .select(`
        *,
        barangay:barangay_id(barangay_name),
        survey_cycle:survey_cycle_id(name, year)
      `)
      .order('survey_cycle_id', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by cycle
    const byCycle: { [key: number]: any[] } = {};
    targets?.forEach(t => {
      if (!byCycle[t.survey_cycle_id]) {
        byCycle[t.survey_cycle_id] = [];
      }
      byCycle[t.survey_cycle_id].push({
        target_id: t.target_id,
        barangay_name: (t.barangay as any)?.barangay_name || 'Unknown',
        target_count: t.target_count,
        achieved_count: t.achieved_count || 0,
        percentage: t.target_count > 0 ? Math.round((t.achieved_count || 0) / t.target_count * 100) : 0
      });
    });

    return NextResponse.json({
      success: true,
      total_targets: targets?.length || 0,
      by_cycle: byCycle,
      all_targets: targets?.map(t => ({
        target_id: t.target_id,
        cycle: `${(t.survey_cycle as any)?.name} (${(t.survey_cycle as any)?.year})`,
        cycle_id: t.survey_cycle_id,
        barangay: (t.barangay as any)?.barangay_name || 'Unknown',
        barangay_id: t.barangay_id,
        target: t.target_count,
        achieved: t.achieved_count || 0,
        percentage: t.target_count > 0 ? Math.round((t.achieved_count || 0) / t.target_count * 100) : 0
      }))
    });

  } catch (error) {
    console.error('Error checking survey targets:', error);
    return NextResponse.json(
      { error: 'Failed to check survey targets' },
      { status: 500 }
    );
  }
}
