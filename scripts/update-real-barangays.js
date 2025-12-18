const { PrismaClient } = require('@prisma/client');

async function updateRealBarangays() {
  console.log('🏘️ Updating barangays with real data...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    // First, clear existing barangays and related data
    console.log('🗑️ Clearing existing barangays...');
    
    // Delete related records first (due to foreign key constraints)
    await prisma.surveyTarget.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.survey_response.deleteMany({});
    await prisma.survey.deleteMany({});
    await prisma.barangay.deleteMany({});
    
    console.log('✅ Cleared existing barangays and related data');

    // Define the real barangays with seal information
    const barangaysWithSeals = [
      'Balasinon', 'Poblacion', 'Buguis', 'Tanwalang', 
      'Luparan', 'Carre', 'Talas', 'Solong vale'
    ];

    const allBarangays = [
      'Katipunan',
      'Tanwalang',
      'Solongvale',
      'Tala-O',
      'Balasinon',
      'Harada Butai',
      'Roxas',
      'New Cebu',
      'Palili',
      'Talas',
      'Carre',
      'Buguis',
      'Mckinley',
      'Kiblagon',
      'Laperas',
      'Clib',
      'Osmeña',
      'Luparan',
      'Poblacion',
      'Tagolilong',
      'Lapla',
      'Litos',
      'Parame',
      'Labon',
      'Waterfall'
    ];

    console.log('🏘️ Adding real barangays...');

    // Add each barangay
    for (let i = 0; i < allBarangays.length; i++) {
      const barangayName = allBarangays[i];
      const hasSeal = barangaysWithSeals.includes(barangayName) || 
                     barangaysWithSeals.includes(barangayName.replace(' ', '')) ||
                     (barangayName === 'Solongvale' && barangaysWithSeals.includes('Solong vale'));
      
      // Generate realistic household and population data
      const households = Math.floor(Math.random() * 200) + 50; // 50-250 households
      const population = households * (Math.floor(Math.random() * 3) + 3); // 3-6 people per household
      
      const barangay = await prisma.barangay.create({
        data: {
          barangay_name: barangayName,
          seal: hasSeal ? 'yes' : 'no',
          households: households,
          population: population,
          is_active: true,
          captain: `Captain of ${barangayName}`, // Placeholder captain name
          description: `Barangay ${barangayName} in Sulop Municipality`
        }
      });

      console.log(`✅ Added: ${barangayName} (ID: ${barangay.barangay_id}) - Seal: ${hasSeal ? 'YES' : 'NO'}`);
    }

    // Create survey targets for each barangay (10% of households)
    console.log('🎯 Creating survey targets...');
    const createdBarangays = await prisma.barangay.findMany();
    
    for (const barangay of createdBarangays) {
      const target = Math.max(Math.floor(barangay.households * 0.1), 5); // At least 5 surveys per barangay
      await prisma.surveyTarget.create({
        data: {
          barangay_id: barangay.barangay_id,
          target: target,
          achieved: 0,
          percentage: 0
        }
      });
      console.log(`🎯 Target for ${barangay.barangay_name}: ${target} surveys`);
    }

    // Summary
    const totalBarangays = await prisma.barangay.count();
    const barangaysWithSealCount = await prisma.barangay.count({
      where: { seal: 'yes' }
    });
    const totalHouseholds = await prisma.barangay.aggregate({
      _sum: { households: true }
    });
    const totalPopulation = await prisma.barangay.aggregate({
      _sum: { population: true }
    });

    console.log('\n📊 Summary:');
    console.log(`✅ Total Barangays: ${totalBarangays}`);
    console.log(`🏆 Barangays with Seal: ${barangaysWithSealCount}`);
    console.log(`🏠 Total Households: ${totalHouseholds._sum.households?.toLocaleString()}`);
    console.log(`👥 Total Population: ${totalPopulation._sum.population?.toLocaleString()}`);

    console.log('\n🏆 Barangays with Seals:');
    const sealedBarangays = await prisma.barangay.findMany({
      where: { seal: 'yes' },
      orderBy: { barangay_name: 'asc' }
    });
    
    sealedBarangays.forEach((b, index) => {
      console.log(`   ${index + 1}. ${b.barangay_name}`);
    });

    console.log('\n🎉 Barangay update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating barangays:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
if (require.main === module) {
  updateRealBarangays()
    .then(() => {
      console.log('✅ Barangay update completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateRealBarangays };