#!/usr/bin/env node

/**
 * Migration Script: Migrate Existing Seal Data to Cycle Awards
 * 
 * This script migrates existing barangay seal data from the global barangay.seal field
 * to the new cycle-aware cycle_awards table. It associates existing seals with the
 * currently active survey cycle while preserving historical seal information.
 * 
 * Usage: node scripts/migrate-seal-data-to-cycle-awards.js [--dry-run] [--cycle-id=N]
 * 
 * Options:
 *   --dry-run     Show what would be migrated without making changes
 *   --cycle-id=N  Migrate to specific cycle ID (defaults to active cycle)
 *   --force       Skip confirmation prompts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForced = args.includes('--force');
const cycleIdArg = args.find(arg => arg.startsWith('--cycle-id='));
const targetCycleId = cycleIdArg ? parseInt(cycleIdArg.split('=')[1]) : null;

/**
 * Get the active survey cycle
 */
async function getActiveCycle() {
  try {
    const { data: activeCycle, error } = await supabase
      .from('survey_cycle')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return activeCycle;
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw new Error('Failed to retrieve active survey cycle');
  }
}

/**
 * Get a specific survey cycle by ID
 */
async function getSurveyCycleById(cycleId) {
  try {
    const { data: cycle, error } = await supabase
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', cycleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return cycle;
  } catch (error) {
    console.error('Error retrieving survey cycle:', error);
    throw new Error('Failed to retrieve survey cycle');
  }
}

/**
 * Get all barangays with their current seal status
 */
async function getBarangaysWithSeals() {
  try {
    const { data: barangays, error } = await supabase
      .from('barangay')
      .select('barangay_id, barangay_name, seal, is_active')
      .eq('is_active', true)
      .order('barangay_name');

    if (error) {
      throw error;
    }

    return barangays || [];
  } catch (error) {
    console.error('Error retrieving barangays:', error);
    throw new Error('Failed to retrieve barangays');
  }
}

/**
 * Check existing cycle awards for the target cycle
 */
async function getExistingCycleAwards(cycleId) {
  try {
    const { data: awards, error } = await supabase
      .from('cycle_awards')
      .select('barangay_id, is_awardee')
      .eq('cycle_id', cycleId);

    if (error) {
      throw error;
    }

    return awards || [];
  } catch (error) {
    console.error('Error retrieving existing cycle awards:', error);
    throw new Error('Failed to retrieve existing cycle awards');
  }
}

/**
 * Create or update a cycle award
 */
