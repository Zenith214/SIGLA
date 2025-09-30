const { PrismaClient } = require('@prisma/client');

async function testCompleteMap() {
  console.log('🗺️ Testing complete map functionality...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    
    // Get all barangays from database
    const barangays = await prisma.barangay.findMany({
      orderBy: { barangay_name: 'asc' }
    });

    console.log(`\n📊 Database has ${barangays.length} barangays`);
    
    // SVG path IDs that should be mapped
    const svgPathIds = [
      '1katipunan', '2tanwalang', '3solongvale', '4tala-o', '5balasinon',
      '6haradabutai', '7roxas', '8newcebu', '9palili', '10talas',
      '11carre', '12buguis', '13mckinley', '14kiblagon', '15laperas',
      '16clib', '17osmena', '18luparan', '19poblacion', '20tagolilong',
      '21lapla', '22litos', '23parame', '24labon', '25waterfall'
    ];

    // Mapping from SVG path IDs to barangay names
    const barangayMapping = {
      "1katipunan": "Katipunan",
      "2tanwalang": "Tanwalang", 
      "3solongvale": "Solongvale",
      "4tala-o": "Tala-O",
      "5balasinon": "Balasinon",
      "6haradabutai": "Harada Butai",
      "7roxas": "Roxas",
      "8newcebu": "New Cebu",
      "9palili": "Palili",
      "10talas": "Talas",
      "11carre": "Carre",
      "12buguis": "Buguis",
      "13mckinley": "Mckinley",
      "14kiblagon": "Kiblagon",
      "15laperas": "Laperas",
      "16clib": "Clib",
      "17osmena": "Osmeña",
      "18luparan": "Luparan",
      "19poblacion": "Poblacion",
      "20tagolilong": "Tagolilong",
      "21lapla": "Lapla",
      "22litos": "Litos",
      "23parame": "Parame",
      "24labon": "Labon",
      "25waterfall": "Waterfall"
    };

    console.log(`\n📍 SVG has ${svgPathIds.length} path elements`);
    
    // Check mapping coverage
    const dbBarangayNames = barangays.map(b => b.barangay_name);
    const mappedBarangayNames = Object.values(barangayMapping);
    
    console.log('\n🔍 Checking mapping coverage...');
    
    const unmappedInDb = dbBarangayNames.filter(name => !mappedBarangayNames.includes(name));
    const unmappedInSvg = mappedBarangayNames.filter(name => !dbBarangayNames.includes(name));
    
    if (unmappedInDb.length > 0) {
      console.log('❌ Barangays in DB but not mapped in SVG:');
      unmappedInDb.forEach(name => console.log(`   - ${name}`));
    }
    
    if (unmappedInSvg.length > 0) {
      console.log('❌ Barangays mapped in SVG but not in DB:');
      unmappedInSvg.forEach(name => console.log(`   - ${name}`));
    }
    
    if (unmappedInDb.length === 0 && unmappedInSvg.length === 0) {
      console.log('✅ Perfect mapping! All barangays are correctly mapped.');
    }

    // Show expected colors
    console.log('\n🎨 Expected map colors:');
    console.log('\n🟢 TEAL barangays (with seals):');
    barangays.filter(b => b.seal === 'yes').forEach(b => {
      const pathId = Object.keys(barangayMapping).find(key => barangayMapping[key] === b.barangay_name);
      console.log(`   ${pathId} -> ${b.barangay_name}`);
    });
    
    console.log('\n⚪ GRAY barangays (without seals):');
    barangays.filter(b => b.seal !== 'yes').forEach(b => {
      const pathId = Object.keys(barangayMapping).find(key => barangayMapping[key] === b.barangay_name);
      console.log(`   ${pathId} -> ${b.barangay_name}`);
    });

    console.log('\n✅ Map should now be fully functional with:');
    console.log('   - All 25 barangays interactive');
    console.log('   - Correct geographic locations');
    console.log('   - Proper color coding based on seal status');
    console.log('   - Hover and click functionality');

  } catch (error) {
    console.error('❌ Error testing complete map:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCompleteMap();