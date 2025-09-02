import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { role } = await request.json();
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);

  if (!role || !['admin', 'interviewer', 'viewer'].includes(role)) {
    return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
  }

  try {
    const { data: updatedUser, error } = await supabase
      .from('user')
      .update({ role })
      .eq('id', userId)
      .select('id, firstName, lastName, email, role')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update user role' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);

  try {
    const { data: user, error } = await supabase
      .from('user')
      .select('id, firstName, lastName, email, role, organization, jobTitle, createdAt, lastLogin')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);

  try {
    const { error } = await supabase
      .from('user')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch {
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}