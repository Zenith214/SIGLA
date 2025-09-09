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
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('🗑️ Starting data clearing operation...');
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    const body = await request.json();
    console.log('📝 Clear request body:', body);
    
    const {
      type = 'all', // 'all', 'barangay', 'dateRange'
      barangayIds = [],
      startDate,
      endDate,
      createBackup = false
    } = body;

    let deletedCount = 0;
    let backupData = null;

    // Create backup if requested
    if (createBackup) {
      console.log('💾 Creating backup...');
      const backupQuery = `
        SELECT sr.*, st.target, st.achieved, st.percentage
        FROM survey_response sr
        LEFT JOIN survey_target st ON sr.barangay_id = st.barangay_id
        ORDER BY sr.created_at DESC
      `;
      const backupResult = await client.query(backupQuery);
      backupData = {
        timestamp: new Date().toISOString(),
        totalRecords: backupResult.rows.length,
        data: backupResult.rows
      };
      console.log(`💾 Backup created with ${backupData.totalRecords} records`);
    }

    // Begin transaction
    await client.query('BEGIN');
    console.log('🔄 Transaction started');

    try {
      switch (type) {
        case 'all':
          console.log('🗑️ Clearing all survey data...');
          // Delete all survey responses
          const deleteAllQuery = 'DELETE FROM survey_response';
          const deleteAllResult = await client.query(deleteAllQuery);
          deletedCount = deleteAllResult.rowCount || 0;
          
          // Reset all survey targets
          await client.query(
            'UPDATE survey_target SET achieved = 0, percentage = 0, updated_at = NOW()'
          );
          console.log(`✅ Deleted ${deletedCount} survey responses and reset all targets`);
          break;

        case 'barangay':
          if (barangayIds.length === 0) {
            throw new Error('No barangay IDs provided');
          }
          
          console.log(`🗑️ Clearing surveys for barangays: ${barangayIds.join(', ')}`);
          // Delete surveys for specific barangays
          const deleteBarangayQuery = 'DELETE FROM survey_response WHERE barangay_id = ANY($1)';
          const deleteBarangayResult = await client.query(deleteBarangayQuery, [barangayIds]);
          deletedCount = deleteBarangayResult.rowCount || 0;
          
          // Reset survey targets for these barangays
          await client.query(
            'UPDATE survey_target SET achieved = 0, percentage = 0, updated_at = NOW() WHERE barangay_id = ANY($1)',
            [barangayIds]
          );
          console.log(`✅ Deleted ${deletedCount} survey responses for specified barangays`);
          break;

        case 'dateRange':
          if (!startDate || !endDate) {
            throw new Error('Start date and end date are required for date range deletion');
          }
          
          console.log(`🗑️ Clearing surveys from ${startDate} to ${endDate}`);
          // Delete surveys within date range
          const deleteDateQuery = 'DELETE FROM survey_response WHERE created_at BETWEEN $1 AND $2';
          const deleteDateResult = await client.query(deleteDateQuery, [startDate, endDate]);
          deletedCount = deleteDateResult.rowCount || 0;
          
          // Recalculate survey targets for all affected barangays
          console.log('🔄 Recalculating survey targets...');
          const affectedBarangaysQuery = `
            SELECT DISTINCT barangay_id FROM survey_response
          `;
          const affectedResult = await client.query(affectedBarangaysQuery);
          
          for (const row of affectedResult.rows) {
            const barangayId = row.barangay_id;
            const countQuery = 'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1';
            const countResult = await client.query(countQuery, [barangayId]);
            const achievedCount = parseInt(countResult.rows[0].count);
            
            const targetQuery = 'SELECT target FROM survey_target WHERE barangay_id = $1';
            const targetResult = await client.query(targetQuery, [barangayId]);
            const target = targetResult.rows[0]?.target || 150;
            
            const percentage = Math.min(Math.round((achievedCount / target) * 100), 100);
            
            // Check if survey target exists, then update or insert
            const existingTargetQuery = 'SELECT target_id FROM survey_target WHERE barangay_id = $1';
            const existingTargetResult = await client.query(existingTargetQuery, [barangayId]);
            
            if (existingTargetResult.rows.length > 0) {
              await client.query(
                'UPDATE survey_target SET achieved = $1, percentage = $2, updated_at = NOW() WHERE barangay_id = $3',
                [achievedCount, percentage, barangayId]
              );
            } else {
              await client.query(
                'INSERT INTO survey_target (barangay_id, target, achieved, percentage, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
                [barangayId, target, achievedCount, percentage]
              );
            }
          }
          console.log(`✅ Deleted ${deletedCount} survey responses and recalculated targets`);
          break;

        default:
          throw new Error('Invalid deletion type');
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Transaction committed successfully');

      return NextResponse.json({
        success: true,
        deletedCount,
        type,
        backup: backupData ? {
          created: true,
          timestamp: backupData.timestamp,
          recordCount: backupData.totalRecords
        } : null
      });

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.log('❌ Transaction rolled back due to error');
      throw error;
    }

  } catch (error) {
    console.error("❌ Error clearing survey data:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to clear survey data",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection');
      client.release();
    }
  }
}

// GET endpoint to get current data statistics
export async function GET() {
  let client;
  try {
    console.log('📊 Fetching data statistics...');
    client = await pool.connect();
    
    // Get survey statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_surveys,
        COUNT(DISTINCT barangay_id) as barangays_with_data,
        MIN(created_at) as earliest_survey,
        MAX(created_at) as latest_survey
      FROM survey_response
    `;
    const statsResult = await client.query(statsQuery);
    
    // Get barangay breakdown with proper names
    const barangayQuery = `
      SELECT 
        b.barangay_name,
        b.barangay_id,
        COUNT(sr.response_id) as survey_count,
        st.target,
        st.achieved,
        st.percentage
      FROM barangay b
      LEFT JOIN survey_response sr ON b.barangay_id = sr.barangay_id
      LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id
      WHERE b.is_active = true
      GROUP BY b.barangay_id, b.barangay_name, st.target, st.achieved, st.percentage
      ORDER BY survey_count DESC
    `;
    const barangayResult = await client.query(barangayQuery);
    
    console.log(`📊 Found ${statsResult.rows[0].total_surveys} total surveys across ${barangayResult.rows.length} barangays`);
    
    return NextResponse.json({
      statistics: statsResult.rows[0],
      barangayBreakdown: barangayResult.rows
    });
    
  } catch (error) {
    console.error("❌ Error getting data statistics:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to get data statistics",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}