import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const barangayId = parseInt(id);
    
    if (isNaN(barangayId)) {
      return NextResponse.json({ error: "Invalid barangay ID" }, { status: 400 });
    }

    const { data: barangay, error } = await supabase
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
      .eq('barangay_id', barangayId)
      .eq('seal', 'yes') // Only allow access to barangays with seal
      .single();

    if (error) {
      throw error;
    }

    if (!barangay) {
      return NextResponse.json({ error: "Barangay not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const surveyTarget = barangay.survey_target?.[0];
    const progress = surveyTarget?.percentage || 0;
    
    let status = "Pending";
    if (progress === 100) {
      status = "Completed";
    } else if (progress > 0) {
      status = "In Progress";
    }

    const transformedBarangay = {
      barangay_id: barangay.barangay_id,
      barangay_name: barangay.barangay_name,
      currentStatus: barangay.currentstatus || status,
      description: barangay.description,
      population: barangay.population || 0,
      households: barangay.households || 0,
      area: null, // Not in current schema
      captain: barangay.captain,
      surveyTargets: barangay.survey_target || [],
      survey_response: [], // Would need separate query for responses
      seal: barangay.seal
    };

    return NextResponse.json(transformedBarangay);
  } catch (error: any) {
    console.error("Error fetching barangay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}