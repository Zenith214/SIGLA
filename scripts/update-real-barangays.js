const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const realBarangays = [
  {
    name: 'Balasinon',
    population: 3420,
    households: 855,
    area: 12.5,
    captain: 'Maria Santos',
    description: 'A progressive barangay known for its agricultural activities.',
  },
  {
    name: 'Poblacion',
    population: 8750,
    households: 2187,
    area: 18.2,
    captain: 'Juan Dela Cruz',
    description: 'The central barangay and seat of municipal government.',
  },
  {
    name: 'Buguis',
    population: 2890,
    households: 722,
    area: 9.8,
    captain: 'Ana Rodriguez',
    description: 'A peaceful barangay with rich cultural heritage.',
  },
  {
    name: 'Tanwalang',
    population: 4560,
    households: 1140,
    area: 14.6,
    captain: 'Pedro Martinez',
    description: 'A growing barangay with excellent road connectivity.',
  },
  {
    name: 'Luparan',
    population: 2150,
    households: 537,
    area: 8.3,
    captain: 'Lisa Garcia',
    description: 'A small but vibrant barangay nestled in the hills.',
  },
  {
    name: 'Carre',
    population: 3680,
    households: 920,
    area: 11.4,
    captain: 'Roberto Santos',
    description: 'Known for its strong community spirit and local festivals.',
  },
  {
    name: 'Talas',
    population: 5120,
    households: 1280,
    area: 15.9,
    captain: 'Carmen Reyes',
    description: 'A barangay famous for its natural springs and eco-tourism.',
  },
  {
    name: 'Solongvale',
    population: 1980,
    households: 495,
    area: 7.2,
    captain: 'Diego Fernandez',
    description: 'The smallest barangay with stunning valley views.',
  }
];

const defaultHistory = JSON.stringify([
  { year: "2024", status: "In Progress" },
  { year: "2023", status: "Completed" },
  { year: "2022", status: "Completed" },
  { year: "2021", status: "Completed" }
]);

async function updateRealBarangays() {
  try {
    console.log('🚀 Starting barangay data update...');
    
    // First, delete all existing barangay records (this will cascade delete related data)
    console.log('🗑️  Clearing existing barangay data...');
    await prisma.assignment.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.surveyTarget.deleteMany();
    await prisma.barangay.deleteMany();
    
    console.log('✅ Existing data cleared.');
    
    // Insert the real barangays
    console.log('📝 Inserting real barangay data...');
    
    for (const barangay of realBarangays) {
      const result = await prisma.barangay.create({
        data: {
          barangay_name: barangay.name,
          population: barangay.population,
          households: barangay.households,
          area: barangay.area,
          captain: barangay.captain,
          description: barangay.description,
          currentStatus: 'Active',
          history: defaultHistory,
          is_active: true,
          seal: 'no',
        }
      });
      
      console.log(`✅ Created: ${barangay.name} (ID: ${result.barangay_id})`);
    }
    
    console.log('\n🎉 Successfully updated all barangay records!');
    console.log(`📊 Total barangays: ${realBarangays.length}`);
    
    // Verify the data
    const count = await prisma.barangay.count();
    console.log(`🔍 Verification: ${count} barangays found in database`);
    
    // List all barangays
    console.log('\n📋 Current barangays in database:');
    const allBarangays = await prisma.barangay.findMany({
      select: {
        barangay_id: true,
        barangay_name: true,
        population: true,
        households: true,
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });
    
    allBarangays.forEach(b => {
      console.log(`   ${b.barangay_id}: ${b.barangay_name} (Pop: ${b.population}, HH: ${b.households})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating barangays:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  updateRealBarangays()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = updateRealBarangays;
