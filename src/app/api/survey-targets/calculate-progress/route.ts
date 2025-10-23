import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

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

export async function POST(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    
    // Get active cycle ID
    const activeCycleId = await getActiveCycleId();
    if (!activeCycleId) {
      return NextResponse.json(
        { error: 'No active survey cycle found. Cannot calculate progress.' },
        { status: 400 }
      );
    }
    
    // Get optional barangay_id from request body to calculate for specific barangay
    const { barangay_id } = await req.json().catch(() => ({}));
    
    let whereClause = 'WHERE st.survey_cycle_id = $1';
    let queryParams = [activeCycleId];
    
    if (barangay_id) {
      whereClause += ' AND st.barangay_id = $2';
      queryParams.push(barangay_id);
    }
    
    // Calculate achieved count from survey responses for each target
    const progressQuery = `
      UPDATE survey_target st
      SET 
        achieved = COALESCE(response_counts.count, 0),
        percentage = CASE 
          WHEN st.target > 0 THEN ROUND((COALESCE(response_counts.count, 0)::decimal / st.target::decimal) * 100)
          ELSE 0 
        END,
        updated_at = NOW()
      FROM (
        SELECT 
          sr.barangay_id,
          COUNT(*) as count
        FROM survey_response sr
        WHERE sr.survey_cycle_id = $1
          AND sr.status IN ('completed', 'submitted')
          ${barangay_id ? 'AND sr.barangay_id = $2' : ''}
        GROUP BY sr.barangay_id
      ) response_counts
      ${whereClause}
        AND st.barangay_id = response_counts.barangay_id
      RETURNING st.*, b.barangay_name
    `;
    
    // Also update targets that have no responses (set achieved to 0)
    const zeroProgressQuery = `
      UPDATE survey_target st
      SET 
        achieved = 0,
        percentage = 0,
        updated_at = NOW()
      FROM barangay b
      ${whereClause}
        AND st.barangay_id = b.barangay_id
        AND NOT EXISTS (
          SELECT 1 FROM survey_response sr 
          WHERE sr.barangay_id = st.barangay_id 
            AND sr.survey_cycle_id = st.survey_cycle_id
            AND sr.status IN ('completed', 'submitted')
        )
      RETURNING st.*, b.barangay_name
    `;
    
    // Execute both queries
    const progressResult = await client.query(progressQuery, queryParams);
    const zeroResult = await client.query(zeroProgressQuery, queryParams);
    
    // Combine results
    const updatedTargets = [...progressResult.rows, ...zeroResult.rows];
    
    return NextResponse.json({
      success: true,
      updated_count: updatedTargets.length,
      targets: updatedTargets,
      message: `Updated progress for ${updatedTargets.length} survey targets in active cycle.`
    });
    
  } catch (err: any) {
    console.error('Error calculating survey target progress:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    
    // Get active cycle ID
    const activeCycleId = await getActiveCycleId();
    if (!activeCycleId) {
      return NextResponse.json(
        { error: 'No active survey cycle found.' },
        { status: 400 }
      );
    }
    
    // Get progress summary for all targets in active cycle
    const summaryQuery = `
      SELECT 
        st.target_id,
        st.barangay_id,
        b.barangay_name,
        st.target,
        st.achieved,
        st.percentage,
        CASE 
          WHEN st.target > 0 THEN ROUND((st.achieved::decimal / st.target::decimal) * 100, 2)
          ELSE 0 
        END as calculated_percentage,
        sr_count.actual_count
      FROM survey_target st
      LEFT JOIN barangay b ON st.barangay_id = b.barangay_id
      LEFT JOIN (
        SELECT 
          barangay_id,
          COUNT(*) as actual_count
        FROM survey_response 
        WHERE survey_cycle_id = $1 
          AND status IN ('completed', 'submitted')
        GROUP BY barangay_id
      ) sr_count ON st.barangay_id = sr_count.barangay_id
      WHERE st.survey_cycle_id = $1
      ORDER BY b.barangay_name ASC
    `;
    
    const result = await client.query(summaryQuery, [activeCycleId]);
    
    return NextResponse.json({
      active_cycle_id: activeCycleId,
      targets: result.rows,
      summary: {
        total_targets: result.rows.length,
        total_target_count: result.rows.reduce((sum, row) => sum + (row.target || 0), 0),
        total_achieved: result.rows.reduce((sum, row) => sum + (row.achieved || 0), 0),
        overall_percentage: result.rows.length > 0 
          ? Math.round((result.rows.reduce((sum, row) => sum + (row.achieved || 0), 0) / 
              result.rows.reduce((sum, row) => sum + (row.target || 0), 0)) * 100)
          : 0
      }
    });
    
  } catch (err: any) {
    console.error('Error getting survey target progress:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}