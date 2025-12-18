/**
 * Migration: Add gender_identity column and rename respondent_gender to biological_sex
 * This aligns the database with the updated survey form structure
 */

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting gender/sex column migration...\n');
    
    // Check if columns already exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'survey_response' 
      AND column_name IN ('biological_sex', 'gender_identity')
    `;
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Columns already exist. Migration already applied.');
      return;
    }
    
    console.log('1. Adding biological_sex column...');
    await client.query(`
      ALTER TABLE survey_response 
      ADD COLUMN IF NOT EXISTS biological_sex VARCHAR(50)
    `);
    console.log('   ✅ biological_sex column added');
    
    console.log('\n2. Adding gender_identity column...');
    await client.query(`
      ALTER TABLE survey_response 
      ADD COLUMN IF NOT EXISTS gender_identity VARCHAR(100)
    `);
    console.log('   ✅ gender_identity column added');
    
    console.log('\n3. Migrating data from respondent_gender to biological_sex...');
    await client.query(`
      UPDATE survey_response 
      SET biological_sex = respondent_gender 
      WHERE respondent_gender IS NOT NULL
    `);
    const migratedCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM survey_response 
      WHERE biological_sex IS NOT NULL
    `);
    console.log(`   ✅ Migrated ${migratedCount.rows[0].count} records`);
    
    console.log('\n4. Setting gender_identity to match biological_sex (default)...');
    await client.query(`
      UPDATE survey_response 
      SET gender_identity = biological_sex 
      WHERE biological_sex IS NOT NULL AND gender_identity IS NULL
    `);
    console.log('   ✅ Default gender_identity values set');
    
    console.log('\n5. Creating index on biological_sex...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_survey_response_biological_sex 
      ON survey_response(biological_sex)
    `);
    console.log('   ✅ Index created');
    
    console.log('\n6. Creating index on gender_identity...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_survey_response_gender_identity 
      ON survey_response(gender_identity)
    `);
    console.log('   ✅ Index created');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Note: respondent_gender column is kept for backward compatibility.');
    console.log('   You can drop it later with: ALTER TABLE survey_response DROP COLUMN respondent_gender;');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
