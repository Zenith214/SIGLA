/**
 * Script to create test users for CPAP testing
 * Run with: node scripts/create-cpap-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUsers() {
  console.log('🚀 Creating CPAP test users...\n');

  try {
    // Test password (same for all test users for easy testing)
    const testPassword = 'test123';
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // 1. Create Officer user for Barangay 1
    console.log('Creating Officer user (Barangay 1)...');
    const { data: officer1, error: officer1Error } = await supabase
      .from('user')
      .upsert({
        email: 'officer.test@cpap.local',
        password: passwordHash,
        first_name: 'Test',
        last_name: 'Officer',
        role: 'Officer',
        barangay_id: 1, // Adjust if your barangay IDs are different
        status: 'Active'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (officer1Error) {
      console.error('❌ Error creating Officer 1:', officer1Error.message);
    } else {
      console.log('✅ Officer user created:', officer1.email);
      console.log('   - Barangay ID:', officer1.barangay_id);
    }

    // 2. Create Officer user for Barangay 2 (optional)
    console.log('\nCreating Officer user (Barangay 2)...');
    const { data: officer2, error: officer2Error } = await supabase
      .from('user')
      .upsert({
        email: 'officer2.test@cpap.local',
        password: passwordHash,
        first_name: 'Test',
        last_name: 'Officer Two',
        role: 'Officer',
        barangay_id: 2, // Adjust if your barangay IDs are different
        status: 'Active'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (officer2Error) {
      console.error('❌ Error creating Officer 2:', officer2Error.message);
    } else {
      console.log('✅ Officer 2 user created:', officer2.email);
      console.log('   - Barangay ID:', officer2.barangay_id);
    }

    // 3. Create Admin user
    console.log('\nCreating Admin user...');
    const { data: admin, error: adminError } = await supabase
      .from('user')
      .upsert({
        email: 'admin.test@cpap.local',
        password: passwordHash,
        first_name: 'Test',
        last_name: 'Admin',
        role: 'Admin',
        status: 'Active'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error creating Admin:', adminError.message);
    } else {
      console.log('✅ Admin user created:', admin.email);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test users created successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 Login Credentials (all users):');
    console.log('   Password: test123\n');
    console.log('👤 Officer (Barangay 1):');
    console.log('   Email: officer.test@cpap.local');
    console.log('   URL: http://localhost:3000/cpap\n');
    console.log('👤 Officer (Barangay 2):');
    console.log('   Email: officer2.test@cpap.local');
    console.log('   URL: http://localhost:3000/cpap\n');
    console.log('👤 Admin:');
    console.log('   Email: admin.test@cpap.local');
    console.log('   URL: http://localhost:3000/admin/cpap\n');
    console.log('='.repeat(60));
    console.log('\n💡 Next Steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Login as Officer: http://localhost:3000/login');
    console.log('3. Follow the testing guide: docs/CPAP_TESTING_GUIDE.md');
    console.log('\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createTestUsers();
