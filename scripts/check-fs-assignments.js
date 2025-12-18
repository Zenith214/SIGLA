// Check Field Supervisor assignments
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFSAssignments() {
  try {
    console.log('🔍 Checking Field Supervisor Assignments...\n');

    // Find FS users
    const fsUsers = await prisma.user.findMany({
      where: { role: 'fs' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    console.log(`📋 Found ${fsUsers.length} Field Supervisor(s):\n`);
    fsUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.id}`);
    });

    if (fsUsers.length === 0) {
      console.log('\n❌ No Field Supervisors found!');
      return;
    }

    // Check assignments for each FS
    for (const fs of fsUsers) {
      console.log(`\n\n🔎 Checking assignments for ${fs.firstName} ${fs.lastName}...`);
      
      const assignments = await prisma.$queryRaw`
        SELECT 
          sa.id,
          sa.supervisor_id,
          sa.barangay_id,
          sa.cycle_id,
          sa.status,
          b.barangay_name,
          sc.name as cycle_name,
          sc.year as cycle_year
        FROM supervisor_assignments sa
        INNER JOIN barangay b ON sa.barangay_id = b.barangay_id
        INNER JOIN survey_cycle sc ON sa.cycle_id = sc.cycle_id
        WHERE sa.supervisor_id = ${fs.id}
        ORDER BY sa.id DESC
      `;

      console.log(`\n   Found ${assignments.length} assignment(s):`);
      
      if (assignments.length === 0) {
        console.log('   ❌ No assignments found for this supervisor');
      } else {
        assignments.forEach((assignment, index) => {
          console.log(`\n   Assignment #${index + 1}:`);
          console.log(`      ID: ${assignment.id}`);
          console.log(`      Barangay: ${assignment.barangay_name} (ID: ${assignment.barangay_id})`);
          console.log(`      Cycle: ${assignment.cycle_name} ${assignment.cycle_year} (ID: ${assignment.cycle_id})`);
          console.log(`      Status: ${assignment.status}`);
        });
      }

      // Check active cycle
      const activeCycle = await prisma.survey_cycle.findFirst({
        where: { status: 'Active' },
        select: { cycle_id: true, name: true, year: true }
      });

      if (activeCycle) {
        console.log(`\n   📅 Active Cycle: ${activeCycle.name} ${activeCycle.year} (ID: ${activeCycle.cycle_id})`);
        
        const activeAssignments = assignments.filter(
          a => a.cycle_id === activeCycle.cycle_id && a.status === 'Active'
        );
        
        console.log(`   ✅ Active assignments for current cycle: ${activeAssignments.length}`);
        
        if (activeAssignments.length === 0 && assignments.length > 0) {
          console.log('\n   ⚠️  ISSUE FOUND:');
          console.log('      - Supervisor has assignments but none are Active for the current cycle');
          console.log('      - Possible causes:');
          console.log('        1. Assignment status is not "Active"');
          console.log('        2. Assignment is for a different cycle');
          console.log('        3. Assignment cycle_id doesn\'t match active cycle');
        }
      } else {
        console.log('\n   ⚠️  No active survey cycle found!');
      }
    }

    console.log('\n\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFSAssignments();
