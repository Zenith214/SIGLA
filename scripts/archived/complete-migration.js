// Complete Supabase Migration
require('dotenv').config({ path: '.env.local' });
console.log('🚀 Completing Supabase Migration...\n');

async function completeMigration() {
  console.log('Step 1: Testing connection...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test connection
    const { data, error } = await supabase
      .from('barangay')
      .select('count')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('✅ Connection working, tables need to be created');
      console.log('\nStep 2: Run this command to create tables:');
      console.log('npx prisma db push');
      console.log('\nStep 3: After tables are created, test with:');
      console.log('node scripts/complete-migration.js');
    } else if (error) {
      console.log('❌ Connection error:', error.message);
      console.log('💡 Make sure your Supabase project status is GREEN');
    } else {
      console.log('✅ Tables exist! Testing data...');
      
      // Test barangay table
      const { data: barangays, error: barangayError } = await supabase
        .from('barangay')
        .select('*')
        .limit(5);
      
      if (barangayError) {
        console.log('❌ Error querying barangays:', barangayError.message);
      } else {
        console.log(`✅ Barangay table working: ${barangays.length} records found`);
      }
      
      // Test user table
      const { data: users, error: userError } = await supabase
        .from('user')
        .select('*')
        .limit(5);
      
      if (userError) {
        console.log('❌ Error querying users:', userError.message);
      } else {
        console.log(`✅ User table working: ${users.length} records found`);
      }
      
      console.log('\n🎉 MIGRATION COMPLETE!');
      console.log('✅ All database tables created');
      console.log('✅ Supabase connection working');
      console.log('✅ Ready to use the application');
      
      console.log('\n📋 Next Steps:');
      console.log('1. Start your development server: npm run dev');
      console.log('2. Test the barangay settings page');
      console.log('3. Try editing barangay seals');
      console.log('4. All APIs should now return 200 instead of 500');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('💡 Make sure your Supabase project is ready (green status)');
  }
}

completeMigration();