/**
 * Fix Survey Cycle Year
 * Updates cycle ID 21 to have year 2026
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCycleYear() {
  console.log('🔍 Checking current cycle data...\n');

  // Get cycle 21
  const { data: cycle, error: fetchError } = await supabase
    .from('survey_cycle')
    .select('*')
    .eq('cycle_id', 21)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching cycle:', fetchError);
    return;
  }

  if (!cycle) {
    console.error('❌ Cycle ID 21 not found');
    return;
  }

  console.log('Current cycle data:');
  console.log(`  Cycle ID: ${cycle.cycle_id}`);
  console.log(`  Name: ${cycle.name}`);
  console.log(`  Year: ${cycle.year}`);
  console.log(`  Active: ${cycle.is_active}`);
  console.log('');

  if (cycle.year === 2026) {
    console.log('✅ Cycle year is already 2026. No update needed.');
    return;
  }

  console.log(`📝 Updating cycle year from ${cycle.year} to 2026...`);

  const { error: updateError } = await supabase
    .from('survey_cycle')
    .update({ year: 2026 })
    .eq('cycle_id', 21);

  if (updateError) {
    console.error('❌ Error updating cycle:', updateError);
    return;
  }

  console.log('✅ Successfully updated cycle year to 2026');

  // Verify the update
  const { data: updatedCycle } = await supabase
    .from('survey_cycle')
    .select('cycle_id, name, year, is_active')
    .eq('cycle_id', 21)
    .single();

  console.log('\nUpdated cycle data:');
  console.log(`  Cycle ID: ${updatedCycle.cycle_id}`);
  console.log(`  Name: ${updatedCycle.name}`);
  console.log(`  Year: ${updatedCycle.year}`);
  console.log(`  Active: ${updatedCycle.is_active}`);
}

fixCycleYear()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
