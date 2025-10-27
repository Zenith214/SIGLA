import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateServiceFunnelMetrics } from '@/lib/funnel-calculations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const cycleId = searchParams.get('cycleId');

    if (!barangayId || !cycleId) {
      return NextResponse.json(
        { error: 'barangayId and cycleId are required' },
        { status: 400 }
      );
    }

    const debug: any = {
      barangayId: parseInt(barangayId),
      currentCycleId: parseInt(cycleId),
      timestamp: new Date().toISOString()
    };

    // Get current cycle info
    const { data: currentCycle } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', parseInt(cycleId))
      .single();

    debug.currentCycle = currentCycle;

    // Get previous cycle
    const { data: previousCycle, error: prevError } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('is_active', false)
      .lt('cycle_id', parseInt(cycleId))
      .order('cycle_id', { ascending: false })
      .limit(1)
      .single();

    debug.previousCycle = previousCycle;
    debug.previousCycleError = prevError?.message;

    if (!previousCycle) {
      debug.message = 'No previous cycle found - this is baseline';
      return NextResponse.json(debug);
    }

    // Get current cycle responses
    const { data: currentResponses } = await supabaseAdmin
      .from('survey_response')
      .select(`
        response_id,
        survey_section!inner (
          section_key,
          data
        )
      `)
      .eq('barangay_id', parseInt(barangayId))
      .eq('survey_cycle_id', parseInt(cycleId))
      .in('status', ['completed', 'submitted']);

    debug.currentResponseCount = currentResponses?.length || 0;

    // Get previous cycle responses
    const { data: previousResponses } = await supabaseAdmin
      .from('survey_response')
      .select(`
        response_id,
        survey_section!inner (
          section_key,
          data
        )
      `)
      .eq('barangay_id', parseInt(barangayId))
      .eq('survey_cycle_id', previousCycle.cycle_id)
      .in('status', ['completed', 'submitted']);

    debug.previousResponseCount = previousResponses?.length || 0;

    // Calculate scores for each service area
    const serviceAreas = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
    debug.serviceComparison = {};

    for (const serviceArea of serviceAreas) {
      const currentServiceResponses = currentResponses?.filter((r: any) => 
        r.survey_section.some((s: any) => s.section_key === serviceArea)
      ) || [];

      const previousServiceResponses = previousResponses?.filter((r: any) =>
        r.survey_section.some((s: any) => s.section_key === serviceArea)
      ) || [];

      const currentScores = currentServiceResponses.length > 0
        ? calculateServiceFunnelMetrics(currentServiceResponses, serviceArea)
        : null;

      const previousScores = previousServiceResponses.length > 0
        ? calculateServiceFunnelMetrics(previousServiceResponses, serviceArea)
        : null;

      const change = currentScores && previousScores
        ? (currentScores.satisfaction?.percentage || 0) - (previousScores.satisfaction?.percentage || 0)
        : 0;

      debug.serviceComparison[serviceArea] = {
        currentResponseCount: currentServiceResponses.length,
        previousResponseCount: previousServiceResponses.length,
        currentScores: currentScores ? {
          awareness: currentScores.awareness?.percentage,
          availment: currentScores.availment?.percentage,
          satisfaction: currentScores.satisfaction?.percentage
        } : null,
        previousScores: previousScores ? {
          awareness: previousScores.awareness?.percentage,
          availment: previousScores.availment?.percentage,
          satisfaction: previousScores.satisfaction?.percentage
        } : null,
        change: Math.round(change),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    }

    return NextResponse.json(debug, { status: 200 });

  } catch (error) {
    console.error('Error in debug trends:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
