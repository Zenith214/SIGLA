import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Find user using Supabase
    const { data: users, error: findError } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (findError || !users || users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Update lastLogin using Supabase
    await supabase
      .from('user')
      .update({ lastLogin: new Date().toISOString() })
      .eq('id', user.id);
    // Generate JWT with user info including role
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
                        lastName: user.lastName,
                email: user.email,
                role: (user.role || 'viewer').toLowerCase(), // Ensure role is lowercase
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Set JWT as HttpOnly cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      role: (user.role || 'viewer').toLowerCase(),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: (user.role || 'viewer').toLowerCase()
      }
    }, { status: 200 });
    
    response.cookies.set('sigla_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Login failed', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}