async function setAwardStatus(barangayId, cycleId, isAwardee, notes) {
  try {
    // Check if award already exists
    const { data: existingAward } = await supabase
      .from('cycle_awards')
      .select('*')
      .eq('barangay_id', barangayId)
      .eq('cycle_id', cycleId)
      .single();

    const awardData = {
      barangay_id: barangayId,
      cycle_id: cycleId,
      is_awardee: isAwardee,
      awarded_date: isAwardee ? new Date().toISOString() : null,
      notes: notes,
      updated_at: new Date().toISOString()
    };

    if (existingAward) {
      // Update existing award
      const { data: updatedAward, error } = await supabase
        .from('cycle_awards')
        .update(awardData)
        .eq('id', existingAward.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { action: 'updated', award: updatedAward };
    } else {
      // Create new award
      const { data: newAward, error } = await supabase
        .from('cycle_awards')
        .insert({
          ...awardData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { action: 'created', award: newAward };
    }
  } catch (error) {
    console.error('Error setting award status:', error);
    throw new Error('Failed to set award status');
  }
}

/**
 * Prompt for user confirmation
 */
function promptConfirmation(message) {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Main migration function
 */
async function migrateSealData() {
  console.log('🔄 Starting seal data migration to cycle awards...\n');

  try {
    // Determine target cycle
    let targetCycle;
    if (targetCycleId) {
      targetCycle = await getSurveyCycleById(targetCycleId);
      if (!targetCycle) {
        throw new Error(`Cycle with ID ${targetCycleId} not found`);
      }
      console.log(`📋 Using specified cycle: ${targetCycle.name} (${targetCycle.year})`);
    } else {
      targetCycle = await getActiveCycle();
      if (!targetCycle) {
        throw new Error('No active cycle found and no cycle ID specified');
      }
      console.log(`📋 Using active cycle: ${targetCycle.name} (${targetCycle.year})`);
    }

    // Get barangays with seal data
    const barangays = await getBarangaysWithSeals();
    console.log(`📊 Found ${barangays.length} active barangays`);

    // Analyze current seal distribution
    const sealedBarangays = barangays.filter(b => b.seal === 'yes');
    const unsealedBarangays = barangays.filter(b => b.seal === 'no');
    
    console.log(`   - ${sealedBarangays.length} barangays with seals (will become awardees)`);
    console.log(`   - ${unsealedBarangays.length} barangays without seals (will become non-awardees)`);

    // Check existing cycle awards
    const existingAwards = await getExistingCycleAwards(targetCycle.cycle_id);
    const existingAwardMap = new Map(existingAwards.map(a => [a.barangay_id, a.is_awardee]));
    
    console.log(`📋 Found ${existingAwards.length} existing awards for this cycle`);

    // Analyze what will be migrated
    const toMigrate = [];
    const toUpdate = [];
    const toSkip = [];

    for (const barangay of barangays) {
      const isAwardee = barangay.seal === 'yes';
      const existingStatus = existingAwardMap.get(barangay.barangay_id);

      if (existingStatus === undefined) {
        // No existing award - will create new
        toMigrate.push({
          barangay,
          isAwardee,
          action: 'create'
        });
      } else if (existingStatus !== isAwardee) {
        // Existing award with different status - will update
        toUpdate.push({
          barangay,
          isAwardee,
          currentStatus: existingStatus,
          action: 'update'
        });
      } else {
        // Existing award with same status - will skip
        toSkip.push({
          barangay,
          isAwardee,
          action: 'skip'
        });
      }
    }

    console.log(`\n📈 Migration Analysis:`);
    console.log(`   - ${toMigrate.length} new awards to create`);
    console.log(`   - ${toUpdate.length} existing awards to update`);
    console.log(`   - ${toSkip.length} awards to skip (already correct)`);

    if (isDryRun) {
      console.log('\n🔍 DRY RUN - No changes will be made\n');
      
      if (toMigrate.length > 0) {
        console.log('New awards to create:');
        toMigrate.forEach(item => {
          console.log(`   - ${item.barangay.barangay_name}: ${item.isAwardee ? 'Awardee' : 'Non-Awardee'}`);
        });
      }

      if (toUpdate.length > 0) {
        console.log('\nAwards to update:');
        toUpdate.forEach(item => {
          console.log(`   - ${item.barangay.barangay_name}: ${item.currentStatus ? 'Awardee' : 'Non-Awardee'} → ${item.isAwardee ? 'Awardee' : 'Non-Awardee'}`);
        });
      }

      console.log('\n✅ Dry run completed. Use without --dry-run to perform actual migration.');
      return;
    }

    // Confirm migration if not forced
    if (!isForced && (toMigrate.length > 0 || toUpdate.length > 0)) {
      const totalChanges = toMigrate.length + toUpdate.length;
      const confirmed = await promptConfirmation(
        `\n⚠️  This will make ${totalChanges} changes to the cycle_awards table. Continue?`
      );
      
      if (!confirmed) {
        console.log('❌ Migration cancelled by user.');
        return;
      }
    }

    // Perform migration
    console.log('\n🚀 Starting migration...');
    
    let created = 0;
    let updated = 0;
    let errors = 0;

    // Process new awards
    for (const item of toMigrate) {
      try {
        const result = await setAwardStatus(
          item.barangay.barangay_id,
          targetCycle.cycle_id,
          item.isAwardee,
          'Migrated from legacy seal system'
        );
        
        if (result.action === 'created') {
          created++;
          console.log(`   ✅ Created award for ${item.barangay.barangay_name}: ${item.isAwardee ? 'Awardee' : 'Non-Awardee'}`);
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Error creating award for ${item.barangay.barangay_name}:`, error.message);
      }
    }

    // Process updates
    for (const item of toUpdate) {
      try {
        const result = await setAwardStatus(
          item.barangay.barangay_id,
          targetCycle.cycle_id,
          item.isAwardee,
          'Updated from legacy seal system'
        );
        
        if (result.action === 'updated') {
          updated++;
          console.log(`   ✅ Updated award for ${item.barangay.barangay_name}: ${item.currentStatus ? 'Awardee' : 'Non-Awardee'} → ${item.isAwardee ? 'Awardee' : 'Non-Awardee'}`);
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Error updating award for ${item.barangay.barangay_name}:`, error.message);
      }
    }

    // Summary
    console.log(`\n📊 Migration Summary:`);
    console.log(`   - ${created} awards created`);
    console.log(`   - ${updated} awards updated`);
    console.log(`   - ${toSkip.length} awards skipped (already correct)`);
    console.log(`   - ${errors} errors encountered`);

    if (errors === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the error messages above.');
    }

    // Final verification
    const finalAwards = await getExistingCycleAwards(targetCycle.cycle_id);
    const finalAwardees = finalAwards.filter(a => a.is_awardee).length;
    const finalNonAwardees = finalAwards.filter(a => !a.is_awardee).length;
    
    console.log(`\n📈 Final State:`);
    console.log(`   - Total awards in cycle: ${finalAwards.length}`);
    console.log(`   - Awardees: ${finalAwardees}`);
    console.log(`   - Non-awardees: ${finalNonAwardees}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Seal Data Migration Script

This script migrates existing barangay seal data from the global barangay.seal 
field to the new cycle-aware cycle_awards table.

Usage: node scripts/migrate-seal-data-to-cycle-awards.js [options]

Options:
  --dry-run       Show what would be migrated without making changes
  --cycle-id=N    Migrate to specific cycle ID (defaults to active cycle)
  --force         Skip confirmation prompts
  --help          Show this help message

Examples:
  # Dry run to see what would be migrated
  node scripts/migrate-seal-data-to-cycle-awards.js --dry-run

  # Migrate to active cycle with confirmation
  node scripts/migrate-seal-data-to-cycle-awards.js

  # Migrate to specific cycle without confirmation
  node scripts/migrate-seal-data-to-cycle-awards.js --cycle-id=1 --force

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      - Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     - Supabase service role key
`);
}

// Main execution
if (args.includes('--help')) {
  showHelp();
} else {
  migrateSealData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}