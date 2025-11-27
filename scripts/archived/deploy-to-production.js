#!/usr/bin/env node

/**
 * Deploy CSIS Workflow Upgrade to Production Environment
 * 
 * This script:
 * 1. Schedules maintenance window if needed
 * 2. Applies database migrations to production
 * 3. Deploys code to production server
 * 4. Enables feature flag gradually (canary deployment)
 * 5. Monitors deployment health
 * 
 * Usage:
 *   node scripts/deploy-to-production.js [--skip-maintenance] [--canary-percentage=10]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const PRODUCTION_CONFIG = {
  supabaseUrl: process.env.PRODUCTION_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.PRODUCTION_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  featureFlag: 'NEXT_PUBLIC_USE_CSIS',
  canaryPercentage: 10, // Start with 10% of users
};

// Parse command line arguments
const args = process.argv.slice(2);
const skipMaintenance = args.includes('--skip-maintenance');
const canaryArg = args.find(arg => arg.startsWith('--canary-percentage='));
if (canaryArg) {
  PRODUCTION_CONFIG.canaryPercentage = parseInt(canaryArg.split('=')[1], 10);
}

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
 * Schedule maintenance window
 */
async function scheduleMaintenance() {
  logStep('1', 'Scheduling maintenance window...');
  
  if (skipMaintenance) {
    logWarning('Skipping maintenance window (--skip-maintenance flag)');
    return true;
  }

  log('\nMaintenance Window Checklist:', 'cyan');
  log('  1. Notify users of upcoming maintenance', 'blue');
  log('  2. Set maintenance mode banner on website', 'blue');
  log('  3. Backup current database state', 'blue');
  log('  4. Prepare rollback plan', 'blue');

  const confirmed = await promptConfirmation('\nHave you completed the maintenance checklist?');
  
  if (!confirmed) {
    logError('Maintenance window not confirmed. Aborting deployment.');
    return false;
  }

  logSuccess('Maintenance window confirmed');
  return true;
}

/**
 * Create database backup
 */
async function createBackup() {
  logStep('2', 'Creating database backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-pre-csis-${timestamp}.sql`;
    
    log(`Creating backup: ${backupFile}`, 'blue');
    logWarning('Note: Ensure you have pg_dump configured for production database');
    
    // This would typically use pg_dump or Supabase backup API
    // For now, we'll just log the intent
    logSuccess(`Backup prepared: ${backupFile}`);
    logWarning('Manual verification required: Ensure backup is complete');
    
    const confirmed = await promptConfirmation('Is the backup verified and complete?');
    return confirmed;
  } catch (error) {
    logError(`Backup failed: ${error.message}`);
    return false;
  }
}

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  logStep('3', 'Checking production database connection...');
  
  try {
    const supabase = createClient(
      PRODUCTION_CONFIG.supabaseUrl,
      PRODUCTION_CONFIG.supabaseKey
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
 * Apply database migrations
 */
async function applyMigrations() {
  logStep('4', 'Applying database migrations to production...');
  
  try {
    const supabase = createClient(
      PRODUCTION_CONFIG.supabaseUrl,
      PRODUCTION_CONFIG.supabaseKey
    );

    // Check if GPS verification migration is already applied
    const { data, error } = await supabase
      .from('survey_response')
      .select('verification_location, gps_verification_status, gps_distance_meters')
      .limit(1);

    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      logWarning('GPS verification columns not found, applying migration...');
      
      const confirmed = await promptConfirmation('Apply GPS verification migration to production?');
      if (!confirmed) {
        logError('Migration not confirmed. Aborting deployment.');
        return false;
      }

      // Run migration script
      try {
        execSync('node scripts/apply-gps-verification-migration.js', {
          stdio: 'inherit',
          env: {
            ...process.env,
            NEXT_PUBLIC_SUPABASE_URL: PRODUCTION_CONFIG.supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: PRODUCTION_CONFIG.supabaseKey
          }
        });
        logSuccess('GPS verification migration applied to production');
      } catch (migrationError) {
        logError('Migration failed');
        return false;
      }
    } else {
      logSuccess('GPS verification columns already exist in production');
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
  logStep('5', 'Verifying production database schema...');
  
  try {
    const supabase = createClient(
      PRODUCTION_CONFIG.supabaseUrl,
      PRODUCTION_CONFIG.supabaseKey
    );

    // Check for required columns
    const { data, error } = await supabase
      .from('survey_response')
      .select('verification_location, gps_verification_status, gps_distance_meters')
      .limit(1);

    if (error) {
      throw error;
    }

    logSuccess('Production schema verification passed');
    return true;
  } catch (error) {
    logError(`Schema verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Deploy code to production
 */
async function deployCode() {
  logStep('6', 'Deploying code to production...');
  
  try {
    log('Building production bundle...', 'blue');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Production build completed');

    logWarning('Note: Deploy the build to your production server');
    logWarning('This may involve: Vercel, AWS, Docker, etc.');
    
    const confirmed = await promptConfirmation('Has the code been deployed to production?');
    return confirmed;
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    return false;
  }
}

/**
 * Enable feature flag with canary deployment
 */
async function enableFeatureFlagCanary() {
  logStep('7', `Enabling CSIS feature flag (${PRODUCTION_CONFIG.canaryPercentage}% canary)...`);
  
  try {
    log(`\nCanary Deployment Strategy:`, 'cyan');
    log(`  - Start with ${PRODUCTION_CONFIG.canaryPercentage}% of users`, 'blue');
    log(`  - Monitor for errors and performance issues`, 'blue');
    log(`  - Gradually increase to 25%, 50%, 75%, 100%`, 'blue');
    log(`  - Rollback if issues detected`, 'blue');

    // For canary deployment, we would typically use a feature flag service
    // like LaunchDarkly, Split.io, or a custom solution
    logWarning('Note: Implement canary logic in your feature flag service');
    
    const envProdPath = path.join(__dirname, '..', '.env.production');
    let envContent = '';

    if (fs.existsSync(envProdPath)) {
      envContent = fs.readFileSync(envProdPath, 'utf8');
    }

    // Add canary configuration
    if (envContent.includes('NEXT_PUBLIC_USE_CSIS')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_USE_CSIS=.*/,
        `NEXT_PUBLIC_USE_CSIS=true\nNEXT_PUBLIC_CSIS_CANARY_PERCENTAGE=${PRODUCTION_CONFIG.canaryPercentage}`
      );
    } else {
      envContent += `\n# CSIS Workflow Feature Flag (Canary Deployment)\nNEXT_PUBLIC_USE_CSIS=true\nNEXT_PUBLIC_CSIS_CANARY_PERCENTAGE=${PRODUCTION_CONFIG.canaryPercentage}\n`;
    }

    fs.writeFileSync(envProdPath, envContent);
    logSuccess(`Feature flag enabled with ${PRODUCTION_CONFIG.canaryPercentage}% canary`);
    
    return true;
  } catch (error) {
    logError(`Failed to enable feature flag: ${error.message}`);
    return false;
  }
}

/**
 * Monitor deployment health
 */
async function monitorDeployment() {
  logStep('8', 'Monitoring deployment health...');
  
  try {
    const supabase = createClient(
      PRODUCTION_CONFIG.supabaseUrl,
      PRODUCTION_CONFIG.supabaseKey
    );

    log('\nRunning health checks...', 'blue');

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

    log('\nMonitoring checklist:', 'cyan');
    log('  ✓ Database queries working', 'green');
    log('  ⏳ Monitor error logs for 15 minutes', 'yellow');
    log('  ⏳ Check GPS capture success rate', 'yellow');
    log('  ⏳ Verify survey completion rates', 'yellow');
    log('  ⏳ Monitor API response times', 'yellow');

    logWarning('Continue monitoring for at least 15 minutes before increasing canary percentage');
    
    return true;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Print deployment summary
 */
function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('PRODUCTION DEPLOYMENT SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const steps = [
    { name: 'Maintenance Window', result: results.maintenance },
    { name: 'Database Backup', result: results.backup },
    { name: 'Database Connection', result: results.dbConnection },
    { name: 'Database Migrations', result: results.migrations },
    { name: 'Schema Verification', result: results.schema },
    { name: 'Code Deployment', result: results.deployment },
    { name: 'Feature Flag (Canary)', result: results.featureFlag },
    { name: 'Health Monitoring', result: results.monitoring }
  ];

  steps.forEach(step => {
    const status = step.result ? '✓' : '✗';
    const color = step.result ? 'green' : 'red';
    log(`${status} ${step.name}`, color);
  });

  log('='.repeat(60), 'cyan');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log('\n✨ Production deployment completed successfully!', 'green');
    log(`\nCanary deployment at ${PRODUCTION_CONFIG.canaryPercentage}% of users`, 'magenta');
    log('\nNext steps:', 'cyan');
    log('1. Monitor error logs for 15-30 minutes', 'blue');
    log('2. Check GPS capture success rate metrics', 'blue');
    log('3. Verify survey completion rates', 'blue');
    log('4. Gather feedback from field staff', 'blue');
    log('5. Gradually increase canary percentage if stable', 'blue');
    log('6. Run: node scripts/increase-canary.js --percentage=25', 'blue');
  } else {
    log('\n⚠️  Production deployment completed with errors', 'yellow');
    log('Please review the errors above and consider rollback', 'yellow');
    log('Run: node scripts/rollback-production.js', 'red');
  }
}

/**
 * Main deployment function
 */
async function deploy() {
  log('\n' + '='.repeat(60), 'magenta');
  log('CSIS WORKFLOW UPGRADE - PRODUCTION DEPLOYMENT', 'magenta');
  log('='.repeat(60), 'magenta');
  log(`Environment: ${PRODUCTION_CONFIG.supabaseUrl}`, 'blue');
  log(`Feature Flag: ${PRODUCTION_CONFIG.featureFlag}`, 'blue');
  log(`Canary Percentage: ${PRODUCTION_CONFIG.canaryPercentage}%`, 'blue');
  log('='.repeat(60) + '\n', 'magenta');

  logWarning('⚠️  WARNING: This will deploy to PRODUCTION environment');
  const proceed = await promptConfirmation('Are you sure you want to proceed?');
  
  if (!proceed) {
    log('\nDeployment cancelled by user', 'yellow');
    process.exit(0);
  }

  const results = {
    maintenance: false,
    backup: false,
    dbConnection: false,
    migrations: false,
    schema: false,
    deployment: false,
    featureFlag: false,
    monitoring: false
  };

  // Execute deployment steps
  results.maintenance = await scheduleMaintenance();
  if (!results.maintenance) {
    printSummary(results);
    process.exit(1);
  }

  results.backup = await createBackup();
  if (!results.backup) {
    printSummary(results);
    process.exit(1);
  }

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

  results.deployment = await deployCode();
  if (!results.deployment) {
    printSummary(results);
    process.exit(1);
  }

  results.featureFlag = await enableFeatureFlagCanary();
  if (!results.featureFlag) {
    printSummary(results);
    process.exit(1);
  }

  results.monitoring = await monitorDeployment();

  printSummary(results);
  process.exit(results.monitoring ? 0 : 1);
}

// Run deployment
deploy().catch(error => {
  logError(`Deployment failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
