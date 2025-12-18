import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/analytics/system-stats
 * Get system-wide statistics across all cycles
 */
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }

  try {
    // Get total cycles
    const { count: totalCycles } = await supabaseAdmin
      .from('survey_cycle')
      .select('*', { count: 'exact', head: true });

    // Get completed cycles
    const { count: completedCycles } = await supabaseAdmin
      .from('survey_cycle')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);

    // Get total barangays
    const { count: totalBarangays } = await supabaseAdmin
      .from('barangay')
      .select('*', { count: 'exact', head: true });

    // Get total responses across all cycles
    const { count: totalResponses } = await supabaseAdmin
      .from('survey_response')
      .select('*', { count: 'exact', head: true });

    // Get total awardees (unique barangays that have been awardees in any cycle)
    const { data: awardees } = await supabaseAdmin
      .from('cycle_award')
      .select('barangay_id')
      .eq('is_awardee', true);

    const uniqueAwardees = new Set(awardees?.map(a => a.barangay_id) || []).size;

    // Calculate average satisfaction across all cycles
    // This is a simplified calculation - in production, you'd want to fetch actual satisfaction scores
    const averageSatisfaction = 66; // Placeholder - will be calculated from actual data

    return NextResponse.json({
      total_cycles: totalCycles || 0,
      cycles_completed: completedCycles || 0,
      total_barangays: totalBarangays || 0,
      total_responses: totalResponses || 0,
      total_awardees: uniqueAwardees,
      average_satisfaction: averageSatisfaction
    });

  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
}
