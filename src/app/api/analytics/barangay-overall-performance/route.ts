import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/analytics/barangay-overall-performance
 * Get overall performance metrics for all barangays across all cycles
 */
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }

  try {
    // Get all barangays
    const { data: barangays } = await supabaseAdmin
      .from('barangay')
      .select('barangay_id, barangay_name')
      .order('barangay_name');

    if (!barangays) {
      return NextResponse.json([]);
    }

    const performanceData = [];

    // For each barangay, calculate overall performance
    for (const barangay of barangays) {
      // Get all cycles this barangay participated in
      const { data: responses } = await supabaseAdmin
        .from('survey_response')
        .select('survey_cycle_id')
        .eq('barangay_id', barangay.barangay_id);

      const cyclesParticipated = new Set(responses?.map(r => r.survey_cycle_id) || []).size;
      const totalResponses = responses?.length || 0;

      if (cyclesParticipated === 0) {
        continue; // Skip barangays with no data
      }

      // Get satisfaction scores from all cycles
      const satisfactionScores: number[] = [];
      const cycleIds = Array.from(new Set(responses?.map(r => r.survey_cycle_id) || []));

      for (const cycleId of cycleIds) {
        try {
          const funnelResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ml/funnel-analysis?barangayId=${barangay.barangay_id}&cycleId=${cycleId}`,
            { headers: request.headers }
          );
          
          if (funnelResponse.ok) {
            const funnelData = await funnelResponse.json();
            if (funnelData.overall_satisfaction) {
              satisfactionScores.push(funnelData.overall_satisfaction);
            }
          }
        } catch (err) {
          console.error(`Error fetching funnel for barangay ${barangay.barangay_id}, cycle ${cycleId}:`, err);
        }
      }

      if (satisfactionScores.length === 0) {
        continue; // Skip if no satisfaction data
      }

      const averageSatisfaction = Math.round(
        satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      );

      const latestSatisfaction = satisfactionScores[satisfactionScores.length - 1];
      
      // Determine trend
      let trend: 'improving' | 'declining' | 'stable' | 'new' = 'new';
      let satisfactionChange = 0;

      if (satisfactionScores.length >= 2) {
        const firstScore = satisfactionScores[0];
        const lastScore = satisfactionScores[satisfactionScores.length - 1];
        satisfactionChange = lastScore - firstScore;

        if (satisfactionChange > 5) {
          trend = 'improving';
        } else if (satisfactionChange < -5) {
          trend = 'declining';
        } else {
          trend = 'stable';
        }
      }

      performanceData.push({
        barangay_id: barangay.barangay_id,
        barangay_name: barangay.barangay_name,
        cycles_participated: cyclesParticipated,
        total_responses: totalResponses,
        average_satisfaction: averageSatisfaction,
        latest_satisfaction: latestSatisfaction,
        trend,
        satisfaction_change: satisfactionChange,
        best_cycle: '', // Placeholder
        worst_cycle: '' // Placeholder
      });
    }

    return NextResponse.json(performanceData);

  } catch (error) {
    console.error('Error fetching barangay overall performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barangay performance data' },
      { status: 500 }
    );
  }
}
