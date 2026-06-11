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
  
  console.log('👤 [/api/me] Request received', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    allCookies: req.cookies.getAll().map(c => c.name),
    headers: {
      host: req.headers.get('host'),
      protocol: req.headers.get('x-forwarded-proto'),
      cookie: req.headers.get('cookie') ? 'present' : 'missing'
    }
  });
  
  if (!token) {
    console.log('❌ [/api/me] No token found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { id, firstName, lastName, email, role } = decoded;
    
    // Fetch profile picture from database
    const client = await pool.connect();
    try {
      // Try to query with all columns, but handle if some don't exist
      let result;
      try {
        result = await client.query(
          'SELECT "profilePicture", "barangayDesignation", "firstLogin", "tourCompleted" FROM "user" WHERE id = $1',
          [id]
        );
      } catch (dbError: any) {
        // If tourCompleted column doesn't exist, try without it
        if (dbError.message?.includes('tourCompleted')) {
          console.log('⚠️ [/api/me] tourCompleted column not found, querying without it');
          result = await client.query(
            'SELECT "profilePicture", "barangayDesignation", "firstLogin" FROM "user" WHERE id = $1',
            [id]
          );
        } else {
          throw dbError;
        }
      }
      
      console.log('[/api/me] User ID:', id);
      // Query result hidden to reduce log noise (contains large profile picture base64)
      
      const profilePicture = result.rows[0]?.profilePicture || null;
      const barangayDesignation = result.rows[0]?.barangayDesignation || null;
      const firstLogin = result.rows[0]?.firstLogin ?? true;
      const tourCompleted = result.rows[0]?.tourCompleted ?? false;
      
      console.log('[/api/me] Returning barangayDesignation:', barangayDesignation);
      
      return NextResponse.json({ 
        id, 
        firstName, 
        lastName, 
        email, 
        role: (role || 'officer').toLowerCase(),
        profilePicture,
        barangayDesignation,
        firstLogin,
        tourCompleted
      });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('❌ [/api/me] Token verification failed:', e instanceof Error ? e.message : e);
    console.error('❌ [/api/me] JWT_SECRET being used:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'undefined');
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 