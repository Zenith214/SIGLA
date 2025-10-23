import { NextRequest, NextResponse } from "next/server"
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

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

export async function GET(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    // Get active cycle ID for filtering
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      return NextResponse.json(
        { error: "No active survey cycle found" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const includeNonAwardees = searchParams.get('include_non_awardees') === 'true';

    // Get awardee barangay IDs for filtering (unless explicitly including non-awardees)
    let awardeeBarangayIds: number[] = [];
    if (!includeNonAwardees) {
      try {
        awardeeBarangayIds = await CycleAwardsService.getAwardeeBarangayIds(activeCycleId);
      } catch (error) {
        console.error('Error fetching awardee barangay IDs:', error);
        // If we can't get awardee data, fall back to showing all assignments
        awardeeBarangayIds = [];
      }
    }

    let query = `
      SELECT 
        a.*,
        b.barangay_name,
        b.population,
        b.households,
        u."firstName",
        u."lastName",
        u.email,
        sc.name as cycle_name,
        sc.year as cycle_year
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      LEFT JOIN survey_cycle sc ON a.survey_cycle_id = sc.cycle_id
      WHERE a.survey_cycle_id = $1
    `;
    let queryParams: any[] = [activeCycleId];

    // Filter by awardee status (only include awardees unless explicitly requested otherwise)
    if (!includeNonAwardees && awardeeBarangayIds.length > 0) {
      const placeholders = awardeeBarangayIds.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
      query += ` AND a.barangay_id IN (${placeholders})`;
      queryParams.push(...awardeeBarangayIds);
    } else if (!includeNonAwardees && awardeeBarangayIds.length === 0) {
      // No awardees found for this cycle, return empty results
      return NextResponse.json([]);
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await client.query(query, queryParams);

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
      },
      survey_cycle: {
        cycle_id: row.survey_cycle_id,
        name: row.cycle_name,
        year: row.cycle_year
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

    // Get active cycle ID for linking assignment
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      return NextResponse.json(
        { error: "No active survey cycle found. Cannot create assignment." },
        { status: 400 }
      );
    }

    // Check if the barangay is an awardee for the active cycle
    const isAwardee = await CycleAwardsService.isBarangayAwardee(barangay_id, activeCycleId);
    if (!isAwardee) {
      return NextResponse.json(
        { error: 'Assignments can only be created for awardee barangays. Please ensure the barangay has been granted award status for the current cycle.' },
        { status: 403 }
      );
    }

    const insertQuery = `
      INSERT INTO assignment (barangay_id, user_id, survey_cycle_id, status, progress, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      parseInt(barangay_id),
      parseInt(user_id),
      activeCycleId,
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
        u.email,
        sc.name as cycle_name,
        sc.year as cycle_year
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      LEFT JOIN survey_cycle sc ON a.survey_cycle_id = sc.cycle_id
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
      },
      survey_cycle: {
        cycle_id: row.survey_cycle_id,
        name: row.cycle_name,
        year: row.cycle_year
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

    // Get active cycle ID to ensure updates are cycle-scoped
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      return NextResponse.json(
        { error: "No active survey cycle found" },
        { status: 400 }
      );
    }

    // Check if the new barangay is an awardee for the active cycle (if barangay is being changed)
    if (barangay_id) {
      const isAwardee = await CycleAwardsService.isBarangayAwardee(barangay_id, activeCycleId);
      if (!isAwardee) {
        return NextResponse.json(
          { error: 'Assignments can only be updated to awardee barangays. Please ensure the barangay has been granted award status for the current cycle.' },
          { status: 403 }
        );
      }
    }

    // Only allow updates to assignments in the active cycle
    const updateQuery = `
      UPDATE assignment 
      SET barangay_id = $2, user_id = $3, status = $4, progress = $5, updated_at = NOW()
      WHERE assignment_id = $1 AND survey_cycle_id = $6
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      assignment_id,
      parseInt(barangay_id),
      parseInt(user_id),
      status,
      parseInt(progress) || 0,
      activeCycleId
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
        u.email,
        sc.name as cycle_name,
        sc.year as cycle_year
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      LEFT JOIN survey_cycle sc ON a.survey_cycle_id = sc.cycle_id
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
      },
      survey_cycle: {
        cycle_id: row.survey_cycle_id,
        name: row.cycle_name,
        year: row.cycle_year
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

    // Get active cycle ID to ensure deletions are cycle-scoped
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      return NextResponse.json(
        { error: "No active survey cycle found" },
        { status: 400 }
      );
    }

    // Only allow deletion of assignments in the active cycle
    const result = await client.query(
      'DELETE FROM assignment WHERE assignment_id = $1 AND survey_cycle_id = $2 RETURNING assignment_id', 
      [assignment_id, activeCycleId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found in active cycle or already deleted" },
        { status: 404 }
      );
    }

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