const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testSurveyCycleWithCorrectEnums() {
  console.log('🔄 Testing Survey Cycle with Correct Enum Values\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Test creating a survey cycle with correct enum values
    console.log('1. 🆕 Creating survey cycle with "ongoing" status...');
    const createResult = await client.query(`
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, ['2024', 'ongoing', '2024-01-01', '2024-12-31', 0]);
    
    const cycleId = createResult.rows[0].cycle_id;
    console.log(`   ✅ Created cycle with ID: ${cycleId}, status: ${createResult.rows[0].status}`);

    // 2. Test updating to different statuses
    console.log('\n2. 🔄 Testing status transitions...');
    
    // ongoing -> completed
    await client.query('UPDATE survey_cycle SET status = $1 WHERE cycle_id = $2', ['completed', cycleId]);
    console.log('   ✅ Updated to "completed" status');
    
    // completed -> archived
    await client.query('UPDATE survey_cycle SET status = $1 WHERE cycle_id = $2', ['archived', cycleId]);
    console.log('   ✅ Updated to "archived" status');
    
    // archived -> draft
    await client.query('UPDATE survey_cycle SET status = $1 WHERE cycle_id = $2', ['draft', cycleId]);
    console.log('   ✅ Updated to "draft" status');

    // 3. Test API simulation with correct enum values
    console.log('\n3. 🔌 Testing API operations with correct enums...');
    
    // Simulate POST with ongoing status
    const postResult = await client.query(`
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, ['2025', 'ongoing', '2025-01-01', '2025-12-31', 0]);
    
    const newCycleId = postResult.rows[0].cycle_id;
    console.log(`   POST: ✅ Created cycle with "ongoing" status (ID: ${newCycleId})`);

    // Simulate archiving previous cycles (like the frontend does)
    const activeCycles = await client.query('SELECT * FROM survey_cycle WHERE status = $1', ['ongoing']);
    console.log(`   Found ${activeCycles.rows.length} active cycles to potentially archive`);

    // Simulate PUT to archive a cycle
    await client.query(`
      UPDATE survey_cycle 
      SET status = $1, updated_at = NOW() 
      WHERE cycle_id = $2
    `, ['archived', cycleId]);
    console.log('   PUT: ✅ Archived previous cycle');

    // 4. Test filtering and display logic
    console.log('\n4. 📊 Testing filtering and display logic...');
    
    const allCycles = await client.query('SELECT * FROM survey_cycle ORDER BY created_at DESC');
    console.log(`   Total cycles: ${allCycles.rows.length}`);
    
    const statusCounts = {};
    allCycles.rows.forEach(cycle => {
      statusCounts[cycle.status] = (statusCounts[cycle.status] || 0) + 1;
    });
    
    console.log('   Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const displayName = status === 'ongoing' ? 'Active' : 
                         status === 'completed' ? 'Completed' : 
                         status === 'archived' ? 'Archived' : 
                         status === 'draft' ? 'Draft' : status;
      console.log(`     ${displayName} (${status}): ${count}`);
    });

    // 5. Clean up test data
    console.log('\n5. 🧹 Cleaning up test data...');
    await client.query('DELETE FROM survey_cycle WHERE cycle_id IN ($1, $2)', [cycleId, newCycleId]);
    console.log('   ✅ Test data cleaned up');

    console.log('\n🎉 All enum tests passed! Survey cycle system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('invalid input value for enum')) {
      console.error('   This indicates an enum value mismatch');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

testSurveyCycleWithCorrectEnums();