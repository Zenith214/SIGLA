import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/barangays/[id]/history
 * Retrieves historical SGLGB award data for a specific barangay across all cycles
 * Shows the last 3 years of data (current year + 2 previous years)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    const params = await context.params;
    const barangayId = parseInt(params.id, 10);

    console.log('📊 History API called for barangay ID:', params.id, '→', barangayId);

    if (isNaN(barangayId) || barangayId <= 0) {
      console.error('❌ Invalid barangay ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid barangay ID' },
        { status: 400 }
      );
    }

    // Get current year and calculate the range (current year + 2 previous years)
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;

    // Fetch award history for this barangay across all cycles in the year range
    console.log('🔍 Querying cycle_awards for barangay:', barangayId, 'years:', startYear, '-', currentYear);
    
    const { data: awardHistory, error: historyError } = await supabaseAdmin
      .from('cycle_awards')
      .select(`
        id,
        is_awardee,
        awarded_date,
        notes,
        cycle_id,
        survey_cycle!inner (
          cycle_id,
          year,
          name
        )
      `)
      .eq('barangay_id', barangayId)
      .gte('survey_cycle.year', startYear)
      .lte('survey_cycle.year', currentYear);

    if (historyError) {
      console.error('❌ Error fetching award history:', historyError);
      throw historyError;
    }
    
    console.log('📊 Award history query result:', awardHistory?.length || 0, 'records');

    let history = (awardHistory || [])
      .map((award: any) => ({
        year: award.survey_cycle.year.toString(),
        status: 'Completed', // If there's an award record, the cycle was completed
        score: award.is_awardee ? '75%' : '50%', // Simplified: awardees get 75%+, non-awardees get lower
        isAwardee: award.is_awardee,
        cycleName: award.survey_cycle.name,
        awardedDate: award.awarded_date,
        notes: award.notes
      }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year)); // Sort by year descending

    // If no cycle_awards data exists, fall back to legacy seal field
    if (history.length === 0) {
      console.log('⚠️ No cycle_awards data found, checking legacy seal field');
      
      const { data: barangayData, error: barangayError } = await supabaseAdmin
        .from('barangay')
        .select('seal')
        .eq('barangay_id', barangayId)
        .single();

      if (barangayError) {
        console.error('❌ Error fetching barangay seal:', barangayError);
      } else {
        console.log('📋 Barangay seal status:', barangayData?.seal);
      }

      if (!barangayError && barangayData && barangayData.seal === 'yes') {
        console.log('✅ Creating legacy history entries for awardee barangay');
        // Create historical entries based on legacy seal status
        // Show the last 3 years with the barangay as an awardee
        history = [];
        for (let year = currentYear; year >= startYear; year--) {
          history.push({
            year: year.toString(),
            status: 'Completed',
            score: '75%', // Assume awardee status
            isAwardee: true,
            cycleName: `Survey Cycle ${year}`,
            awardedDate: null,
            notes: 'Legacy award data'
          });
        }
        console.log('📜 Generated', history.length, 'legacy history entries');
      }
    }

    return NextResponse.json({
      success: true,
      data: history,
      meta: {
        barangay_id: barangayId,
        year_range: {
          start: startYear,
          end: currentYear
        },
        total_records: history.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch barangay history:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch barangay history",
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
