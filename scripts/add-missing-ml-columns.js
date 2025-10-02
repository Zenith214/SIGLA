#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function addMissingColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔧 Adding missing ML columns...\n');
    
    // 1. Add missing columns to action_grid_classification
    console.log('📋 Adding columns to action_grid_classification...');
    
    await client.query(`
      ALTER TABLE action_grid_classification 
      ADD COLUMN IF NOT EXISTS confidence NUMERIC DEFAULT 0.85;
    `);
    console.log('✅ Added confidence column');
    
    // 2. Add missing columns to ai_insight
    console.log('\n📋 Adding columns to ai_insight...');
    
    await client.query(`
      ALTER TABLE ai_insight 
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'ML_ANALYSIS';
    `);
    console.log('✅ Added source column');
    
    // 3. Add missing columns to ai_recommendation
    console.log('\n📋 Adding columns to ai_recommendation...');
    
    await client.query(`
      ALTER TABLE ai_recommendation 
      ADD COLUMN IF NOT EXISTS recommendation_text TEXT,
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'MEDIUM',
      ADD COLUMN IF NOT EXISTS recommendation_type_alt VARCHAR(50),
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'ML_ANALYSIS',
      ADD COLUMN IF NOT EXISTS related_insight TEXT;
    `);
    console.log('✅ Added recommendation columns');
    
    // 4. Update existing data to populate new columns
    console.log('\n🔄 Updating existing data...');
    
    // Update ai_insight source column
    await client.query(`
      UPDATE ai_insight 
      SET source = 'SERVICE_SCORES' 
      WHERE source IS NULL OR source = 'ML_ANALYSIS';
    `);
    
    // Update ai_recommendation columns
    await client.query(`
      UPDATE ai_recommendation 
      SET recommendation_text = description,
          priority = CASE 
            WHEN priority_level = 'HIGH' THEN 'HIGH'
            WHEN priority_level = 'LOW' THEN 'LOW'
            ELSE 'MEDIUM'
          END,
          recommendation_type_alt = recommendation_type,
          source = 'SERVICE_SCORES'
      WHERE recommendation_text IS NULL;
    `);
    
    console.log('✅ Updated existing data');
    
    // 5. Test the new schema
    console.log('\n🧪 Testing new schema...');
    
    const testActionGrid = await client.query(`
      SELECT classification_id, service_name, confidence 
      FROM action_grid_classification 
      LIMIT 1;
    `);
    console.log('✅ action_grid_classification test:', testActionGrid.rows.length > 0 ? 'Working' : 'No data');
    
    const testInsight = await client.query(`
      SELECT insight_id, insight_text, source 
      FROM ai_insight 
      LIMIT 1;
    `);
    console.log('✅ ai_insight test:', testInsight.rows.length > 0 ? 'Working' : 'No data');
    
    const testRecommendation = await client.query(`
      SELECT recommendation_id, recommendation_text, priority, source 
      FROM ai_recommendation 
      LIMIT 1;
    `);
    console.log('✅ ai_recommendation test:', testRecommendation.rows.length > 0 ? 'Working' : 'No data');
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Missing ML columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

addMissingColumns();