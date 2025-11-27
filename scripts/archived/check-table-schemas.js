#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function checkSchemas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔍 Checking table schemas...\n');
    
    // Check action_grid_classification columns
    const actionGridResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'action_grid_classification'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 action_grid_classification columns:');
    actionGridResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
    // Check ai_insight columns
    const aiInsightResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ai_insight'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 ai_insight columns:');
    aiInsightResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
    // Check ai_recommendation columns
    const aiRecommendationResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ai_recommendation'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 ai_recommendation columns:');
    aiRecommendationResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkSchemas();