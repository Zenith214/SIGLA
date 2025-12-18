/**
 * Check Survey Cycle Data
 * Displays all survey cycles to verify year values
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCycleData() {
  console.log('🔍 Fetching all survey cycles...\n');

  const { data: cycles, error } = await supabase
    .from('survey_cycle')
    .select('*')
    .order('cycle_id', { ascending: true });

  if (error) {
    console.error('❌ Error fetching cycles:', error);
    return;
  }

  if (!cycles || cycles.length === 0) {
    console.log('⚠️  No survey cycles found');
    return;
  }

  console.log(`Found ${cycles.length} survey cycle(s):\n`);
  console.log('═'.repeat(80));

  cycles.forEach((cycle, index) => {
    const activeIndicator = cycle.is_active ? '🟢 ACTIVE' : '⚪ Inactive';
    const nameYearMatch = cycle.name.includes(cycle.year.toString()) ? '✅' : '⚠️ ';
    
    console.log(`\n${index + 1}. ${activeIndicator}`);
    console.log(`   Cycle ID:    ${cycle.cycle_id}`);
    console.log(`   Name:        ${cycle.name}`);
    console.log(`   Year:        ${cycle.year} ${nameYearMatch}`);
    console.log(`   Start Date:  ${cycle.start_date || 'Not set'}`);
    console.log(`   End Date:    ${cycle.end_date || 'Not set'}`);
    console.log(`   Created:     ${new Date(cycle.created_at).toLocaleString()}`);
    console.log(`   Updated:     ${cycle.updated_at ? new Date(cycle.updated_at).toLocaleString() : 'Never'}`);
  });

  console.log('\n' + '═'.repeat(80));
  
  // Check for mismatches
  const mismatches = cycles.filter(cycle => {
    const yearInName = cycle.name.match(/\d{4}/);
    return yearInName && parseInt(yearInName[0]) !== cycle.year;
  });

  if (mismatches.length > 0) {
    console.log('\n⚠️  WARNING: Found cycles with name/year mismatches:');
    mismatches.forEach(cycle => {
      const yearInName = cycle.name.match(/\d{4}/)[0];
      console.log(`   - Cycle ${cycle.cycle_id}: Name says "${yearInName}" but year field is ${cycle.year}`);
    });
  } else {
    console.log('\n✅ All cycle names match their year values');
  }

  // Show active cycle
  const activeCycle = cycles.find(c => c.is_active);
  if (activeCycle) {
    console.log(`\n🎯 Active Cycle: ${activeCycle.name} (ID: ${activeCycle.cycle_id}, Year: ${activeCycle.year})`);
  } else {
    console.log('\n⚠️  No active cycle found');
  }
}

checkCycleData()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
