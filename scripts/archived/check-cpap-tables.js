const { PrismaClient } = require('@prisma/client');

async function checkCPAPTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking for CPAP tables...\n');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('cpaps', 'cpap_items')
    `;
    
    console.log('Tables found:', tables);
    
    // Check if CPAPStatus enum exists
    const enums = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'CPAPStatus'
      )
    `;
    
    console.log('\nCPAPStatus enum values:', enums);
    
    // Check user role default
    const roleDefault = await prisma.$queryRaw`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name = 'role'
    `;
    
    console.log('\nUser role default:', roleDefault);
    
    // Check if any users have 'officer' role
    const officerCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "user" 
      WHERE role = 'officer'
    `;
    
    console.log('\nOfficer users count:', officerCount);
    
    // Check if any users still have 'viewer' role
    const viewerCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "user" 
      WHERE role = 'viewer'
    `;
    
    console.log('Viewer users count:', viewerCount);
    
    console.log('\n✅ CPAP tables check complete');
    
  } catch (error) {
    console.error('❌ Error checking CPAP tables:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkCPAPTables();
