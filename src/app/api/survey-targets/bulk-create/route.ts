import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
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

export async function POST(req: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const { cycle_id, default_target = 150 } = await req.json();

    if (!cycle_id) {
      return NextResponse.json(
        { error: 'cycle_id is required' },
        { status: 400 }
      );
    }

    console.log(`📊 Bulk creating targets for cycle ${cycle_id} with default target: ${default_target}`);

    // Get all awardee barangays for this cycle
    const awardeeBarangayIds = await CycleAwardsService.getAwardeeBarangayIds(cycle_id);

    if (awardeeBarangayIds.length === 0) {
      return NextResponse.json(
        { error: 'No awardees found for this cycle. Please grant awards first.' },
        { status: 404 }
      );
    }

    console.log(`✅ Found ${awardeeBarangayIds.length} awardee barangays`);

    // Get existing targets for this cycle
    const existingTargetsResult = await client.query(
      'SELECT barangay_id FROM survey_target WHERE survey_cycle_id = $1',
      [cycle_id]
    );

    const existingBarangayIds = new Set(existingTargetsResult.rows.map(row => row.barangay_id));
    console.log(`📋 Found ${existingBarangayIds.size} existing targets`);

    // Filter out barangays that already have targets
    const barangaysToCreate = awardeeBarangayIds.filter(id => !existingBarangayIds.has(id));

    if (barangaysToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        created: 0,
        message: 'All awardees already have survey targets for this cycle.'
      });
    }

    console.log(`➕ Creating targets for ${barangaysToCreate.length} barangays`);

    // Bulk insert targets
    const values: any[] = [];
    const placeholders: string[] = [];
    
    barangaysToCreate.forEach((barangayId, index) => {
      const offset = index * 5;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
      values.push(
        barangayId,
        cycle_id,
        default_target,
        0, // achieved
        0  // percentage
      );
    });

    const insertQuery = `
      INSERT INTO survey_target (barangay_id, survey_cycle_id, target, achieved, percentage)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await client.query(insertQuery, values);

    console.log(`✅ Successfully created ${result.rows.length} survey targets`);

    return NextResponse.json({
      success: true,
      created: result.rows.length,
      targets: result.rows,
      message: `Created ${result.rows.length} survey targets successfully.`
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (err: any) {
    console.error('❌ Error bulk creating survey targets:', err);
    return NextResponse.json({ 
      error: err.message || 'Failed to bulk create survey targets' 
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
