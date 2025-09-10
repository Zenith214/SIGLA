/**
 * Test ML Database Integration
 * 
 * This script tests the integration between the ML pipeline and the database.
 * It verifies that the ML-related tables are properly set up and can be accessed.
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

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
 * Test database connection
 */
async function testDatabaseConnection() {
  try {
    log('Testing database connection...');
    await prisma.$connect();
    log('Database connection successful!', 'success');
    return true;
  } catch (error) {
    log(`Database connection failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Test ML tables existence
 */
async function testMLTablesExistence() {
  try {
    log('Testing ML tables existence...');
    
    const tables = [
      'ml_model',
      'ml_prediction',
      'action_grid_classification',
      'ai_insight',
      'ai_recommendation'
    ];
    
    const results = {};
    
    for (const table of tables) {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        );
      `;
      
      results[table] = result[0].exists;
      
      if (result[0].exists) {
        log(`Table '${table}' exists!`, 'success');
      } else {
        log(`Table '${table}' does not exist!`, 'error');
      }
    }
    
    return results;
  } catch (error) {
    log(`Failed to test ML tables existence: ${error.message}`, 'error');
    return {};
  }
}

/**
 * Test ML Python integration
 */
async function testMLPythonIntegration() {
  try {
    log('Testing ML Python integration...');
    
    // Create a temporary test script
    const testScriptPath = path.join(__dirname, 'temp-ml-test.py');
    
    const testScript = `
import os
import sys
import json
from dotenv import load_dotenv

# Add the ML module to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml.sigla_ml.api import SiglaMLAPI
from ml.sigla_ml.data_extraction import DataExtractor

def main():
    try:
        # Test database connection
        print("Testing database connection...")
        data_extractor = DataExtractor()
        supabase = data_extractor._get_connection()
        print("Database connection successful!")
        
        # Test table access
        print("Testing table access...")
        response = supabase.table('ml_model').select('*').limit(1).execute()
        print(f"ML model table access: {'success' if response is not None else 'failed'}")
        
        response = supabase.table('ml_prediction').select('*').limit(1).execute()
        print(f"ML prediction table access: {'success' if response is not None else 'failed'}")
        
        response = supabase.table('action_grid_classification').select('*').limit(1).execute()
        print(f"Action grid classification table access: {'success' if response is not None else 'failed'}")
        
        response = supabase.table('ai_insight').select('*').limit(1).execute()
        print(f"AI insight table access: {'success' if response is not None else 'failed'}")
        
        response = supabase.table('ai_recommendation').select('*').limit(1).execute()
        print(f"AI recommendation table access: {'success' if response is not None else 'failed'}")
        
        print("All tests completed successfully!")
        return 0
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1

if __name__ == "__main__":
    load_dotenv()
    sys.exit(main())
`;
    
    fs.writeFileSync(testScriptPath, testScript);
    
    // Execute the test script
    log('Executing Python test script...');
    const result = execSync(`python ${testScriptPath}`, { encoding: 'utf8' });
    
    // Clean up
    fs.unlinkSync(testScriptPath);
    
    // Parse the results
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.includes('successful') || line.includes('success')) {
        log(line, 'success');
      } else if (line.includes('failed') || line.includes('Error')) {
        log(line, 'error');
      } else if (line.trim()) {
        log(line, 'info');
      }
    }
    
    return !result.includes('Error');
  } catch (error) {
    log(`Failed to test ML Python integration: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log('Starting ML database integration test...');
  
  // Test database connection
  const connectionSuccess = await testDatabaseConnection();
  if (!connectionSuccess) {
    log('Database connection test failed. Aborting further tests.', 'error');
    return;
  }
  
  // Test ML tables existence
  const tablesExist = await testMLTablesExistence();
  const allTablesExist = Object.values(tablesExist).every(exists => exists);
  
  if (!allTablesExist) {
    log('Some ML tables do not exist. Please run the database migration first.', 'warning');
    log('You can run the migration with: node scripts/apply-db-optimizations.js', 'info');
    return;
  }
  
  // Test ML Python integration
  const pythonIntegrationSuccess = await testMLPythonIntegration();
  if (!pythonIntegrationSuccess) {
    log('ML Python integration test failed.', 'error');
    return;
  }
  
  log('All tests completed successfully!', 'success');
  log('The ML pipeline is properly integrated with the database.', 'success');
}

// Run the main function
main()
  .catch(error => {
    log(`An error occurred: ${error.message}`, 'error');
  })
  .finally(async () => {
    await prisma.$disconnect();
  });