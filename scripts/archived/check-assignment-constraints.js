const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConstraints() {
  console.log('🔍 Checking Assignment Table Constraints\n');
  console.log('=' .repeat(60));
  
  try {
    const client = await pool.connect();
    
    // Check for unique constraints
    const uniqueConstraints = await client.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'assignment'::regclass
        AND contype = 'u'
    `);
    
    console.log('\n📋 Unique Constraints:\n');
    if (uniqueConstraints.rows.length === 0) {
      console.log('✅ No unique constraints found');
      console.log('   Multiple interviewers CAN be assigned to same barangay');
    } else {
      uniqueConstraints.rows.forEach(row => {
        console.log(`❌ ${row.constraint_name}:`);
        console.log(`   ${row.definition}`);
      });
      console.log('\n⚠️  Unique constraints prevent multiple assignments');
    }
    
    // Check current assignments
    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 Current Assignment Distribution:\n');
    
    const distribution = await client.query(`
      SELECT 
        barangay_id,
        COUNT(*) as assignment_count
      FROM assignment
      WHERE survey_cycle_id = (SELECT cycle_id FROM survey_cycle WHERE is_active = true)
      GROUP BY barangay_id
      HAVING COUNT(*) > 1
      ORDER BY assignment_count DESC
    `);
    
    if (distribution.rows.length === 0) {
      console.log('✅ No barangays have multiple assignments');
      console.log('   Each barangay has 0 or 1 assignment');
    } else {
      console.log(`⚠️  Found ${distribution.rows.length} barangays with multiple assignments:\n`);
      distribution.rows.forEach(row => {
        console.log(`   Barangay ${row.barangay_id}: ${row.assignment_count} assignments`);
      });
    }
    
    // Test if we can insert duplicate
    console.log('\n' + '=' .repeat(60));
    console.log('\n🧪 Testing Multiple Assignment Capability:\n');
    
    const testBarangay = await client.query(`
      SELECT barangay_id 
      FROM barangay 
      LIMIT 1
    `);
    
    if (testBarangay.rows.length > 0) {
      const barangayId = testBarangay.rows[0].barangay_id;
      const activeCycle = await client.query(`
        SELECT cycle_id FROM survey_cycle WHERE is_active = true
      `);
      
      if (activeCycle.rows.length > 0) {
        const cycleId = activeCycle.rows[0].cycle_id;
        
        console.log(`Testing with Barangay ${barangayId}, Cycle ${cycleId}...\n`);
        
        // Check existing assignments
        const existing = await client.query(`
          SELECT COUNT(*) as count
          FROM assignment
          WHERE barangay_id = $1 AND survey_cycle_id = $2
        `, [barangayId, cycleId]);
        
        console.log(`Existing assignments: ${existing.rows[0].count}`);
        
        if (existing.rows[0].count > 0) {
          console.log('✅ System allows multiple assignments (at least 1 exists)');
        } else {
          console.log('ℹ️  No assignments exist for this test barangay');
        }
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n📝 Conclusion:\n');
    
    if (uniqueConstraints.rows.length === 0 && distribution.rows.length === 0) {
      console.log('✅ System CAN support multiple interviewers per barangay');
      console.log('   No database constraints preventing it');
      console.log('   Just need UI updates to display multiple assignments');
    } else if (uniqueConstraints.rows.length > 0) {
      console.log('❌ System CANNOT support multiple interviewers per barangay');
      console.log('   Database has unique constraints preventing it');
      console.log('   Need to remove constraints first');
    } else {
      console.log('⚠️  System already HAS multiple assignments');
      console.log('   But UI may not display them correctly');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkConstraints();
