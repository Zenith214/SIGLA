import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM survey_cycle ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching survey cycles:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey cycles" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { year, status, start_date, end_date, responses } = body;

    const query = `
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await client.query(query, [
      year,
      status,
      new Date(start_date),
      new Date(end_date),
      responses || 0,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Failed to create survey cycle");
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating survey cycle:", error);
    return NextResponse.json(
      { error: "Failed to create survey cycle" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { cycle_id, year, status, start_date, end_date, responses } = body;

    const updateFields = [];
    const values = [cycle_id];
    let paramIndex = 2;

    if (year !== undefined) {
      updateFields.push(`year = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    if (start_date !== undefined) {
      updateFields.push(`start_date = $${paramIndex}`);
      values.push(new Date(start_date));
      paramIndex++;
    }
    if (end_date !== undefined) {
      updateFields.push(`end_date = $${paramIndex}`);
      values.push(new Date(end_date));
      paramIndex++;
    }
    if (responses !== undefined) {
      updateFields.push(`responses = $${paramIndex}`);
      values.push(responses);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `UPDATE survey_cycle SET ${updateFields.join(
      ", "
    )} WHERE cycle_id = $1 RETURNING *`;
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Failed to update survey cycle");
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating survey cycle:", error);
    return NextResponse.json(
      { error: "Failed to update survey cycle" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { cycle_id } = body;

    await client.query("DELETE FROM survey_cycle WHERE cycle_id = $1", [
      cycle_id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting survey cycle:", error);
    return NextResponse.json(
      { error: "Failed to delete survey cycle" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
