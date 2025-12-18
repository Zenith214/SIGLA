import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycle } from '@/utils/surveyCycleHelpers';

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
    
    // Get active cycle
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return NextResponse.json(
        { error: 'No active survey cycle found. Cannot reset targets.' },
        { status: 400 }
      );
    }
    
    const { action, source_cycle_id, target_values } = await req.json();
    
    if (action === 'copy_from_cycle' && source_cycle_id) {
      // Copy targets from another cycle to the active cycle
      const copyQuery = `
        INSERT INTO survey_target (barangay_id, survey_cycle_id, target, achieved, percentage, created_at, updated_at)
        SELECT 
          st.barangay_id,
          $1 as survey_cycle_id,
          st.target,
          0 as achieved,
          0 as percentage,
          NOW() as created_at,
          NOW() as updated_at
        FROM survey_target st
        WHERE st.survey_cycle_id = $2
          AND NOT EXISTS (
            SELECT 1 FROM survey_target existing 
            WHERE existing.barangay_id = st.barangay_id 
              AND existing.survey_cycle_id = $1
          )
        RETURNING *
      `;
      
      const result = await client.query(copyQuery, [activeCycle.cycle_id, source_cycle_id]);
      
      return NextResponse.json({
        success: true,
        message: `Copied ${result.rows.length} targets from cycle ${source_cycle_id} to active cycle ${activeCycle.cycle_id}`,
        copied_targets: result.rows
      });
      
    } else if (action === 'reset_progress') {
      // Reset progress for all targets in active cycle
      const resetQuery = `
        UPDATE survey_target 
        SET 
          achieved = 0,
          percentage = 0,
          updated_at = NOW()
        WHERE survey_cycle_id = $1
        RETURNING *
      `;
      
      const result = await client.query(resetQuery, [activeCycle.cycle_id]);
      
      return NextResponse.json({
        success: true,
        message: `Reset progress for ${result.rows.length} targets in active cycle ${activeCycle.cycle_id}`,
        reset_targets: result.rows
      });
      
    } else if (action === 'create_default' && target_values) {
      // Create default targets for all barangays in active cycle
      const createQuery = `
        INSERT INTO survey_target (barangay_id, survey_cycle_id, target, achieved, percentage, created_at, updated_at)
        SELECT 
          b.barangay_id,
          $1 as survey_cycle_id,
          $2 as target,
          0 as achieved,
          0 as percentage,
          NOW() as created_at,
          NOW() as updated_at
        FROM barangay b
        WHERE b.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM survey_target existing 
            WHERE existing.barangay_id = b.barangay_id 
              AND existing.survey_cycle_id = $1
          )
        RETURNING *
      `;
      
      const result = await client.query(createQuery, [activeCycle.cycle_id, target_values.default_target]);
      
      return NextResponse.json({
        success: true,
        message: `Created ${result.rows.length} default targets for active cycle ${activeCycle.cycle_id}`,
        created_targets: result.rows
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: copy_from_cycle, reset_progress, create_default' },
        { status: 400 }
      );
    }
    
  } catch (err: any) {
    console.error('Error resetting survey targets:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    
    // Get available cycles for copying targets
    const cyclesQuery = `
      SELECT 
        sc.cycle_id,
        sc.name,
        sc.year,
        sc.is_active,
        COUNT(st.target_id) as target_count
      FROM survey_cycle sc
      LEFT JOIN survey_target st ON sc.cycle_id = st.survey_cycle_id
      GROUP BY sc.cycle_id, sc.name, sc.year, sc.is_active
      ORDER BY sc.year DESC, sc.created_at DESC
    `;
    
    const result = await client.query(cyclesQuery);
    
    return NextResponse.json({
      available_cycles: result.rows,
      reset_options: [
        {
          action: 'copy_from_cycle',
          description: 'Copy targets from another cycle to the active cycle',
          requires: 'source_cycle_id'
        },
        {
          action: 'reset_progress',
          description: 'Reset achieved counts and percentages to zero for active cycle',
          requires: null
        },
        {
          action: 'create_default',
          description: 'Create default targets for all active barangays',
          requires: 'target_values.default_target'
        }
      ]
    });
    
  } catch (err: any) {
    console.error('Error getting reset options:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}