#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function fixNullConstraints() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    console.log('🔧 Fixing NULL constraints for ML system...\n');
    
    // Make need_for_action_score nullable
    console.log('📋 Making need_for_action_score nullable...');
    await client.query(`
      ALTER TABLE action_grid_classification 
      ALTER COLUMN need_for_action_score DROP NOT NULL;
    `);
    console.log('✅ need_for_action_score made nullable');
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 NULL constraints fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

fixNullConstraints();