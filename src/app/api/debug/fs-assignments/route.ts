import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Find FS users
    const { data: fsUsers, error: fsError } = await supabaseAdmin
      .from('user')
      .select('id, firstName, lastName, email, role')
      .eq('role', 'fs')

    if (fsError) throw fsError

    const results = []

    for (const fs of fsUsers || []) {
      // Get assignments
      const { data: assignments, error: assignError } = await supabaseAdmin
        .from('supervisor_assignments')
        .select(`
          id,
          supervisor_id,
          barangay_id,
          cycle_id,
          status,
          barangay:barangay_id (barangay_name),
          survey_cycle:cycle_id (name, year, status)
        `)
        .eq('supervisor_id', fs.id)

      if (assignError) throw assignError

      // Get active cycle
      const { data: activeCycle } = await supabaseAdmin
        .from('survey_cycle')
        .select('cycle_id, name, year, status')
        .eq('status', 'Active')
        .single()

      results.push({
        supervisor: fs,
        assignments: assignments || [],
        activeCycle,
        activeAssignments: (assignments || []).filter(
          a => a.cycle_id === activeCycle?.cycle_id && a.status === 'Active'
        )
      })
    }

    return NextResponse.json({ success: true, data: results })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
