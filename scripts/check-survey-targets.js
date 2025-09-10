/**
 * Survey Target Completion Checker
 * 
 * This script checks for completed survey targets and triggers the ML analysis process.
 * It should be run as a scheduled task (e.g., using cron or Windows Task Scheduler).
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkSurveyTargetCompletion() {
  console.log('🔍 Checking for completed survey targets...');
  
  try {
    // Determine the base URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Call the API endpoint to check for completed targets and trigger analysis
    const response = await fetch(`${baseUrl}/api/ml/analyze-target-completion`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.analyzed > 0) {
      console.log(`✅ Successfully analyzed ${result.analyzed} completed survey targets`);
      
      // Log details for each analyzed barangay
      result.results.forEach(barangay => {
        if (barangay.success) {
          console.log(`   - ${barangay.barangay_name} (ID: ${barangay.barangay_id}): Analysis successful`);
        } else {
          console.log(`   - ${barangay.barangay_name} (ID: ${barangay.barangay_id}): Analysis failed - ${barangay.error}`);
        }
      });
    } else {
      console.log('ℹ️ No newly completed survey targets found');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error checking survey target completion:', error);
    return { error: error.message };
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  checkSurveyTargetCompletion()
    .then(result => {
      if (!result.error) {
        console.log('🎉 Survey target check completed successfully!');
      } else {
        console.error('❌ Survey target check failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { checkSurveyTargetCompletion };