// Diagnose FS assignment issue (read-only)
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  try {
    console.log('🔍 Diagnosing FS Assignment Issue...\n');

    // 1. Find FS user
    const { data: fsUsers, error: fsError } = await supabase
      .from('user')
      .select('id, firstName, lastName, email, role')
      .eq('role', 'fs');

    if (fsError) {
      console.log('❌ Error fetching FS users:', fsError.message);
      return;
    }

    if (!fsUsers || fsUsers.length === 0) {
      console.log('❌ No FS users found!');
      return;
    }

    const fs = fsUsers[0];
    console.log(`👤 FS User: ${fs.firstName} ${fs.lastName} (ID: ${fs.id})\n`);

    // 2. Get most recent cycle
    const { data: cycles, error: cycleError } = await supabase
      .from('survey_cycle')
      .select('*')
      .order('year', { ascending: false })
      .limit(3);

    if (cycleError) {
      console.log('❌ Error fetching cycles:', cycleError.message);
      return;
    }

    console.log(`📅 Recent Cycles:`);
    cycles.forEach(c => {
      console.log(`   - ${c.name} ${c.year} (ID: ${c.cycle_id})`);
    });
    console.log();

    const latestCycle = cycles[0];
    console.log(`📌 Latest Cycle: ${latestCycle.name} ${latestCycle.year} (ID: ${latestCycle.cycle_id})\n`);

    // 3. Check assignments
    const { data: altAssignments, error: altError } = await supabase
      .from('supervisor_assignments')
      .select('id, supervisor_id, barangay_id, cycle_id, status')
      .eq('supervisor_id', fs.id);

    if (altError) {
        console.log('❌ Alternative query also failed:', altError.message);
        console.log('\n🔧 SOLUTION: You need to manually check the database.');
        console.log('\nRun this SQL query in Supabase SQL Editor:');
        console.log(`
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
WHERE sa.supervisor_id = ${fs.id};
        `);
        console.log('\nThen update the assignment:');
        console.log(`
UPDATE supervisor_assignments
SET cycle_id = ${latestCycle.cycle_id}, status = 'Active'
WHERE supervisor_id = ${fs.id};
        `);
        return;
    }

    console.log(`📋 Found ${altAssignments.length} assignment(s):`);
    altAssignments.forEach(a => {
        console.log(`\n   Assignment ID: ${a.id}`);
        console.log(`   Barangay ID: ${a.barangay_id}`);
        console.log(`   Cycle ID: ${a.cycle_id} ${a.cycle_id === latestCycle.cycle_id ? '✅ (matches latest)' : '❌ (MISMATCH!)'}`);
        console.log(`   Status: ${a.status} ${a.status === 'Active' ? '✅' : '❌ (should be "Active")'}`);
    });

    const hasIssue = altAssignments.some(a => 
      a.cycle_id !== latestCycle.cycle_id || a.status !== 'Active'
    );

    if (hasIssue) {
        console.log(`\n\n⚠️  ISSUE FOUND!`);
        console.log(`\n🔧 SOLUTION: Run this SQL in Supabase SQL Editor:`);
        console.log(`
UPDATE supervisor_assignments
SET cycle_id = ${latestCycle.cycle_id}, status = 'Active'
WHERE supervisor_id = ${fs.id};
        `);
      } else {
        console.log(`\n\n✅ No issues found! Assignments look correct.`);
        console.log(`\n💡 If the FS dashboard still shows "No Assignments", try:`);
        console.log(`   1. Refresh the page (Ctrl+F5)`);
        console.log(`   2. Clear browser cache`);
        console.log(`   3. Log out and log back in`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

diagnose();
