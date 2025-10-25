import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, createAuditLog } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/survey-cycles/complete
 * Marks a survey cycle as completed and deactivates it
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  try {
    const body = await request.json();
    const { cycle_id } = body;

    if (!cycle_id) {
      return NextResponse.json(
        { error: 'cycle_id is required' },
        { status: 400 }
      );
    }

    // Verify the cycle exists and is currently active
    const { data: cycle, error: fetchError } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', cycle_id)
      .single();

    if (fetchError || !cycle) {
      return NextResponse.json(
        { error: 'Survey cycle not found' },
        { status: 404 }
      );
    }

    if (!cycle.is_active) {
      return NextResponse.json(
        { error: 'This cycle is not currently active' },
        { status: 400 }
      );
    }

    // Mark the cycle as completed (deactivate it)
    const { error: updateError } = await supabaseAdmin
      .from('survey_cycle')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('cycle_id', cycle_id);

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'COMPLETE_SURVEY_CYCLE', {
        cycle_id,
        name: cycle.name,
        year: cycle.year
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Survey cycle completed successfully',
      data: {
        cycle_id,
        name: cycle.name,
        year: cycle.year
      }
    });

  } catch (error) {
    console.error("Error completing survey cycle:", error);
    return NextResponse.json(
      { 
        error: "Failed to complete survey cycle",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
