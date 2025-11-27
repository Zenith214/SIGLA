const { PrismaClient } = require('@prisma/client');

async function testMapFix() {
  console.log('🗺️ Testing map fix - checking barangay seal status...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    
    const barangays = await prisma.barangay.findMany({
      orderBy: { barangay_name: 'asc' }
    });

    console.log(`\n📊 Found ${barangays.length} barangays:\n`);
    
    const barangaysWithSeals = [];
    const barangaysWithoutSeals = [];
    
    barangays.forEach((barangay) => {
      if (barangay.seal === 'yes') {
        barangaysWithSeals.push(barangay.barangay_name);
      } else {
        barangaysWithoutSeals.push(barangay.barangay_name);
      }
    });

    console.log('🏆 Barangays WITH seals (should show as TEAL on map):');
    barangaysWithSeals.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });

    console.log('\n⚪ Barangays WITHOUT seals (should show as GRAY on map):');
    barangaysWithoutSeals.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });

    console.log('\n📈 Summary:');
    console.log(`   Total Barangays: ${barangays.length}`);
    console.log(`   With Seals: ${barangaysWithSeals.length}`);
    console.log(`   Without Seals: ${barangaysWithoutSeals.length}`);

    console.log('\n✅ Expected behavior on map:');
    console.log('   - Barangays with seals should appear in TEAL color (#64D9B7)');
    console.log('   - Barangays without seals should appear in GRAY color (#6A7280)');
    console.log('   - Hovering should highlight in YELLOW (#FFC857)');
    console.log('   - Clicking should show barangay details');

  } catch (error) {
    console.error('❌ Error testing map fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMapFix();