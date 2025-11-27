/**
 * Test Script for Survey Target Completion Analysis
 * 
 * This script tests the survey target completion analysis process by:
 * 1. Updating a test barangay's survey target to 100% completion
 * 2. Triggering the analysis process
 * 3. Verifying that the analysis was performed correctly
 */

const { Pool } = require('pg');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_POSTGRES_URL,
});

async function testSurveyTargetAnalysis() {
  let client;
  
  try {
    console.log('🧪 Starting survey target analysis test...');
    
    // Connect to the database
    client = await pool.connect();
    
    // 1. Select a test barangay (using the first one found)
    console.log('1️⃣ Selecting a test barangay...');
    const barangayResult = await client.query('SELECT * FROM barangay LIMIT 1');
    
    if (barangayResult.rows.length === 0) {
      throw new Error('No barangays found in the database');
    }
    
    const testBarangay = barangayResult.rows[0];
    console.log(`   Selected barangay: ${testBarangay.barangay_name} (ID: ${testBarangay.barangay_id})`);
    
    // 2. Get or create a survey target for this barangay
    console.log('2️⃣ Getting/creating survey target...');
    let targetResult = await client.query(
      'SELECT * FROM survey_target WHERE barangay_id = $1',
      [testBarangay.barangay_id]
    );
    
    let surveyTarget;
    
    if (targetResult.rows.length === 0) {
      // Create a new survey target
      const insertResult = await client.query(
        'INSERT INTO survey_target (barangay_id, target, achieved, percentage, analyzed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [testBarangay.barangay_id, 10, 0, 0, false]
      );
      surveyTarget = insertResult.rows[0];
      console.log(`   Created new survey target with ID: ${surveyTarget.target_id}`);
    } else {
      surveyTarget = targetResult.rows[0];
      console.log(`   Found existing survey target with ID: ${surveyTarget.target_id}`);
    }
    
    // 3. Update the survey target to 100% completion and mark as not analyzed
    console.log('3️⃣ Updating survey target to 100% completion...');
    await client.query(
      'UPDATE survey_target SET achieved = target, percentage = 100, analyzed = false, analysis_date = NULL WHERE target_id = $1',
      [surveyTarget.target_id]
    );
    console.log('   Survey target updated to 100% completion and marked as not analyzed');
    
    // 4. Trigger the analysis process
    console.log('4️⃣ Triggering the analysis process...');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ml/analyze-target-completion`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`   Analysis process triggered: ${JSON.stringify(result, null, 2)}`);
    
    // 5. Verify that the analysis was performed
    console.log('5️⃣ Verifying analysis results...');
    const verificationResult = await client.query(
      'SELECT * FROM survey_target WHERE target_id = $1',
      [surveyTarget.target_id]
    );
    
    if (verificationResult.rows.length === 0) {
      throw new Error('Survey target not found after analysis');
    }
    
    const updatedTarget = verificationResult.rows[0];
    
    if (updatedTarget.analyzed) {
      console.log('✅ Analysis was performed successfully!');
      console.log(`   Analysis date: ${updatedTarget.analysis_date}`);
      
      // Check for ML predictions
      const predictionsResult = await client.query(
        'SELECT * FROM ml_prediction WHERE barangay_id = $1 ORDER BY created_at DESC LIMIT 1',
        [testBarangay.barangay_id]
      );
      
      if (predictionsResult.rows.length > 0) {
        console.log('✅ ML predictions were generated!');
        console.log(`   Prediction ID: ${predictionsResult.rows[0].prediction_id}`);
      } else {
        console.log('⚠️ No ML predictions were found');
      }
      
      // Check for insights
      const insightsResult = await client.query(
        'SELECT * FROM ai_insight WHERE barangay_id = $1 ORDER BY created_at DESC LIMIT 1',
        [testBarangay.barangay_id]
      );
      
      if (insightsResult.rows.length > 0) {
        console.log('✅ AI insights were generated!');
        console.log(`   Insight ID: ${insightsResult.rows[0].insight_id}`);
        console.log(`   Title: ${insightsResult.rows[0].title}`);
      } else {
        console.log('⚠️ No AI insights were found');
      }
      
    } else {
      console.log('❌ Analysis was NOT performed');
      throw new Error('Survey target was not marked as analyzed');
    }
    
    console.log('🎉 Test completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSurveyTargetAnalysis()
    .then(result => {
      if (result.success) {
        console.log('✅ Survey target analysis test passed!');
        process.exit(0);
      } else {
        console.error('❌ Survey target analysis test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testSurveyTargetAnalysis };