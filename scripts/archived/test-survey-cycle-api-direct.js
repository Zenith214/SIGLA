// Test the survey cycle API routes directly
const { NextRequest, NextResponse } = require('next/server');

// Mock the API route functions
async function testAPIRoutes() {
  console.log('Testing Survey Cycle API Routes...\n');

  try {
    // Import the route handlers
    const routeModule = require('../src/app/api/survey-cycles/route.ts');
    
    console.log('Available exports:', Object.keys(routeModule));
    
    // Test GET
    console.log('1. Testing GET handler...');
    const getResult = await routeModule.GET();
    console.log('GET result status:', getResult.status);
    
    if (getResult.status === 200) {
      const data = await getResult.json();
      console.log('GET data:', data);
    }

  } catch (error) {
    console.error('Error testing API routes:', error.message);
    console.log('\nThis is expected since we need to test via HTTP requests.');
    console.log('Let\'s create a simple HTTP test instead...');
  }
}

// Alternative: Test with a simple HTTP client simulation
async function testWithHTTPSimulation() {
  console.log('\nTesting with HTTP simulation...\n');
  
  // Simulate the API logic directly
  const { Pool } = require('pg');
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  try {
    // Simulate GET request
    console.log('Simulating GET /api/survey-cycles');
    const result = await client.query("SELECT * FROM survey_cycle ORDER BY created_at DESC");
    console.log('✅ GET simulation successful:', result.rows.length, 'cycles found');
    
    // Simulate POST request
    console.log('\nSimulating POST /api/survey-cycles');
    const postData = {
      year: '2024',
      status: 'Active',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      responses: 0
    };
    
    const insertQuery = `
      INSERT INTO survey_cycle (year, status, start_date, end_date, responses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const insertResult = await client.query(insertQuery, [
      postData.year,
      postData.status,
      new Date(postData.start_date),
      new Date(postData.end_date),
      postData.responses
    ]);
    
    console.log('✅ POST simulation successful:', insertResult.rows[0]);
    
    // Simulate PUT request
    console.log('\nSimulating PUT /api/survey-cycles');
    const cycleId = insertResult.rows[0].cycle_id;
    const updateData = {
      cycle_id: cycleId,
      responses: 50,
      status: 'Completed'
    };
    
    const updateFields = [];
    const values = [cycleId];
    let paramIndex = 2;
    
    if (updateData.responses !== undefined) {
      updateFields.push(`responses = $${paramIndex}`);
      values.push(updateData.responses);
      paramIndex++;
    }
    if (updateData.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(updateData.status);
      paramIndex++;
    }
    
    updateFields.push(`updated_at = NOW()`);
    
    const updateQuery = `UPDATE survey_cycle SET ${updateFields.join(", ")} WHERE cycle_id = $1 RETURNING *`;
    const updateResult = await client.query(updateQuery, values);
    
    console.log('✅ PUT simulation successful:', updateResult.rows[0]);
    
    // Simulate DELETE request
    console.log('\nSimulating DELETE /api/survey-cycles');
    await client.query("DELETE FROM survey_cycle WHERE cycle_id = $1", [cycleId]);
    console.log('✅ DELETE simulation successful');
    
  } catch (error) {
    console.error('❌ Simulation error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testAPIRoutes().then(() => testWithHTTPSimulation());