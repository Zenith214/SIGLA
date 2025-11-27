#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function fixLastIssues() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔧 Fixing last ML schema issues...\n');
    
    // 1. Add updated_at column to action_grid_classification
    console.log('📋 Adding updated_at column to action_grid_classification...');
    await client.query(`
      ALTER TABLE action_grid_classification 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ updated_at column added');
    
    // 2. Make content column nullable in ai_insight
    console.log('\n📋 Making content column nullable in ai_insight...');
    await client.query(`
      ALTER TABLE ai_insight 
      ALTER COLUMN content DROP NOT NULL;
    `);
    console.log('✅ content column made nullable');
    
    // 3. Test final schema
    console.log('\n🧪 Testing final schema...');
    
    const testActionGrid = await client.query(`
      SELECT classification_id, updated_at 
      FROM action_grid_classification 
      LIMIT 1;
    `);
    
    if (testActionGrid.rows.length > 0) {
      console.log('✅ action_grid_classification updated_at: Working');
    }
    
    // Test ai_insight insert without content
    const testInsert = await client.query(`
      INSERT INTO ai_insight (barangay_id, insight_type, confidence_score, insight_text, source)
      VALUES (17, 'TEST', 0.95, 'Test insight', 'TEST')
      RETURNING insight_id;
    `);
    
    if (testInsert.rows.length > 0) {
      console.log('✅ ai_insight nullable content: Working');
      
      // Clean up test record
      await client.query(`
        DELETE FROM ai_insight WHERE insight_id = $1;
      `, [testInsert.rows[0].insight_id]);
      console.log('🧹 Test record cleaned up');
    }
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 All ML schema issues fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

fixLastIssues();