const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanDuplicates() {
  console.log('🧹 Cleaning ML Cache Duplicates\n');
  console.log('=' .repeat(60));
  
  try {
    const client = await pool.connect();
    
    // Find all duplicates
    const duplicates = await client.query(`
      SELECT barangay_id, cycle_id, COUNT(*) as count
      FROM ml_cache
      GROUP BY barangay_id, cycle_id
      HAVING COUNT(*) > 1
      ORDER BY cycle_id, barangay_id
    `);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No duplicates found!');
      client.release();
      await pool.end();
      return;
    }
    
    console.log(`\n⚠️  Found ${duplicates.rows.length} duplicate combinations\n`);
    
    for (const dup of duplicates.rows) {
      console.log(`\nProcessing Barangay ${dup.barangay_id}, Cycle ${dup.cycle_id}:`);
      console.log(`  Found ${dup.count} records`);
      
      // Get all records for this combination
      const records = await client.query(`
        SELECT 
          ctid,
          barangay_id,
          cycle_id,
          created_at,
          updated_at,
          data->'action_grid'->'financial'->>'satisfaction_score' as financial_satisfaction,
          CASE 
            WHEN data IS NULL THEN 0
            WHEN data = '{}' THEN 0
            WHEN data->'action_grid' IS NULL THEN 0
            ELSE 1
          END as has_data
        FROM ml_cache
        WHERE barangay_id = $1 AND cycle_id = $2
        ORDER BY has_data DESC, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
      `, [dup.barangay_id, dup.cycle_id]);
      
      console.log(`\n  Records found:`);
      records.rows.forEach((rec, idx) => {
        console.log(`    ${idx + 1}. Has data: ${rec.has_data ? 'Yes' : 'No'}, ` +
                    `Satisfaction: ${rec.financial_satisfaction || 'null'}, ` +
                    `Updated: ${rec.updated_at || 'never'}`);
      });
      
      // Keep the first one (best record), delete the rest
      const keepRecord = records.rows[0];
      const deleteRecords = records.rows.slice(1);
      
      console.log(`\n  ✅ Keeping: Record with ${keepRecord.has_data ? 'data' : 'no data'}`);
      console.log(`  ❌ Deleting: ${deleteRecords.length} duplicate(s)`);
      
      // Delete duplicates
      for (const delRec of deleteRecords) {
        await client.query(`DELETE FROM ml_cache WHERE ctid = $1`, [delRec.ctid]);
        console.log(`     Deleted record (ctid: ${delRec.ctid})`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ Cleanup Complete!');
    
    // Verify no duplicates remain
    const verify = await client.query(`
      SELECT barangay_id, cycle_id, COUNT(*) as count
      FROM ml_cache
      GROUP BY barangay_id, cycle_id
      HAVING COUNT(*) > 1
    `);
    
    if (verify.rows.length === 0) {
      console.log('✅ Verified: No duplicates remaining');
    } else {
      console.log(`⚠️  Warning: ${verify.rows.length} duplicates still exist`);
    }
    
    // Show final count
    const finalCount = await client.query('SELECT COUNT(*) as count FROM ml_cache');
    console.log(`\n📊 Total ML Cache Records: ${finalCount.rows[0].count}`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

cleanDuplicates();
