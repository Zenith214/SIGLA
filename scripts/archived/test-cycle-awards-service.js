#!/usr/bin/env node

/**
 * Test Cycle Awards Service
 * 
 * This script tests if the CycleAwardsService works and can access the cycle_awards table.
 * If it works, we can proceed with the migration.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simplified version of the service functions
async function getActiveCycleId() {
  try {
    const { data: activeCycle, error } = await supabase
      .from('survey_cycle')
      .select('cycle_id')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return activeCycle?.cycle_id || null;
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw new Error('Failed to retrieve active survey cycle');
  }
}

async function testCycleAwardsAccess() {
  console.log('🧪 Testing cycle_awards table access...\n');

  try {
    // Test basic select with service role
    const { data, error, count } = await supabase
      .from('cycle_awards')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Direct table access failed:', error);
      return false;
    }

    console.log('✅ Direct table access successful');
    console.log(`📊 Found ${count || 0} records in cycle_awards table`);
    
    if (data && data.length > 0) {
      console.log('📝 Sample records:');
      data.forEach((record, index) => {
        console.log(`   ${index + 1}. Barangay ${record.barangay_id}, Cycle ${record.cycle_id}, Awardee: ${record.is_awardee}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testMigrationFunction() {
  console.log('\n🧪 Testing migration function...\n');

  try {
    const activeCycleId = await getActiveCycleId();
    
    if (!activeCycleId) {
      console.log('⚠️  No active cycle found');
      return false;
    }

    console.log(`🎯 Active cycle ID: ${activeCycleId}`);

    // Get barangays with seal data
    const { data: barangays, error } = await supabase
      .from('barangay')
      .select('barangay_id, barangay_name, seal')
      .eq('is_active', true)
      .limit(3);

    if (error) {
      console.error('❌ Error getting barangays:', error);
      return false;
    }

    console.log(`📊 Found ${barangays?.length || 0} barangays to test with`);

    if (barangays && barangays.length > 0) {
      console.log('📝 Sample barangays:');
      barangays.forEach(b => {
        console.log(`   - ${b.barangay_name}: seal=${b.seal}`);
      });

      // Test creating a single award
      const testBarangay = barangays[0];
      const isAwardee = testBarangay.seal === 'yes';

      console.log(`\n🧪 Testing award creation for ${testBarangay.barangay_name}...`);

      const { data: newAward, error: insertError } = await supabase
        .from('cycle_awards')
        .upsert({
          barangay_id: testBarangay.barangay_id,
          cycle_id: activeCycleId,
          is_awardee: isAwardee,
          awarded_date: isAwardee ? new Date().toISOString() : null,
          notes: 'Test migration record',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Test award creation failed:', insertError);
        return false;
      }

      console.log('✅ Test award created successfully');
      console.log(`📝 Award ID: ${newAward.id}, Awardee: ${newAward.is_awardee}`);

      // Clean up test record
      const { error: deleteError } = await supabase
        .from('cycle_awards')
        .delete()
        .eq('id', newAward.id);

      if (deleteError) {
        console.log('⚠️  Could not clean up test record:', deleteError.message);
      } else {
        console.log('🧹 Test record cleaned up');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Migration function test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting cycle awards service test...\n');

  try {
    // Test table access
    const accessOk = await testCycleAwardsAccess();
    
    if (!accessOk) {
      console.log('\n❌ Table access failed. The cycle_awards table may not exist or have permission issues.');
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check if the table exists in your database');
      console.log('   2. Verify RLS policies allow service role access');
      console.log('   3. Run Prisma migration: npx prisma db push');
      return;
    }

    // Test migration functionality
    const migrationOk = await testMigrationFunction();
    
    if (!migrationOk) {
      console.log('\n❌ Migration function test failed.');
      return;
    }

    console.log('\n✅ All tests passed! The cycle awards system is ready.');
    console.log('\n📋 You can now run the seal data migration:');
    console.log('   node scripts/migrate-seal-data-to-cycle-awards.js --dry-run');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});