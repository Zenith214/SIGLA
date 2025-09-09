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

    // Fetch barangays with seals (awardees) for dashboard display
    const barangaysQuery = `
      SELECT 
        b.barangay_id,
        b.barangay_name,
        b.population,
        b.households,
        b.captain,
        b.description,
        b."currentStatus",
        b.seal,
        st.percentage
      FROM barangay b
      LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id
      WHERE b.is_active = true AND b.seal = 'yes'
      ORDER BY b.barangay_name ASC
    `;

    const result = await client.query(barangaysQuery);
    const barangays = result.rows;

    // Transform the data to match frontend expectations
    const transformedBarangays = barangays.map((barangay: any) => {
      const progress = barangay.percentage || 0;

      let status = "Pending";
      if (progress === 100) {
        status = "Completed";
      } else if (progress > 0) {
        status = "In Progress";
      }

      return {
        id: barangay.barangay_id, // Transform barangay_id to id
        barangay_id: barangay.barangay_id, // Keep original for updates
        name: barangay.barangay_name, // Transform barangay_name to name
        progress: progress,
        status: status,
        population: barangay.population || 0,
        households: barangay.households || 0,
        captain: barangay.captain,
        description: barangay.description,
        currentStatus: barangay.currentStatus || status,
        seal: barangay.seal,
        history: [] // Add empty history for now
      };
    });

    return NextResponse.json(transformedBarangays);
  } catch (error: any) {
    console.error('Error fetching barangays:', error);
    return NextResponse.json(
      { message: 'Failed to fetch barangays', error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}