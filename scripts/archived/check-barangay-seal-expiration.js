// Check barangay seal expiration data
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkBarangaySealExpiration() {
  console.log('🔍 Checking barangay seal expiration data...');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    // Connect to the database
    await prisma.$connect();
    
    // Get all barangays with seal information
    const barangays = await prisma.barangay.findMany({
      select: {
        barangay_id: true,
        barangay_name: true,
        seal: true,
        seal_expiration_date: true
      },
      orderBy: {
        barangay_id: 'asc'
      }
    });
    
    console.log('\n📊 Barangay Seal Expiration Data:');
    console.table(barangays);
    
    // Count barangays with seal='yes' and expiration date
    const sealedBarangays = barangays.filter(b => b.seal === 'yes' && b.seal_expiration_date);
    console.log(`\n✅ Total barangays with SGLGB seal: ${sealedBarangays.length}/${barangays.length}`);
    
    // Check for expired seals
    const now = new Date();
    const expiredSeals = sealedBarangays.filter(b => b.seal_expiration_date < now);
    console.log(`❌ Expired seals: ${expiredSeals.length}`);
    
    // Check for seals expiring in the next 30 days
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSeals = sealedBarangays.filter(b => 
      b.seal_expiration_date >= now && 
      b.seal_expiration_date <= thirtyDaysFromNow
    );
    console.log(`⚠️ Seals expiring in next 30 days: ${expiringSeals.length}`);
    
    // Check for valid seals
    const validSeals = sealedBarangays.filter(b => b.seal_expiration_date > thirtyDaysFromNow);
    console.log(`✅ Valid seals: ${validSeals.length}`);
    
  } catch (error) {
    console.error('💥 Error checking barangay data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run check
checkBarangaySealExpiration()
  .then(() => {
    console.log('\n✅ Check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });