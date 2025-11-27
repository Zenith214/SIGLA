#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ML System Database Issues...\n');

// Load environment variables
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function fixMLDatabaseIssues() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Connected to database');

    // 1. Check if ML tables exist
    console.log('\n📋 Checking ML table structure...');
    
    const tableChecks = [
      'action_grid_classification',
      'ai_insight', 
      'ai_recommendation',
      'ml_model',
      'ml_prediction'
    ];

    for (const tableName of tableChecks) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);

      if (tableExists.rows[0].exists) {
        console.log(`   ✅ Table '${tableName}' exists`);
      } else {
        console.log(`   ❌ Table '${tableName}' missing - creating...`);
        await createMLTable(client, tableName);
      }
    }

    // 2. Add missing confidence column to ai_insight table
    console.log('\n🔧 Checking ai_insight table structure...');
    
    const confidenceColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_insight' 
        AND column_name = 'confidence'
      );
    `);

    if (!confidenceColumnExists.rows[0].exists) {
      console.log('   ➕ Adding confidence column to ai_insight table...');
      await client.query(`
        ALTER TABLE ai_insight ADD COLUMN confidence DECIMAL(5,4);
      `);
      console.log('   ✅ Confidence column added');
    } else {
      console.log('   ✅ Confidence column already exists');
    }

    // 3. Create/Update RLS policies for ML tables
    console.log('\n🔐 Setting up Row Level Security policies...');
    
    for (const tableName of tableChecks) {
      try {
        // Enable RLS
        await client.query(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
        
        // Drop existing policies if they exist
        await client.query(`DROP POLICY IF EXISTS "Service role can do everything" ON ${tableName};`);
        await client.query(`DROP POLICY IF EXISTS "Allow authenticated users" ON ${tableName};`);
        
        // Create new policies
        await client.query(`
          CREATE POLICY "Service role can do everything" ON ${tableName}
          FOR ALL USING (auth.role() = 'service_role');
        `);
        
        await client.query(`
          CREATE POLICY "Allow authenticated users" ON ${tableName}
          FOR ALL USING (auth.role() = 'authenticated');
        `);
        
        console.log(`   ✅ RLS policies created for ${tableName}`);
      } catch (error) {
        console.log(`   ⚠️  RLS policy creation failed for ${tableName}: ${error.message}`);
      }
    }

    // 4. Grant necessary permissions
    console.log('\n🔑 Granting database permissions...');
    
    try {
      await client.query(`GRANT USAGE ON SCHEMA public TO postgres;`);
      await client.query(`GRANT CREATE ON SCHEMA public TO postgres;`);
      await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;`);
      await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;`);
      console.log('   ✅ Permissions granted');
    } catch (error) {
      console.log(`   ⚠️  Permission grant failed: ${error.message}`);
    }

    // 5. Test ML table access
    console.log('\n🧪 Testing ML table access...');
    
    for (const tableName of tableChecks) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${tableName};`);
        console.log(`   ✅ ${tableName}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ❌ ${tableName}: Access failed - ${error.message}`);
      }
    }

    console.log('\n🎉 ML database issues fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing ML database issues:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

async function createMLTable(client, tableName) {
  const tableSchemas = {
    action_grid_classification: `
      CREATE TABLE action_grid_classification (
        id SERIAL PRIMARY KEY,
        barangay_id INTEGER NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        satisfaction_score DECIMAL(5,2),
        need_for_action_score DECIMAL(5,2),
        quadrant VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    ai_insight: `
      CREATE TABLE ai_insight (
        id SERIAL PRIMARY KEY,
        barangay_id INTEGER NOT NULL,
        insight_type VARCHAR(100),
        insight_text TEXT,
        confidence DECIMAL(5,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    ai_recommendation: `
      CREATE TABLE ai_recommendation (
        id SERIAL PRIMARY KEY,
        barangay_id INTEGER NOT NULL,
        recommendation_type VARCHAR(100),
        recommendation_text TEXT,
        priority_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    ml_model: `
      CREATE TABLE ml_model (
        id SERIAL PRIMARY KEY,
        model_name VARCHAR(255) NOT NULL,
        model_version VARCHAR(50),
        model_type VARCHAR(100),
        accuracy DECIMAL(5,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    ml_prediction: `
      CREATE TABLE ml_prediction (
        id SERIAL PRIMARY KEY,
        model_id INTEGER REFERENCES ml_model(id),
        barangay_id INTEGER NOT NULL,
        prediction_data JSONB,
        confidence_score DECIMAL(5,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  };

  if (tableSchemas[tableName]) {
    await client.query(tableSchemas[tableName]);
    console.log(`   ✅ Created table '${tableName}'`);
  }
}

// Run the fix
fixMLDatabaseIssues();