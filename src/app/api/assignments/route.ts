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

export async function GET() {
  let client;
  try {
    client = await pool.connect();

    const query = `
      SELECT 
        a.*,
        b.barangay_name,
        b.population,
        b.households,
        u."firstName",
        u."lastName",
        u.email
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `;

    const result = await client.query(query);

    // Transform the data to match the expected structure
    const assignments = result.rows.map((row: any) => ({
      ...row,
      barangay: {
        barangay_id: row.barangay_id,
        barangay_name: row.barangay_name,
        population: row.population,
        households: row.households
      },
      user: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email
      }
    }));

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
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
    const body = await request.json()
    const { barangay_id, user_id, status, progress } = body

    const insertQuery = `
      INSERT INTO assignment (barangay_id, user_id, status, progress, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      parseInt(barangay_id),
      parseInt(user_id),
      status || 'Pending',
      parseInt(progress) || 0
    ]);

    if (result.rows.length === 0) {
      throw new Error('Failed to create assignment');
    }

    // Fetch the complete assignment with related data
    const selectQuery = `
      SELECT 
        a.*,
        b.barangay_name,
        b.population,
        b.households,
        u."firstName",
        u."lastName",
        u.email
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      WHERE a.assignment_id = $1
    `;

    const assignmentResult = await client.query(selectQuery, [result.rows[0].assignment_id]);
    const row = assignmentResult.rows[0];

    const assignment = {
      ...row,
      barangay: {
        barangay_id: row.barangay_id,
        barangay_name: row.barangay_name,
        population: row.population,
        households: row.households
      },
      user: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email
      }
    };

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
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
    const body = await request.json()
    const { assignment_id, barangay_id, user_id, status, progress } = body

    const updateQuery = `
      UPDATE assignment 
      SET barangay_id = $2, user_id = $3, status = $4, progress = $5, updated_at = NOW()
      WHERE assignment_id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      assignment_id,
      parseInt(barangay_id),
      parseInt(user_id),
      status,
      parseInt(progress) || 0
    ]);

    if (result.rows.length === 0) {
      throw new Error('Failed to update assignment');
    }

    // Fetch the complete assignment with related data
    const selectQuery = `
      SELECT 
        a.*,
        b.barangay_name,
        b.population,
        b.households,
        u."firstName",
        u."lastName",
        u.email
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      WHERE a.assignment_id = $1
    `;

    const assignmentResult = await client.query(selectQuery, [assignment_id]);
    const row = assignmentResult.rows[0];

    const assignment = {
      ...row,
      barangay: {
        barangay_id: row.barangay_id,
        barangay_name: row.barangay_name,
        population: row.population,
        households: row.households
      },
      user: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email
      }
    };

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
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
    const body = await request.json()
    const { assignment_id } = body

    await client.query('DELETE FROM assignment WHERE assignment_id = $1', [assignment_id]);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release();
    }
  }
}