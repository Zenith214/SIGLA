#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMLSchemaIssues() {
  console.log('🔧 Fixing ML Schema Issues...\n');

  try {
    // 1. Check and fix action_grid_classification table
    console.log('📋 Checking action_grid_classification table schema...');
    
    const { data: actionGridData, error: actionGridError } = await supabase
      .from('action_grid_classification')
      .select('*')
      .limit(1);
      
    if (actionGridError) {
      console.log('❌ Error accessing action_grid_classification:', actionGridError.message);
    } else {
      console.log('✅ action_grid_classification accessible');
      if (actionGridData && actionGridData.length > 0) {
        console.log('   Current columns:', Object.keys(actionGridData[0]));
        
        // Check if service_name column exists
        if (!actionGridData[0].hasOwnProperty('service_name')) {
          console.log('⚠️  Missing service_name column, adding it...');
          
          // Add service_name column
          const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE action_grid_classification ADD COLUMN IF NOT EXISTS service_name VARCHAR(50);`
          });
          
          if (alterError) {
            console.log('❌ Failed to add service_name column:', alterError.message);
          } else {
            console.log('✅ Added service_name column');
          }
        } else {
          console.log('✅ service_name column exists');
        }
      }
    }

    // 2. Check and fix ai_insight table schema
    console.log('\n📋 Checking ai_insight table schema...');
    
    const { data: insightData, error: insightError } = await supabase
      .from('ai_insight')
      .select('*')
      .limit(1);
      
    if (insightError) {
      console.log('❌ Error accessing ai_insight:', insightError.message);
    } else {
      console.log('✅ ai_insight accessible');
      if (insightData && insightData.length > 0) {
        console.log('   Current columns:', Object.keys(insightData[0]));
        
        // Check if insight_text column exists (it should be content)
        if (!insightData[0].hasOwnProperty('insight_text') && insightData[0].hasOwnProperty('content')) {
          console.log('⚠️  Missing insight_text column, adding alias...');
          
          // Add insight_text as alias to content
          const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE ai_insight ADD COLUMN IF NOT EXISTS insight_text TEXT;
                  UPDATE ai_insight SET insight_text = content WHERE insight_text IS NULL;`
          });
          
          if (alterError) {
            console.log('❌ Failed to add insight_text column:', alterError.message);
          } else {
            console.log('✅ Added insight_text column');
          }
        } else if (insightData[0].hasOwnProperty('insight_text')) {
          console.log('✅ insight_text column exists');
        }
      }
    }

    // 3. Test the fixes
    console.log('\n🧪 Testing the fixes...');
    
    // Test action_grid_classification with service_name
    const { data: testActionGrid, error: testActionGridError } = await supabase
      .from('action_grid_classification')
      .select('id, service_name, quadrant')
      .limit(1);
      
    if (testActionGridError) {
      console.log('❌ action_grid_classification test failed:', testActionGridError.message);
    } else {
      console.log('✅ action_grid_classification with service_name: Working');
    }
    
    // Test ai_insight with insight_text
    const { data: testInsight, error: testInsightError } = await supabase
      .from('ai_insight')
      .select('insight_id, insight_text, content')
      .limit(1);
      
    if (testInsightError) {
      console.log('❌ ai_insight test failed:', testInsightError.message);
    } else {
      console.log('✅ ai_insight with insight_text: Working');
    }

    console.log('\n🎉 ML Schema fixes completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Alternative approach using direct SQL if RPC doesn't work
async function fixMLSchemaDirectSQL() {
  console.log('🔧 Fixing ML Schema Issues with Direct SQL...\n');
  
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('✅ Connected to database');
    
    // 1. Add service_name column to action_grid_classification
    console.log('📋 Adding service_name column...');
    await client.query(`
      ALTER TABLE action_grid_classification 
      ADD COLUMN IF NOT EXISTS service_name VARCHAR(50);
    `);
    console.log('✅ service_name column added');
    
    // 2. Add insight_text column to ai_insight
    console.log('📋 Adding insight_text column...');
    await client.query(`
      ALTER TABLE ai_insight 
      ADD COLUMN IF NOT EXISTS insight_text TEXT;
    `);
    
    // Copy content to insight_text where needed
    await client.query(`
      UPDATE ai_insight 
      SET insight_text = content 
      WHERE insight_text IS NULL AND content IS NOT NULL;
    `);
    console.log('✅ insight_text column added and populated');
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Direct SQL schema fixes completed!');
    
  } catch (error) {
    console.error('❌ Direct SQL error:', error.message);
    await pool.end();
  }
}

// Run the appropriate fix method
if (process.argv.includes('--direct-sql')) {
  fixMLSchemaDirectSQL();
} else {
  fixMLSchemaIssues();
}