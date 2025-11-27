#!/usr/bin/env node

/**
 * Deploy CSIS Workflow Upgrade to Staging Environment
 * 
 * This script:
 * 1. Applies database migrations to staging
 * 2. Verifies database schema
 * 3. Runs build process
 * 4. Validates deployment
 * 5. Enables feature flag for testing
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const STAGING_CONFIG = {
  supabaseUrl: process.env.STAGING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.STAGING_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  featureFlag: 'NEXT_PUBLIC_USE_CSIS',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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
 * Check if database is accessible
 */
async function checkDatabaseConnection() {
  logStep('1', 'Checking database connection...');
  
  try {
    const supabase = createClient(
      STAGING_CONFIG.supabaseUrl,
      STAGING_CONFIG.supabaseKey
    );

    const { data, error } = await supabase
      .from('barangay')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    logSuccess('Database connection successful');
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Apply database migrations
 */
async function applyMigrations() {
  logStep('2', 'Applying database migrations...');
  
  try {
    // Check if GPS verification migration is already applied
    const supabase = createClient(
      STAGING_CONFIG.supabaseUrl,
      STAGING_CONFIG.supabaseKey
    );

    const { data, error } = await supabase
      .from('survey_response')
      .select('verification_location, gps_verification_status, gps_distance_meters')
      .limit(1);

    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      log('GPS verification columns not found, applying migration...', 'yellow');
      
      // Run migration script
      try {
        execSync('node scripts/apply-gps-verification-migration.js', {
          stdio: 'inherit',
          env: {
            ...process.env,
            NEXT_PUBLIC_SUPABASE_URL: STAGING_CONFIG.supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: STAGING_CONFIG.supabaseKey
          }
        });
        logSuccess('GPS verification migration applied');
      } catch (migrationError) {
        logError('Migration failed');
        return false;
      }
    } else {
      logSuccess('GPS verification columns already exist');
    }

    return true;
  } catch (error) {
    logError(`Migration check failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify database schema
 */
async function verifySchema() {
  logStep('3', 'Verifying database schema...');
  
  try {
    const supabase = createClient(
      STAGING_CONFIG.supabaseUrl,
      STAGING_CONFIG.supabaseKey
    );

    // Check for required columns
    const { data, error } = await supabase
      .from('survey_response')
      .select('verification_location, gps_verification_status, gps_distance_meters')
      .limit(1);

    if (error) {
      throw error;
    }

    logSuccess('Schema verification passed');
    return true;
  } catch (error) {
    logError(`Schema verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Run build process
 */
async function runBuild() {
  logStep('4', 'Running build process...');
  
  try {
    log('Building Next.js application...', 'blue');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build completed successfully');
    return true;
  } catch (error) {
    logError('Build failed');
    return false;
  }
}

/**
 * Validate deployment
 */
async function validateDeployment() {
  logStep('5', 'Validating deployment...');
  
  try {
    const supabase = createClient(
      STAGING_CONFIG.supabaseUrl,
      STAGING_CONFIG.supabaseKey
    );

    // Test basic queries
    const tests = [
      {
        name: 'Barangay query',
        query: () => supabase.from('barangay').select('id').limit(1)
      },
      {
        name: 'Survey response query',
        query: () => supabase.from('survey_response').select('id, verification_location').limit(1)
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

    return true;
  } catch (error) {
    logError(`Validation failed: ${error.message}`);
    return false;
  }
}

/**
 * Enable feature flag
 */
async function enableFeatureFlag() {
  logStep('6', 'Enabling CSIS feature flag...');
  
  try {
    // Check if .env.local exists
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    let envContent = '';

    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8');
    }

    // Check if flag already exists
    if (envContent.includes('NEXT_PUBLIC_USE_CSIS')) {
      // Update existing flag
      envContent = envContent.replace(
        /NEXT_PUBLIC_USE_CSIS=.*/,
        'NEXT_PUBLIC_USE_CSIS=true'
      );
      logSuccess('Updated existing CSIS feature flag');
    } else {
      // Add new flag
      envContent += '\n# CSIS Workflow Feature Flag\nNEXT_PUBLIC_USE_CSIS=true\n';
      logSuccess('Added CSIS feature flag');
    }

    fs.writeFileSync(envLocalPath, envContent);
    log('Feature flag enabled in .env.local', 'green');
    logWarning('Note: Restart the development server to apply changes');
    
    return true;
  } catch (error) {
    logError(`Failed to enable feature flag: ${error.message}`);
    return false;
  }
}

/**
 * Print deployment summary
 */
function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('STAGING DEPLOYMENT SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const steps = [
    { name: 'Database Connection', result: results.dbConnection },
    { name: 'Database Migrations', result: results.migrations },
    { name: 'Schema Verification', result: results.schema },
    { name: 'Build Process', result: results.build },
    { name: 'Deployment Validation', result: results.validation },
    { name: 'Feature Flag', result: results.featureFlag }
  ];

  steps.forEach(step => {
    const status = step.result ? '✓' : '✗';
    const color = step.result ? 'green' : 'red';
    log(`${status} ${step.name}`, color);
  });

  log('='.repeat(60), 'cyan');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log('\n✨ Staging deployment completed successfully!', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Test the CSIS workflow in staging environment', 'blue');
    log('2. Verify GPS verification functionality', 'blue');
    log('3. Test all 6 service sections', 'blue');
    log('4. Validate Kish Grid selection', 'blue');
    log('5. Review deployment logs for any warnings', 'blue');
  } else {
    log('\n⚠️  Staging deployment completed with errors', 'yellow');
    log('Please review the errors above and retry', 'yellow');
  }
}

/**
 * Main deployment function
 */
async function deploy() {
  log('\n' + '='.repeat(60), 'cyan');
  log('CSIS WORKFLOW UPGRADE - STAGING DEPLOYMENT', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Environment: ${STAGING_CONFIG.supabaseUrl}`, 'blue');
  log(`Feature Flag: ${STAGING_CONFIG.featureFlag}`, 'blue');
  log('='.repeat(60) + '\n', 'cyan');

  const results = {
    dbConnection: false,
    migrations: false,
    schema: false,
    build: false,
    validation: false,
    featureFlag: false
  };

  // Execute deployment steps
  results.dbConnection = await checkDatabaseConnection();
  if (!results.dbConnection) {
    printSummary(results);
    process.exit(1);
  }

  results.migrations = await applyMigrations();
  if (!results.migrations) {
    printSummary(results);
    process.exit(1);
  }

  results.schema = await verifySchema();
  if (!results.schema) {
    printSummary(results);
    process.exit(1);
  }

  results.build = await runBuild();
  if (!results.build) {
    printSummary(results);
    process.exit(1);
  }

  results.validation = await validateDeployment();
  if (!results.validation) {
    printSummary(results);
    process.exit(1);
  }

  results.featureFlag = await enableFeatureFlag();

  printSummary(results);
  process.exit(results.featureFlag ? 0 : 1);
}

// Run deployment
deploy().catch(error => {
  logError(`Deployment failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
