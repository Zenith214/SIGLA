import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/tools/check-assignment-status
 * Check actual status values in assignment table
 */
export async function GET(request: NextRequest) {
  try {
    // Get all assignments with their actual status values
    const { data: assignments, error } = await supabaseAdmin
      .from('assignment')
      .select(`
        assignment_id,
        barangay_id,
        survey_cycle_id,
        status,
        progress,
        barangay:barangay_id(barangay_name),
        survey_cycle:survey_cycle_id(name, year)
      `)
      .order('survey_cycle_id', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by status to see what values exist
    const statusCounts: { [key: string]: number } = {};
    assignments?.forEach(a => {
      const status = a.status || 'NULL';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Group by cycle
    const byCycle: { [key: number]: any[] } = {};
    assignments?.forEach(a => {
      if (!byCycle[a.survey_cycle_id]) {
        byCycle[a.survey_cycle_id] = [];
      }
      byCycle[a.survey_cycle_id].push({
        assignment_id: a.assignment_id,
        barangay_name: (a.barangay as any)?.barangay_name || 'Unknown',
        status: a.status,
        progress: a.progress
      });
    });

    return NextResponse.json({
      success: true,
      total_assignments: assignments?.length || 0,
      status_breakdown: statusCounts,
      by_cycle: byCycle,
      all_assignments: assignments?.map(a => ({
        assignment_id: a.assignment_id,
        cycle: `${(a.survey_cycle as any)?.name} (${(a.survey_cycle as any)?.year})`,
        barangay: (a.barangay as any)?.barangay_name || 'Unknown',
        status: a.status,
        progress: a.progress
      }))
    });

  } catch (error) {
    console.error('Error checking assignment status:', error);
    return NextResponse.json(
      { error: 'Failed to check assignment status' },
      { status: 500 }
    );
  }
}
