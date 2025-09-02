import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: assignments, error } = await supabase
      .from('assignment')
      .select(`
        *,
        barangay (
          barangay_name
        ),
        user (
          firstName,
          lastName,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barangay_id, user_id, status, progress } = body

    const { data: assignment, error } = await supabase
      .from('assignment')
      .insert({
        barangay_id: parseInt(barangay_id),
        user_id: parseInt(user_id),
        status: status || 'Pending',
        progress: parseInt(progress) || 0
      })
      .select(`
        *,
        barangay (
          barangay_name
        ),
        user (
          firstName,
          lastName,
          email
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignment_id, barangay_id, user_id, status, progress } = body

    const { data: assignment, error } = await supabase
      .from('assignment')
      .update({
        barangay_id: parseInt(barangay_id),
        user_id: parseInt(user_id),
        status,
        progress: parseInt(progress) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('assignment_id', assignment_id)
      .select(`
        *,
        barangay (
          barangay_name
        ),
        user (
          firstName,
          lastName,
          email
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignment_id } = body

    const { error } = await supabase
      .from('assignment')
      .delete()
      .eq('assignment_id', assignment_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  }
}