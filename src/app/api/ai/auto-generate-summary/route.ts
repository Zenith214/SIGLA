/**
 * Auto-generate Executive Summary
 * Triggered when a barangay survey is completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barangayId, cycleId } = body;

    if (!barangayId || !cycleId) {
      return NextResponse.json(
        { error: 'barangayId and cycleId are required' },
        { status: 400 }
      );
    }

    console.log(`🤖 [AUTO-GENERATE] Checking if summary should be generated for Barangay ${barangayId}, Cycle ${cycleId}`);

    // Check if survey is completed (100% progress)
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignment')
      .select('progress, status')
      .eq('barangay_id', barangayId)
      .eq('survey_cycle_id', cycleId)
      .single();

    if (assignmentError || !assignment) {
      console.log(`⚠️ [AUTO-GENERATE] No assignment found`);
      return NextResponse.json({
        success: false,
        message: 'No assignment found'
      });
    }

    // Only generate if survey is completed (100% progress or completed status)
    const isCompleted = assignment.progress >= 100 || assignment.status === 'completed';
    
    if (!isCompleted) {
      console.log(`⚠️ [AUTO-GENERATE] Survey not completed yet (${assignment.progress}%)`);
      return NextResponse.json({
        success: false,
        message: `Survey not completed yet (${assignment.progress}%)`
      });
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabaseAdmin
      .from('ml_cache')
      .select('id, computed_at')
      .eq('endpoint', 'ai-executive-summary')
      .eq('barangay_id', barangayId)
      .eq('cycle_id', cycleId)
      .single();

    if (existingSummary) {
      console.log(`✅ [AUTO-GENERATE] Summary already exists, generated at ${existingSummary.computed_at}`);
      return NextResponse.json({
        success: true,
        message: 'Summary already exists',
        alreadyGenerated: true,
        generatedAt: existingSummary.computed_at
      });
    }

    // Generate the summary
    console.log(`🚀 [AUTO-GENERATE] Generating executive summary...`);
    
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/executive-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barangayId: parseInt(barangayId),
        cycleId: parseInt(cycleId),
        forceRefresh: false
      })
    });

    if (!generateResponse.ok) {
      throw new Error('Failed to generate summary');
    }

    const result = await generateResponse.json();

    console.log(`✅ [AUTO-GENERATE] Executive summary generated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Executive summary generated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ [AUTO-GENERATE] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to auto-generate summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
