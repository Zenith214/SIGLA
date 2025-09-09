import { NextRequest, NextResponse } from "next/server"
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

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json(
        { error: "Barangay name is required" },
        { status: 400 }
      )
    }

    // Search for barangay by name (exact match, case-insensitive)
    const result = await client.query(
      'SELECT * FROM barangay WHERE barangay_name = $1 AND is_active = true LIMIT 1',
      [name]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Barangay not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching barangay by name:", error)
    return NextResponse.json(
      { error: "Failed to fetch barangay" },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release();
    }
  }
}