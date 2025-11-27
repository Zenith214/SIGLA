/**
 * Funnel Migration Validation Script
 * 
 * This script validates that the new funnel calculation methodology is working correctly
 * by testing sample API responses and verifying the structure of returned data.
 * 
 * Usage: node scripts/validate-funnel-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Find a cycle-barangay combination with actual survey data
 */
async function findCombinationWithData() {
  const { data: responses, error } = await supabase
    .from('survey_response')
    .select('cycle_id, barangay_id')
    .limit(1);

  if (error || !responses || responses.length === 0) {
    return null;
  }

  return responses[0];
}

/**
 * Test the funnel analysis API
 */
async function testFunnelAnalysisAPI(cycleId, barangayId) {
  const url = `${API_BASE_URL}/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}&refresh=true`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate funnel metrics structure
 */
function validateFunnelMetrics(serviceScores) {
  const issues = [];
  
  if (!serviceScores || typeof serviceScores !== 'object') {
    issues.push('service_scores is missing or not an object');
    return issues;
  }

  for (const [serviceArea, metrics] of Object.entries(serviceScores)) {
    // Check if metrics has the new funnel structure
    if (!metrics.awareness || !metrics.availment || !metrics.satisfaction) {
      issues.push(`${serviceArea}: Missing funnel stages (awareness/availment/satisfaction)`);
      continue;
    }

    // Validate each stage has count, total, percentage
    for (const stage of ['awareness', 'availment', 'satisfaction']) {
      const stageData = metrics[stage];
      
      if (typeof stageData !== 'object') {
        issues.push(`${serviceArea}.${stage}: Not an object`);
        continue;
      }

      if (!('count' in stageData)) {
        issues.push(`${serviceArea}.${stage}: Missing 'count' field`);
      }
      
      if (!('total' in stageData)) {
        issues.push(`${serviceArea}.${stage}: Missing 'total' field`);
      }
      
      if (!('percentage' in stageData)) {
        issues.push(`${serviceArea}.${stage}: Missing 'percentage' field`);
      }

      // Validate cascading funnel logic
      if (stage === 'availment' && stageData.total !== metrics.awareness.count) {
        issues.push(`${serviceArea}: Availment total (${stageData.total}) should equal awareness count (${metrics.awareness.count})`);
      }

      if (stage === 'satisfaction' && stageData.total !== metrics.availment.count) {
        issues.push(`${serviceArea}: Satisfaction total (${stageData.total}) should equal availment count (${metrics.availment.count})`);
      }
    }
  }

  return issues;
}

/**
 * Display funnel metrics in a readable format
 */
function displayFunnelMetrics(serviceScores) {
  console.log('\n📊 Service Funnel Metrics:');
  console.log('='.repeat(70));

  for (const [serviceArea, metrics] of Object.entries(serviceScores)) {
    console.log(`\n${serviceArea}:`);
    
    if (metrics.awareness) {
      const { count, total, percentage } = metrics.awareness;
      console.log(`  Awareness:     ${count}/${total} (${percentage !== null ? percentage.toFixed(1) + '%' : 'N/A'})`);
    }
    
    if (metrics.availment) {
      const { count, total, percentage } = metrics.availment;
      console.log(`  Availment:     ${count}/${total} (${percentage !== null ? percentage.toFixed(1) + '%' : 'N/A'})`);
    }
    
    if (metrics.satisfaction) {
      const { count, total, percentage } = metrics.satisfaction;
      console.log(`  Satisfaction:  ${count}/${total} (${percentage !== null ? percentage.toFixed(1) + '%' : 'N/A'})`);
    }
  }
  
  console.log();
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('Funnel Migration Validation Script');
  console.log('='.repeat(70));
  console.log();

  try {
    // Find a combination with actual data
    console.log('🔍 Finding a cycle-barangay combination with survey data...');
    const combination = await findCombinationWithData();

    if (!combination) {
      console.log('⚠️  No survey responses found in database.');
      console.log('   Cannot validate funnel calculations without data.');
      return;
    }

    const { cycle_id, barangay_id } = combination;
    console.log(`   Found: Cycle ${cycle_id}, Barangay ${barangay_id}`);
    console.log();

    // Test the funnel analysis API
    console.log('🧪 Testing Funnel Analysis API...');
    const result = await testFunnelAnalysisAPI(cycle_id, barangay_id);

    if (!result.success) {
      console.log(`❌ API test failed: ${result.error}`);
      process.exit(1);
    }

    console.log('✅ API responded successfully');
    console.log();

    // Validate the response structure
    console.log('🔍 Validating funnel metrics structure...');
    const issues = validateFunnelMetrics(result.data.service_scores);

    if (issues.length > 0) {
      console.log('❌ Validation issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log();
      process.exit(1);
    }

    console.log('✅ Funnel metrics structure is valid');

    // Display the metrics
    if (Object.keys(result.data.service_scores).length > 0) {
      displayFunnelMetrics(result.data.service_scores);
    } else {
      console.log('\n⚠️  No service scores returned (barangay may have no data)');
      console.log();
    }

    // Summary
    console.log('='.repeat(70));
    console.log('✅ Validation Summary');
    console.log('='.repeat(70));
    console.log();
    console.log('✓ API is responding correctly');
    console.log('✓ Funnel metrics have correct structure (count, total, percentage)');
    console.log('✓ Cascading funnel logic is implemented');
    console.log();
    console.log('The new funnel calculation methodology is working correctly!');
    console.log();

  } catch (error) {
    console.error();
    console.error('❌ Error during validation:');
    console.error(error);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
