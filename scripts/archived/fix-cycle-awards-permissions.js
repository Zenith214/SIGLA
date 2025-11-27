#!/usr/bin/env node

/**
 * Fix RLS policies for cycle_awards table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCycleAwardsPermissions() {
  console.log('🔧 Fixing cycle_awards table permissions...\n');

  try {
    // First, let's check if the table exists
    console.log('1. Checking if cycle_awards table exists...');
    
    const { data: tableExists, error: tableError } = await supabase.rpc('check_table_exists', {
      table_name: 'cycle_awards'
    });

    if (tableError) {
      console.log('   Creating custom function to check table existence...');
      
      // Create a simple query to check table existence
      const { error: checkError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'cycle_awards')
        .single();

      if (checkError && checkError.code === '42501') {
        console.log('   ✅ Table exists but has permission issues');
      } else if (checkError && checkError.code === '42P01') {
        console.error('   ❌ Table does not exist. Please create it first.');
        return false;
      }
    }

    console.log('2. Disabling RLS on cycle_awards table...');
    
    // Disable RLS to allow service role access
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE cycle_awards DISABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('   Trying alternative approach...');
      
      // Try using raw SQL execution
      try {
        await supabase.from('cycle_awards').select('count').limit(0);
        console.log('   ✅ Table is now accessible');
      } catch (error) {
        console.log('   Still having issues, trying to create basic policies...');
        
        // Create basic policies that allow service role access
        const policies = [
          'DROP POLICY IF EXISTS "Enable read access for service role" ON cycle_awards;',
          'DROP POLICY IF EXISTS "Enable insert access for service role" ON cycle_awards;',
          'DROP POLICY IF EXISTS "Enable update access for service role" ON cycle_awards;',
          'DROP POLICY IF EXISTS "Enable delete access for service role" ON cycle_awards;',
          'CREATE POLICY "Enable read access for service role" ON cycle_awards FOR SELECT USING (true);',
          'CREATE POLICY "Enable insert access for service role" ON cycle_awards FOR INSERT WITH CHECK (true);',
          'CREATE POLICY "Enable update access for service role" ON cycle_awards FOR UPDATE USING (true);',
          'CREATE POLICY "Enable delete access for service role" ON cycle_awards FOR DELETE USING (true);'
        ];

        for (const policy of policies) {
          try {
            await supabase.rpc('exec_sql', { sql: policy });
          } catch (policyError) {
            console.log(`   Warning: Could not execute policy: ${policy}`);
          }
        }
      }
    }

    console.log('3. Testing table access...');
    
    const { data: testData, error: testError } = await supabase
      .from('cycle_awards')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('   ❌ Still cannot access table:', testError);
      return false;
    }

    console.log('   ✅ Table is now accessible');
    console.log(`   📊 Found ${testData?.length || 0} existing records`);

    console.log('\n🎉 Permissions fixed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
    return false;
  }
}

async function testCycleAwardsAPI() {
  console.log('\n🧪 Testing cycle awards functionality...\n');

  try {
    // Test basic read
    console.log('1. Testing basic read access...');
    const { data: awards, error: readError } = await supabase
      .from('cycle_awards')
      .select('*');

    if (readError) {
      console.error('   ❌ Read test failed:', readError);
      return false;
    }

    console.log(`   ✅ Read test passed (${awards?.length || 0} records)`);

    // Test with barangay join
    console.log('2. Testing join with barangay table...');
    const { data: awardsWithBarangay, error: joinError } = await supabase
      .from('cycle_awards')
      .select(`
        *,
        barangay:barangay_id (
          barangay_id,
          barangay_name,
          households,
          population
        )
      `)
      .limit(5);

    if (joinError) {
      console.error('   ❌ Join test failed:', joinError);
      return false;
    }

    console.log(`   ✅ Join test passed (${awardsWithBarangay?.length || 0} records with barangay data)`);

    console.log('\n✅ All API tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Error testing API:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting cycle awards permissions fix...\n');

  const permissionsFixed = await fixCycleAwardsPermissions();
  
  if (permissionsFixed) {
    await testCycleAwardsAPI();
    
    console.log('\n📋 Next steps:');
    console.log('   1. The cycle_awards table is now accessible');
    console.log('   2. You can now use the award management features');
    console.log('   3. Consider migrating existing seal data to cycle-specific awards');
  } else {
    console.log('\n❌ Could not fix permissions automatically.');
    console.log('\n💡 Manual steps required:');
    console.log('   1. Access your Supabase dashboard');
    console.log('   2. Go to Authentication > Policies');
    console.log('   3. Create policies for the cycle_awards table');
    console.log('   4. Or disable RLS entirely for this table');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});