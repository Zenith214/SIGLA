const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBarangayRetrieval() {
  try {
    console.log('🔍 Testing barangay data retrieval...');
    
    // Get all barangays from database
    const barangays = await prisma.barangay.findMany({
      select: {
        barangay_id: true,
        barangay_name: true,
        population: true,
        households: true,
        captain: true,
        currentStatus: true,
        history: true,
        is_active: true,
        seal: true,
        description: true,
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });
    
    console.log(`✅ Found ${barangays.length} barangays in database:`);
    console.log('');
    
    barangays.forEach(barangay => {
      console.log(`📍 ${barangay.barangay_name} (ID: ${barangay.barangay_id})`);
      console.log(`   Population: ${barangay.population}`);
      console.log(`   Households: ${barangay.households}`);
      console.log(`   Captain: ${barangay.captain}`);
      console.log(`   Status: ${barangay.currentStatus}`);
      console.log(`   Seal: ${barangay.seal}`);
      console.log(`   Description: ${barangay.description}`);
      console.log(`   History: ${barangay.history}`);
      console.log('');
    });
    
    // Test the 8 real barangays
    const realBarangayNames = ['Balasinon', 'Poblacion', 'Buguis', 'Tanwalang', 'Luparan', 'Carre', 'Talas', 'Solongvale'];
    
    console.log('🎯 Checking for all 8 real barangays...');
    const foundNames = barangays.map(b => b.barangay_name);
    
    let allFound = true;
    realBarangayNames.forEach(name => {
      if (foundNames.includes(name)) {
        console.log(`✅ ${name} - Found`);
      } else {
        console.log(`❌ ${name} - Missing`);
        allFound = false;
      }
    });
    
    if (allFound) {
      console.log('\n🎉 All 8 real barangays are present in the database!');
    } else {
      console.log('\n⚠️  Some barangays are missing from the database.');
    }
    
    return barangays;
    
  } catch (error) {
    console.error('❌ Error retrieving barangays:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testBarangayRetrieval()
    .then(() => {
      console.log('\n✨ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = testBarangayRetrieval;
