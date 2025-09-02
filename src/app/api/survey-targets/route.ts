import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: targets, error } = await supabase
      .from('survey_target')
      .select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json(targets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const { data: target, error } = await supabase
      .from('survey_target')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(target);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { target_id, ...updateData } = data;
    
    const { data: target, error } = await supabase
      .from('survey_target')
      .update(updateData)
      .eq('target_id', target_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(target);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { target_id } = await req.json();
    
    const { error } = await supabase
      .from('survey_target')
      .delete()
      .eq('target_id', target_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
