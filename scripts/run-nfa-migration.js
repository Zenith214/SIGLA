/**
 * NFA Binary Field Migration Runner
 * This script runs the database migration for the NFA binary fields
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env file');
  process.exit(1);
}

// Create PostgreSQL client
const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runQuery(query, description) {
  console.log(`\n📊 ${description}...`);
  try {
    const result = await client.query(query);
    console.log('✅ Success');
    return result.rows;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return null;
  }
}

async function checkCurrentState() {
  console.log('\n========================================');
  console.log('STEP 1: Checking Current Database State');
  console.log('========================================');

  try {
    const result = await client.query(`
      SELECT section_key, data
      FROM survey_section
      LIMIT 10
    `);

    console.log(`✅ Found ${result.rows.length} survey sections`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No survey sections found in database');
      return { hasOldFields: false, hasNewFields: false };
    }

    // Check if old field names exist
    const hasOldFields = result.rows.some(section => {
      const jsonData = section.data;
      return jsonData && (
        jsonData.suggestionsProjects ||
        jsonData.suggestionsFinancial ||
        jsonData.suggestionsSocialPrograms
      );
    });

    console.log(`📋 Old field names present: ${hasOldFields ? 'YES' : 'NO'}`);
    
    // Check if new field names exist
    const hasNewFields = result.rows.some(section => {
      const jsonData = section.data;
      return jsonData && (
        jsonData.need_for_action_binary_projects ||
        jsonData.need_for_action_binary_financial
      );
    });

    console.log(`📋 New field names present: ${hasNewFields ? 'YES' : 'NO'}`);

    return { hasOldFields, hasNewFields };
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    return false;
  }
}

async function runTestMigration() {
  console.log('\n========================================');
  console.log('STEP 2: Running Test Migration');
  console.log('========================================');

  const testScript = fs.readFileSync(
    path.join(__dirname, '../database/nfa-migration-test.sql'),
    'utf8'
  );

  console.log('📝 Test script loaded');
  console.log('⚠️  Note: Test script uses psql-specific commands (\\echo)');
  console.log('⚠️  Running migration directly instead...');
  
  return true;
}

async function runMigration() {
  console.log('\n========================================');
  console.log('STEP 3: Running Production Migration');
  console.log('========================================');

  const migrationScript = fs.readFileSync(
    path.join(__dirname, '../database/nfa-binary-field-migration-text.sql'),
    'utf8'
  );

  console.log('📝 Migration script loaded');
  console.log('⚠️  Running full migration script...');

  try {
    await client.query(migrationScript);
    console.log('✅ Migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Error details:', error.stack);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n========================================');
  console.log('STEP 4: Verifying Migration');
  console.log('========================================');

  try {
    // Check for new fields
    const result = await client.query(`
      SELECT section_key, data
      FROM survey_section
      WHERE section_key = 'financial'
      LIMIT 5
    `);

    if (result.rows.length === 0) {
      console.log('⚠️  No financial sections found to verify');
      return true; // Not necessarily a failure
    }

    const hasNewFields = result.rows.some(section => {
      const jsonData = section.data;
      return jsonData && (
        jsonData.need_for_action_binary_projects ||
        jsonData.need_for_action_binary_financial
      );
    });

    console.log(`✅ New field names present: ${hasNewFields ? 'YES' : 'NO'}`);

    // Check for old fields (should be gone)
    const hasOldFields = result.rows.some(section => {
      const jsonData = section.data;
      return jsonData && (
        jsonData.suggestionsProjects ||
        jsonData.suggestionsFinancial
      );
    });

    console.log(`✅ Old field names present: ${hasOldFields ? 'YES (UNEXPECTED!)' : 'NO (GOOD!)'}`);

    // Count statistics
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_sections,
        COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as has_binary_projects,
        COUNT(CASE WHEN data ? 'suggestionsProjects' THEN 1 END) as has_old_suggestions
      FROM survey_section
      WHERE section_key = 'financial'
    `);

    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      console.log(`\n📊 Migration Statistics:`);
      console.log(`   Total financial sections: ${stats.total_sections}`);
      console.log(`   With new binary fields: ${stats.has_binary_projects}`);
      console.log(`   With old suggestion fields: ${stats.has_old_suggestions}`);
    }

    if (hasNewFields && !hasOldFields) {
      console.log('\n🎉 Migration verified successfully!');
      return true;
    } else if (!hasNewFields && !hasOldFields) {
      console.log('\n⚠️  No fields found (might be empty database)');
      return true;
    } else {
      console.log('\n⚠️  Migration verification failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('NFA BINARY FIELD MIGRATION');
  console.log('========================================');

  try {
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Step 1: Check current state
    const state = await checkCurrentState();
    
    if (!state) {
      console.error('\n❌ Failed to check database state');
      process.exit(1);
    }

    if (state.hasNewFields && !state.hasOldFields) {
      console.log('\n✅ Migration already completed!');
      console.log('   Database already has new field names.');
      process.exit(0);
    }

    // Proceed with migration regardless
    console.log('\n✅ Proceeding with migration...');

    // Step 2: Run test migration (skipped - requires psql)
    console.log('\n⚠️  Skipping test migration (requires psql)');
    console.log('   Proceeding directly to production migration...');

    // Step 3: Run migration
    const migrationSuccess = await runMigration();
    
    if (!migrationSuccess) {
      console.error('\n❌ Migration failed!');
      console.log('   Check the errors above for details.');
      process.exit(1);
    }

    // Step 4: Verify migration
    const verificationSuccess = await verifyMigration();
    
    if (!verificationSuccess) {
      console.error('\n❌ Migration verification failed!');
      process.exit(1);
    }

    console.log('\n========================================');
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nNext steps:');
    console.log('1. Test the application to ensure everything works');
    console.log('2. Monitor for any issues');
    console.log('3. If issues occur, run the rollback script');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

main();
