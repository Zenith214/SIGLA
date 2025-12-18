// Import using dynamic import since we're dealing with TypeScript modules
async function importHelpers() {
  const helpers = await import('../src/utils/surveyCycleHelpers.js');
  return helpers;
}

async function testSurveyCycleHelpers() {
  console.log('Testing Survey Cycle Helper Functions...\n');

  try {
    // Import the helper functions
    const { 
      getActiveCycle, 
      setActiveCycle, 
      validateSingleActiveCycle,
      createSurveyCycle,
      getSurveyCycles,
      getActiveCycleId,
      generateSurveyNumber,
      getNextSurveySequence
    } = await importHelpers();
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
      const sequenceNumber = await getNextSurveySequence(1);
      const surveyNumber = await generateSurveyNumber(1, sequenceNumber);
      console.log('Generated survey number:', surveyNumber);
      console.log('✓ generateSurveyNumber() works\n');
    }

    // Test 6: Create a new cycle (for testing)
    console.log('Test 6: Creating a new survey cycle...');
    const newCycle = await createSurveyCycle(
      'Test Cycle 2026',
      2026,
      new Date('2026-01-01'),
      new Date('2026-12-31')
    );
    console.log('Created cycle:', newCycle);
    console.log('✓ createSurveyCycle() works\n');

    // Test 7: Set active cycle
    console.log('Test 7: Setting new cycle as active...');
    await setActiveCycle(newCycle.cycle_id);
    const newActiveCycle = await getActiveCycle();
    console.log('New active cycle:', newActiveCycle?.name);
    console.log('✓ setActiveCycle() works\n');

    // Test 8: Restore original active cycle
    if (activeCycle) {
      console.log('Test 8: Restoring original active cycle...');
      await setActiveCycle(activeCycle.cycle_id);
      const restoredActiveCycle = await getActiveCycle();
      console.log('Restored active cycle:', restoredActiveCycle?.name);
      console.log('✓ Active cycle restored\n');
    }

    console.log('🎉 All survey cycle helper tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  testSurveyCycleHelpers()
    .then(() => {
      console.log('\nTest script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTest script failed:', error);
      process.exit(1);
    });
}

module.exports = { testSurveyCycleHelpers };