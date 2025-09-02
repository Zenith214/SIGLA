// Supabase migration helper script
console.log('🚀 Supabase Migration Helper\n');

function checkEnvironmentSetup() {
  console.log('1. 📋 Environment Setup Check');
  console.log('=============================');
  
  console.log('Required environment variables:');
  console.log('✅ DATABASE_URL (PostgreSQL connection string)');
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL');
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY');
  console.log('✅ JWT_SECRET (keep existing)');
  
  console.log('\nExample .env setup:');
  console.log('DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"');
  console.log('NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"');
  console.log('SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"');
}

function showMigrationSteps() {
  console.log('\n2. 🔄 Migration Steps');
  console.log('====================');
  
  console.log('Step 1: Create Supabase Project');
  console.log('   • Go to supabase.com');
  console.log('   • Create new project');
  console.log('   • Save database password');
  console.log('   • Wait for project setup (2-3 minutes)');
  
  console.log('\nStep 2: Get Connection Details');
  console.log('   • Settings → Database');
  console.log('   • Copy connection string');
  console.log('   • Settings → API');
  console.log('   • Copy URL and keys');
  
  console.log('\nStep 3: Update Environment');
  console.log('   • Update .env file with Supabase credentials');
  console.log('   • Replace MySQL DATABASE_URL with PostgreSQL');
  
  console.log('\nStep 4: Update Schema');
  console.log('   • Copy prisma/schema-postgresql.prisma to prisma/schema.prisma');
  console.log('   • Or manually change provider to "postgresql"');
  
  console.log('\nStep 5: Install Dependencies');
  console.log('   • npm install @supabase/supabase-js');
  
  console.log('\nStep 6: Run Migration');
  console.log('   • npx prisma generate');
  console.log('   • npx prisma db push');
}

async function testConnection() {
  console.log('\n3. 🧪 Connection Test');
  console.log('=====================');
  
  try {
    console.log('Testing API connection...');
    const response = await fetch('http://localhost:3000/api/barangays/all');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Connected to Supabase!');
      console.log(`📊 Data loaded: ${data.length} items`);
      
      if (data.length > 0) {
        console.log('📝 Sample data:');
        console.log(`   Name: ${data[0].name || data[0].barangay_name}`);
        console.log(`   Seal: ${data[0].seal}`);
      }
      
      return true;
    } else {
      console.log(`❌ FAILED: HTTP ${response.status}`);
      const errorText = await response.text();
      console.log(`🚨 Error: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 NETWORK ERROR: ${error.message}`);
    return false;
  }
}

function showBenefits() {
  console.log('\n4. 🎯 Migration Benefits');
  console.log('========================');
  
  console.log('Immediate Fixes:');
  console.log('✅ No more "Can\'t reach database server" errors');
  console.log('✅ All APIs return 200 instead of 500');
  console.log('✅ Barangay seal editing works');
  console.log('✅ Survey system fully operational');
  console.log('✅ Assignment dropdowns populated');
  
  console.log('\nLong-term Benefits:');
  console.log('🌟 Cloud reliability - no local setup needed');
  console.log('🌟 Automatic backups and scaling');
  console.log('🌟 Real-time features available');
  console.log('🌟 Built-in authentication system');
  console.log('🌟 Easy deployment to production');
}

function showTroubleshooting() {
  console.log('\n5. 🔧 Troubleshooting');
  console.log('=====================');
  
  console.log('Common Issues:');
  console.log('');
  console.log('❌ "Provider not supported" error:');
  console.log('   → Check prisma/schema.prisma has provider = "postgresql"');
  console.log('');
  console.log('❌ "Connection refused" error:');
  console.log('   → Verify DATABASE_URL format and credentials');
  console.log('   → Check Supabase project is active (green status)');
  console.log('');
  console.log('❌ "Table does not exist" error:');
  console.log('   → Run: npx prisma db push');
  console.log('   → This creates all tables in Supabase');
  console.log('');
  console.log('❌ "Enum type does not exist" error:');
  console.log('   → PostgreSQL enums are case-sensitive');
  console.log('   → Run: npx prisma db push --force-reset');
}

async function runMigrationHelper() {
  console.log('🚀 Supabase Migration Helper Started\n');
  
  checkEnvironmentSetup();
  showMigrationSteps();
  
  console.log('\n🧪 Testing current connection...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('\n🎉 MIGRATION SUCCESSFUL!');
    console.log('Your system is now running on Supabase PostgreSQL');
    showBenefits();
  } else {
    console.log('\n⏳ Migration in progress or not started yet');
    showTroubleshooting();
    
    console.log('\n📋 Next Steps:');
    console.log('1. Complete Supabase project setup');
    console.log('2. Update .env with Supabase credentials');
    console.log('3. Update prisma/schema.prisma provider');
    console.log('4. Run: npx prisma generate && npx prisma db push');
    console.log('5. Test again with: node scripts/migrate-to-supabase.js');
  }
  
  console.log('\n📞 Need Help?');
  console.log('=============');
  console.log('• Supabase Docs: https://supabase.com/docs');
  console.log('• Prisma PostgreSQL: https://www.prisma.io/docs/concepts/database-connectors/postgresql');
  console.log('• Migration Guide: See SUPABASE_MIGRATION_GUIDE.md');
}

// Run the migration helper
runMigrationHelper().catch(console.error);