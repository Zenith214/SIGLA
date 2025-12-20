import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/barangays/[id]/visits
 * Fetch all visitation logs for a specific barangay
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const barangayId = parseInt(id)

    if (isNaN(barangayId)) {
      return NextResponse.json(
        { error: 'Invalid barangay ID' },
        { status: 400 }
      )
    }

    // Fetch all visits for questionnaires in this barangay
    // Join through questionnaires -> spots -> barangays -> survey_response
    const { data: visits, error } = await supabaseAdmin
      .from('visits')
      .select(`
        visit_id,
        questionnaire_id,
        visit_number,
        visit_timestamp,
        outcome,
        notes,
        location_lat,
        location_lng,
        questionnaire:questionnaires!inner (
          questionnaire_id,
          spot:spots!inner (
            spot_name,
            barangay_id
          ),
          survey_response (
            respondent_name
          )
        )
      `)
      .eq('questionnaire.spot.barangay_id', barangayId)
      .order('visit_timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching visits:', error)
      return NextResponse.json(
        { error: 'Failed to fetch visitation logs' },
        { status: 500 }
      )
    }

    return NextResponse.json(visits || [])
  } catch (error) {
    console.error('Error in GET /api/barangays/[id]/visits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
