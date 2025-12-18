import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Helper to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('pulse_token')?.value;
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const barangayId = parseInt(resolvedParams.id);

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT barangay_id, barangay_name, logo_url, description, households, population, captain, "currentStatus", seal, is_active FROM barangay WHERE barangay_id = $1',
      [barangayId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Barangay not found' }, { status: 404 });
    }

    const barangay = result.rows[0];
    return NextResponse.json({
      id: barangay.barangay_id,
      barangay_id: barangay.barangay_id,
      name: barangay.barangay_name,
      barangay_name: barangay.barangay_name,
      logo_url: barangay.logo_url,
      description: barangay.description,
      households: barangay.households,
      population: barangay.population,
      captain: barangay.captain,
      status: barangay.currentStatus,
      seal: barangay.seal === 'yes',
      isActive: barangay.is_active
    });
  } catch (error) {
    console.error('Failed to fetch barangay:', error);
    return NextResponse.json({ message: 'Failed to fetch barangay' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const barangayId = parseInt(resolvedParams.id);
  const body = await request.json();

  console.log('[PATCH /api/barangays/[id]] User:', user);
  console.log('[PATCH /api/barangays/[id]] Barangay ID:', barangayId);
  console.log('[PATCH /api/barangays/[id]] User designation:', user.barangayDesignation, typeof user.barangayDesignation);
  console.log('[PATCH /api/barangays/[id]] Body:', body);

  // Officers can only update their designated barangay's logo
  if (user.role?.toLowerCase() === 'officer') {
    // Convert both to numbers for comparison
    const userDesignation = parseInt(user.barangayDesignation);
    if (userDesignation !== barangayId) {
      console.log('[PATCH /api/barangays/[id]] Permission denied: designation mismatch');
      return NextResponse.json({ message: 'You can only update your designated barangay' }, { status: 403 });
    }
    // Officers can only update logo_url
    if (Object.keys(body).some(key => key !== 'logo_url')) {
      console.log('[PATCH /api/barangays/[id]] Permission denied: trying to update non-logo fields');
      return NextResponse.json({ message: 'Officers can only update the barangay logo' }, { status: 403 });
    }
  } else if (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'developer') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  let client;
  try {
    client = await pool.connect();
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.logo_url !== undefined) {
      updateFields.push(`logo_url = $${paramIndex++}`);
      values.push(body.logo_url);
    }
    if (body.barangay_name !== undefined && user.role?.toLowerCase() !== 'officer') {
      updateFields.push(`barangay_name = $${paramIndex++}`);
      values.push(body.barangay_name);
    }
    if (body.description !== undefined && user.role?.toLowerCase() !== 'officer') {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    values.push(barangayId);
    
    const query = `
      UPDATE barangay 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE barangay_id = $${paramIndex}
      RETURNING barangay_id, barangay_name, logo_url, description, "currentStatus", seal, is_active
    `;
    
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Barangay not found' }, { status: 404 });
    }

    const barangay = result.rows[0];
    return NextResponse.json({ 
      message: 'Barangay updated successfully',
      barangay: {
        id: barangay.barangay_id,
        name: barangay.barangay_name,
        logo_url: barangay.logo_url,
        description: barangay.description,
        status: barangay.currentStatus,
        seal: barangay.seal === 'yes',
        isActive: barangay.is_active
      }
    });
  } catch (error) {
    console.error('Update barangay error:', error);
    return NextResponse.json({ 
      message: 'Failed to update barangay',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
