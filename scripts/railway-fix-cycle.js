/**
 * Railway-Compatible Cycle Fix Script
 * Can be run directly on Railway with: node scripts/railway-fix-cycle.js
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_KEY ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('🚀 Railway Cycle Fix Script');
  console.log('═'.repeat(60));
  console.log('');

  // Step 1: Check all cycles
  console.log('📋 Step 1: Checking all survey cycles...');
  const { data: cycles, error: fetchError } = await supabase
    .from('survey_cycle')
    .select('*')
    .order('cycle_id', { ascending: true });

  if (fetchError) {
    console.error('❌ Error fetching cycles:', fetchError.message);
    process.exit(1);
  }

  if (!cycles || cycles.length === 0) {
    console.log('⚠️  No survey cycles found in database');
    process.exit(0);
  }

  console.log(`✅ Found ${cycles.length} cycle(s)\n`);

  // Display all cycles
  cycles.forEach((cycle) => {
    const active = cycle.is_active ? '🟢' : '⚪';
    const yearMatch = cycle.name.includes(cycle.year.toString()) ? '✅' : '⚠️';
    console.log(`${active} Cycle ${cycle.cycle_id}: ${cycle.name} (Year: ${cycle.year}) ${yearMatch}`);
  });

  console.log('');

  // Step 2: Find cycles that need fixing
  const needsFix = cycles.filter(cycle => {
    const yearInName = cycle.name.match(/\d{4}/);
    return yearInName && parseInt(yearInName[0]) !== cycle.year;
  });

  if (needsFix.length === 0) {
    console.log('✅ All cycles are correct! No fixes needed.');
    process.exit(0);
  }

  console.log(`⚠️  Found ${needsFix.length} cycle(s) that need fixing:\n`);

  // Step 3: Fix each cycle
  for (const cycle of needsFix) {
    const yearInName = cycle.name.match(/\d{4}/)[0];
    const correctYear = parseInt(yearInName);

    console.log(`📝 Fixing Cycle ${cycle.cycle_id}:`);
    console.log(`   Name: ${cycle.name}`);
    console.log(`   Current Year: ${cycle.year}`);
    console.log(`   Correct Year: ${correctYear}`);

    const { error: updateError } = await supabase
      .from('survey_cycle')
      .update({ year: correctYear })
      .eq('cycle_id', cycle.cycle_id);

    if (updateError) {
      console.error(`   ❌ Failed to update: ${updateError.message}`);
    } else {
      console.log(`   ✅ Updated successfully!`);
    }
    console.log('');
  }

  // Step 4: Verify fixes
  console.log('🔍 Verifying fixes...');
  const { data: verifyData } = await supabase
    .from('survey_cycle')
    .select('*')
    .order('cycle_id', { ascending: true });

  const stillBroken = verifyData.filter(cycle => {
    const yearInName = cycle.name.match(/\d{4}/);
    return yearInName && parseInt(yearInName[0]) !== cycle.year;
  });

  if (stillBroken.length === 0) {
    console.log('✅ All cycles are now correct!');
  } else {
    console.log(`⚠️  ${stillBroken.length} cycle(s) still need attention`);
  }

  console.log('');
  console.log('═'.repeat(60));
  console.log('✅ Script completed');
}

main()
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  });
