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
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let client;
  try {
    console.log('Login attempt for:', email);
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Find user by email using direct PostgreSQL query
    const userResult = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const user = userResult.rows[0];
    console.log('User found:', user ? 'Yes' : 'No');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Update lastLogin in database
    await client.query('UPDATE "user" SET "lastLogin" = $1 WHERE id = $2', [new Date().toISOString(), user.id]);
    console.log('Updated lastLogin for user:', user.id);
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
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed', error: error instanceof Error ? error.message : error }, { status: 500 });
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
}