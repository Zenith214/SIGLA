import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    // Get database client with timeout
    client = await pool.connect();
    const resolvedParams = await params;
    const assignmentId = parseInt(resolvedParams.id);

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
      // Check if assignment exists and get details for logging
      const checkQuery = `
        SELECT a.assignment_id, a.barangay_id, a.user_id, 
               b.barangay_name, u."firstName", u."lastName"
        FROM assignment a
        LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
        LEFT JOIN "user" u ON a.user_id = u.id
        WHERE a.assignment_id = $1
      `;
      const checkResult = await client.query(checkQuery, [assignmentId]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Assignment not found' },
          { status: 404 }
        );
      }

      const assignment = checkResult.rows[0];
      
      // Check for dependent records that might prevent deletion
      // Note: Based on the schema, assignments don't have direct dependencies
      // The database foreign key constraints will handle referential integrity

      // Delete the assignment
      const deleteResult = await client.query(
        'DELETE FROM assignment WHERE assignment_id = $1 RETURNING assignment_id',
        [assignmentId]
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

  } catch (error) {
    console.error('Error deleting assignment:', {
      assignmentId: resolvedParams?.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Return appropriate error based on error type
    if (error.code === '23503') { // Foreign key violation
      return NextResponse.json(
        { 
          error: 'Cannot delete assignment due to related data',
          details: 'This assignment has associated records that must be removed first'
        },
        { status: 409 }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 } // Service unavailable
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete assignment',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      WHERE a.assignment_id = $1
    `;

    const result = await client.query(query, [assignmentId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found' },
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

    const updateQuery = `
      UPDATE assignment 
      SET barangay_id = $2, user_id = $3, status = $4, progress = $5, updated_at = NOW()
      WHERE assignment_id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      assignmentId,
      parseInt(barangay_id),
      parseInt(user_id),
      status,
      parseInt(progress) || 0
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found or failed to update' },
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
        u.email
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
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