const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addConstraint() {
  console.log('🔒 Adding Unique Constraint to ML Cache\n');
  console.log('=' .repeat(60));
  
  try {
    const client = await pool.connect();
    
    // Check for existing duplicates first
    console.log('\n1️⃣  Checking for duplicates...\n');
    const duplicates = await client.query(`
      SELECT barangay_id, cycle_id, COUNT(*) as count
      FROM ml_cache
      GROUP BY barangay_id, cycle_id
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length > 0) {
      console.log(`❌ Found ${duplicates.rows.length} duplicates!`);
      console.log('   Cannot add constraint with duplicates present.');
      console.log('\n💡 Run this first:');
      console.log('   node scripts/clean-ml-cache-duplicates.js');
      client.release();
      await pool.end();
      return;
    }
    
    console.log('✅ No duplicates found\n');
    
    // Check if constraint already exists
    console.log('2️⃣  Checking if constraint already exists...\n');
    const existing = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'ml_cache'::regclass
        AND conname = 'ml_cache_barangay_cycle_unique'
    `);
    
    if (existing.rows.length > 0) {
      console.log('✅ Constraint already exists!');
      console.log('   No action needed.');
      client.release();
      await pool.end();
      return;
    }
    
    console.log('⏳ Constraint does not exist, adding it...\n');
    
    // Add the constraint
    console.log('3️⃣  Adding unique constraint...\n');
    await client.query(`
      ALTER TABLE ml_cache 
      ADD CONSTRAINT ml_cache_barangay_cycle_unique 
      UNIQUE (barangay_id, cycle_id)
    `);
    
    console.log('✅ Constraint added successfully!\n');
    
    // Verify it was added
    console.log('4️⃣  Verifying constraint...\n');
    const verify = await client.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'ml_cache'::regclass
        AND conname = 'ml_cache_barangay_cycle_unique'
    `);
    
    if (verify.rows.length > 0) {
      console.log('✅ Verified! Constraint details:');
      console.log(`   Name: ${verify.rows[0].constraint_name}`);
      console.log(`   Definition: ${verify.rows[0].definition}`);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n🎉 Success! ML Cache now has unique constraint');
    console.log('\n💡 This prevents duplicate records for the same barangay/cycle');
    console.log('   Future INSERT attempts will fail with a unique violation error');
    console.log('   Use INSERT ... ON CONFLICT in ML scripts to handle this');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Constraint already exists (this is fine)');
    } else {
      console.log('\n💡 If you see a duplicate key error:');
      console.log('   1. Run: node scripts/check-ml-cache-duplicates.js');
      console.log('   2. Run: node scripts/clean-ml-cache-duplicates.js');
      console.log('   3. Try again: node scripts/add-ml-cache-constraint.js');
    }
    
    await pool.end();
  }
}

addConstraint();
