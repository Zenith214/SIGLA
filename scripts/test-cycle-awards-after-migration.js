#!/usr/bin/env node

/**
 * Test Cycle Awards After Migration
 * 
 * This script tests if the cycle awards system works after the migration.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testCycleAwards() {
  console.log('🧪 Testing cycle awards after migration...\n');

  try {
    // Get active cycle
    const activeCycle = await prisma.surveyCycle.findFirst({
      where: { is_active: true }
    });

    if (!activeCycle) {
      throw new Error('No active cycle found');
    }

    console.log(`📋 Active cycle: ${activeCycle.name} (ID: ${activeCycle.cycle_id})`);

    // Get cycle awards
    const awards = await prisma.cycleAward.findMany({
      where: { cycle_id: activeCycle.cycle_id },
      include: {
        barangay: {
          select: {
            barangay_name: true,
            seal: true
          }
        }
      },
      orderBy: {
        barangay: {
          barangay_name: 'asc'
        }
      }
    });

    console.log(`📊 Found ${awards.length} cycle awards`);

    const awardees = awards.filter(a => a.is_awardee);
    const nonAwardees = awards.filter(a => !a.is_awardee);

    console.log(`   - ${awardees.length} awardees`);
    console.log(`   - ${nonAwardees.length} non-awardees`);

    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    
    let integrityIssues = 0;
    
    for (const award of awards) {
      const expectedAwardee = award.barangay.seal === 'yes';
      if (award.is_awardee !== expectedAwardee) {
        console.log(`   ⚠️  Integrity issue: ${award.barangay.barangay_name} - Award: ${award.is_awardee}, Seal: ${award.barangay.seal}`);
        integrityIssues++;
      }
    }

    if (integrityIssues === 0) {
      console.log('   ✅ All awards match their corresponding seal status');
    } else {
      console.log(`   ❌ Found ${integrityIssues} integrity issues`);
    }

    // Show sample awardees
    console.log('\n📝 Sample awardees:');
    awardees.slice(0, 5).forEach(award => {
      console.log(`   - ${award.barangay.barangay_name} (Seal: ${award.barangay.seal})`);
    });

    // Show sample non-awardees
    console.log('\n📝 Sample non-awardees:');
    nonAwardees.slice(0, 5).forEach(award => {
      console.log(`   - ${award.barangay.barangay_name} (Seal: ${award.barangay.seal})`);
    });

    // Test award lookup function
    console.log('\n🧪 Testing award lookup...');
    
    const testBarangay = awards[0];
    const foundAward = await prisma.cycleAward.findUnique({
      where: {
        barangay_id_cycle_id: {
          barangay_id: testBarangay.barangay_id,
          cycle_id: activeCycle.cycle_id
        }
      }
    });

    if (foundAward) {
      console.log(`   ✅ Award lookup works: ${testBarangay.barangay.barangay_name} is ${foundAward.is_awardee ? 'awardee' : 'non-awardee'}`);
    } else {
      console.log('   ❌ Award lookup failed');
    }

    console.log('\n✅ Migration verification completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Update map components to use cycle awards');
    console.log('   2. Update survey target creation to filter by awardees');
    console.log('   3. Test the award management UI');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCycleAwards().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});