import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: cycles, error } = await supabase
      .from('survey_cycle')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    return NextResponse.json(cycles)
  } catch (error) {
    console.error("Error fetching survey cycles:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey cycles" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, status, start_date, end_date, responses } = body

    const { data: cycle, error } = await supabase
      .from('survey_cycle')
      .insert({
        year,
        status,
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        responses: responses || 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(cycle)
  } catch (error) {
    console.error("Error creating survey cycle:", error)
    return NextResponse.json(
      { error: "Failed to create survey cycle" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cycle_id, year, status, start_date, end_date, responses } = body

    const { data: cycle, error } = await supabase
      .from('survey_cycle')
      .update({
        year,
        status,
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        responses: responses || 0,
        updated_at: new Date().toISOString()
      })
      .eq('cycle_id', cycle_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(cycle)
  } catch (error) {
    console.error("Error updating survey cycle:", error)
    return NextResponse.json(
      { error: "Failed to update survey cycle" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { cycle_id } = body

    const { error } = await supabase
      .from('survey_cycle')
      .delete()
      .eq('cycle_id', cycle_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting survey cycle:", error)
    return NextResponse.json(
      { error: "Failed to delete survey cycle" },
      { status: 500 }
    )
  }
}