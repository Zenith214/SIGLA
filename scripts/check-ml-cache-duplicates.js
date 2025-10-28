const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDuplicates() {
  console.log('🔍 Checking ML Cache for Duplicates\n');
  console.log('=' .repeat(60));
  
  try {
    const client = await pool.connect();
    
    // Check cycle 18 records
    const result = await client.query(`
      SELECT 
        barangay_id,
        cycle_id,
        data->>'barangay_id' as data_barangay_id,
        data->'action_grid'->'financial'->>'satisfaction_score' as financial_satisfaction
      FROM ml_cache 
      WHERE cycle_id = 18 
      ORDER BY barangay_id
    `);
    
    console.log(`\n📊 ML Cache Records for Cycle 18: ${result.rows.length}\n`);
    
    const barangayCount = {};
    
    result.rows.forEach((row, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  Barangay ID: ${row.barangay_id}`);
      console.log(`  Data Barangay ID: ${row.data_barangay_id}`);
      console.log(`  Financial Satisfaction: ${row.financial_satisfaction}%`);
      console.log('');
      
      // Count occurrences
      barangayCount[row.barangay_id] = (barangayCount[row.barangay_id] || 0) + 1;
    });
    
    // Check for duplicates
    console.log('=' .repeat(60));
    console.log('\n🔍 Duplicate Check:\n');
    
    let hasDuplicates = false;
    Object.entries(barangayCount).forEach(([barangayId, count]) => {
      if (count > 1) {
        console.log(`❌ Barangay ${barangayId}: ${count} records (DUPLICATE!)`);
        hasDuplicates = true;
      } else {
        console.log(`✅ Barangay ${barangayId}: ${count} record`);
      }
    });
    
    if (hasDuplicates) {
      console.log('\n⚠️  DUPLICATES FOUND!');
      console.log('\n💡 Solution: Remove duplicate records from ml_cache table');
      console.log('   Keep only the most recent or most accurate record per barangay per cycle');
      console.log('\n   SQL to find duplicates:');
      console.log('   SELECT barangay_id, cycle_id, COUNT(*) as count');
      console.log('   FROM ml_cache');
      console.log('   WHERE cycle_id = 18');
      console.log('   GROUP BY barangay_id, cycle_id');
      console.log('   HAVING COUNT(*) > 1;');
    } else {
      console.log('\n✅ No duplicates found!');
    }
    
    // Check all cycles for duplicates
    console.log('\n' + '=' .repeat(60));
    console.log('\n🔍 Checking All Cycles for Duplicates:\n');
    
    const allDuplicates = await client.query(`
      SELECT barangay_id, cycle_id, COUNT(*) as count
      FROM ml_cache
      GROUP BY barangay_id, cycle_id
      HAVING COUNT(*) > 1
      ORDER BY cycle_id, barangay_id
    `);
    
    if (allDuplicates.rows.length > 0) {
      console.log(`❌ Found ${allDuplicates.rows.length} duplicate combinations:\n`);
      allDuplicates.rows.forEach(row => {
        console.log(`   Barangay ${row.barangay_id}, Cycle ${row.cycle_id}: ${row.count} records`);
      });
      
      console.log('\n💡 To clean up duplicates, run:');
      console.log('   node scripts/clean-ml-cache-duplicates.js');
    } else {
      console.log('✅ No duplicates found in any cycle!');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkDuplicates();
