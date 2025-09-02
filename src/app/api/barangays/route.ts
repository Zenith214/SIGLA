import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch barangays with seals (awardees) for dashboard display
    const { data: barangays, error } = await supabase
      .from('barangay')
      .select(`
        *,
        survey_target (
          target,
          achieved,
          percentage,
          created_at
        )
      `)
      .eq('is_active', true)
      .eq('seal', 'yes') // Only show awardees on dashboard
      .order('barangay_name', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform the data to match frontend expectations
    const transformedBarangays = barangays.map(barangay => {
      const surveyTarget = barangay.survey_target?.[0];
      const progress = surveyTarget?.percentage || 0;
      
      let status = "Pending";
      if (progress === 100) {
        status = "Completed";
      } else if (progress > 0) {
        status = "In Progress";
      }

      return {
        id: barangay.barangay_id, // Transform barangay_id to id
        barangay_id: barangay.barangay_id, // Keep original for updates
        name: barangay.barangay_name, // Transform barangay_name to name
        progress: progress,
        status: status,
        population: barangay.population || 0,
        households: barangay.households || 0,
        captain: barangay.captain,
        description: barangay.description,
        currentStatus: barangay.currentstatus || status,
        seal: barangay.seal,
        history: [] // Add empty history for now
      };
    });

    return NextResponse.json(transformedBarangays);
  } catch (error: any) {
    console.error('Error fetching barangays:', error);
    return NextResponse.json(
      { message: 'Failed to fetch barangays', error: error.message },
      { status: 500 }
    );
  }
}