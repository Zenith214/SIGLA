import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM survey_target');
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const data = await req.json();
    
    const columns = Object.keys(data).map(key => `"${key}"`).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO survey_target (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create survey target');
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const data = await req.json();
    const { target_id, ...updateData } = data;
    
    const setClause = Object.keys(updateData).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [target_id, ...Object.values(updateData)];
    
    const query = `UPDATE survey_target SET ${setClause} WHERE target_id = $1 RETURNING *`;
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to update survey target');
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
    const { target_id } = await req.json();
    
    await client.query('DELETE FROM survey_target WHERE target_id = $1', [target_id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
