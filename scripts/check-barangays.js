const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBarangays() {
  try {
    console.log('🔍 Checking current barangay data in database...\n');
    
    const barangays = await prisma.barangay.findMany({
      select: {
        barangay_id: true,
        barangay_name: true,
        is_awardee: true,
        population: true,
        households: true,
        area: true,
        currentStatus: true
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });

    if (barangays.length === 0) {
      console.log('❌ No barangays found in database');
      console.log('💡 You need to seed the database first');
    } else {
      console.log(`✅ Found ${barangays.length} barangays in database:\n`);
      
      const awardees = barangays.filter(b => b.is_awardee);
      const nonAwardees = barangays.filter(b => !b.is_awardee);
      
      console.log(`🏆 SGLGB Awardees (${awardees.length}):`);
      awardees.forEach(b => {
        console.log(`   ✅ ${b.barangay_name} (Pop: ${b.population?.toLocaleString() || 'N/A'})`);
      });
      
      console.log(`\n📍 Non-Awardees (${nonAwardees.length}):`);
      nonAwardees.forEach(b => {
        console.log(`   ❌ ${b.barangay_name} (Pop: ${b.population?.toLocaleString() || 'N/A'})`);
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total Barangays: ${barangays.length}`);
      console.log(`   SGLGB Awardees: ${awardees.length}`);
      console.log(`   Non-Awardees: ${nonAwardees.length}`);
    }
    
  } catch (error) {
    console.error('💥 Error checking barangays:', error.message);
    if (error.message.includes('Environment variable not found: DATABASE_URL')) {
      console.log('💡 Make sure your DATABASE_URL environment variable is set');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkBarangays();