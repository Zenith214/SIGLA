import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('pulse_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Only return safe user info
                  const { id, firstName, lastName, email, role } = decoded as any;
              return NextResponse.json({ id, firstName, lastName, email, role: (role || 'officer').toLowerCase() });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 