#!/usr/bin/env node

/**
 * Verify Rollback Success
 * 
 * This script verifies that the rollback was successful by checking:
 * 1. Feature flag is disabled
 * 2. Database integrity is maintained
 * 3. GPS verification columns are removed (if database rollback was performed)
 * 4. System is functional
 * 
 * Usage:
 *   node scripts/verify-rollback.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

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
 * Check 1: Verify feature flag is disabled
 */
async function checkFeatureFlag() {
  logStep('1', 'Checking feature flag status...');
  
  try {
    const envProdPath = path.join(__dirname, '..', '.env.production');
    
    if (!fs.existsSync(envProdPath)) {
      logWarning('.env.production file not found');
      logWarning('Feature flag may be managed in hosting platform');
      return { status: 'unknown', message: 'File not found' };
    }

    const envContent = fs.readFileSync(envProdPath, 'utf8');
    
    if (envContent.includes('NEXT_PUBLIC_USE_CSIS=true')) {
      logError('Feature flag is still ENABLED');
      return { status: 'error', message: 'Feature flag is true' };
    }

    if (envContent.includes('NEXT_PUBLIC_USE_CSIS=false')) {
      logSuccess('Feature flag is DISABLED');
      return { status: 'success', message: 'Feature flag is false' };
    }

    logWarning('Feature flag not found in .env.production');
    return { status: 'warning', message: 'Feature flag not found' };
  } catch (error) {
    logError(`Feature flag check failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

/**
 * Check 2: Verify database connection
 */
async function checkDatabaseConnection() {
  logStep('2', 'Checking database connection...');
  
  try {
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

    const { data, error } = await supabase
      .from('barangay')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    logSuccess('Database connection successful');
    return { status: 'success', message: 'Connected' };
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

/**
 * Check 3: Verify GPS verification columns status
 */
async function checkGPSColumns() {
  logStep('3', 'Checking GPS verification columns...');
  
  try {
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

    const { data, error } = await supabase
      .from('survey_response')
      .select('verification_location, gps_verification_status, gps_distance_meters')
      .limit(1);

    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      logSuccess('GPS verification columns removed (full rollback)');
      return { status: 'success', message: 'Columns removed', fullRollback: true };
    }

    if (!error) {
      logWarning('GPS verification columns still exist (feature flag rollback only)');
      return { status: 'warning', message: 'Columns exist', fullRollback: false };
    }

    throw error;
  } catch (error) {
    logError(`GPS column check failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

/**
 * Check 4: Verify survey response data integrity
 */
async function checkDataIntegrity() {
  logStep('4', 'Checking data integrity...');
  
  try {
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

    // Get total survey count
    const { count: totalCount, error: countError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    log(`Total survey responses: ${totalCount}`, 'blue');

    // Get recent surveys
    const { data: recentSurveys, error: recentError } = await supabase
      .from('survey_response')
      .select('id, survey_number, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      throw recentError;
    }

    log(`Recent surveys: ${recentSurveys?.length || 0}`, 'blue');

    // Check for null or invalid data
    const { count: invalidCount, error: invalidError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .is('survey_number', null);

    if (invalidError) {
      throw invalidError;
    }

    if (invalidCount > 0) {
      logWarning(`Found ${invalidCount} surveys with null survey_number`);
    }

    logSuccess('Data integrity check passed');
    return { 
      status: 'success', 
      message: 'Data intact',
      totalCount,
      recentCount: recentSurveys?.length || 0,
      invalidCount
    };
  } catch (error) {
    logError(`Data integrity check failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

/**
 * Check 5: Verify core tables are accessible
 */
async function checkCoreTables() {
  logStep('5', 'Checking core tables...');
  
  try {
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

    const tables = [
      { name: 'barangay', columns: 'id, name' },
      { name: 'survey_response', columns: 'id, survey_number' },
      { name: 'users', columns: 'id, email' },
      { name: 'survey_cycle', columns: 'id, name' }
    ];

    const results = [];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table.name)
        .select(table.columns)
        .limit(1);

      if (error) {
        logError(`${table.name} table query failed: ${error.message}`);
        results.push({ table: table.name, status: 'error', error: error.message });
      } else {
        logSuccess(`${table.name} table accessible`);
        results.push({ table: table.name, status: 'success' });
      }
    }

    const allSuccess = results.every(r => r.status === 'success');
    
    return { 
      status: allSuccess ? 'success' : 'error',
      message: allSuccess ? 'All tables accessible' : 'Some tables failed',
      results
    };
  } catch (error) {
    logError(`Core tables check failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

/**
 * Check 6: Verify system functionality
 */
async function checkSystemFunctionality() {
  logStep('6', 'Checking system functionality...');
  
  try {
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

    // Test 1: Can query barangays
    const { data: barangays, error: barangayError } = await supabase
      .from('barangay')
      .select('id, name')
      .limit(5);

    if (barangayError) {
      throw new Error(`Barangay query failed: ${barangayError.message}`);
    }

    logSuccess(`Barangay query works (${barangays?.length || 0} records)`);

    // Test 2: Can query survey responses
    const { data: surveys, error: surveyError } = await supabase
      .from('survey_response')
      .select('id, survey_number, created_at')
      .limit(5);

    if (surveyError) {
      throw new Error(`Survey query failed: ${surveyError.message}`);
    }

    logSuccess(`Survey query works (${surveys?.length || 0} records)`);

    // Test 3: Can query users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);

    if (userError) {
      throw new Error(`User query failed: ${userError.message}`);
    }

    logSuccess(`User query works (${users?.length || 0} records)`);

    return { status: 'success', message: 'System functional' };
  } catch (error) {
    logError(`System functionality check failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

/**
 * Print verification summary
 */
function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('ROLLBACK VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const checks = [
    { name: 'Feature Flag', result: results.featureFlag },
    { name: 'Database Connection', result: results.dbConnection },
    { name: 'GPS Columns', result: results.gpsColumns },
    { name: 'Data Integrity', result: results.dataIntegrity },
    { name: 'Core Tables', result: results.coreTables },
    { name: 'System Functionality', result: results.functionality }
  ];

  checks.forEach(check => {
    const statusIcon = check.result.status === 'success' ? '✓' : 
                       check.result.status === 'warning' ? '⚠' : '✗';
    const color = check.result.status === 'success' ? 'green' :
                  check.result.status === 'warning' ? 'yellow' : 'red';
    log(`${statusIcon} ${check.name}: ${check.result.message}`, color);
  });

  log('='.repeat(60), 'cyan');

  // Overall assessment
  const hasError = checks.some(c => c.result.status === 'error');
  const hasWarning = checks.some(c => c.result.status === 'warning');

  if (hasError) {
    log('\n⚠️  ROLLBACK VERIFICATION FAILED', 'red');
    log('Some checks failed. Please review errors above.', 'red');
    log('Manual intervention may be required.', 'red');
  } else if (hasWarning) {
    log('\n⚠️  ROLLBACK VERIFICATION PASSED WITH WARNINGS', 'yellow');
    log('Rollback appears successful but some warnings detected.', 'yellow');
    
    if (results.gpsColumns.fullRollback === false) {
      log('\nNote: GPS verification columns still exist (feature flag rollback only)', 'yellow');
      log('This is expected if you did not use --rollback-db flag', 'yellow');
    }
  } else {
    log('\n✨ ROLLBACK VERIFICATION PASSED', 'green');
    log('All checks passed successfully!', 'green');
  }

  // Additional information
  if (results.dataIntegrity.status === 'success') {
    log('\n📊 Data Statistics:', 'blue');
    log(`  Total Surveys: ${results.dataIntegrity.totalCount}`, 'blue');
    log(`  Recent Surveys: ${results.dataIntegrity.recentCount}`, 'blue');
    if (results.dataIntegrity.invalidCount > 0) {
      log(`  Invalid Surveys: ${results.dataIntegrity.invalidCount}`, 'yellow');
    }
  }

  // Next steps
  log('\n📋 Next Steps:', 'cyan');
  if (hasError) {
    log('1. Review error messages above', 'blue');
    log('2. Check database logs', 'blue');
    log('3. Verify environment variables', 'blue');
    log('4. Contact system administrator if needed', 'blue');
  } else {
    log('1. Monitor system for 15-30 minutes', 'blue');
    log('2. Test survey submission manually', 'blue');
    log('3. Verify field staff can use the system', 'blue');
    log('4. Document rollback in issue tracker', 'blue');
    log('5. Plan fix for issues that caused rollback', 'blue');
  }
}

/**
 * Main verification function
 */
async function verify() {
  log('\n' + '='.repeat(60), 'magenta');
  log('ROLLBACK VERIFICATION', 'magenta');
  log('='.repeat(60), 'magenta');
  log(`Environment: ${CONFIG.supabaseUrl}`, 'blue');
  log('='.repeat(60) + '\n', 'magenta');

  const results = {
    featureFlag: null,
    dbConnection: null,
    gpsColumns: null,
    dataIntegrity: null,
    coreTables: null,
    functionality: null
  };

  // Execute verification checks
  results.featureFlag = await checkFeatureFlag();
  results.dbConnection = await checkDatabaseConnection();
  
  if (results.dbConnection.status === 'success') {
    results.gpsColumns = await checkGPSColumns();
    results.dataIntegrity = await checkDataIntegrity();
    results.coreTables = await checkCoreTables();
    results.functionality = await checkSystemFunctionality();
  } else {
    log('\nSkipping remaining checks due to database connection failure', 'red');
  }

  printSummary(results);

  const hasError = Object.values(results).some(r => r && r.status === 'error');
  process.exit(hasError ? 1 : 0);
}

// Run verification
verify().catch(error => {
  logError(`Verification failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
