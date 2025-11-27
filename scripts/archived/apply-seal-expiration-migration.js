// Apply seal expiration date migration to Supabase using Prisma
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function applySealExpirationMigration() {
  console.log('🚀 Applying seal_expiration_date migration to Supabase...');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    // Connect to the database
    console.log('📡 Connecting to Supabase database...');
    await prisma.$connect();
    console.log('✅ Connected successfully');
    
    console.log('1️⃣ Adding seal_expiration_date column...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE barangay ADD COLUMN IF NOT EXISTS seal_expiration_date TIMESTAMP;');
      console.log('✅ Column added successfully');
    } catch (error) {
      // If column already exists, this is fine
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('2️⃣ Updating existing records with seal="yes"...');
    const updateResult = await prisma.$executeRawUnsafe("UPDATE barangay SET seal_expiration_date = NOW() + INTERVAL '1 year' WHERE seal = 'yes' AND seal_expiration_date IS NULL;");
    console.log(`✅ Updated ${updateResult} records successfully`);
    
    console.log('3️⃣ Creating index on seal_expiration_date...');
    try {
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_barangay_seal_expiration ON barangay(seal_expiration_date);');
      console.log('✅ Index created successfully');
    } catch (error) {
      // If index already exists, this is fine
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Index already exists');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    const barangays = await prisma.barangay.findMany({
      where: {
        seal: 'yes'
      },
      select: {
        barangay_id: true,
        barangay_name: true,
        seal: true,
        seal_expiration_date: true
      },
      take: 5
    });
    
    console.log('✅ Verification successful. Sample data:');
    console.table(barangays);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  applySealExpirationMigration()
    .then(() => {
      console.log('Migration process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}