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

// Helper to verify admin role (or developer role)
async function verifyAdminRole(request: NextRequest) {
  const token = request.cookies.get('pulse_token')?.value;
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const role = decoded.role?.toLowerCase();
    return role === 'admin' || role === 'developer';
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

  const body = await request.json();
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);

  // Validate role if provided
  if (body.role && !['admin', 'fs', 'interviewer', 'officer', 'developer'].includes(body.role)) {
    return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    
    // Build dynamic update query based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.firstName !== undefined) {
      updateFields.push(`"firstName" = $${paramIndex++}`);
      values.push(body.firstName);
    }
    if (body.lastName !== undefined) {
      updateFields.push(`"lastName" = $${paramIndex++}`);
      values.push(body.lastName);
    }
    if (body.role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      values.push(body.role);
    }
    if (body.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(body.status);
    }
    if (body.lastLogin !== undefined) {
      updateFields.push(`"lastLogin" = $${paramIndex++}`);
      values.push(body.lastLogin);
    }
    if (body.barangayDesignation !== undefined) {
      updateFields.push(`"barangayDesignation" = $${paramIndex++}`);
      values.push(body.barangayDesignation === '' || body.barangayDesignation === null ? null : parseInt(body.barangayDesignation));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    values.push(userId);
    
    const query = `
      UPDATE "user" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, "firstName", "lastName", email, role, status, "lastLogin", "barangayDesignation", "createdAt"
    `;
    
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to update user');
    }

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ 
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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