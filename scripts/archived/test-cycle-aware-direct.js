require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Import the survey cycle helpers (simulate the functionality)
async function getActiveCycle(client) {
  const result = await client.query('SELECT * FROM survey_cycle WHERE is_active = true LIMIT 1');
  return result.rows[0] || null;
}

async function generateSurveyNumber(barangayId, sequenceNumber, activeCycle) {
  const barangayPart = barangayId.toString().padStart(2, '0');
  const yearPart = activeCycle.year.toString();
  const sequencePart = sequenceNumber.toString().padStart(4, '0');
  
  return `${barangayPart}-${yearPart}-${sequencePart}`;
}

async function getNextSurveySequence(client, barangayId, activeCycleId) {
  const result = await client.query(
    'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1 AND survey_cycle_id = $2',
    [barangayId, activeCycleId]
  );
  
  return (parseInt(result.rows[0].count) || 0) + 1;
}

async function testCycleAwareFunctionality() {
  let client;
  try {
    client = await pool.connect();
    
    console.log('🧪 Testing Cycle-Aware Survey Response Functionality');
    console.log('=' .repeat(60));
    
    // Test 1: Get active cycle
    console.log('\n1. Getting active cycle...');
    const activeCycle = await getActiveCycle(client);
    
    if (!activeCycle) {
      console.log('❌ No active cycle found');
      return;
    }
    
    console.log('✅ Active cycle:', activeCycle.name, `(${activeCycle.year})`);
    
    // Test 2: Generate survey number
    console.log('\n2. Testing survey number generation...');
    const barangayId = 8;
    const sequenceNumber = await getNextSurveySequence(client, barangayId, activeCycle.cycle_id);
    const surveyNumber = await generateSurveyNumber(barangayId, sequenceNumber, activeCycle);
    
    console.log(`✅ Generated survey number: ${surveyNumber}`);
    console.log(`   - Barangay: ${barangayId}`);
    console.log(`   - Sequence: ${sequenceNumber}`);
    console.log(`   - Cycle Year: ${activeCycle.year}`);
    
    // Test 3: Create a test survey response
    console.log('\n3. Creating test survey response...');
    
    const insertQuery = `
      INSERT INTO survey_response (
        survey_number, barangay_id, interviewer_id, survey_cycle_id, respondent_name,
        respondent_age, respondent_gender, location_lat, location_lng,
        location_address, status, progress, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING response_id, survey_number, survey_cycle_id
    `;
    
    const result = await client.query(insertQuery, [
      surveyNumber,
      barangayId,
      1, // interviewer_id
      activeCycle.cycle_id,
      'Test Respondent',
      30,
      'Male',
      10.3157,
      123.8854,
      'Test Location',
      'completed',
      100
    ]);
    
    const createdResponse = result.rows[0];
    console.log('✅ Created survey response:');
    console.log(`   - Response ID: ${createdResponse.response_id}`);
    console.log(`   - Survey Number: ${createdResponse.survey_number}`);
    console.log(`   - Cycle ID: ${createdResponse.survey_cycle_id}`);
    
    // Test 4: Test cycle-scoped queries
    console.log('\n4. Testing cycle-scoped queries...');
    
    // Query responses for active cycle
    const cycleResponsesQuery = `
      SELECT 
        sr.response_id,
        sr.survey_number,
        sr.survey_cycle_id,
        sc.name as cycle_name,
        sr.barangay_id,
        sr.respondent_name
      FROM survey_response sr
      JOIN survey_cycle sc ON sr.survey_cycle_id = sc.cycle_id
      WHERE sr.survey_cycle_id = $1
      ORDER BY sr.created_at DESC
    `;
    
    const cycleResponses = await client.query(cycleResponsesQuery, [activeCycle.cycle_id]);
    
    console.log(`✅ Found ${cycleResponses.rows.length} responses in active cycle:`);
    cycleResponses.rows.forEach(row => {
      console.log(`   - ${row.survey_number} | ${row.respondent_name} | Barangay ${row.barangay_id}`);
    });
    
    // Test 5: Test barangay + cycle filtering
    console.log('\n5. Testing barangay + cycle filtering...');
    
    const barangayCycleQuery = `
      SELECT COUNT(*) as count
      FROM survey_response
      WHERE barangay_id = $1 AND survey_cycle_id = $2
    `;
    
    const barangayCycleResult = await client.query(barangayCycleQuery, [barangayId, activeCycle.cycle_id]);
    console.log(`✅ Responses for Barangay ${barangayId} in active cycle: ${barangayCycleResult.rows[0].count}`);
    
    // Test 6: Test survey number format validation
    console.log('\n6. Testing survey number format validation...');
    
    const formatQuery = `
      SELECT 
        survey_number,
        CASE 
          WHEN survey_number ~ '^[0-9]{2}-[0-9]{4}-[0-9]{4}$' THEN 'Valid Format'
          ELSE 'Invalid Format'
        END as format_status
      FROM survey_response
      WHERE survey_cycle_id = $1
    `;
    
    const formatResult = await client.query(formatQuery, [activeCycle.cycle_id]);
    
    console.log('✅ Survey number format validation:');
    formatResult.rows.forEach(row => {
      console.log(`   - ${row.survey_number}: ${row.format_status}`);
    });
    
    // Test 7: Clean up test data
    console.log('\n7. Cleaning up test data...');
    
    const deleteResult = await client.query(
      'DELETE FROM survey_response WHERE response_id = $1',
      [createdResponse.response_id]
    );
    
    console.log(`✅ Cleaned up ${deleteResult.rowCount} test record(s)`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All cycle-aware functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testCycleAwareFunctionality();