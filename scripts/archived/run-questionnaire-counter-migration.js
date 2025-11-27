const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env or .env.local
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_questionnaire_counter.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration: add_questionnaire_counter.sql');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully');

    // Verify the table was created
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM questionnaire_counter
    `);

    console.log(`✅ Questionnaire counter table created (${result.rows[0].count} barangays initialized)`);
    console.log(`ℹ️  Counters will be initialized automatically when each barangay generates their first questionnaire number`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runMigration();
