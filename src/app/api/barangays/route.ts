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

export async function GET(request: Request) {
  let client;
  try {
    client = await pool.connect();

    // Get year parameter from URL
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Fetch ALL barangays with survey data for the specified year
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
        b.seal_expiration_date,
        st.percentage,
        COALESCE(COUNT(sr.response_id), 0) as survey_count,
        COALESCE(AVG(CASE WHEN sr.status = 'completed' THEN 1 ELSE 0 END) * 100, 0) as completion_rate
      FROM barangay b
      LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id
      LEFT JOIN survey_response sr ON b.barangay_id = sr.barangay_id 
        AND EXTRACT(YEAR FROM sr.created_at) = $1
      WHERE b.is_active = true
      GROUP BY b.barangay_id, b.barangay_name, b.population, b.households, 
               b.captain, b.description, b."currentStatus", b.seal, b.seal_expiration_date, st.percentage
      ORDER BY b.barangay_name ASC
    `;

    const result = await client.query(barangaysQuery, [parseInt(year)]);
    const barangays = result.rows;

    // Transform the data to match frontend expectations
    const transformedBarangays = barangays.map((barangay: any) => {
      const progress = barangay.percentage || 0;
      const surveyCount = parseInt(barangay.survey_count) || 0;
      const completionRate = parseFloat(barangay.completion_rate) || 0;
      const selectedYear = parseInt(year);

      // Determine survey status for the selected year
      let surveyStatus = "No data";
      if (surveyCount > 0) {
        if (completionRate === 100) {
          surveyStatus = "Completed";
        } else if (completionRate > 0) {
          surveyStatus = "In Progress";
        } else {
          surveyStatus = "Pending";
        }
      }

      // Determine if seal is valid for the selected year
      let sealValidForYear = 'no';
      if (barangay.seal === 'yes') {
        if (barangay.seal_expiration_date) {
          const expirationDate = new Date(barangay.seal_expiration_date);
          const expirationYear = expirationDate.getFullYear();
          
          // Assume seal was awarded 1 year before expiration (typical SGLGB cycle)
          const awardYear = expirationYear - 1;
          
          // Check if selected year is within the seal validity period
          if (selectedYear >= awardYear && selectedYear <= expirationYear) {
            sealValidForYear = 'yes';
          }
        } else {
          // If no expiration date, assume seal is only valid for current year
          const currentYear = new Date().getFullYear();
          if (selectedYear === currentYear) {
            sealValidForYear = 'yes';
          }
        }
      }

      return {
        id: barangay.barangay_id, // Transform barangay_id to id
        barangay_id: barangay.barangay_id, // Keep original for updates
        name: barangay.barangay_name, // Transform barangay_name to name
        progress: surveyCount > 0 ? progress : 0,
        status: surveyStatus, // Survey status for the selected year
        population: barangay.population || 0,
        households: barangay.households || 0,
        captain: barangay.captain,
        description: barangay.description || (surveyCount === 0 ? `No survey data available for ${year}` : ''),
        currentStatus: barangay.currentStatus || surveyStatus,
        seal: sealValidForYear, // Year-specific seal status
        seal_original: barangay.seal, // Keep original seal status for reference
        seal_expiration_date: barangay.seal_expiration_date,
        survey_count: surveyCount,
        completion_rate: completionRate,
        year: year,
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