#!/usr/bin/env node

/**
 * Check if cycle_awards table exists and has proper permissions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCycleAwardsTable() {
  console.log('🔍 Checking cycle_awards table...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('cycle_awards')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing cycle_awards table:', error);
      
      if (error.code === '42501') {
        console.log('\n💡 This appears to be a permission issue.');
        console.log('   The table might exist but lack proper RLS policies.');
      } else if (error.code === '42P01') {
        console.log('\n💡 The cycle_awards table does not exist.');
        console.log('   You need to run the migration script first.');
      }
      
      return false;
    }

    console.log('✅ cycle_awards table is accessible');
    console.log(`📊 Found ${data?.length || 0} records in the table`);
    
    if (data && data.length > 0) {
      console.log('📝 Sample record:', data[0]);
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function checkSurveyCycles() {
  console.log('\n🔍 Checking survey_cycle table...\n');

  try {
    const { data: cycles, error } = await supabase
      .from('survey_cycle')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error accessing survey_cycle table:', error);
      return false;
    }

    console.log('✅ survey_cycle table is accessible');
    console.log(`📊 Found ${cycles?.length || 0} cycles`);
    
    if (cycles && cycles.length > 0) {
      console.log('\n📋 Available cycles:');
      cycles.forEach(cycle => {
        console.log(`   - ${cycle.name} (${cycle.year}) ${cycle.is_active ? '[ACTIVE]' : ''}`);
      });
      
      const activeCycle = cycles.find(c => c.is_active);
      if (activeCycle) {
        console.log(`\n🎯 Active cycle: ${activeCycle.name} (ID: ${activeCycle.cycle_id})`);
      } else {
        console.log('\n⚠️  No active cycle found');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function checkBarangays() {
  console.log('\n🔍 Checking barangay table for seal data...\n');

  try {
    const { data: barangays, error } = await supabase
      .from('barangay')
      .select('barangay_id, barangay_name, seal, is_active')
      .eq('is_active', true)
      .order('barangay_name');

    if (error) {
      console.error('❌ Error accessing barangay table:', error);
      return false;
    }

    console.log('✅ barangay table is accessible');
    console.log(`📊 Found ${barangays?.length || 0} active barangays`);
    
    if (barangays && barangays.length > 0) {
      const sealedCount = barangays.filter(b => b.seal === 'yes').length;
      const unsealedCount = barangays.filter(b => b.seal === 'no').length;
      
      console.log(`   - ${sealedCount} barangays with seals`);
      console.log(`   - ${unsealedCount} barangays without seals`);
      
      console.log('\n📝 Sample barangays with seals:');
      barangays
        .filter(b => b.seal === 'yes')
        .slice(0, 5)
        .forEach(b => {
          console.log(`   - ${b.barangay_name} (ID: ${b.barangay_id})`);
        });
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting cycle awards table diagnostic...\n');

  const cycleAwardsOk = await checkCycleAwardsTable();
  const surveyCyclesOk = await checkSurveyCycles();
  const barangaysOk = await checkBarangays();

  console.log('\n📊 Summary:');
  console.log(`   - cycle_awards table: ${cycleAwardsOk ? '✅ OK' : '❌ ISSUE'}`);
  console.log(`   - survey_cycle table: ${surveyCyclesOk ? '✅ OK' : '❌ ISSUE'}`);
  console.log(`   - barangay table: ${barangaysOk ? '✅ OK' : '❌ ISSUE'}`);

  if (!cycleAwardsOk) {
    console.log('\n💡 Recommendations:');
    console.log('   1. Run the cycle-awards migration SQL to create the table');
    console.log('   2. Check RLS policies for the cycle_awards table');
    console.log('   3. Ensure service role has proper permissions');
  }

  if (cycleAwardsOk && surveyCyclesOk && barangaysOk) {
    console.log('\n✅ All tables are accessible. Migration can proceed.');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});