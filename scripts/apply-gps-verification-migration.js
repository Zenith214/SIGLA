/**
 * Apply GPS Verification Migration
 * 
 * This script adds GPS verification fields to the survey_response table
 * to support quality control verification of interview locations.
 * 
 * Features:
 * - Adds verification_location JSONB column
 * - Adds gps_verification_status VARCHAR column
 * - Adds gps_distance_meters INTEGER column
 * - Creates indexes for efficient querying
 * - Includes rollback capability
 * 
 * Requirements: 5.4, 5.5, 5.6, 5.7
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Execute a SQL statement with error handling
 */
async function executeSql(statement, description) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: statement 
    });

    if (error) {
      throw error;
    }

    console.log(`✅ ${description}`);
    return { success: true };
  } catch (error) {
    // Check if it's a benign error (already exists)
    if (error.message && (
      error.message.includes('already exists') ||
      error.message.includes('duplicate')
    )) {
      console.log(`⏭️  ${description} (already exists, skipping)`);
      return { success: true, skipped: true };
    }

    console.error(`❌ ${description} - Error:`, error.message);
    return { success: false, error };
  }
}

/**
 * Check if columns already exist
 */
async function checkExistingColumns() {
  console.log('🔍 Checking existing columns...\n');
  
  const { data, error } = await supabase
    .from('survey_response')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error checking columns:', error.message);
    return { exists: false };
  }

  const hasVerificationLocation = data && data.length > 0 && 
    'verification_location' in data[0];
  const hasGpsStatus = data && data.length > 0 && 
    'gps_verification_status' in data[0];
  const hasGpsDistance = data && data.length > 0 && 
    'gps_distance_meters' in data[0];

  if (hasVerificationLocation || hasGpsStatus || hasGpsDistance) {
    console.log('ℹ️  Some GPS verification columns already exist:');
    if (hasVerificationLocation) console.log('   - verification_location');
    if (hasGpsStatus) console.log('   - gps_verification_status');
    if (hasGpsDistance) console.log('   - gps_distance_meters');
    console.log('');
  }

  return {
    exists: hasVerificationLocation || hasGpsStatus || hasGpsDistance,
    hasVerificationLocation,
    hasGpsStatus,
    hasGpsDistance
  };
}

/**
 * Apply the migration
 */
async function applyMigration() {
  console.log('🚀 Starting GPS Verification Migration...\n');

  try {
    // Check existing columns
    const existing = await checkExistingColumns();

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'add-gps-verification-fields.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 Loaded SQL file:', sqlPath);
    console.log('📊 Applying migration...\n');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute each statement
    for (const statement of statements) {
      let description = 'Executing statement';
      
      // Extract meaningful description from statement
      if (statement.includes('ADD COLUMN') && statement.includes('verification_location')) {
        description = 'Adding verification_location column';
      } else if (statement.includes('ADD COLUMN') && statement.includes('gps_verification_status')) {
        description = 'Adding gps_verification_status column';
      } else if (statement.includes('ADD COLUMN') && statement.includes('gps_distance_meters')) {
        description = 'Adding gps_distance_meters column';
      } else if (statement.includes('CREATE INDEX') && statement.includes('gps_flagged')) {
        description = 'Creating index for flagged interviews';
      } else if (statement.includes('CREATE INDEX') && statement.includes('verification_location')) {
        description = 'Creating GIN index for verification location';
      } else if (statement.includes('CREATE INDEX') && statement.includes('cycle_gps_status')) {
        description = 'Creating composite index for cycle-aware queries';
      }

      const result = await executeSql(statement + ';', description);

      if (result.success) {
        if (result.skipped) {
          skipCount++;
        } else {
          successCount++;
        }
      } else {
        errorCount++;
        errors.push({ description, error: result.error });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`   ✅ Successfully applied: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(({ description, error }) => {
        console.log(`   - ${description}: ${error.message}`);
      });
      console.log('\n⚠️  Migration completed with errors');
      return false;
    } else {
      console.log('\n✨ GPS Verification Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update API endpoints to accept verificationLocation');
      console.log('2. Update survey submission logic to calculate GPS verification');
      console.log('3. Create supervisor dashboard for GPS verification review');
      return true;
    }

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error.message);
    console.error(error);
    return false;
  }
}

/**
 * Rollback the migration
 */
async function rollbackMigration() {
  console.log('🔄 Starting GPS Verification Migration Rollback...\n');

  try {
    const rollbackStatements = [
      {
        sql: 'DROP INDEX IF EXISTS idx_survey_response_cycle_gps_status;',
        description: 'Dropping composite index for cycle-aware queries'
      },
      {
        sql: 'DROP INDEX IF EXISTS idx_survey_response_verification_location;',
        description: 'Dropping GIN index for verification location'
      },
      {
        sql: 'DROP INDEX IF EXISTS idx_survey_response_gps_flagged;',
        description: 'Dropping index for flagged interviews'
      },
      {
        sql: 'ALTER TABLE survey_response DROP COLUMN IF EXISTS gps_distance_meters;',
        description: 'Removing gps_distance_meters column'
      },
      {
        sql: 'ALTER TABLE survey_response DROP COLUMN IF EXISTS gps_verification_status;',
        description: 'Removing gps_verification_status column'
      },
      {
        sql: 'ALTER TABLE survey_response DROP COLUMN IF EXISTS verification_location;',
        description: 'Removing verification_location column'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const { sql, description } of rollbackStatements) {
      const result = await executeSql(sql, description);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Rollback Summary:');
    console.log('='.repeat(60));
    console.log(`   ✅ Successfully rolled back: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount === 0) {
      console.log('\n✨ Rollback completed successfully!');
      return true;
    } else {
      console.log('\n⚠️  Rollback completed with errors');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Fatal error during rollback:', error.message);
    console.error(error);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);
const isRollback = args.includes('--rollback') || args.includes('-r');

if (isRollback) {
  rollbackMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
} else {
  applyMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}
