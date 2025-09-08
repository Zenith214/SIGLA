const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seedInitialData() {
  console.log('🌱 Starting initial data seeding...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@sigla.com' },
      update: {},
      create: {
        email: 'admin@sigla.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        status: 'Active',
        jobTitle: 'System Administrator',
        organization: 'SIGLA Survey System'
      }
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create some sample barangays
    console.log('🏘️ Creating sample barangays...');
    const barangays = [
      { barangay_name: 'Poblacion', households: 150, population: 750, captain: 'Juan Dela Cruz' },
      { barangay_name: 'San Jose', households: 120, population: 600, captain: 'Maria Santos' },
      { barangay_name: 'San Antonio', households: 200, population: 1000, captain: 'Pedro Garcia' },
      { barangay_name: 'Santa Maria', households: 180, population: 900, captain: 'Ana Reyes' },
      { barangay_name: 'San Miguel', households: 160, population: 800, captain: 'Jose Rizal' }
    ];

    for (const barangay of barangays) {
      await prisma.barangay.upsert({
        where: { barangay_name: barangay.barangay_name },
        update: {},
        create: barangay
      });
      console.log(`✅ Created barangay: ${barangay.barangay_name}`);
    }

    // Create a survey cycle
    console.log('📊 Creating survey cycle...');
    const currentYear = new Date().getFullYear();
    await prisma.survey_cycle.upsert({
      where: { cycle_id: 1 },
      update: {},
      create: {
        year: currentYear.toString(),
        status: 'Active',
        start_date: new Date(`${currentYear}-01-01`),
        end_date: new Date(`${currentYear}-12-31`),
        responses: 0
      }
    });
    console.log(`✅ Created survey cycle for ${currentYear}`);

    // Create survey targets for each barangay
    console.log('🎯 Creating survey targets...');
    const createdBarangays = await prisma.barangay.findMany();
    
    for (const barangay of createdBarangays) {
      const target = Math.floor(barangay.households * 0.1); // 10% of households
      await prisma.surveyTarget.upsert({
        where: { target_id: barangay.barangay_id },
        update: {},
        create: {
          barangay_id: barangay.barangay_id,
          target: target,
          achieved: 0,
          percentage: 0
        }
      });
      console.log(`✅ Created target for ${barangay.barangay_name}: ${target} surveys`);
    }

    console.log('🎉 Initial data seeding completed successfully!');

    // Summary
    const userCount = await prisma.user.count();
    const barangayCount = await prisma.barangay.count();
    const targetCount = await prisma.surveyTarget.count();
    const cycleCount = await prisma.survey_cycle.count();

    console.log('\n📊 Database Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Barangays: ${barangayCount}`);
    console.log(`- Survey Targets: ${targetCount}`);
    console.log(`- Survey Cycles: ${cycleCount}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
if (require.main === module) {
  seedInitialData()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedInitialData };