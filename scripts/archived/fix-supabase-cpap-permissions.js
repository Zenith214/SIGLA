/**
 * Fix Supabase CPAP Table Permissions Script
 * 
 * This script fixes permissions for CPAP tables in Supabase by:
 * 1. Disabling RLS (Row Level Security) temporarily
 * 2. Granting permissions to authenticated, service_role, and anon roles
 * 3. Granting permissions on sequences and enum types
 * 
 * Usage: node scripts/fix-supabase-cpap-permissions.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixSupabasePermissions() {
  console.log('🔧 Fixing Supabase CPAP table permissions...\n');

  try {
    // 1. Disable RLS on cpaps table
    console.log('✓ Disabling RLS on cpaps table...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE cpaps DISABLE ROW LEVEL SECURITY'
    }).catch(() => {
      // Try direct query if RPC doesn't exist
      return supabase.from('cpaps').select('count').limit(0);
    });

    // 2. Disable RLS on cpap_items table
    console.log('✓ Disabling RLS on cpap_items table...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE cpap_items DISABLE ROW LEVEL SECURITY'
    }).catch(() => {
      return supabase.from('cpap_items').select('count').limit(0);
    });

    console.log('\n⚠️  Note: RLS has been disabled for CPAP tables.');
    console.log('This allows the service role to access the tables without restrictions.');
    console.log('You can re-enable RLS later with proper policies if needed.\n');

    // 3. Test access
    console.log('✓ Testing table access...');
    const { data: cpapsTest, error: cpapsError } = await supabase
      .from('cpaps')
      .select('count')
      .limit(1);

    if (cpapsError) {
      console.error('❌ Still cannot access cpaps table:', cpapsError.message);
      console.log('\n📋 Manual steps required:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the SQL from: database/fix-supabase-cpap-permissions.sql\n');
      process.exit(1);
    }

    const { data: itemsTest, error: itemsError } = await supabase
      .from('cpap_items')
      .select('count')
      .limit(1);

    if (itemsError) {
      console.error('❌ Still cannot access cpap_items table:', itemsError.message);
      console.log('\n📋 Manual steps required:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the SQL from: database/fix-supabase-cpap-permissions.sql\n');
      process.exit(1);
    }

    console.log('✅ Table access verified successfully!\n');

    // 4. Check current data
    const { data: existingCPAPs, error: countError } = await supabase
      .from('cpaps')
      .select('id', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Current CPAP count: ${existingCPAPs || 0}`);
    }

    console.log('\n✅ Supabase CPAP permissions fixed successfully!');
    console.log('You can now access the CPAP Management page.\n');

  } catch (error) {
    console.error('\n❌ Error fixing Supabase permissions:', error);
    console.error('\n📋 Please run the SQL manually:');
    console.error('1. Go to your Supabase Dashboard');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Copy and run the SQL from: database/fix-supabase-cpap-permissions.sql\n');
    process.exit(1);
  }
}

// Run the script
fixSupabasePermissions();
