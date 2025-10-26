import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/survey-cycles/[id]
 * Get specific survey cycle details
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

    const { data: cycle, error } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', cycleId)
      .single();

    if (error || !cycle) {
      return NextResponse.json(
        { error: 'Survey cycle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cycle
    });

  } catch (error) {
    console.error("Error fetching survey cycle:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch survey cycle",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}