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

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    // Fetch barangays with seals (awardees) from database
    const result = await client.query(`
      SELECT 
        barangay_id,
        barangay_name,
        households,
        population,
        area,
        "currentStatus" as current_status,
        seal,
        description,
        is_active
      FROM barangay 
      WHERE is_active = true AND seal = 'yes'
      ORDER BY barangay_name ASC
    `);

    const barangays = result.rows.map(row => ({
      id: row.barangay_id,
      name: row.barangay_name,
      households: row.households || 0,
      population: row.population || 0,
      area: row.area || 0,
      status: row.current_status || 'Pending',
      seal: row.seal === 'yes',
      description: row.description || '',
      isActive: row.is_active === true
    }));

    return NextResponse.json(barangays);

  } catch (error) {
    console.error('❌ Failed to fetch barangays:', error);
    return NextResponse.json(
      { error: `Failed to fetch barangays: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}