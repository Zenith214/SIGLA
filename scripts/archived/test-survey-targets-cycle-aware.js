const baseUrl = 'http://localhost:3000';

async function testSurveyTargetsCycleAware() {
  console.log('🎯 Testing Survey Targets Cycle-Aware Implementation\n');

  try {
    // Test 1: Check if we have an active cycle
    console.log('1. 📋 Checking Active Survey Cycle...');
    const activeCycleResponse = await fetch(`${baseUrl}/api/survey-cycles/active`);
    
    if (!activeCycleResponse.ok) {
      console.log('❌ No active cycle found. Creating one for testing...');
      
      // Create a test cycle
      const createCycleResponse = await fetch(`${baseUrl}/api/survey-cycles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Cycle 2025',
          year: 2025
        })
      });
      
      if (createCycleResponse.ok) {
        const newCycle = await createCycleResponse.json();
        console.log('✅ Created test cycle:', newCycle.name);
        
        // Set it as active
        const setActiveResponse = await fetch(`${baseUrl}/api/survey-cycles/active`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cycle_id: newCycle.cycle_id })
        });
        
        if (setActiveResponse.ok) {
          console.log('✅ Set cycle as active');
        }
      }
    } else {
      const activeCycle = await activeCycleResponse.json();
      console.log('✅ Active cycle found:', activeCycle.name, `(${activeCycle.year})`);
    }

    // Test 2: Get survey targets (should be filtered by active cycle)
    console.log('\n2. 🎯 Testing Survey Targets API (Cycle-Filtered)...');
    const targetsResponse = await fetch(`${baseUrl}/api/survey-targets`);
    
    if (targetsResponse.ok) {
      const targets = await targetsResponse.json();
      console.log(`✅ Retrieved ${targets.length} survey targets for active cycle`);
      
      if (targets.length > 0) {
        console.log('   Sample target:', {
          barangay: targets[0].barangay_name,
          target: targets[0].target,
          achieved: targets[0].achieved,
          cycle: targets[0].cycle_name
        });
      }
    } else {
      console.log('❌ Failed to retrieve survey targets');
    }

    // Test 3: Test historical data access
    console.log('\n3. 📊 Testing Historical Data Access...');
    const historicalResponse = await fetch(`${baseUrl}/api/survey-targets?include_historical=true`);
    
    if (historicalResponse.ok) {
      const historicalTargets = await historicalResponse.json();
      console.log(`✅ Retrieved ${historicalTargets.length} survey targets (including historical)`);
      
      // Group by cycle
      const byCycle = historicalTargets.reduce((acc, target) => {
        const cycle = target.cycle_name || 'No Cycle';
        acc[cycle] = (acc[cycle] || 0) + 1;
        return acc;
      }, {});
      
      console.log('   Targets by cycle:', byCycle);
    } else {
      console.log('❌ Failed to retrieve historical survey targets');
    }

    // Test 4: Test progress calculation
    console.log('\n4. 📈 Testing Progress Calculation...');
    const progressResponse = await fetch(`${baseUrl}/api/survey-targets/calculate-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (progressResponse.ok) {
      const progressResult = await progressResponse.json();
      console.log(`✅ Updated progress for ${progressResult.updated_count} targets`);
      console.log('   Message:', progressResult.message);
    } else {
      const error = await progressResponse.json();
      console.log('❌ Progress calculation failed:', error.error);
    }

    // Test 5: Test progress summary
    console.log('\n5. 📊 Testing Progress Summary...');
    const summaryResponse = await fetch(`${baseUrl}/api/survey-targets/calculate-progress`);
    
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      console.log('✅ Progress summary retrieved:');
      console.log('   Active Cycle ID:', summary.active_cycle_id);
      console.log('   Total Targets:', summary.summary.total_targets);
      console.log('   Total Target Count:', summary.summary.total_target_count);
      console.log('   Total Achieved:', summary.summary.total_achieved);
      console.log('   Overall Percentage:', summary.summary.overall_percentage + '%');
    } else {
      const error = await summaryResponse.json();
      console.log('❌ Progress summary failed:', error.error);
    }

    // Test 6: Test reset options
    console.log('\n6. 🔄 Testing Reset Options...');
    const resetOptionsResponse = await fetch(`${baseUrl}/api/survey-targets/reset`);
    
    if (resetOptionsResponse.ok) {
      const resetOptions = await resetOptionsResponse.json();
      console.log('✅ Reset options retrieved:');
      console.log('   Available cycles:', resetOptions.available_cycles.length);
      console.log('   Reset actions:', resetOptions.reset_options.map(opt => opt.action));
    } else {
      const error = await resetOptionsResponse.json();
      console.log('❌ Reset options failed:', error.error);
    }

    // Test 7: Test creating a target (should auto-link to active cycle)
    console.log('\n7. ➕ Testing Target Creation (Auto-Cycle Linking)...');
    
    // First get available barangays
    const barangaysResponse = await fetch(`${baseUrl}/api/barangays`);
    if (barangaysResponse.ok) {
      const barangays = await barangaysResponse.json();
      
      if (barangays.length > 0) {
        const testBarangay = barangays[0];
        
        const createTargetResponse = await fetch(`${baseUrl}/api/survey-targets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barangay_id: testBarangay.barangay_id,
            target: 50,
            achieved: 0,
            percentage: 0
          })
        });
        
        if (createTargetResponse.ok) {
          const newTarget = await createTargetResponse.json();
          console.log('✅ Created new target with auto-cycle linking');
          console.log('   Barangay ID:', newTarget.barangay_id);
          console.log('   Survey Cycle ID:', newTarget.survey_cycle_id);
          console.log('   Target:', newTarget.target);
        } else {
          const error = await createTargetResponse.json();
          console.log('⚠️ Target creation result:', error.error);
        }
      }
    }

    console.log('\n🎉 Survey Targets Cycle-Aware Testing Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSurveyTargetsCycleAware();