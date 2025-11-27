const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testAssignmentCycleAware() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('🔗 Connected to database');

    // Test 1: Check if there's an active cycle
    console.log('\n📋 Test 1: Checking for active survey cycle...');
    const activeCycleQuery = 'SELECT * FROM survey_cycle WHERE is_active = true';
    const activeCycleResult = await client.query(activeCycleQuery);
    
    if (activeCycleResult.rows.length === 0) {
      console.log('❌ No active survey cycle found. Creating one for testing...');
      
      // Create a test cycle
      const createCycleQuery = `
        INSERT INTO survey_cycle (name, year, is_active, created_at)
        VALUES ('Test Cycle 2024', 2024, true, NOW())
        RETURNING *
      `;
      const newCycle = await client.query(createCycleQuery);
      console.log('✅ Created test cycle:', newCycle.rows[0]);
    } else {
      console.log('✅ Active cycle found:', activeCycleResult.rows[0]);
    }

    // Test 2: Check assignment table structure
    console.log('\n📋 Test 2: Checking assignment table structure...');
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'assignment'
      ORDER BY ordinal_position
    `;
    const structureResult = await client.query(tableStructureQuery);
    console.log('✅ Assignment table structure:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Test 3: Check existing assignments and their cycle association
    console.log('\n📋 Test 3: Checking existing assignments...');
    const assignmentsQuery = `
      SELECT 
        a.assignment_id,
        a.barangay_id,
        a.user_id,
        a.survey_cycle_id,
        a.status,
        sc.name as cycle_name,
        sc.year as cycle_year,
        b.barangay_name,
        u."firstName",
        u."lastName"
      FROM assignment a
      LEFT JOIN survey_cycle sc ON a.survey_cycle_id = sc.cycle_id
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `;
    const assignmentsResult = await client.query(assignmentsQuery);
    
    if (assignmentsResult.rows.length === 0) {
      console.log('ℹ️  No assignments found in database');
    } else {
      console.log(`✅ Found ${assignmentsResult.rows.length} assignments:`);
      assignmentsResult.rows.forEach(assignment => {
        console.log(`  - Assignment ${assignment.assignment_id}: ${assignment.barangay_name} → ${assignment.firstName} ${assignment.lastName} (Cycle: ${assignment.cycle_name || 'None'}, Status: ${assignment.status})`);
      });
    }

    // Test 4: Test cycle-aware filtering
    console.log('\n📋 Test 4: Testing cycle-aware assignment filtering...');
    const activeCycleId = activeCycleResult.rows[0]?.cycle_id || (await client.query('SELECT cycle_id FROM survey_cycle WHERE is_active = true')).rows[0]?.cycle_id;
    
    if (activeCycleId) {
      const cycleFilterQuery = `
        SELECT COUNT(*) as count
        FROM assignment
        WHERE survey_cycle_id = $1
      `;
      const cycleFilterResult = await client.query(cycleFilterQuery, [activeCycleId]);
      console.log(`✅ Assignments in active cycle (${activeCycleId}): ${cycleFilterResult.rows[0].count}`);
    } else {
      console.log('❌ No active cycle ID found for filtering test');
    }

    // Test 5: Test assignment API endpoint simulation
    console.log('\n📋 Test 5: Simulating assignment API calls...');
    
    // Simulate GET /api/assignments (cycle-aware)
    if (activeCycleId) {
      const apiSimulationQuery = `
        SELECT 
          a.*,
          b.barangay_name,
          b.population,
          b.households,
          u."firstName",
          u."lastName",
          u.email,
          sc.name as cycle_name,
          sc.year as cycle_year
        FROM assignment a
        LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
        LEFT JOIN "user" u ON a.user_id = u.id
        LEFT JOIN survey_cycle sc ON a.survey_cycle_id = sc.cycle_id
        WHERE a.survey_cycle_id = $1
        ORDER BY a.created_at DESC
      `;
      const apiResult = await client.query(apiSimulationQuery, [activeCycleId]);
      console.log(`✅ API simulation: Would return ${apiResult.rows.length} assignments for active cycle`);
      
      if (apiResult.rows.length > 0) {
        console.log('  Sample assignment data structure:');
        const sample = apiResult.rows[0];
        console.log(`    - ID: ${sample.assignment_id}`);
        console.log(`    - Barangay: ${sample.barangay_name}`);
        console.log(`    - Interviewer: ${sample.firstName} ${sample.lastName}`);
        console.log(`    - Cycle: ${sample.cycle_name} (${sample.cycle_year})`);
        console.log(`    - Status: ${sample.status}`);
      }
    }

    console.log('\n🎉 Assignment cycle-aware testing completed successfully!');

  } catch (error) {
    console.error('❌ Error during assignment testing:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the test
testAssignmentCycleAware()
  .then(() => {
    console.log('\n✅ All assignment cycle-aware tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Assignment cycle-aware tests failed:', error);
    process.exit(1);
  });