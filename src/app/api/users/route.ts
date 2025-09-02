import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Helper to verify admin role
async function verifyAdminRole(request: NextRequest) {
  const token = request.cookies.get('sigla_token')?.value;
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { data: users, error } = await supabase
      .from('user')
      .select('id, firstName, lastName, email, role, status, organization, jobTitle, createdAt, lastLogin')
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to fetch users', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await req.json();
    
    // Hash the password if provided
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }
    
    const { data: user, error } = await supabase
      .from('user')
      .insert(data)
      .select('id, firstName, lastName, email, role, status, organization, jobTitle, createdAt, lastLogin')
      .single();

    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  
  const { data: user, error } = await supabase
    .from('user')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
  }

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  
  const { error } = await supabase
    .from('user')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ message: 'Failed to delete user', error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}