import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET - Fetch current GPS threshold setting
export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    // Check if settings table exists, if not create it
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER
      );
    `;
    await client.query(createTableQuery);

    // Fetch GPS threshold setting
    const query = `
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'gps_verification_threshold'
    `;
    const result = await client.query(query);

    let threshold = 200; // Default value

    if (result.rows.length > 0) {
      threshold = parseInt(result.rows[0].setting_value);
    } else {
      // Insert default value if not exists
      const insertQuery = `
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES ('gps_verification_threshold', '200', 'Distance threshold in meters for GPS verification')
        ON CONFLICT (setting_key) DO NOTHING
      `;
      await client.query(insertQuery);
    }

    return NextResponse.json({ threshold });
  } catch (error) {
    console.error("Error fetching GPS threshold:", error);
    return NextResponse.json(
      { error: "Failed to fetch GPS threshold setting" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

// POST - Update GPS threshold setting
export async function POST(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { threshold } = body;

    // Validate threshold
    if (typeof threshold !== "number" || threshold < 10 || threshold > 5000) {
      return NextResponse.json(
        { error: "Threshold must be a number between 10 and 5000 meters" },
        { status: 400 }
      );
    }

    // Ensure settings table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER
      );
    `;
    await client.query(createTableQuery);

    // Update or insert threshold setting
    const upsertQuery = `
      INSERT INTO system_settings (setting_key, setting_value, description, updated_at)
      VALUES ('gps_verification_threshold', $1, 'Distance threshold in meters for GPS verification', CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = $1,
        updated_at = CURRENT_TIMESTAMP
      RETURNING setting_value
    `;
    const result = await client.query(upsertQuery, [threshold.toString()]);

    // Also update environment variable for runtime use (optional)
    process.env.GPS_VERIFICATION_THRESHOLD = threshold.toString();

    return NextResponse.json({
      success: true,
      threshold: parseInt(result.rows[0].setting_value),
    });
  } catch (error) {
    console.error("Error updating GPS threshold:", error);
    return NextResponse.json(
      { error: "Failed to update GPS threshold setting" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
