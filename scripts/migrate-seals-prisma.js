#!/usr/bin/env node

/**
 * Migrate Seal Data Using Prisma
 * 
 * This script uses Prisma client directly to migrate existing seal data
 * to cycle awards, bypassing RLS issues.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const cycleIdArg = args.find(arg => arg.startsWith('--cycle-id='));
const targetCycleId = cycleIdArg ? parseInt(cycleIdArg.split('=')[1]) : null;

/**
 * Get the active survey cycle
 */
async function getActiveCycle() {
  try {
    const activeCycle = await prisma.surveyCycle.findFirst({
      where: { is_active: true }
    });

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
    const cycle = await prisma.surveyCycle.findUnique({
      where: { cycle_id: cycleId }
    });

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
    const barangays = await prisma.barangay.findMany({
      where: { is_active: true },
      select: {
        barangay_id: true,
        barangay_name: true,
        seal: true
      },
      orderBy: { barangay_name: 'asc' }
    });

    return barangays;
  } catch (error) {
    console.error('Error retrieving barangays:', error);
    throw new Error('Failed to retrieve barangays');
  }
}

/**
 * Get existing cycle awards for the target cycle
 */
async function getExistingCycleAwards(cycleId) {
  try {
    const awards = await prisma.cycleAward.findMany({
      where: { cycle_id: cycleId },
      select: {
        id: true,
        barangay_id: true,
        is_awardee: true
      }
    });

    return awards;
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
    const awardData = {
      barangay_id: barangayId,
      cycle_id: cycleId,
      is_awardee: isAwardee,
      awarded_date: isAwardee ? new Date() : null,
      notes: notes,
      updated_at: new Date()
    };

    // Use upsert to create or update
    const award = await prisma.cycleAward.upsert({
      where: {
        barangay_id_cycle_id: {
          barangay_id: barangayId,
          cycle_id: cycleId
        }
      },
      update: awardData,
      create: {
        ...awardData,
        created_at: new Date()
      }
    });

    return award;
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
  console.log('🔄 Starting seal data migration using Prisma...\n');

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
    if (toMigrate.length > 0 || toUpdate.length > 0) {
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
        await setAwardStatus(
          item.barangay.barangay_id,
          targetCycle.cycle_id,
          item.isAwardee,
          'Migrated from legacy seal system'
        );
        
        created++;
        console.log(`   ✅ Created award for ${item.barangay.barangay_name}: ${item.isAwardee ? 'Awardee' : 'Non-Awardee'}`);
      } catch (error) {
        errors++;
        console.error(`   ❌ Error creating award for ${item.barangay.barangay_name}:`, error.message);
      }
    }

    // Process updates
    for (const item of toUpdate) {
      try {
        await setAwardStatus(
          item.barangay.barangay_id,
          targetCycle.cycle_id,
          item.isAwardee,
          'Updated from legacy seal system'
        );
        
        updated++;
        console.log(`   ✅ Updated award for ${item.barangay.barangay_name}: ${item.currentStatus ? 'Awardee' : 'Non-Awardee'} → ${item.isAwardee ? 'Awardee' : 'Non-Awardee'}`);
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
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Seal Data Migration Script (Prisma Version)

This script migrates existing barangay seal data from the global barangay.seal 
field to the new cycle-aware cycle_awards table using Prisma client.

Usage: node scripts/migrate-seals-prisma.js [options]

Options:
  --dry-run       Show what would be migrated without making changes
  --cycle-id=N    Migrate to specific cycle ID (defaults to active cycle)
  --help          Show this help message

Examples:
  # Dry run to see what would be migrated
  node scripts/migrate-seals-prisma.js --dry-run

  # Migrate to active cycle with confirmation
  node scripts/migrate-seals-prisma.js

  # Migrate to specific cycle
  node scripts/migrate-seals-prisma.js --cycle-id=1

Environment Variables Required:
  DATABASE_URL                  - PostgreSQL database connection string
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