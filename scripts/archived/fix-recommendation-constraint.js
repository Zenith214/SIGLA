#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function fixRecommendationConstraint() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔧 Fixing ai_recommendation priority_level constraint...');
    
    await client.query(`
      ALTER TABLE ai_recommendation 
      ALTER COLUMN priority_level DROP NOT NULL;
    `);
    
    console.log('✅ priority_level made nullable');
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Final constraint fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

fixRecommendationConstraint();