import { NextResponse } from "next/server";
import { Pool } from "pg";

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL in environment variables");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase connections
  },
});

export async function GET(request: Request) {
  let client;
  try {
    client = await pool.connect();

    // Get year parameter from URL
    const { searchParams } = new URL(request.url);
    const year =
      searchParams.get("year") || new Date().getFullYear().toString();

    // Check if barangay_year_data table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'barangay_year_data'
      );
    `;

    const tableExistsResult = await client.query(tableExistsQuery);
    const tableExists = tableExistsResult.rows[0].exists;

    let barangaysQuery;
    let queryParams;

    if (tableExists) {
      // Use the new year-specific table if it exists
      console.log("📊 Using barangay_year_data table for year-specific data");

      barangaysQuery = `
        SELECT 
          b.barangay_id,
          b.barangay_name,
          b.population,
          b.households,
          b.captain,
          b.description,
          b."currentStatus",
          COALESCE(byd.seal_status, 'no') as seal_status,
          COALESCE(byd.survey_status, 'No data') as survey_status,
          COALESCE(byd.survey_count, 0) as survey_count,
          COALESCE(byd.completion_rate, 0) as completion_rate,
          COALESCE(byd.target_achieved, 0) as target_achieved,
          COALESCE(byd.target_percentage, 0) as target_percentage,
          byd.notes,
          byd.year
        FROM barangay b
        LEFT JOIN barangay_year_data byd ON b.barangay_id = byd.barangay_id AND byd.year = $1
        WHERE b.is_active = true
        ORDER BY b.barangay_name ASC
      `;
      queryParams = [year];
    } else {
      // Fallback to calculating year-specific data on-the-fly
      console.log(
        "⚠️  barangay_year_data table not found, calculating data on-the-fly"
      );

      barangaysQuery = `
        SELECT 
          b.barangay_id,
          b.barangay_name,
          b.population,
          b.households,
          b.captain,
          b.description,
          b."currentStatus",
          b.seal,
          COALESCE(COUNT(sr.response_id), 0) as survey_count,
          COALESCE(AVG(CASE WHEN sr.status = 'completed' THEN 1 ELSE 0 END) * 100, 0) as completion_rate,
          COALESCE(st.achieved, 0) as target_achieved,
          COALESCE(st.percentage, 0) as target_percentage
        FROM barangay b
        LEFT JOIN survey_response sr ON b.barangay_id = sr.barangay_id 
          AND EXTRACT(YEAR FROM sr.created_at) = $1
        LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id
        WHERE b.is_active = true
        GROUP BY b.barangay_id, b.barangay_name, b.population, b.households, 
                 b.captain, b.description, b."currentStatus", b.seal, st.achieved, st.percentage
        ORDER BY b.barangay_name ASC
      `;
      queryParams = [parseInt(year)];
    }

    const result = await client.query(barangaysQuery, queryParams);
    const barangays = result.rows;

    // Transform the data to match frontend expectations
    const transformedBarangays = barangays.map((barangay: any) => {
      let sealStatus, surveyStatus, surveyCount, completionRate;

      if (tableExists) {
        // Use data from barangay_year_data table
        sealStatus = barangay.seal_status || "no";
        surveyStatus = barangay.survey_status || "No data";
        surveyCount = barangay.survey_count || 0;
        completionRate = parseFloat(barangay.completion_rate) || 0;
      } else {
        // Calculate from raw data
        surveyCount = parseInt(barangay.survey_count) || 0;
        completionRate = parseFloat(barangay.completion_rate) || 0;

        // Determine survey status
        if (surveyCount > 0) {
          if (completionRate >= 100) {
            surveyStatus = "Completed";
          } else if (completionRate > 0) {
            surveyStatus = "In Progress";
          } else {
            surveyStatus = "Pending";
          }
        } else {
          surveyStatus = "No data";
        }

        // For seal status, use current seal for current year, 'no' for past years
        const currentYear = new Date().getFullYear();
        if (parseInt(year) === currentYear) {
          sealStatus = barangay.seal || "no";
        } else {
          sealStatus = "no"; // Conservative approach for past years
        }
      }

      return {
        id: barangay.barangay_id,
        barangay_id: barangay.barangay_id,
        name: barangay.barangay_name,
        area: 0, // Add missing area field
        progress: barangay.target_percentage || 0,
        status: surveyStatus,
        population: barangay.population || 0,
        households: barangay.households || 0,
        captain: barangay.captain,
        description:
          barangay.description ||
          (surveyCount === 0 ? `No survey data available for ${year}` : ""),
        currentStatus: barangay.currentStatus || surveyStatus,
        seal: sealStatus,
        seal_original: tableExists ? barangay.seal : barangay.seal || "no", // Add missing seal_original field
        seal_expiration_date: barangay.seal_expiration_date || null, // Add missing field
        survey_count: surveyCount,
        completion_rate: completionRate,
        target_achieved: barangay.target_achieved || 0,
        target_percentage: barangay.target_percentage || 0,
        notes: barangay.notes || null,
        year: year,
        history: [
          {
            year: year,
            status: surveyStatus,
            score: surveyCount > 0 ? `${Math.round(completionRate)}%` : "N/A",
          },
        ],
      };
    });

    return NextResponse.json(transformedBarangays);
  } catch (error: any) {
    console.error("Error fetching barangays by year:", error);
    return NextResponse.json(
      { message: "Failed to fetch barangays by year", error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: Request) {
  let client;
  try {
    client = await pool.connect();

    // Check if barangay_year_data table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'barangay_year_data'
      );
    `;

    const tableExistsResult = await client.query(tableExistsQuery);
    const tableExists = tableExistsResult.rows[0].exists;

    if (!tableExists) {
      return NextResponse.json(
        {
          message:
            "Year-specific data table not available. Please run the migration script first.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { barangay_id, year, seal_status, survey_status, notes } = body;

    if (!barangay_id || !year) {
      return NextResponse.json(
        { message: "Barangay ID and year are required" },
        { status: 400 }
      );
    }

    // Validate barangay exists
    const barangayExistsQuery =
      "SELECT barangay_id FROM barangay WHERE barangay_id = $1 AND is_active = true";
    const barangayExists = await client.query(barangayExistsQuery, [
      barangay_id,
    ]);

    if (barangayExists.rows.length === 0) {
      return NextResponse.json(
        { message: "Barangay not found or inactive" },
        { status: 404 }
      );
    }

    // Upsert barangay year data safely
    const upsertQuery = `
      INSERT INTO barangay_year_data 
        (barangay_id, year, seal_status, survey_status, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (barangay_id, year) 
      DO UPDATE SET
        seal_status = EXCLUDED.seal_status,
        survey_status = EXCLUDED.survey_status,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await client.query(upsertQuery, [
      barangay_id,
      year,
      seal_status || "no",
      survey_status || "No data",
      notes || null,
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating barangay year data:", error);
    return NextResponse.json(
      { message: "Failed to update barangay year data", error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
