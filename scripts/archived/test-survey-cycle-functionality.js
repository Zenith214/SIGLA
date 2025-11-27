const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testSurveyCycleFunctionality() {
  console.log('Testing Survey Cycle Functionality...\n');
  
  const client = await pool.connect();
  try {
    // 1. Check current survey cycles
    console.log('1. Current survey cycles:');
    const currentCycles = await client.query('SELECT * FROM survey_cycle ORDER BY created_at DESC');
    console.log(`Found ${currentCycles.rows.length} survey cycles:`);
    currentCycles.rows.forEach((cycle, i) => {
      console.log(`  ${i + 1}. ${cycle.year} - ${cycle.status} (ID: ${cycle.cycle_id})`);
      console.log(`     Start: ${cycle.start_date}, End: ${cycle.end_date}`);
      console.log(`     Responses: ${cycle.responses || 0}`);
    });

    // 2. Test creating a new survey cycle
    console.log('\n2. Testing survey cycle creation...');
    const newCycle = {
      year: '2024',
      status: 'Active',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      responses: 0
    };

    const insertResult = await client.query(`
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [newCycle.year, newCycle.status, newCycle.start_date, newCycle.end_date, newCycle.responses]);

    if (insertResult.rows.length > 0) {
      console.log('✅ Successfully created survey cycle:', insertResult.rows[0].cycle_id);
    } else {
      console.log('❌ Failed to create survey cycle');
    }

    // 3. Test updating a survey cycle
    console.log('\n3. Testing survey cycle update...');
    const cycleToUpdate = insertResult.rows[0];
    const updateResult = await client.query(`
      UPDATE survey_cycle 
      SET responses = $1, updated_at = NOW() 
      WHERE cycle_id = $2 
      RETURNING *
    `, [100, cycleToUpdate.cycle_id]);

    if (updateResult.rows.length > 0) {
      console.log('✅ Successfully updated survey cycle responses to:', updateResult.rows[0].responses);
    } else {
      console.log('❌ Failed to update survey cycle');
    }

    // 4. Test survey cycle status enum
    console.log('\n4. Testing survey cycle status enum...');
    try {
      await client.query(`
        UPDATE survey_cycle 
        SET status = 'Completed' 
        WHERE cycle_id = $1
      `, [cycleToUpdate.cycle_id]);
      console.log('✅ Successfully updated status to Completed');
    } catch (error) {
      console.log('❌ Error updating status:', error.message);
    }

    // 5. Check final state
    console.log('\n5. Final survey cycles state:');
    const finalCycles = await client.query('SELECT * FROM survey_cycle ORDER BY created_at DESC');
    finalCycles.rows.forEach((cycle, i) => {
      console.log(`  ${i + 1}. ${cycle.year} - ${cycle.status} (ID: ${cycle.cycle_id})`);
      console.log(`     Responses: ${cycle.responses || 0}`);
    });

    // 6. Clean up test data (optional)
    console.log('\n6. Cleaning up test data...');
    await client.query('DELETE FROM survey_cycle WHERE cycle_id = $1', [cycleToUpdate.cycle_id]);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testSurveyCycleFunctionality();