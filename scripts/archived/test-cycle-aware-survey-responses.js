require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testCycleAwareSurveyResponses() {
  let client;
  try {
    client = await pool.connect();
    
    console.log('🧪 Testing Cycle-Aware Survey Response Implementation');
    console.log('=' .repeat(60));
    
    // Test 1: Check if active cycle exists
    console.log('\n1. Checking for active survey cycle...');
    const activeCycleQuery = 'SELECT * FROM survey_cycle WHERE is_active = true';
    const activeCycleResult = await client.query(activeCycleQuery);
    
    if (activeCycleResult.rows.length === 0) {
      console.log('❌ No active survey cycle found');
      console.log('💡 Creating a test cycle...');
      
      // Create a test cycle
      const createCycleQuery = `
        INSERT INTO survey_cycle (name, year, is_active, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `;
      const testCycle = await client.query(createCycleQuery, [
        'Test Cycle 2025',
        2025,
        true
      ]);
      
      console.log('✅ Created test cycle:', testCycle.rows[0]);
    } else {
      console.log('✅ Active cycle found:', activeCycleResult.rows[0]);
    }
    
    // Test 2: Check survey_response table structure
    console.log('\n2. Checking survey_response table structure...');
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'survey_response'
      AND column_name IN ('survey_cycle_id', 'survey_number')
      ORDER BY column_name
    `;
    const structureResult = await client.query(tableStructureQuery);
    console.log('📋 Table structure:', structureResult.rows);
    
    // Test 3: Check existing survey responses with cycle linkage
    console.log('\n3. Checking existing survey responses...');
    const responsesQuery = `
      SELECT 
        sr.response_id,
        sr.survey_number,
        sr.survey_cycle_id,
        sc.name as cycle_name,
        sc.year as cycle_year,
        sr.barangay_id,
        sr.created_at
      FROM survey_response sr
      LEFT JOIN survey_cycle sc ON sr.survey_cycle_id = sc.cycle_id
      ORDER BY sr.created_at DESC
      LIMIT 5
    `;
    const responsesResult = await client.query(responsesQuery);
    
    if (responsesResult.rows.length > 0) {
      console.log('📊 Recent survey responses:');
      responsesResult.rows.forEach(row => {
        console.log(`  - ${row.survey_number} | Cycle: ${row.cycle_name || 'NULL'} (${row.cycle_year || 'N/A'}) | Barangay: ${row.barangay_id}`);
      });
    } else {
      console.log('📊 No survey responses found');
    }
    
    // Test 4: Check survey number format
    console.log('\n4. Analyzing survey number formats...');
    const numberFormatQuery = `
      SELECT 
        survey_number,
        CASE 
          WHEN survey_number ~ '^[0-9]{2}-[0-9]{4}-[0-9]{4}$' THEN 'New Format (BB-YYYY-NNNN)'
          ELSE 'Other Format'
        END as format_type,
        survey_cycle_id,
        created_at
      FROM survey_response
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const formatResult = await client.query(numberFormatQuery);
    
    if (formatResult.rows.length > 0) {
      console.log('🔢 Survey number format analysis:');
      formatResult.rows.forEach(row => {
        console.log(`  - ${row.survey_number} | ${row.format_type} | Cycle ID: ${row.survey_cycle_id || 'NULL'}`);
      });
    }
    
    // Test 5: Check survey targets with cycle linkage
    console.log('\n5. Checking survey targets...');
    const targetsQuery = `
      SELECT 
        st.target_id,
        st.barangay_id,
        st.survey_cycle_id,
        sc.name as cycle_name,
        st.target,
        st.achieved,
        st.percentage
      FROM survey_target st
      LEFT JOIN survey_cycle sc ON st.survey_cycle_id = sc.cycle_id
      ORDER BY st.barangay_id
      LIMIT 5
    `;
    const targetsResult = await client.query(targetsQuery);
    
    if (targetsResult.rows.length > 0) {
      console.log('🎯 Survey targets:');
      targetsResult.rows.forEach(row => {
        console.log(`  - Barangay ${row.barangay_id} | Cycle: ${row.cycle_name || 'NULL'} | ${row.achieved}/${row.target} (${row.percentage}%)`);
      });
    } else {
      console.log('🎯 No survey targets found');
    }
    
    // Test 6: Test API endpoint simulation
    console.log('\n6. Testing cycle-aware query simulation...');
    const activeCycle = activeCycleResult.rows[0] || (await client.query('SELECT * FROM survey_cycle WHERE is_active = true')).rows[0];
    
    if (activeCycle) {
      const cycleFilterQuery = `
        SELECT COUNT(*) as count
        FROM survey_response
        WHERE survey_cycle_id = $1
      `;
      const cycleFilterResult = await client.query(cycleFilterQuery, [activeCycle.cycle_id]);
      console.log(`📈 Responses in active cycle "${activeCycle.name}": ${cycleFilterResult.rows[0].count}`);
      
      // Test barangay-specific filtering
      const barangayFilterQuery = `
        SELECT barangay_id, COUNT(*) as count
        FROM survey_response
        WHERE survey_cycle_id = $1
        GROUP BY barangay_id
        ORDER BY count DESC
        LIMIT 3
      `;
      const barangayFilterResult = await client.query(barangayFilterQuery, [activeCycle.cycle_id]);
      
      if (barangayFilterResult.rows.length > 0) {
        console.log('📊 Top barangays by response count in active cycle:');
        barangayFilterResult.rows.forEach(row => {
          console.log(`  - Barangay ${row.barangay_id}: ${row.count} responses`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Cycle-aware survey response implementation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the test
testCycleAwareSurveyResponses();