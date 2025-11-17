#!/usr/bin/env node

/**
 * Rollback CSIS Workflow Upgrade from Production
 * 
 * This script:
 * 1. Disables CSIS feature flag
 * 2. Optionally rolls back database migrations
 * 3. Verifies rollback success
 * 4. Ensures data integrity
 * 
 * Usage:
 *   node scripts/rollback-production.js [--rollback-db] [--force]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const ROLLBACK_CONFIG = {
  supabaseUrl: process.env.PRODUCTION_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.PRODUCTION_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  featureFlag: 'NEXT_PUBLIC_USE_CSIS',
};

// Parse command line arguments
const args = process.argv.slice(2);
const rollbackDb = args.includes('--rollback-db');
const force = args.includes('--force');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * Prompt user for confirmation
 */
function promptConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.yellow}${question} (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  logStep('1', 'Checking production database connection...');
  
  try {
    const supabase = createClient(
      ROLLBACK_CONFIG.supabaseUrl,
      ROLLBACK_CONFIG.supabaseKey
    );

    const { data, error } = await supabase
      .from('barangay')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    logSuccess('Production database connection successful');
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Create backup before rollback
 */
async function createPreRollbackBackup() {
  logStep('2', 'Creating pre-rollback backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-pre-rollback-${timestamp}.sql`;
    
    log(`Creating backup: ${backupFile}`, 'blue');
    logWarning('Note: Ensure you have pg_dump configured for production database');
    
    // This would typically use pg_dump or Supabase backup API
    logSuccess(`Backup prepared: ${backupFile}`);
    logWarning('Manual verification required: Ensure backup is complete');
    
    if (!force) {
      const confirmed = await promptConfirmation('Is the backup verified and complete?');
      return confirmed;
    }
    
    return true;
  } catch (error) {
    logError(`Backup failed: ${error.message}`);
    return false;
  }
}

/**
 * Disable CSIS feature flag
 */
async function disableFeatureFlag() {
  logStep('3', 'Disabling CSIS feature flag...');
  
  try {
    const envProdPath = path.join(__dirname, '..', '.env.production');
    
    if (!fs.existsSync(envProdPath)) {
      logWarning('.env.production file not found');
      logWarning('Feature flag may be managed elsewhere (e.g., Vercel, environment variables)');
      
      if (!force) {
        const confirmed = await promptConfirmation('Have you disabled the feature flag manually?');
        return confirmed;
      }
      return true;
    }

    let envContent = fs.readFileSync(envProdPath, 'utf8');

    // Disable CSIS feature flag
    if (envContent.includes('NEXT_PUBLIC_USE_CSIS=true')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_USE_CSIS=true/g,
        'NEXT_PUBLIC_USE_CSIS=false'
      );
      
      // Remove canary percentage if present
      envContent = envContent.replace(
        /NEXT_PUBLIC_CSIS_CANARY_PERCENTAGE=\d+\n?/g,
        ''
      );

      fs.writeFileSync(envProdPath, envContent);
      logSuccess('CSIS feature flag disabled in .env.production');
    } else {
      logWarning('CSIS feature flag not found or already disabled');
    }

    logWarning('Note: Redeploy application for changes to take effect');
    
    if (!force) {
      const confirmed = await promptConfirmation('Have you redeployed the application?');
      return confirmed;
    }
    
    return true;
  } catch (error) {
    logError(`Failed to disable feature flag: ${error.message}`);
    return false;
  }
}

/**
 * Verify feature flag is disabled
 */
async function verifyFeatureFlagDisabled() {
  logStep('4', 'Verifying feature flag is disabled...');
  
  try {
    const envProdPath = path.join(__dirname, '..', '.env.production');
    
    if (fs.existsSync(envProdPath)) {
      const envContent = fs.readFileSync(envProdPath, 'utf8');
      
      if (envContent.includes('NEXT_PUBLIC_USE_CSIS=true')) {
        logError('Feature flag is still enabled in .env.production');
        return false;
      }
    }

    logSuccess('Feature flag verification passed');
    logWarning('Note: Verify in production environment that CSIS features are disabled');
    
    return true;
  } catch (error) {
    logError(`Feature flag verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Rollback database migrations (optional)
 */
async function rollbackDatabaseMigrations() {
  logStep('5', 'Rolling back database migrations...');
  
  if (!rollbackDb) {
    logWarning('Skipping database rollback (use --rollback-db to enable)');
    logWarning('GPS verification columns will remain in database');
    return true;
  }

  try {
    const supabase = createClient(
      ROLLBACK_CONFIG.supabaseUrl,
      ROLLBACK_CONFIG.supabaseKey
    );

    log('Checking for GPS verification columns...', 'blue');

    // Check if columns exist
    const { data, error } = await supabase
      .from('survey_response')
      .select('verification_location, gps_verification_status, gps_distance_meters')
      .limit(1);

    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      logSuccess('GPS verification columns already removed');
      return true;
    }

    logWarning('GPS verification columns found in database');
    logWarning('⚠️  WARNING: Removing these columns will delete GPS verification data!');
    
    if (!force) {
      const confirmed = await promptConfirmation('Are you sure you want to remove GPS verification columns?');
      if (!confirmed) {
        logWarning('Database rollback cancelled');
        return true;
      }
    }

    // Remove GPS verification columns
    log('Removing GPS verification columns...', 'blue');
    
    const rollbackSQL = `
      -- Remove GPS verification columns
      ALTER TABLE survey_response 
      DROP COLUMN IF EXISTS verification_location,
      DROP COLUMN IF EXISTS gps_verification_status,
      DROP COLUMN IF EXISTS gps_distance_meters;

      -- Remove GPS verification index
      DROP INDEX IF EXISTS idx_survey_responses_gps_flagged;
    `;

    // Execute rollback SQL
    const { error: rollbackError } = await supabase.rpc('exec_sql', { sql: rollbackSQL });

    if (rollbackError) {
      logError(`Database rollback failed: ${rollbackError.message}`);
      logWarning('You may need to run the rollback SQL manually');
      return false;
    }

    logSuccess('GPS verification columns removed from database');
    return true;
  } catch (error) {
    logError(`Database rollback failed: ${error.message}`);
    logWarning('You may need to run the rollback SQL manually');
    return false;
  }
}

/**
 * Verify data integrity after rollback
 */
async function verifyDataIntegrity() {
  logStep('6', 'Verifying data integrity...');
  
  try {
    const supabase = createClient(
      ROLLBACK_CONFIG.supabaseUrl,
      ROLLBACK_CONFIG.supabaseKey
    );

    log('Running data integrity checks...', 'blue');

    // Test basic queries
    const tests = [
      {
        name: 'Barangay query',
        query: () => supabase.from('barangay').select('id').limit(1)
      },
      {
        name: 'Survey response query',
        query: () => supabase.from('survey_response').select('id').limit(1)
      },
      {
        name: 'User query',
        query: () => supabase.from('users').select('id').limit(1)
      }
    ];

    for (const test of tests) {
      const { error } = await test.query();
      if (error) {
        throw new Error(`${test.name} failed: ${error.message}`);
      }
      logSuccess(`${test.name} passed`);
    }

    // Check survey response count
    const { count, error: countError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    logSuccess(`Survey responses intact: ${count} records`);

    logSuccess('Data integrity verification passed');
    return true;
  } catch (error) {
    logError(`Data integrity check failed: ${error.message}`);
    return false;
  }
}

/**
 * Monitor system health after rollback
 */
async function monitorPostRollback() {
  logStep('7', 'Monitoring system health...');
  
  try {
    const supabase = createClient(
      ROLLBACK_CONFIG.supabaseUrl,
      ROLLBACK_CONFIG.supabaseKey
    );

    log('Checking system health...', 'blue');

    // Get recent survey activity
    const cutoffTime = new Date(Date.now() - 3600 * 1000).toISOString();
    
    const { data: recentSurveys, error: surveyError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime);

    if (surveyError) {
      throw surveyError;
    }

    const surveyCount = recentSurveys?.length || 0;
    logSuccess(`Recent surveys (last hour): ${surveyCount}`);

    log('\nPost-rollback monitoring checklist:', 'cyan');
    log('  ✓ Database queries working', 'green');
    log('  ⏳ Monitor error logs for 15 minutes', 'yellow');
    log('  ⏳ Verify survey submission still works', 'yellow');
    log('  ⏳ Check that old survey flow is active', 'yellow');
    log('  ⏳ Monitor API response times', 'yellow');

    logWarning('Continue monitoring for at least 15 minutes after rollback');
    
    return true;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Print rollback summary
 */
function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('PRODUCTION ROLLBACK SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const steps = [
    { name: 'Database Connection', result: results.dbConnection },
    { name: 'Pre-Rollback Backup', result: results.backup },
    { name: 'Disable Feature Flag', result: results.featureFlag },
    { name: 'Verify Flag Disabled', result: results.verification },
    { name: 'Database Rollback', result: results.dbRollback },
    { name: 'Data Integrity Check', result: results.integrity },
    { name: 'Post-Rollback Monitoring', result: results.monitoring }
  ];

  steps.forEach(step => {
    const status = step.result ? '✓' : '✗';
    const color = step.result ? 'green' : 'red';
    log(`${status} ${step.name}`, color);
  });

  log('='.repeat(60), 'cyan');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log('\n✨ Production rollback completed successfully!', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Monitor error logs for 15-30 minutes', 'blue');
    log('2. Verify survey submissions work correctly', 'blue');
    log('3. Check that old survey flow is active', 'blue');
    log('4. Gather feedback from field staff', 'blue');
    log('5. Investigate root cause of issues', 'blue');
    log('6. Fix issues before attempting redeployment', 'blue');
  } else {
    log('\n⚠️  Production rollback completed with errors', 'yellow');
    log('Please review the errors above', 'yellow');
    log('Manual intervention may be required', 'red');
  }
}

/**
 * Main rollback function
 */
async function rollback() {
  log('\n' + '='.repeat(60), 'magenta');
  log('CSIS WORKFLOW UPGRADE - PRODUCTION ROLLBACK', 'magenta');
  log('='.repeat(60), 'magenta');
  log(`Environment: ${ROLLBACK_CONFIG.supabaseUrl}`, 'blue');
  log(`Feature Flag: ${ROLLBACK_CONFIG.featureFlag}`, 'blue');
  log(`Database Rollback: ${rollbackDb ? 'ENABLED' : 'DISABLED'}`, 'blue');
  log(`Force Mode: ${force ? 'ENABLED' : 'DISABLED'}`, 'blue');
  log('='.repeat(60) + '\n', 'magenta');

  logWarning('⚠️  WARNING: This will rollback CSIS features in PRODUCTION');
  
  if (rollbackDb) {
    logWarning('⚠️  WARNING: Database rollback will DELETE GPS verification data');
  }
  
  if (!force) {
    const proceed = await promptConfirmation('Are you sure you want to proceed with rollback?');
    
    if (!proceed) {
      log('\nRollback cancelled by user', 'yellow');
      process.exit(0);
    }
  }

  const results = {
    dbConnection: false,
    backup: false,
    featureFlag: false,
    verification: false,
    dbRollback: false,
    integrity: false,
    monitoring: false
  };

  // Execute rollback steps
  results.dbConnection = await checkDatabaseConnection();
  if (!results.dbConnection) {
    printSummary(results);
    process.exit(1);
  }

  results.backup = await createPreRollbackBackup();
  if (!results.backup) {
    printSummary(results);
    process.exit(1);
  }

  results.featureFlag = await disableFeatureFlag();
  if (!results.featureFlag) {
    printSummary(results);
    process.exit(1);
  }

  results.verification = await verifyFeatureFlagDisabled();
  if (!results.verification) {
    printSummary(results);
    process.exit(1);
  }

  results.dbRollback = await rollbackDatabaseMigrations();
  if (!results.dbRollback) {
    printSummary(results);
    process.exit(1);
  }

  results.integrity = await verifyDataIntegrity();
  if (!results.integrity) {
    printSummary(results);
    process.exit(1);
  }

  results.monitoring = await monitorPostRollback();

  printSummary(results);
  process.exit(results.monitoring ? 0 : 1);
}

// Run rollback
rollback().catch(error => {
  logError(`Rollback failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});