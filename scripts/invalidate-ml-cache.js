/**
 * ML Cache Invalidation Script
 * 
 * This script clears all existing ML cache entries to ensure that
 * the new funnel calculation methodology is applied to all analytics.
 * 
 * Usage: node scripts/invalidate-ml-cache.js
 */

const readline = require('readline');
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

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const { data: stats, error } = await supabase
    .from('ml_cache')
    .select('endpoint, hit_count, is_stale, computed_at, expires_at');

  if (error) {
    console.error('Error fetching cache stats:', error);
    return null;
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  const now = new Date();
  const totalEntries = stats.length;
  const staleEntries = stats.filter(s => s.is_stale || new Date(s.expires_at) < now).length;
  const freshEntries = totalEntries - staleEntries;
  const totalHits = stats.reduce((sum, s) => sum + (s.hit_count || 0), 0);
  const avgHitsPerEntry = totalEntries > 0 ? totalHits / totalEntries : 0;

  const byEndpoint = stats.reduce((acc, s) => {
    if (!acc[s.endpoint]) {
      acc[s.endpoint] = { count: 0, hits: 0 };
    }
    acc[s.endpoint].count++;
    acc[s.endpoint].hits += s.hit_count || 0;
    return acc;
  }, {});

  return {
    totalEntries,
    freshEntries,
    staleEntries,
    totalHits,
    avgHitsPerEntry,
    byEndpoint
  };
}

/**
 * Invalidate all cache entries
 */
async function invalidateAllCache() {
  const { error, count } = await supabase
    .from('ml_cache')
    .delete()
    .neq('id', 0); // Delete all rows (using a condition that's always true)

  if (error) {
    throw new Error(`Failed to invalidate cache: ${error.message}`);
  }

  return count;
}

/**
 * Prompt user for confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('ML Cache Invalidation Script');
  console.log('='.repeat(60));
  console.log();

  try {
    // Get current cache statistics
    console.log('📊 Fetching current cache statistics...');
    const stats = await getCacheStats();

    if (!stats || stats.totalEntries === 0) {
      console.log('✅ Cache is already empty. No entries to clear.');
      rl.close();
      return;
    }

    // Display cache statistics
    console.log();
    console.log('Current Cache Status:');
    console.log(`  Total Entries: ${stats.totalEntries}`);
    console.log(`  Fresh Entries: ${stats.freshEntries}`);
    console.log(`  Stale Entries: ${stats.staleEntries}`);
    console.log(`  Total Hits: ${stats.totalHits}`);
    console.log(`  Avg Hits/Entry: ${stats.avgHitsPerEntry.toFixed(2)}`);
    console.log();

    // Display breakdown by endpoint
    if (stats.byEndpoint && Object.keys(stats.byEndpoint).length > 0) {
      console.log('Breakdown by Endpoint:');
      Object.entries(stats.byEndpoint).forEach(([endpoint, data]) => {
        console.log(`  ${endpoint}: ${data.count} entries, ${data.hits} hits`);
      });
      console.log();
    }

    // Ask for confirmation
    console.log('⚠️  WARNING: This will delete ALL ML cache entries.');
    console.log('   After deletion, analytics will need to be regenerated.');
    console.log();

    const answer = await askConfirmation('Do you want to proceed? (yes/no): ');

    if (answer !== 'yes' && answer !== 'y') {
      console.log();
      console.log('❌ Cache invalidation cancelled by user.');
      rl.close();
      return;
    }

    // Proceed with cache invalidation
    console.log();
    console.log('🗑️  Clearing all ML cache entries...');

    const startTime = Date.now();
    await invalidateAllCache();
    const duration = Date.now() - startTime;

    console.log();
    console.log('✅ Cache invalidation completed successfully!');
    console.log(`   Cleared ${stats.totalEntries} entries in ${duration}ms`);
    console.log();

    // Verify cache is empty
    console.log('🔍 Verifying cache is empty...');
    const verifyStats = await getCacheStats();

    if (!verifyStats || verifyStats.totalEntries === 0) {
      console.log('✅ Verification successful: Cache is empty.');
    } else {
      console.log(`⚠️  Warning: ${verifyStats.totalEntries} entries still remain in cache.`);
    }

    console.log();
    console.log('📝 Next Steps:');
    console.log('   1. Run the analytics regeneration script to recalculate all metrics');
    console.log('   2. Monitor logs for any errors during regeneration');
    console.log('   3. Verify that new metrics are being served correctly');
    console.log();

  } catch (error) {
    console.error();
    console.error('❌ Error during cache invalidation:');
    console.error(error);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log();
  console.log('❌ Script interrupted by user.');
  rl.close();
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
