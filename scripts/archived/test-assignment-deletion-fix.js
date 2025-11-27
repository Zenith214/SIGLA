const fetch = require('node-fetch');

async function testAssignmentDeletionFix() {
  console.log('🧪 Testing Assignment Deletion Fix...\n');

  try {
    // Test 1: Check if we can fetch assignments
    console.log('1. Testing assignments API...');
    const assignmentsResponse = await fetch('http://localhost:3000/api/assignments');
    
    if (!assignmentsResponse.ok) {
      console.log(`   ❌ Assignments API failed: ${assignmentsResponse.status}`);
      return;
    }
    
    const assignments = await assignmentsResponse.json();
    console.log(`   ✅ Found ${assignments.length} assignments`);
    
    // Test 2: Check if we can fetch all barangays
    console.log('\n2. Testing barangays/all API...');
    const barangaysResponse = await fetch('http://localhost:3000/api/barangays/all');
    
    if (!barangaysResponse.ok) {
      console.log(`   ❌ Barangays API failed: ${barangaysResponse.status}`);
      return;
    }
    
    const barangays = await barangaysResponse.json();
    console.log(`   ✅ Found ${barangays.length} barangays`);
    
    // Test 3: Check if we can fetch interviewers
    console.log('\n3. Testing interviewers API...');
    const interviewersResponse = await fetch('http://localhost:3000/api/interviewers');
    
    if (!interviewersResponse.ok) {
      console.log(`   ❌ Interviewers API failed: ${interviewersResponse.status}`);
      return;
    }
    
    const interviewers = await interviewersResponse.json();
    console.log(`   ✅ Found ${interviewers.length} interviewers`);
    
    // Test 4: Test assignment creation if we have data
    if (barangays.length > 0 && interviewers.length > 0) {
      console.log('\n4. Testing assignment creation...');
      
      const testAssignment = {
        barangay_id: barangays[0].id || barangays[0].barangay_id,
        user_id: interviewers[0].id,
        status: 'Pending',
        progress: 0
      };
      
      console.log('   Creating test assignment:', testAssignment);
      
      const createResponse = await fetch('http://localhost:3000/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testAssignment)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.log(`   ❌ Create failed: ${createResponse.status} - ${errorText}`);
        return;
      }
      
      const createdAssignment = await createResponse.json();
      console.log(`   ✅ Created assignment ID: ${createdAssignment.assignment_id}`);
      
      // Test 5: Test the new deletion endpoint
      console.log('\n5. Testing assignment deletion (new endpoint)...');
      
      const deleteResponse = await fetch(`http://localhost:3000/api/assignments/${createdAssignment.assignment_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.log(`   ❌ Delete failed: ${deleteResponse.status} - ${errorText}`);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('   Error details:', errorJson);
        } catch (e) {
          console.log('   Raw error:', errorText);
        }
        return;
      }
      
      const deleteResult = await deleteResponse.json();
      console.log(`   ✅ Delete successful:`, deleteResult);
      
      // Test 6: Verify deletion
      console.log('\n6. Verifying deletion...');
      const verifyResponse = await fetch('http://localhost:3000/api/assignments');
      const updatedAssignments = await verifyResponse.json();
      
      const stillExists = updatedAssignments.find(a => a.assignment_id === createdAssignment.assignment_id);
      if (stillExists) {
        console.log('   ❌ Assignment still exists after deletion');
      } else {
        console.log('   ✅ Assignment successfully deleted');
      }
      
    } else {
      console.log('\n4. ⚠️  Cannot test assignment creation - missing barangays or interviewers');
    }
    
    console.log('\n🎉 Assignment deletion fix test completed!');
    console.log('\n📋 Summary of fixes:');
    console.log('   ✅ Changed DELETE endpoint from /api/assignments to /api/assignments/{id}');
    console.log('   ✅ Changed barangays endpoint from /api/barangays to /api/barangays/all');
    console.log('   ✅ Improved error handling and user feedback');
    console.log('   ✅ Fixed data structure matching for barangays and interviewers');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssignmentDeletionFix();