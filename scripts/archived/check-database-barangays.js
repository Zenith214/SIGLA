const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBarangays() {
  try {
    console.log('🔍 Checking barangays in database...\n');

    // Get all barangays
    const allBarangays = await prisma.barangay.findMany({
      select: {
        barangay_id: true,
        barangay_name: true,
        seal: true,
        is_active: true
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });

    console.log(`📊 Total barangays in database: ${allBarangays.length}`);
    console.log(`🏆 Barangays with seals: ${allBarangays.filter(b => b.seal === 'yes').length}`);
    console.log(`❌ Barangays without seals: ${allBarangays.filter(b => b.seal === 'no').length}`);
    console.log(`🚫 Inactive barangays: ${allBarangays.filter(b => !b.is_active).length}\n`);

    console.log('📋 All barangays:');
    allBarangays.forEach((barangay, index) => {
      const sealIcon = barangay.seal === 'yes' ? '🏆' : '❌';
      const activeIcon = barangay.is_active ? '✅' : '🚫';
      console.log(`${index + 1}. ${sealIcon} ${activeIcon} ${barangay.barangay_name} (ID: ${barangay.barangay_id})`);
    });

    // Check what the API would return
    console.log('\n🔍 What /api/barangays would return:');
    const apiBarangays = await prisma.barangay.findMany({
      where: {
        is_active: true,
        seal: 'yes'
      },
      select: {
        barangay_id: true,
        barangay_name: true,
        seal: true
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });

    console.log(`📊 API would return: ${apiBarangays.length} barangays`);
    apiBarangays.forEach((barangay, index) => {
      console.log(`${index + 1}. 🏆 ${barangay.barangay_name} (ID: ${barangay.barangay_id})`);
    });

  } catch (error) {
    console.error('❌ Error checking barangays:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBarangays();