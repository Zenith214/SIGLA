// Fix FS assignment to match active cycle
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixFSAssignment() {
  try {
    console.log('🔧 Fixing FS Assignment...\n');

    // 1. Find FS user
    const { data: fsUsers, error: fsError } = await supabase
      .from('user')
      .select('id, firstName, lastName, email')
      .eq('role', 'fs');

    if (fsError) throw fsError;

    if (!fsUsers || fsUsers.length === 0) {
      console.log('❌ No FS users found!');
      return;
    }

    const fs = fsUsers[0];
    console.log(`👤 Found FS: ${fs.firstName} ${fs.lastName} (ID: ${fs.id})\n`);

    // 2. Get active cycle (most recent one)
    const { data: cycles, error: cycleError } = await supabase
      .from('survey_cycle')
      .select('*')
      .order('year', { ascending: false })
      .limit(1);

    if (cycleError) throw cycleError;
    if (!cycles || cycles.length === 0) throw new Error('No survey cycles found');
    
    const activeCycle = cycles[0];

    if (cycleError) throw cycleError;

    console.log(`📅 Active Cycle: ${activeCycle.name} ${activeCycle.year} (ID: ${activeCycle.cycle_id})\n`);

    // 3. Check existing assignments
    const { data: assignments, error: assignError } = await supabase
      .from('supervisor_assignments')
      .select(`
        *,
        barangay:barangay_id (barangay_name)
      `)
      .eq('supervisor_id', fs.id);

    if (assignError) throw assignError;

    console.log(`📋 Found ${assignments.length} existing assignment(s):`);
    assignments.forEach(a => {
      console.log(`   - ${a.barangay.barangay_name} (Cycle: ${a.cycle_id}, Status: ${a.status})`);
    });

    // 4. Update assignments to active cycle and Active status
    console.log(`\n🔄 Updating assignments...`);
    
    for (const assignment of assignments) {
      const { data, error } = await supabase
        .from('supervisor_assignments')
        .update({
          cycle_id: activeCycle.cycle_id,
          status: 'Active'
        })
        .eq('id', assignment.id)
        .select();

      if (error) {
        console.log(`   ❌ Failed to update assignment ${assignment.id}:`, error.message);
      } else {
        console.log(`   ✅ Updated assignment for ${assignment.barangay.barangay_name}`);
        console.log(`      - Cycle: ${assignment.cycle_id} → ${activeCycle.cycle_id}`);
        console.log(`      - Status: ${assignment.status} → Active`);
      }
    }

    // 5. Verify the fix
    console.log(`\n🔍 Verifying fix...`);
    
    const { data: verifyAssignments, error: verifyError } = await supabase
      .from('supervisor_assignments')
      .select(`
        *,
        barangay:barangay_id (barangay_name)
      `)
      .eq('supervisor_id', fs.id)
      .eq('cycle_id', activeCycle.cycle_id)
      .eq('status', 'Active');

    if (verifyError) throw verifyError;

    console.log(`\n✅ Verification: Found ${verifyAssignments.length} active assignment(s) for current cycle:`);
    verifyAssignments.forEach(a => {
      console.log(`   - ${a.barangay.barangay_name}`);
    });

    console.log(`\n🎉 Fix complete! The FS dashboard should now show assignments.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixFSAssignment();
