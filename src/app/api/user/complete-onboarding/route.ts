import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies - use pulse_token to match /api/me
    const token = request.cookies.get('pulse_token')?.value;

    if (!token) {
      console.log('❌ [/api/user/complete-onboarding] No token found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.id) {
      console.log('❌ [/api/user/complete-onboarding] Invalid token');
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Update user's firstLogin field to false - onboarding complete
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE "user" SET "firstLogin" = false WHERE id = $1',
        [decoded.id]
      );
      
      console.log('✅ [/api/user/complete-onboarding] Onboarding completed for user:', decoded.id);
      
      return NextResponse.json(
        { message: 'Onboarding completed successfully' },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ [/api/user/complete-onboarding] Error:', error);
    return NextResponse.json(
      { message: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
