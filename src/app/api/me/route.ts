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

export async function GET(req: NextRequest) {
  const token = req.cookies.get('pulse_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id, firstName, lastName, email, role } = decoded;
    
    // Fetch profile picture from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT "profilePicture", "barangayDesignation" FROM "user" WHERE id = $1',
        [id]
      );
      
      console.log('[/api/me] User ID:', id);
      console.log('[/api/me] Query result:', result.rows[0]);
      
      const profilePicture = result.rows[0]?.profilePicture || null;
      const barangayDesignation = result.rows[0]?.barangayDesignation || null;
      
      console.log('[/api/me] Returning barangayDesignation:', barangayDesignation);
      
      return NextResponse.json({ 
        id, 
        firstName, 
        lastName, 
        email, 
        role: (role || 'officer').toLowerCase(),
        profilePicture,
        barangayDesignation
      });
    } finally {
      client.release();
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 