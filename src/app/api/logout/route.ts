import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    
    // Clear the pulse_token cookie
    response.cookies.set('pulse_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // Expire immediately
    });
    
    return response;
  } catch {
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}