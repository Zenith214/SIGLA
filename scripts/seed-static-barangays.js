const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Static barangay data from the dashboard
const staticBarangayData = [
  { name: "Katipunan", population: 12450, households: 3120, area: 15.2, surveyStatus: "Completed", seal: "yes" },
  { name: "Tanwalang", population: 8750, households: 2180, area: 12.8, surveyStatus: "In Progress", seal: "yes" },
  { name: "Solong Vale", population: 15200, households: 3800, area: 18.5, surveyStatus: "Completed", seal: "yes" },
  { name: "Tala-o", population: 6890, households: 1720, area: 9.3, surveyStatus: "Pending", seal: "yes" },
  { name: "Balasinon", population: 9340, households: 2335, area: 11.7, surveyStatus: "In Progress", seal: "yes" },
  { name: "Haradabutai", population: 7650, households: 1912, area: 10.4, surveyStatus: "Completed", seal: "yes" },
  { name: "Roxas", population: 11200, households: 2800, area: 14.1, surveyStatus: "Completed", seal: "yes" },
  { name: "New Cebu", population: 13800, households: 3450, area: 16.9, surveyStatus: "In Progress", seal: "yes" },
  { name: "Palili", population: 5420, households: 1355, area: 7.8, surveyStatus: "Pending", seal: "yes" },
  { name: "Talas", population: 8960, households: 2240, area: 12.3, surveyStatus: "Completed", seal: "yes" },
  { name: "Carre", population: 6780, households: 1695, area: 9.1, surveyStatus: "In Progress", seal: "yes" },
  { name: "Buguis", population: 10300, households: 2575, area: 13.6, surveyStatus: "Completed", seal: "yes" },
  { name: "McKinley", population: 7890, households: 1972, area: 10.7, surveyStatus: "Pending", seal: "yes" },
  { name: "Kiblagon", population: 9870, households: 2467, area: 12.9, surveyStatus: "In Progress", seal: "yes" },
  { name: "Laperas", population: 6540, households: 1635, area: 8.9, surveyStatus: "Completed", seal: "yes" },
  { name: "Clib", population: 8120, households: 2030, area: 11.2, surveyStatus: "In Progress", seal: "yes" },
  { name: "Osmena", population: 11650, households: 2912, area: 14.8, surveyStatus: "Completed", seal: "yes" },
  { name: "Luparan", population: 7320, households: 1830, area: 9.8, surveyStatus: "Pending", seal: "yes" },
  { name: "Poblacion", population: 16800, households: 4200, area: 20.3, surveyStatus: "Completed", seal: "yes" },
  { name: "Tagolilong", population: 5890, households: 1472, area: 8.1, surveyStatus: "In Progress", seal: "yes" },
  { name: "Lapla", population: 9450, households: 2362, area: 12.6, surveyStatus: "Completed", seal: "yes" },
  { name: "Litos", population: 7140, households: 1785, area: 9.5, surveyStatus: "Pending", seal: "yes" },
  { name: "Parame", population: 8670, households: 2167, area: 11.4, surveyStatus: "In Progress", seal: "yes" },
  { name: "Labon", population: 6230, households: 1557, area: 8.6, surveyStatus: "Completed", seal: "yes" },
  { name: "Waterfall", population: 4890, households: 1222, area: 6.9, surveyStatus: "Pending", seal: "yes" }
];

async function seedStaticBarangays() {
  try {
    console.log('🌱 Starting to seed static barangay data...');

    // Check if barangays already exist
    const existingBarangays = await prisma.barangay.findMany();
    console.log(`📊 Found ${existingBarangays.length} existing barangays in database`);

    if (existingBarangays.length > 0) {
      console.log('✅ Barangays already exist in database. Skipping seed.');
      return;
    }

    // Seed barangays
    for (const barangayData of staticBarangayData) {
      console.log(`🏘️  Creating barangay: ${barangayData.name}`);
      
      const barangay = await prisma.barangay.create({
        data: {
          barangay_name: barangayData.name,
          population: barangayData.population,
          households: barangayData.households,
          seal: barangayData.seal,
          currentStatus: barangayData.surveyStatus,
          is_active: true,
          description: `${barangayData.name} is a barangay with ${barangayData.population.toLocaleString()} residents and ${barangayData.households.toLocaleString()} households.`
        }
      });

      // Create survey targets based on status
      let targetProgress = 0;
      let achievedProgress = 0;
      
      switch (barangayData.surveyStatus) {
        case 'Completed':
          targetProgress = 150; // Standard target
          achievedProgress = 150; // Fully achieved
          break;
        case 'In Progress':
          targetProgress = 150;
          achievedProgress = Math.floor(Math.random() * 100) + 50; // 50-149
          break;
        case 'Pending':
          targetProgress = 150;
          achievedProgress = 0;
          break;
      }

      const percentage = Math.round((achievedProgress / targetProgress) * 100);

      await prisma.surveyTarget.create({
        data: {
          barangay_id: barangay.barangay_id,
          target: targetProgress,
          achieved: achievedProgress,
          percentage: percentage
        }
      });

      console.log(`✅ Created ${barangayData.name} with ${percentage}% progress`);
    }

    console.log('🎉 Successfully seeded all static barangay data!');

  } catch (error) {
    console.error('❌ Error seeding static barangay data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedStaticBarangays()
    .then(() => {
      console.log('✅ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedStaticBarangays };