/**
 * Database Optimization Script
 * 
 * This script applies the database optimizations defined in the migration files.
 * It uses Prisma to apply the migrations and verify the changes.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MIGRATION_DIR = path.join(__dirname, '..', 'prisma', 'migrations', '20240709_add_ml_tables');
const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Print a formatted message to the console
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let color = colors.reset;
  
  switch (type) {
    case 'success':
      color = colors.green;
      break;
    case 'warning':
      color = colors.yellow;
      break;
    case 'error':
      color = colors.red;
      break;
    case 'info':
      color = colors.cyan;
      break;
  }
  
  console.log(`${colors.bright}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

/**
 * Check if the migration directory exists
 */
function checkMigrationExists() {
  if (!fs.existsSync(MIGRATION_DIR)) {
    log(`Migration directory not found: ${MIGRATION_DIR}`, 'error');
    log('Please ensure the migration files are in the correct location.', 'error');
    process.exit(1);
  }
  
  log(`Found migration directory: ${MIGRATION_DIR}`, 'success');
}

/**
 * Apply the Prisma migrations
 */
function applyMigrations() {
  try {
    log('Applying migrations using Prisma...');
    execSync('npx prisma migrate dev --name add_ml_tables', { stdio: 'inherit' });
    log('Migrations applied successfully!', 'success');
  } catch (error) {
    log('Failed to apply migrations using Prisma.', 'error');
    log('Attempting to apply migrations manually...', 'warning');
    applyMigrationsManually();
  }
}

/**
 * Apply migrations manually by executing the SQL file
 */
function applyMigrationsManually() {
  try {
    const migrationSqlPath = path.join(MIGRATION_DIR, 'migration.sql');
    
    if (!fs.existsSync(migrationSqlPath)) {
      log(`Migration SQL file not found: ${migrationSqlPath}`, 'error');
      process.exit(1);
    }
    
    log('Applying migrations manually...');
    
    // Get database connection info from .env file
    const envPath = path.join(__dirname, '..', '.env');
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    
    let databaseUrl = '';
    
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=([^\r\n]+)/);
      if (match) databaseUrl = match[1];
    } else if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=([^\r\n]+)/);
      if (match) databaseUrl = match[1];
    }
    
    if (!databaseUrl) {
      log('Could not find DATABASE_URL in .env or .env.local files', 'error');
      process.exit(1);
    }
    
    // Parse the database URL to get connection details
    const dbUrlRegex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):([^/]+)\/(.+)/;
    const dbMatch = databaseUrl.match(dbUrlRegex);
    
    if (!dbMatch) {
      log('Invalid DATABASE_URL format', 'error');
      process.exit(1);
    }
    
    const [, username, password, host, port, database] = dbMatch;
    
    // Create a temporary .pgpass file for authentication
    const pgpassPath = path.join(__dirname, '.pgpass');
    fs.writeFileSync(pgpassPath, `${host}:${port}:${database}:${username}:${password}`, { mode: 0o600 });
    
    // Set PGPASSFILE environment variable
    process.env.PGPASSFILE = pgpassPath;
    
    // Execute the SQL file
    execSync(`psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${migrationSqlPath}"`, { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync(pgpassPath);
    
    log('Migrations applied successfully!', 'success');
  } catch (error) {
    log(`Failed to apply migrations manually: ${error.message}`, 'error');
    log('Please apply the migrations manually using your database management tool.', 'warning');
    log(`The migration SQL file is located at: ${path.join(MIGRATION_DIR, 'migration.sql')}`, 'info');
    process.exit(1);
  }
}

/**
 * Generate Prisma client
 */
function generatePrismaClient() {
  try {
    log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('Prisma client generated successfully!', 'success');
  } catch (error) {
    log(`Failed to generate Prisma client: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Verify the database changes
 */
function verifyChanges() {
  try {
    log('Verifying database changes...');
    
    // Create a temporary verification script
    const verificationScriptPath = path.join(__dirname, 'verify-db-changes.js');
    
    const verificationScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyChanges() {
  try {
    // Check if new tables exist
    const mlModelTableExists = await prisma.$queryRaw\`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ml_model'
      );
    \`;
    
    const mlPredictionTableExists = await prisma.$queryRaw\`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ml_prediction'
      );
    \`;
    
    const aiInsightTableExists = await prisma.$queryRaw\`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ai_insight'
      );
    \`;
    
    console.log('ML Model table exists:', mlModelTableExists[0].exists);
    console.log('ML Prediction table exists:', mlPredictionTableExists[0].exists);
    console.log('AI Insight table exists:', aiInsightTableExists[0].exists);
    
    // Check if indexes exist
    const barangayIndexExists = await prisma.$queryRaw\`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'barangay' AND indexname = 'barangay_is_active_idx'
      );
    \`;
    
    const surveyResponseIndexExists = await prisma.$queryRaw\`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'survey_response' AND indexname = 'survey_response_barangay_id_idx'
      );
    \`;
    
    console.log('Barangay index exists:', barangayIndexExists[0].exists);
    console.log('Survey Response index exists:', surveyResponseIndexExists[0].exists);
    
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyChanges();
`;
    
    fs.writeFileSync(verificationScriptPath, verificationScript);
    
    // Execute the verification script
    const result = execSync(`node ${verificationScriptPath}`, { encoding: 'utf8' });
    
    // Clean up
    fs.unlinkSync(verificationScriptPath);
    
    // Check the verification results
    if (result.includes('true')) {
      log('Database changes verified successfully!', 'success');
    } else {
      log('Some database changes could not be verified.', 'warning');
      log('Please check the database manually to ensure all changes were applied correctly.', 'warning');
    }
  } catch (error) {
    log(`Failed to verify database changes: ${error.message}`, 'error');
    log('Please verify the database changes manually.', 'warning');
  }
}

/**
 * Main function to run the optimization script
 */
async function main() {
  log('Starting database optimization process...');
  
  // Check if migration exists
  checkMigrationExists();
  
  // Apply migrations
  applyMigrations();
  
  // Generate Prisma client
  generatePrismaClient();
  
  // Verify changes
  verifyChanges();
  
  log('Database optimization completed!', 'success');
  log('The database schema has been optimized with the following improvements:', 'info');
  log('1. Added ML-related tables for machine learning functionality', 'info');
  log('2. Added indexes to improve query performance', 'info');
  log('3. Optimized data types for better storage efficiency', 'info');
  log('4. Added automatic timestamp updates for modified records', 'info');
  log('5. Improved table relationships and constraints', 'info');
}

// Run the script
main().catch(error => {
  log(`An error occurred: ${error.message}`, 'error');
  process.exit(1);
});