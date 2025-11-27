#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function fixVeryLastIssues() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔧 Fixing very last ML schema issues...\n');
    
    // 1. Make section_name nullable in action_grid_classification
    console.log('📋 Making section_name nullable...');
    await client.query(`
      ALTER TABLE action_grid_classification 
      ALTER COLUMN section_name DROP NOT NULL;
    `);
    console.log('✅ section_name made nullable');
    
    // 2. Add updated_at column to ai_recommendation
    console.log('\n📋 Adding updated_at to ai_recommendation...');
    await client.query(`
      ALTER TABLE ai_recommendation 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ updated_at column added to ai_recommendation');
    
    // 3. Test final fixes
    console.log('\n🧪 Testing final fixes...');
    
    // Test action_grid_classification insert without section_name
    const testActionGrid = await client.query(`
      INSERT INTO action_grid_classification (barangay_id, service_name, satisfaction_score, quadrant, confidence, need_action_score)
      VALUES (17, 'test_service', 50.0, 'TEST', 0.95, 5.0)
      RETURNING classification_id;
    `);
    
    if (testActionGrid.rows.length > 0) {
      console.log('✅ action_grid_classification nullable section_name: Working');
      
      // Clean up test record
      await client.query(`
        DELETE FROM action_grid_classification WHERE classification_id = $1;
      `, [testActionGrid.rows[0].classification_id]);
      console.log('🧹 Test record cleaned up');
    }
    
    // Test ai_recommendation updated_at
    const testRecommendation = await client.query(`
      SELECT recommendation_id, updated_at 
      FROM ai_recommendation 
      LIMIT 1;
    `);
    
    console.log('✅ ai_recommendation updated_at: Available');
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 All ML schema issues completely fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

fixVeryLastIssues();