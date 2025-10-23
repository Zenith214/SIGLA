import { NextResponse } from "next/server";
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

    // Get distinct years from survey responses and survey cycles
    const yearsQuery = `
      SELECT DISTINCT year_value
      FROM (
        SELECT EXTRACT(YEAR FROM created_at)::text as year_value
        FROM survey_response
        WHERE created_at IS NOT NULL
        UNION
        SELECT year::text as year_value
        FROM survey_cycle
        WHERE year IS NOT NULL
      ) years
      ORDER BY year_value DESC
    `;

    const result = await client.query(yearsQuery);
    const dbYears = result.rows.map(row => row.year_value);

    // Always include current year and previous 2 years
    const currentYear = new Date().getFullYear();
    const standardYears = [
      currentYear.toString(),        // This year (2025)
      (currentYear - 1).toString(),  // Last year (2024)
      (currentYear - 2).toString()   // Year before last (2023)
    ];

    // Combine database years with standard years and remove duplicates
    const allYears = [...new Set([...standardYears, ...dbYears])];
    
    // Sort in descending order (newest first)
    const years = allYears.sort((a, b) => parseInt(b) - parseInt(a));

    return NextResponse.json(years);
  } catch (error: any) {
    console.error('Error fetching survey years:', error);
    return NextResponse.json(
      { message: 'Failed to fetch survey years', error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}