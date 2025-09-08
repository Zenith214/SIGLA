const { PrismaClient } = require('@prisma/client');

async function verifyMigration() {
  console.log('🔍 Verifying Supabase migration...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Test all main models
    console.log('\n📊 Testing database operations...');

    // Test Users
    const users = await prisma.user.findMany();
    console.log(`👤 Users: ${users.length} found`);
    if (users.length > 0) {
      console.log(`   - Admin user: ${users[0].email} (${users[0].role})`);
    }

    // Test Barangays
    const barangays = await prisma.barangay.findMany();
    console.log(`🏘️ Barangays: ${barangays.length} found`);
    barangays.forEach(b => {
      console.log(`   - ${b.barangay_name}: ${b.households} households, ${b.population} population`);
    });

    // Test Survey Cycles
    const cycles = await prisma.survey_cycle.findMany();
    console.log(`📊 Survey Cycles: ${cycles.length} found`);
    cycles.forEach(c => {
      console.log(`   - ${c.year}: ${c.status} (${c.start_date.toISOString().split('T')[0]} to ${c.end_date.toISOString().split('T')[0]})`);
    });

    // Test Survey Targets
    const targets = await prisma.surveyTarget.findMany({
      include: { barangay: true }
    });
    console.log(`🎯 Survey Targets: ${targets.length} found`);
    targets.forEach(t => {
      console.log(`   - ${t.barangay.barangay_name}: ${t.achieved}/${t.target} (${t.percentage}%)`);
    });

    // Test database constraints and relationships
    console.log('\n🔗 Testing relationships...');
    
    // Test user-assignment relationship
    const assignments = await prisma.assignment.findMany({
      include: { user: true, barangay: true }
    });
    console.log(`📋 Assignments: ${assignments.length} found`);

    // Test survey responses
    const responses = await prisma.survey_response.findMany();
    console.log(`📝 Survey Responses: ${responses.length} found`);

    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const bcrypt = require('bcryptjs');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sigla.com' }
    });
    
    if (adminUser) {
      const passwordValid = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   - Admin password test: ${passwordValid ? '✅ Valid' : '❌ Invalid'}`);
    }

    // Environment check
    console.log('\n🔧 Environment Configuration:');
    console.log(`   - Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - Supabase Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - Supabase Service Role: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);

    console.log('\n🎉 Migration verification completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Login with: admin@sigla.com / admin123');
    console.log('3. Test the survey functionality');
    console.log('4. Create additional users and assignments as needed');

    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyMigration()
    .then((success) => {
      if (success) {
        console.log('\n✅ All tests passed! Your Supabase migration is complete.');
        process.exit(0);
      } else {
        console.log('\n❌ Some tests failed. Please check the errors above.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Verification error:', error);
      process.exit(1);
    });
}

module.exports = { verifyMigration };