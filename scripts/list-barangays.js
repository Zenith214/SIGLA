const { PrismaClient } = require('@prisma/client');

async function listBarangays() {
  console.log('🏘️ Fetching all barangays from Supabase...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    
    const barangays = await prisma.barangay.findMany({
      orderBy: { barangay_name: 'asc' }
    });

    console.log(`\n📊 Found ${barangays.length} barangays:\n`);
    
    barangays.forEach((barangay, index) => {
      console.log(`${index + 1}. ${barangay.barangay_name}`);
      console.log(`   ID: ${barangay.barangay_id}`);
      console.log(`   Households: ${barangay.households || 'N/A'}`);
      console.log(`   Population: ${barangay.population || 'N/A'}`);
      console.log(`   Captain: ${barangay.captain || 'N/A'}`);
      console.log(`   Seal: ${barangay.seal}`);
      console.log(`   Status: ${barangay.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${barangay.created_at.toISOString().split('T')[0]}`);
      console.log('');
    });

    // Also show summary stats
    const totalHouseholds = barangays.reduce((sum, b) => sum + (b.households || 0), 0);
    const totalPopulation = barangays.reduce((sum, b) => sum + (b.population || 0), 0);
    const activeCount = barangays.filter(b => b.is_active).length;

    console.log('📈 Summary Statistics:');
    console.log(`   Total Barangays: ${barangays.length}`);
    console.log(`   Active Barangays: ${activeCount}`);
    console.log(`   Total Households: ${totalHouseholds.toLocaleString()}`);
    console.log(`   Total Population: ${totalPopulation.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error fetching barangays:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
listBarangays();