/**
 * Fix CPAP Table Permissions Script
 * 
 * This script grants necessary permissions on CPAP tables to the database user.
 * Run this if you encounter "permission denied for table cpaps" errors.
 * 
 * Usage: node scripts/fix-cpap-permissions.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPermissions() {
  console.log('🔧 Fixing CPAP table permissions...\n');

  try {
    // Get the current database user
    const userResult = await prisma.$queryRaw`SELECT current_user`;
    const currentUser = userResult[0].current_user;
    console.log(`📌 Current database user: ${currentUser}\n`);

    // Grant permissions on cpaps table
    console.log('✓ Granting permissions on cpaps table...');
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpaps TO ${currentUser}`);
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO ${currentUser}`);

    // Grant permissions on cpap_items table
    console.log('✓ Granting permissions on cpap_items table...');
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpap_items TO ${currentUser}`);
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO ${currentUser}`);

    // Grant permissions on CPAPStatus enum type
    console.log('✓ Granting permissions on CPAPStatus enum...');
    await prisma.$executeRawUnsafe(`GRANT USAGE ON TYPE "CPAPStatus" TO ${currentUser}`);

    console.log('\n✅ Permissions granted successfully!\n');

    // Verify permissions
    console.log('📋 Verifying permissions...\n');
    const permissions = await prisma.$queryRaw`
      SELECT 
        grantee, 
        table_schema, 
        table_name, 
        privilege_type
      FROM information_schema.table_privileges
      WHERE table_name IN ('cpaps', 'cpap_items')
        AND grantee = ${currentUser}
      ORDER BY table_name, privilege_type
    `;

    if (permissions.length > 0) {
      console.log('Granted permissions:');
      permissions.forEach(perm => {
        console.log(`  - ${perm.table_name}: ${perm.privilege_type}`);
      });
    } else {
      console.log('⚠️  Warning: Could not verify permissions. They may still be set correctly.');
    }

    console.log('\n✅ CPAP table permissions fixed successfully!');
    console.log('You can now access the CPAP Management page.\n');

  } catch (error) {
    console.error('\n❌ Error fixing permissions:', error);
    console.error('\nIf you see permission errors, you may need to:');
    console.error('1. Run this script as a database superuser');
    console.error('2. Or manually run the SQL in database/fix-cpap-permissions.sql\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixPermissions();
