import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: NextRequest) {
  console.log('🔐 [LOGIN API] Request received')
  
  const { email, password } = await req.json();
  console.log('📧 [LOGIN API] Email:', email)
  console.log('🔑 [LOGIN API] Password length:', password?.length)

  if (!email || !password) {
    console.log('❌ [LOGIN API] Missing required fields')
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let client;
  try {
    console.log('🔍 [LOGIN API] Attempting to find user:', email);
    
    // Get a client from the pool
    client = await pool.connect();
    console.log('✅ [LOGIN API] Database connection established')
    
    // Find user by email using direct PostgreSQL query
    const userResult = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
    console.log('📊 [LOGIN API] Query result rows:', userResult.rows.length)
    
    if (userResult.rows.length === 0) {
      console.log('❌ [LOGIN API] User not found in database')
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const user = userResult.rows[0];
    console.log('✅ [LOGIN API] User found - ID:', user.id, 'Role:', user.role)

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 [LOGIN API] Password validation result:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ [LOGIN API] Invalid password')
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    console.log('✅ [LOGIN API] Password valid, updating lastLogin')
    // Update lastLogin in database
    await client.query('UPDATE "user" SET "lastLogin" = $1 WHERE id = $2', [new Date().toISOString(), user.id]);
    console.log('✅ [LOGIN API] Updated lastLogin for user:', user.id);
    
    console.log('🎫 [LOGIN API] Generating JWT token')
    // Generate JWT with user info including role and barangayDesignation
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: (user.role || 'officer').toLowerCase(), // Ensure role is lowercase
        barangayDesignation: user.barangayDesignation || null,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🍪 [LOGIN API] Setting cookie and preparing response')
    // Set JWT as HttpOnly cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      role: (user.role || 'officer').toLowerCase(),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: (user.role || 'officer').toLowerCase()
      }
    }, { status: 200 });
    
    response.cookies.set('pulse_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    console.log('✅ [LOGIN API] Login successful, returning response')
    return response;
  } catch (error) {
    console.error('❌ [LOGIN API] Error:', error);
    return NextResponse.json({ message: 'Login failed', error: error instanceof Error ? error.message : error }, { status: 500 });
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
      console.log('🔌 [LOGIN API] Database connection released')
    }
  }
}