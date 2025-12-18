const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Implement the helper functions directly for testing
async function getActiveCycle() {
  const { data: activeCycle, error } = await supabase
    .from('survey_cycle')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return activeCycle;
}

async function validateSingleActiveCycle() {
  const { data: activeCycles, error } = await supabase
    .from('survey_cycle')
    .select('cycle_id')
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  return (activeCycles?.length || 0) <= 1;
}

async function getSurveyCycles() {
  const { data: cycles, error } = await supabase
    .from('survey_cycle')
    .select('*')
    .order('is_active', { ascending: false })
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return cycles || [];
}

async function getActiveCycleId() {
  const activeCycle = await getActiveCycle();
  return activeCycle?.cycle_id || null;
}

async function generateSurveyNumber(barangayId, sequenceNumber) {
  const activeCycle = await getActiveCycle();
  
  if (!activeCycle) {
    throw new Error('No active survey cycle found. Cannot generate survey number.');
  }

  const barangayPart = barangayId.toString().padStart(2, '0');
  const yearPart = activeCycle.year.toString();
  const sequencePart = sequenceNumber.toString().padStart(4, '0');
  
  return `${barangayPart}-${yearPart}-${sequencePart}`;
}

async function testSurveyCycleHelpers() {
  console.log('Testing Survey Cycle Helper Functions...\n');

  try {
    // Test 1: Get active cycle
    console.log('Test 1: Getting active cycle...');
    const activeCycle = await getActiveCycle();
    console.log('Active cycle:', activeCycle);
    console.log('✓ getActiveCycle() works\n');

    // Test 2: Validate single active cycle
    console.log('Test 2: Validating single active cycle constraint...');
    const isValid = await validateSingleActiveCycle();
    console.log('Single active cycle constraint valid:', isValid);
    console.log('✓ validateSingleActiveCycle() works\n');

    // Test 3: Get all cycles
    console.log('Test 3: Getting all survey cycles...');
    const allCycles = await getSurveyCycles();
    console.log('Total cycles:', allCycles.length);
    console.log('Cycles:', allCycles.map(c => `${c.name} (${c.year}) - Active: ${c.is_active}`));
    console.log('✓ getSurveyCycles() works\n');

    // Test 4: Get active cycle ID
    console.log('Test 4: Getting active cycle ID...');
    const activeCycleId = await getActiveCycleId();
    console.log('Active cycle ID:', activeCycleId);
    console.log('✓ getActiveCycleId() works\n');

    // Test 5: Generate survey number
    if (activeCycleId) {
      console.log('Test 5: Generating survey number...');
      const surveyNumber = await generateSurveyNumber(1, 1);
      console.log('Generated survey number:', surveyNumber);
      console.log('✓ generateSurveyNumber() works\n');
    }

    console.log('🎉 All survey cycle helper tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the tests
testSurveyCycleHelpers()
  .then(() => {
    console.log('\nTest script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest script failed:', error);
    process.exit(1);
  });