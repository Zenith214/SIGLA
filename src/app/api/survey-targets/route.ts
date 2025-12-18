import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId, getActiveCycle } from '@/utils/surveyCycleHelpers';
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
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get('cycle_id');
    const includeHistorical = searchParams.get('include_historical') === 'true';
    const includeNonAwardees = searchParams.get('include_non_awardees') === 'true';
    
    let targetCycleId: number | null = null;
    
    if (!includeHistorical) {
      // Use active cycle if not requesting historical data
      targetCycleId = await getActiveCycleId();
      if (!targetCycleId) {
        // No active cycle, return empty results
        return NextResponse.json([]);
      }
    } else if (cycleId) {
      // Use specific cycle if provided
      targetCycleId = parseInt(cycleId);
    }
    
    // Get awardee barangay IDs for the target cycle (unless explicitly including non-awardees)
    let awardeeBarangayIds: number[] = [];
    if (!includeNonAwardees && targetCycleId) {
      try {
        awardeeBarangayIds = await CycleAwardsService.getAwardeeBarangayIds(targetCycleId);
      } catch (error) {
        console.error('Error fetching awardee barangay IDs:', error);
        // If we can't get awardee data, fall back to showing all targets
        awardeeBarangayIds = [];
      }
    }
    
    let query = `
      SELECT st.*, b.barangay_name, sc.name as cycle_name, sc.year as cycle_year
      FROM survey_target st
      LEFT JOIN barangay b ON st.barangay_id = b.barangay_id
      LEFT JOIN survey_cycle sc ON st.survey_cycle_id = sc.cycle_id
    `;
    let queryParams: any[] = [];
    let whereConditions: string[] = [];
    
    // Filter by cycle
    if (targetCycleId) {
      whereConditions.push(`st.survey_cycle_id = $${queryParams.length + 1}`);
      queryParams.push(targetCycleId);
    }
    
    // Filter by awardee status (only include awardees unless explicitly requested otherwise)
    if (!includeNonAwardees && awardeeBarangayIds.length > 0) {
      const placeholders = awardeeBarangayIds.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
      whereConditions.push(`st.barangay_id IN (${placeholders})`);
      queryParams.push(...awardeeBarangayIds);
    } else if (!includeNonAwardees && awardeeBarangayIds.length === 0 && targetCycleId) {
      // No awardees found for this cycle, return empty results
      return NextResponse.json([]);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY b.barangay_name ASC';
    
    const result = await client.query(query, queryParams);
    
    // Return with no-cache headers to prevent stale data
    return NextResponse.json(result.rows, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    console.error('Error fetching survey targets:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const data = await req.json();
    
    // Get active cycle and link the target to it
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return NextResponse.json(
        { error: 'No active survey cycle found. Please set an active cycle before creating targets.' },
        { status: 400 }
      );
    }
    
    // Check if the barangay is an awardee for the active cycle
    const isAwardee = await CycleAwardsService.isBarangayAwardee(data.barangay_id, activeCycle.cycle_id);
    if (!isAwardee) {
      return NextResponse.json(
        { error: 'Survey targets can only be created for awardee barangays. Please ensure the barangay has been granted award status for the current cycle.' },
        { status: 403 }
      );
    }
    
    // Ensure the target is linked to the active cycle
    const targetData = {
      ...data,
      survey_cycle_id: activeCycle.cycle_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Check if target already exists for this barangay in the active cycle
    const existingCheck = await client.query(
      'SELECT target_id FROM survey_target WHERE barangay_id = $1 AND survey_cycle_id = $2',
      [targetData.barangay_id, activeCycle.cycle_id]
    );
    
    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'A survey target already exists for this barangay in the active cycle.' },
        { status: 409 }
      );
    }
    
    const columns = Object.keys(targetData).map(key => `"${key}"`).join(', ');
    const values = Object.values(targetData);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO survey_target (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create survey target');
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating survey target:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const data = await req.json();
    const { target_id, ...updateData } = data;
    
    // Add updated timestamp
    const updatedTargetData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // Verify the target exists and belongs to the active cycle (for security)
    const activeCycleId = await getActiveCycleId();
    if (activeCycleId) {
      const targetCheck = await client.query(
        'SELECT target_id FROM survey_target WHERE target_id = $1 AND survey_cycle_id = $2',
        [target_id, activeCycleId]
      );
      
      if (targetCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Survey target not found in the active cycle.' },
          { status: 404 }
        );
      }
    }
    
    const setClause = Object.keys(updatedTargetData).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [target_id, ...Object.values(updatedTargetData)];
    
    const query = `UPDATE survey_target SET ${setClause} WHERE target_id = $1 RETURNING *`;
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to update survey target');
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating survey target:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { target_id } = await req.json();
    
    // Verify the target exists and belongs to the active cycle (for security)
    const activeCycleId = await getActiveCycleId();
    if (activeCycleId) {
      const targetCheck = await client.query(
        'SELECT target_id FROM survey_target WHERE target_id = $1 AND survey_cycle_id = $2',
        [target_id, activeCycleId]
      );
      
      if (targetCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Survey target not found in the active cycle.' },
          { status: 404 }
        );
      }
    }
    
    await client.query('DELETE FROM survey_target WHERE target_id = $1', [target_id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting survey target:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}