import { NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    const barangayId = parseInt(id);

    if (isNaN(barangayId)) {
      return NextResponse.json(
        { error: 'Invalid barangay ID' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Get the active survey cycle ID
    const activeCycleId = await getActiveCycleId();
    
    if (!activeCycleId) {
      return NextResponse.json([]);
    }

    // Fetch all assignments for this barangay in the active cycle
    const query = `
      SELECT
        a.assignment_id,
        a.status,
        a.progress,
        a.created_at,
        a.updated_at,
        u."firstName",
        u."lastName",
        u.email
      FROM assignment a
      INNER JOIN "user" u ON a.user_id = u.id
      WHERE a.barangay_id = $1 AND a.survey_cycle_id = $2
      ORDER BY a.created_at DESC
    `;

    const result = await client.query(query, [barangayId, activeCycleId]);

    const assignments = result.rows.map((row: any) => ({
      assignment_id: row.assignment_id,
      status: row.status,
      progress: row.progress || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      interviewer: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email
      }
    }));

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error('Error fetching barangay assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments', message: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
