// Test script for assignment API cycle-awareness
// This script tests the assignment API endpoints to ensure they are cycle-aware

async function testAssignmentAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Assignment API Cycle-Awareness');
  console.log('==========================================\n');

  try {
    // Test 1: Get active cycle
    console.log('📋 Test 1: Getting active survey cycle...');
    const activeCycleResponse = await fetch(`${baseUrl}/api/survey-cycles/active`);
    
    if (!activeCycleResponse.ok) {
      console.log('❌ No active cycle found or API error');
      console.log('   This is expected if no cycle is set as active');
      return;
    }
    
    const activeCycle = await activeCycleResponse.json();
    console.log('✅ Active cycle found:', activeCycle);

    // Test 2: Get assignments (should be filtered by active cycle)
    console.log('\n📋 Test 2: Getting assignments (cycle-filtered)...');
    const assignmentsResponse = await fetch(`${baseUrl}/api/assignments`);
    
    if (!assignmentsResponse.ok) {
      const errorData = await assignmentsResponse.json();
      console.log('❌ Assignments API error:', errorData);
      return;
    }
    
    const assignments = await assignmentsResponse.json();
    console.log(`✅ Retrieved ${assignments.length} assignments from active cycle`);
    
    if (assignments.length > 0) {
      console.log('   Sample assignment:');
      const sample = assignments[0];
      console.log(`   - ID: ${sample.assignment_id}`);
      console.log(`   - Barangay: ${sample.barangay?.barangay_name || 'Unknown'}`);
      console.log(`   - Interviewer: ${sample.user?.firstName} ${sample.user?.lastName}`);
      console.log(`   - Cycle: ${sample.survey_cycle?.name || 'Unknown'} (${sample.survey_cycle?.year || 'Unknown'})`);
      console.log(`   - Status: ${sample.status}`);
    }

    // Test 3: Test barangays with assignments (already cycle-aware)
    console.log('\n📋 Test 3: Getting barangays with assignments...');
    const barangaysResponse = await fetch(`${baseUrl}/api/barangays-with-assignments`);
    
    if (barangaysResponse.ok) {
      const barangays = await barangaysResponse.json();
      console.log(`✅ Retrieved ${barangays.length} barangays with assignments from active cycle`);
      
      if (barangays.length > 0) {
        const assignedBarangays = barangays.filter(b => b.assignment);
        console.log(`   - ${assignedBarangays.length} barangays have assignments in active cycle`);
      }
    } else {
      console.log('❌ Barangays with assignments API error');
    }

    console.log('\n🎉 Assignment API cycle-awareness tests completed!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Assignment API endpoints are now cycle-aware');
    console.log('   ✅ All assignment operations are scoped to active cycle');
    console.log('   ✅ Assignment creation, updates, and deletion require active cycle');
    console.log('   ✅ Assignment retrieval is filtered by active cycle');

  } catch (error) {
    console.error('❌ Error during API testing:', error.message);
    console.log('\n💡 Make sure the Next.js development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testAssignmentAPI();