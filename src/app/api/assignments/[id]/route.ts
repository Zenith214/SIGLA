import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getActiveCycleId } from '@/utils/surveyCycleHelpers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  let resolvedParams;
  let assignmentId;
  
  try {
    // Get database client with timeout
    client = await pool.connect();
    resolvedParams = await params;
    assignmentId = parseInt(resolvedParams.id);

    // Validate assignment ID
    if (isNaN(assignmentId) || assignmentId <= 0) {
      return NextResponse.json(
        { error: 'Invalid assignment ID. Must be a positive integer.' },
        { status: 400 }
      );
    }

    // Start transaction for data integrity
    await client.query('BEGIN');

    try {
      // Get active cycle ID to ensure operations are cycle-scoped
      const activeCycleId = await getActiveCycleId();

      if (!activeCycleId) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'No active survey cycle found' },
          { status: 400 }
        );
      }

      // Check if assignment exists in active cycle and get details for logging
      const checkQuery = `
        SELECT a.assignment_id, a.barangay_id, a.user_id, a.survey_cycle_id,
               b.barangay_name, u."firstName", u."lastName"
        FROM assignment a
        LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
        LEFT JOIN "user" u ON a.user_id = u.id
        WHERE a.assignment_id = $1 AND a.survey_cycle_id = $2
      `;
      const checkResult = await client.query(checkQuery, [assignmentId, activeCycleId]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Assignment not found in active cycle' },
          { status: 404 }
        );
      }

      const assignment = checkResult.rows[0];
      
      // Check for dependent records that might prevent deletion
      // Note: Based on the schema, assignments don't have direct dependencies
      // The database foreign key constraints will handle referential integrity

      // Delete the assignment (already verified to be in active cycle)
      const deleteResult = await client.query(
        'DELETE FROM assignment WHERE assignment_id = $1 AND survey_cycle_id = $2 RETURNING assignment_id',
        [assignmentId, activeCycleId]
      );

      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Failed to delete assignment' },
          { status: 500 }
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      // Log successful deletion
      console.log(`Assignment ${assignmentId} successfully deleted:`, {
        barangay: assignment.barangay_name,
        assignee: `${assignment.firstName} ${assignment.lastName}`,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Assignment deleted successfully',
        deletedId: assignmentId
      });

    } catch (transactionError) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      throw transactionError;
    }

  } catch (error: any) {
    console.error('Error deleting assignment:', {
      assignmentId: assignmentId || resolvedParams?.id,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });

    // Return appropriate error based on error type
    if (error?.code === '23503') { // Foreign key violation
      return NextResponse.json(
        { 
          error: 'Cannot delete assignment due to related data',
          details: 'This assignment has associated records that must be removed first'
        },
        { status: 409 }
      );
    }

    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 } // Service unavailable
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete assignment',
        details: process.env.NODE_ENV === 'development' ? error?.message || 'Unknown error' : 'Internal server error'
      },
      { status: 500 }
    );
  } finally {
    // Always release the client back to the pool
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing database client:', releaseError);
      }
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    client = await pool.connect();
    const resolvedParams = await params;
    const assignmentId = parseInt(resolvedParams.id);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    // Get active cycle ID to ensure we only return assignments from active cycle
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      return NextResponse.json(
        { error: 'No active survey cycle found' },
        { status: 400 }
      );
    }

    const query = `
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
      WHERE a.assignment_id = $1 AND a.survey_cycle_id = $2
    `;

    const result = await client.query(query, [assignmentId, activeCycleId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found in active cycle' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
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

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    client = await pool.connect();
    const resolvedParams = await params;
    const assignmentId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { barangay_id, user_id, status, progress } = body;

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    // Get active cycle ID to ensure updates are cycle-scoped
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      return NextResponse.json(
        { error: 'No active survey cycle found' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE assignment 
      SET barangay_id = $2, user_id = $3, status = $4, progress = $5, updated_at = NOW()
      WHERE assignment_id = $1 AND survey_cycle_id = $6
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      assignmentId,
      parseInt(barangay_id),
      parseInt(user_id),
      status,
      parseInt(progress) || 0,
      activeCycleId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found in active cycle or failed to update' },
        { status: 404 }
      );
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

    const assignmentResult = await client.query(selectQuery, [assignmentId]);
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

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}