#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function fixFinalIssues() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔧 Fixing final ML schema issues...\n');
    
    // 1. Add need_action_score column as alias to need_for_action_score
    console.log('📋 Adding need_action_score column...');
    await client.query(`
      ALTER TABLE action_grid_classification 
      ADD COLUMN IF NOT EXISTS need_action_score NUMERIC;
    `);
    
    await client.query(`
      UPDATE action_grid_classification 
      SET need_action_score = need_for_action_score 
      WHERE need_action_score IS NULL;
    `);
    console.log('✅ need_action_score column added and populated');
    
    // 2. Make title column nullable in ai_insight
    console.log('\n📋 Making title column nullable...');
    await client.query(`
      ALTER TABLE ai_insight 
      ALTER COLUMN title DROP NOT NULL;
    `);
    console.log('✅ title column made nullable');
    
    // 3. Test the fixes
    console.log('\n🧪 Testing fixes...');
    
    const testActionGrid = await client.query(`
      SELECT classification_id, need_action_score, need_for_action_score 
      FROM action_grid_classification 
      LIMIT 1;
    `);
    
    if (testActionGrid.rows.length > 0) {
      console.log('✅ need_action_score test: Working');
      console.log(`   Sample: need_action_score=${testActionGrid.rows[0].need_action_score}, need_for_action_score=${testActionGrid.rows[0].need_for_action_score}`);
    }
    
    // Test ai_insight insert without title
    const testInsert = await client.query(`
      INSERT INTO ai_insight (barangay_id, insight_type, content, confidence_score, insight_text, source)
      VALUES (17, 'TEST', 'Test content', 0.95, 'Test insight', 'TEST')
      RETURNING insight_id;
    `);
    
    if (testInsert.rows.length > 0) {
      console.log('✅ ai_insight nullable title test: Working');
      
      // Clean up test record
      await client.query(`
        DELETE FROM ai_insight WHERE insight_id = $1;
      `, [testInsert.rows[0].insight_id]);
      console.log('🧹 Test record cleaned up');
    }
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Final ML schema fixes completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

fixFinalIssues();