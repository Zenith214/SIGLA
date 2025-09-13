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
    
    // Fetch ALL barangays with survey targets
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
        st.percentage
      FROM barangay b
      LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id
      WHERE b.is_active = true
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
        seal_expiration_date: barangay.seal_expiration_date,
        history: [] // Add empty history for now
      };
    });

    return NextResponse.json(transformedBarangays);
  } catch (error: any) {
    console.error('Error fetching all barangays:', error);
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

export async function PUT(req: Request) {
  let client;
  try {
    client = await pool.connect();
    const body = await req.json();
    const { barangayId, ...updates } = body;

    console.log('Received update request:', { barangayId, updates });

    if (!barangayId) {
      return NextResponse.json(
        { message: 'Barangay ID is required' },
        { status: 400 }
      );
    }

    // Map frontend field names to database field names
    const updateFields = [];
    const values = [parseInt(barangayId)];
    let paramIndex = 2;
    
    if (updates.name !== undefined) {
      updateFields.push(`barangay_name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.seal !== undefined) {
      updateFields.push(`seal = $${paramIndex}`);
      values.push(updates.seal);
      paramIndex++;
    }
    if (updates.seal_expiration_date !== undefined) {
      updateFields.push(`seal_expiration_date = $${paramIndex}`);
      // Handle empty string dates by converting to null
      const dateValue = updates.seal_expiration_date === '' ? null : updates.seal_expiration_date;
      values.push(dateValue);
      paramIndex++;
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }
    if (updates.population !== undefined) {
      updateFields.push(`population = $${paramIndex}`);
      values.push(updates.population);
      paramIndex++;
    }
    if (updates.households !== undefined) {
      updateFields.push(`households = $${paramIndex}`);
      values.push(updates.households);
      paramIndex++;
    }
    if (updates.captain !== undefined) {
      updateFields.push(`captain = $${paramIndex}`);
      values.push(updates.captain);
      paramIndex++;
    }
    if (updates.currentStatus !== undefined) {
      updateFields.push(`"currentStatus" = $${paramIndex}`);
      values.push(updates.currentStatus);
      paramIndex++;
    }
    if (updates.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      values.push(updates.is_active);
      paramIndex++;
    }

    console.log('Mapped update data:', updateFields, values);

    const query = `UPDATE barangay SET ${updateFields.join(', ')} WHERE barangay_id = $1 RETURNING *`;
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to update barangay');
    }

    const updatedBarangay = result.rows[0];

    // Transform response to match frontend expectations
    const transformedResponse = {
      id: updatedBarangay.barangay_id,
      barangay_id: updatedBarangay.barangay_id,
      name: updatedBarangay.barangay_name,
      seal: updatedBarangay.seal,
      seal_expiration_date: updatedBarangay.seal_expiration_date,
      description: updatedBarangay.description,
      population: updatedBarangay.population,
      households: updatedBarangay.households,
      captain: updatedBarangay.captain,
      currentStatus: updatedBarangay.currentStatus,
      is_active: updatedBarangay.is_active
    };

    console.log('Update successful:', transformedResponse);
    return NextResponse.json(transformedResponse);
  } catch (error: any) {
    console.error('Error updating barangay:', error);
    return NextResponse.json(
      { message: 'Failed to update barangay', error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(req: Request) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(req.url);
    const barangayId = searchParams.get('id');

    console.log('Received delete request for barangay ID:', barangayId);

    if (!barangayId) {
      return NextResponse.json(
        { message: 'Barangay ID is required' },
        { status: 400 }
      );
    }

    // First check if barangay exists
    const checkQuery = 'SELECT barangay_id, barangay_name FROM barangay WHERE barangay_id = $1';
    const checkResult = await client.query(checkQuery, [parseInt(barangayId)]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Barangay not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    const deleteQuery = 'UPDATE barangay SET is_active = false WHERE barangay_id = $1 RETURNING barangay_id, barangay_name';
    const result = await client.query(deleteQuery, [parseInt(barangayId)]);

    if (result.rows.length === 0) {
      throw new Error('Failed to delete barangay');
    }

    console.log('Delete successful for barangay:', result.rows[0].barangay_name);
    return NextResponse.json({ 
      message: 'Barangay deleted successfully',
      deletedBarangay: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error deleting barangay:', error);
    return NextResponse.json(
      { message: 'Failed to delete barangay', error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}