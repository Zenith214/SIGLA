import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

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

  let client;
  try {
    client = await pool.connect();
    const query = `
      UPDATE "user" 
      SET role = $1 
      WHERE id = $2 
      RETURNING id, "firstName", "lastName", email, role
    `;
    
    const result = await client.query(query, [role, userId]);

    if (result.rows.length === 0) {
      throw new Error('Failed to update user role');
    }

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update user role' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
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

  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM "user" WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
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

  let client;
  try {
    client = await pool.connect();
    await client.query('DELETE FROM "user" WHERE id = $1', [userId]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}