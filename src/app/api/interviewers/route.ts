import { NextResponse } from "next/server"
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
    
    // Get users with interviewer role - this endpoint doesn't require admin auth
    // since it's needed for assignment functionality
    const query = `
      SELECT id, "firstName", "lastName", email, role
      FROM "user"
      WHERE role = 'interviewer' 
        AND (status = 'Active' OR status IS NULL)
      ORDER BY "firstName" ASC
    `;
    
    const result = await client.query(query);
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching interviewers:", error)
    return NextResponse.json(
      { error: "Failed to fetch interviewers" },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release();
    }
  }
}