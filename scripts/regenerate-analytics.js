/**
 * Analytics Regeneration Script
 * 
 * This script regenerates all ML analytics using the new funnel calculation methodology.
 * It queries all survey cycles and barangays, then triggers cache recomputation for each
 * cycle-barangay combination by calling the ML endpoints with forceRefresh=true.
 * 
 * Usage: node scripts/regenerate-analytics.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configuration
const BATCH_SIZE = 15; // Process 15 combinations at a time
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch all survey cycles from the database
 */
async function fetchAllCycles() {
  const { data: cycles, error } = await supabase
    .from('survey_cycle')
    .select('cycle_id, name, year, is_active')
    .order('cycle_id', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch survey cycles: ${error.message}`);
  }

  return cycles || [];
}

/**
 * Fetch all active barangays from the database
 */
async function fetchAllBarangays() {
  const { data: barangays, error } = await supabase
    .from('barangay')
    .select('barangay_id, barangay_name, is_active')
    .eq('is_active', true)
    .order('barangay_id', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch barangays: ${error.message}`);
  }

  return barangays || [];
}

/**
 * Trigger cache recomputation for a specific cycle-barangay combination
 */
async function regenerateAnalytics(cycleId, barangayId, cycleName, barangayName) {
  const startTime = Date.now();
  
  try {
    // Call the funnel analysis endpoint with forceRefresh=true
    const url = `${API_BASE_URL}/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}&refresh=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      cycleId,
      barangayId,
      cycleName,
      barangayName,
      duration,
      cached: data._cache?.cached || false
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      cycleId,
      barangayId,
      cycleName,
      barangayName,
      duration,
      error: error.message
    };
  }
}

/**
 * Process combinations in batches
 */
async function processBatch(combinations, batchNumber, totalBatches) {
  console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${combinations.length} combinations)...`);
  
  const batchStartTime = Date.now();
  const promises = combinations.map(combo => 
    regenerateAnalytics(combo.cycleId, combo.barangayId, combo.cycleName, combo.barangayName)
  );
  
  const results = await Promise.all(promises);
  const batchDuration = Date.now() - batchStartTime;
  
  // Log results for this batch
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Batch ${batchNumber} completed in ${batchDuration}ms`);
  console.log(`   Successful: ${successful}, Failed: ${failed}`);
  
  // Log any failures
  results.filter(r => !r.success).forEach(result => {
    console.log(`   ❌ Failed: Cycle ${result.cycleName} (${result.cycleId}) + Barangay ${result.barangayName} (${result.barangayId})`);
    console.log(`      Error: ${result.error}`);
  });
  
  return results;
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('Analytics Regeneration Script');
  console.log('='.repeat(70));
  console.log();
  console.log('This script will regenerate all ML analytics using the new funnel');
  console.log('calculation methodology by calling ML endpoints with forceRefresh=true.');
  console.log();

  const scriptStartTime = Date.now();

  try {
    // Fetch all cycles and barangays
    console.log('📊 Fetching survey cycles and barangays...');
    
    const [cycles, barangays] = await Promise.all([
      fetchAllCycles(),
      fetchAllBarangays()
    ]);

    console.log(`   Found ${cycles.length} survey cycles`);
    console.log(`   Found ${barangays.length} active barangays`);
    console.log();

    if (cycles.length === 0) {
      console.log('⚠️  No survey cycles found. Nothing to regenerate.');
      return;
    }

    if (barangays.length === 0) {
      console.log('⚠️  No active barangays found. Nothing to regenerate.');
      return;
    }

    // Display cycles
    console.log('Survey Cycles:');
    cycles.forEach(cycle => {
      const status = cycle.is_active ? '(Active)' : '';
      console.log(`   - ${cycle.name} (${cycle.year}) ${status}`);
    });
    console.log();

    // Display barangays (first 10 only if there are many)
    console.log('Barangays:');
    const displayBarangays = barangays.slice(0, 10);
    displayBarangays.forEach(barangay => {
      console.log(`   - ${barangay.barangay_name} (ID: ${barangay.barangay_id})`);
    });
    if (barangays.length > 10) {
      console.log(`   ... and ${barangays.length - 10} more`);
    }
    console.log();

    // Create all cycle-barangay combinations
    const combinations = [];
    for (const cycle of cycles) {
      for (const barangay of barangays) {
        combinations.push({
          cycleId: cycle.cycle_id,
          cycleName: cycle.name,
          barangayId: barangay.barangay_id,
          barangayName: barangay.barangay_name
        });
      }
    }

    const totalCombinations = combinations.length;
    const totalBatches = Math.ceil(totalCombinations / BATCH_SIZE);

    console.log(`🔄 Total combinations to process: ${totalCombinations}`);
    console.log(`📦 Batch size: ${BATCH_SIZE}`);
    console.log(`📦 Total batches: ${totalBatches}`);
    console.log();

    // Process combinations in batches
    const allResults = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalCombinations);
      const batch = combinations.slice(batchStart, batchEnd);
      
      const batchResults = await processBatch(batch, i + 1, totalBatches);
      allResults.push(...batchResults);
      
      // Log progress with timestamps
      const progress = ((i + 1) / totalBatches * 100).toFixed(1);
      const elapsed = ((Date.now() - scriptStartTime) / 1000).toFixed(1);
      console.log(`   Progress: ${progress}% (${i + 1}/${totalBatches} batches, ${elapsed}s elapsed)`);
    }

    // Calculate summary statistics
    const totalDuration = Date.now() - scriptStartTime;
    const successful = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;
    const avgDuration = allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length;

    // Display summary
    console.log();
    console.log('='.repeat(70));
    console.log('📊 Regeneration Summary');
    console.log('='.repeat(70));
    console.log();
    console.log(`Total Combinations Processed: ${totalCombinations}`);
    console.log(`Successful: ${successful} (${(successful / totalCombinations * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed} (${(failed / totalCombinations * 100).toFixed(1)}%)`);
    console.log();
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`Average Duration per Combination: ${avgDuration.toFixed(0)}ms`);
    console.log();

    // Display failed combinations if any
    if (failed > 0) {
      console.log('❌ Failed Combinations:');
      allResults.filter(r => !r.success).forEach(result => {
        console.log(`   - Cycle: ${result.cycleName} (${result.cycleId}), Barangay: ${result.barangayName} (${result.barangayId})`);
        console.log(`     Error: ${result.error}`);
      });
      console.log();
    }

    // Performance check
    if (totalDuration > 300000) { // 300 seconds = 5 minutes
      console.log('⚠️  Warning: Regeneration took longer than 300 seconds.');
      console.log(`   Actual duration: ${(totalDuration / 1000).toFixed(1)}s`);
      console.log('   Consider optimizing the ML endpoints or increasing batch size.');
      console.log();
    } else {
      console.log(`✅ Performance target met: Completed in ${(totalDuration / 1000).toFixed(1)}s (< 300s)`);
      console.log();
    }

    console.log('📝 Next Steps:');
    console.log('   1. Verify that new metrics are being served correctly');
    console.log('   2. Check sample API responses to confirm funnel calculations');
    console.log('   3. Monitor frontend displays for correct metric rendering');
    console.log();

    if (failed > 0) {
      console.log('⚠️  Some combinations failed. Review the errors above and retry if needed.');
      process.exit(1);
    }

  } catch (error) {
    console.error();
    console.error('❌ Error during analytics regeneration:');
    console.error(error);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log();
  console.log('❌ Script interrupted by user.');
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
