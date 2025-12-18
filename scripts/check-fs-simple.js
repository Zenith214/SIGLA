// Simple check for FS assignments using direct SQL
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkFS() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Field Supervisor Assignments...\n');

    // Find FS users
    const fsResult = await client.query(`
      SELECT id, "firstName", "lastName", email, role
      FROM "user"
      WHERE role = 'fs'
    `);

    console.log(`📋 Found ${fsResult.rows.length} Field Supervisor(s):\n`);
    fsResult.rows.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.id}`);
    });

    if (fsResult.rows.length === 0) {
      console.log('\n❌ No Field Supervisors found!');
      return;
    }

    // Check assignments for each FS
    for (const fs of fsResult.rows) {
      console.log(`\n\n🔎 Checking assignments for ${fs.firstName} ${fs.lastName}...`);
      
      const assignmentsResult = await client.query(`
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
        WHERE sa.supervisor_id = $1
        ORDER BY sa.id DESC
      `, [fs.id]);

      const assignments = assignmentsResult.rows;
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
      const activeCycleResult = await client.query(`
        SELECT cycle_id, name, year
        FROM survey_cycle
        WHERE status = 'Active'
        LIMIT 1
      `);

      if (activeCycleResult.rows.length > 0) {
        const activeCycle = activeCycleResult.rows[0];
        console.log(`\n   📅 Active Cycle: ${activeCycle.name} ${activeCycle.year} (ID: ${activeCycle.cycle_id})`);
        
        const activeAssignments = assignments.filter(
          a => a.cycle_id === activeCycle.cycle_id && a.status === 'Active'
        );
        
        console.log(`   ✅ Active assignments for current cycle: ${activeAssignments.length}`);
        
        if (activeAssignments.length === 0 && assignments.length > 0) {
          console.log('\n   ⚠️  ISSUE FOUND:');
          console.log('      - Supervisor has assignments but none are Active for the current cycle');
          console.log('      - Possible causes:');
          assignments.forEach(a => {
            if (a.cycle_id !== activeCycle.cycle_id) {
              console.log(`        ❌ Assignment #${a.id} is for cycle ${a.cycle_id}, but active cycle is ${activeCycle.cycle_id}`);
            }
            if (a.status !== 'Active') {
              console.log(`        ❌ Assignment #${a.id} has status "${a.status}", should be "Active"`);
            }
          });
        }
      } else {
        console.log('\n   ⚠️  No active survey cycle found!');
      }
    }

    console.log('\n\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkFS();
