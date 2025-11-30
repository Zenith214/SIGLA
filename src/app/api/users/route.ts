import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

export async function GET(request: NextRequest) {
  // Check if user is admin, developer, or FS (Field Supervisors need to see interviewers)
  const token = request.cookies.get('pulse_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  let userRole;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    userRole = decoded.role?.toLowerCase();
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  // Allow admin, developer, and FS to view users
  if (userRole !== 'admin' && userRole !== 'developer' && userRole !== 'fs') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  let client;
  try {
    client = await pool.connect();
    
    // Get role parameter from URL
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    let query = 'SELECT id, email, "firstName", "lastName", role, status, "lastLogin", "createdAt", organization, "jobTitle", phone, "barangayDesignation" FROM "user"';
    let queryParams: any[] = [];
    
    if (role) {
      query += ' WHERE role = $1';
      queryParams.push(role);
    }
    
    query += ' ORDER BY "createdAt" DESC';
    
    const result = await client.query(query, queryParams);
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to fetch users', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(req: NextRequest) {
  // Check if user is admin (only admins can create users)
  const isAdmin = await verifyAdminRole(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  let client;
  try {
    client = await pool.connect();
    const data = await req.json();
    
    // Hash the password if provided
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }
    
    // Handle barangayDesignation - convert empty string to null
    if (data.barangayDesignation !== undefined) {
      data.barangayDesignation = data.barangayDesignation === '' || data.barangayDesignation === null 
        ? null 
        : parseInt(data.barangayDesignation);
    }
    
    const columns = Object.keys(data).map(key => `"${key}"`).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO "user" (${columns}, "createdAt") 
      VALUES (${placeholders}, NOW()) 
      RETURNING id, "firstName", "lastName", email, role, status, organization, "jobTitle", "createdAt", "lastLogin", "barangayDesignation"
    `;
    
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to create user');
    }
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(req: NextRequest) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  let client;
  try {
    client = await pool.connect();
    const data = await req.json();
    const { id, ...updateData } = data;
    
    // If password is being updated, hash it
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    const setClause = Object.keys(updateData).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updateData)];
    
    console.log('Update query:', `UPDATE "user" SET ${setClause} WHERE id = $1`);
    console.log('Update values:', values);
    
    const query = `UPDATE "user" SET ${setClause} WHERE id = $1 RETURNING id, "firstName", "lastName", email, role, status, organization, "jobTitle", "createdAt", "lastLogin"`;
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
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

export async function DELETE(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { id } = await req.json();
    
    await client.query('DELETE FROM "user" WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to delete user', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}