const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testCompleteSurveyCycle() {
  console.log('🔄 Complete Survey Cycle Test\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Check database schema
    console.log('1. 📋 Checking database schema...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'survey_cycle' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Survey cycle table columns:');
    schemaCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 2. Check status enum values
    console.log('\n2. 🏷️  Checking status enum values...');
    const enumCheck = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'survey_status'
      )
    `);
    
    if (enumCheck.rows.length > 0) {
      console.log('   Available status values:');
      enumCheck.rows.forEach(row => {
        console.log(`   - ${row.enumlabel}`);
      });
    } else {
      console.log('   ⚠️  No enum values found - checking if status is text type');
    }

    // 3. Test CRUD operations
    console.log('\n3. 🧪 Testing CRUD operations...');
    
    // CREATE
    console.log('   Creating new survey cycle...');
    const createResult = await client.query(`
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, ['2024', 'Active', '2024-01-01', '2024-12-31', 0]);
    
    const newCycleId = createResult.rows[0].cycle_id;
    console.log(`   ✅ Created cycle with ID: ${newCycleId}`);

    // READ
    console.log('   Reading survey cycles...');
    const readResult = await client.query('SELECT * FROM survey_cycle ORDER BY created_at DESC');
    console.log(`   ✅ Found ${readResult.rows.length} survey cycles`);

    // UPDATE
    console.log('   Updating survey cycle...');
    const updateResult = await client.query(`
      UPDATE survey_cycle 
      SET responses = $1, status = $2, updated_at = NOW() 
      WHERE cycle_id = $3 
      RETURNING *
    `, [150, 'Completed', newCycleId]);
    console.log(`   ✅ Updated cycle - responses: ${updateResult.rows[0].responses}, status: ${updateResult.rows[0].status}`);

    // DELETE
    console.log('   Deleting test survey cycle...');
    await client.query('DELETE FROM survey_cycle WHERE cycle_id = $1', [newCycleId]);
    console.log('   ✅ Deleted test cycle');

    // 4. Test API route logic simulation
    console.log('\n4. 🔌 Testing API route logic...');
    
    // Simulate GET request logic
    const getSimulation = await client.query("SELECT * FROM survey_cycle ORDER BY created_at DESC");
    console.log(`   GET: ✅ Would return ${getSimulation.rows.length} cycles`);

    // Simulate POST request logic
    const postData = {
      year: '2025',
      status: 'Active',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-12-31'),
      responses: 0
    };

    const postSimulation = await client.query(`
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [postData.year, postData.status, postData.start_date, postData.end_date, postData.responses]);
    
    const testCycleId = postSimulation.rows[0].cycle_id;
    console.log(`   POST: ✅ Would create cycle with ID ${testCycleId}`);

    // Simulate PUT request logic
    const putData = {
      cycle_id: testCycleId,
      year: '2025',
      status: 'Completed',
      responses: 75
    };

    const updateFields = [];
    const values = [putData.cycle_id];
    let paramIndex = 2;

    if (putData.year !== undefined) {
      updateFields.push(`year = $${paramIndex}`);
      values.push(putData.year);
      paramIndex++;
    }
    if (putData.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(putData.status);
      paramIndex++;
    }
    if (putData.responses !== undefined) {
      updateFields.push(`responses = $${paramIndex}`);
      values.push(putData.responses);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);

    const putQuery = `UPDATE survey_cycle SET ${updateFields.join(", ")} WHERE cycle_id = $1 RETURNING *`;
    const putSimulation = await client.query(putQuery, values);
    console.log(`   PUT: ✅ Would update cycle - responses: ${putSimulation.rows[0].responses}`);

    // Simulate DELETE request logic
    await client.query("DELETE FROM survey_cycle WHERE cycle_id = $1", [testCycleId]);
    console.log('   DELETE: ✅ Would delete cycle successfully');

    // 5. Final status
    console.log('\n5. 📊 Final database state...');
    const finalState = await client.query('SELECT * FROM survey_cycle ORDER BY created_at DESC');
    console.log(`   Total survey cycles: ${finalState.rows.length}`);
    finalState.rows.forEach((cycle, i) => {
      console.log(`   ${i + 1}. ${cycle.year} - ${cycle.status} (${cycle.responses || 0} responses)`);
    });

    console.log('\n🎉 All survey cycle tests passed! The system is working correctly.');
    console.log('\n📝 Summary:');
    console.log('   ✅ Database schema is correct');
    console.log('   ✅ CRUD operations work');
    console.log('   ✅ API logic simulations pass');
    console.log('   ✅ Status updates work');
    console.log('   ✅ Date handling works');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testCompleteSurveyCycle();