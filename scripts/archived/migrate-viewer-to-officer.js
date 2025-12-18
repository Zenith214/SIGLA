/**
 * Data Migration Script: viewer to officer Role
 * 
 * This script updates all existing users with the "viewer" role to "officer" role.
 * This is part of the CPAP module integration where the viewer role is being
 * renamed to officer to better reflect governance responsibilities.
 * 
 * Usage:
 *   node scripts/migrate-viewer-to-officer.js
 * 
 * Requirements:
 *   - Database must be accessible
 *   - Prisma schema must be up to date
 *   - Migration 20251119081816_add_cpap_module_and_rename_viewer_to_officer must be applied
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateViewerToOfficer() {
  console.log('🔄 Starting viewer to officer role migration...\n');

  try {
    // Step 1: Connect to database
    console.log('📡 Connecting to database...');
    await prisma.$connect();
    console.log('✓ Connected successfully\n');

    // Step 2: Check current role distribution
    console.log('📊 Checking current role distribution...');
    const currentRoles = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count 
      FROM "user" 
      GROUP BY role
      ORDER BY role
    `;
    
    console.log('Current user roles:');
    currentRoles.forEach(rc => {
      console.log(`  - ${rc.role}: ${rc.count} users`);
    });
    console.log();

    // Step 3: Find users with viewer role
    const viewerUsers = await prisma.user.findMany({
      where: {
        role: 'viewer'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (viewerUsers.length === 0) {
      console.log('✓ No users with "viewer" role found. Migration not needed or already complete.\n');
      return;
    }

    console.log(`📝 Found ${viewerUsers.length} user(s) with "viewer" role:`);
    viewerUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`);
    });
    console.log();

    // Step 4: Perform the migration
    console.log('🔄 Updating users from "viewer" to "officer"...');
    const updateResult = await prisma.user.updateMany({
      where: {
        role: 'viewer'
      },
      data: {
        role: 'officer'
      }
    });

    console.log(`✓ Updated ${updateResult.count} user(s) successfully\n`);

    // Step 5: Verify the migration
    console.log('✅ Verifying migration...');
    const remainingViewers = await prisma.user.count({
      where: {
        role: 'viewer'
      }
    });

    if (remainingViewers > 0) {
      console.error(`❌ Migration incomplete: ${remainingViewers} user(s) still have "viewer" role`);
      process.exit(1);
    }

    const officerCount = await prisma.user.count({
      where: {
        role: 'officer'
      }
    });

    console.log(`✓ Verification complete: ${officerCount} user(s) now have "officer" role\n`);

    // Step 6: Show final role distribution
    console.log('📊 Final role distribution:');
    const finalRoles = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count 
      FROM "user" 
      GROUP BY role
      ORDER BY role
    `;
    
    finalRoles.forEach(rc => {
      console.log(`  - ${rc.role}: ${rc.count} users`);
    });
    console.log();

    console.log('✅ Migration completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Users migrated: ${updateResult.count}`);
    console.log(`  - Remaining viewer users: 0`);
    console.log(`  - Total officer users: ${officerCount}\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateViewerToOfficer()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
