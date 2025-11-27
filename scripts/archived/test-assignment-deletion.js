const fetch = require('node-fetch');

async function testAssignmentDeletion() {
  console.log('🧪 Testing Assignment Deletion...\n');

  try {
    // First, get current assignments
    console.log('1. Fetching current assignments...');
    const assignmentsResponse = await fetch('http://localhost:3000/api/assignments');
    
    if (!assignmentsResponse.ok) {
      throw new Error(`Failed to fetch assignments: ${assignmentsResponse.status}`);
    }
    
    const assignments = await assignmentsResponse.json();
    console.log(`   Found ${assignments.length} assignments`);
    
    if (assignments.length === 0) {
      console.log('   No assignments to test deletion with');
      return;
    }
    
    // Show first assignment details
    const testAssignment = assignments[0];
    console.log(`   Test assignment ID: ${testAssignment.assignment_id}`);
    console.log(`   Barangay: ${testAssignment.barangay_name || 'Unknown'}`);
    console.log(`   User: ${testAssignment.firstName} ${testAssignment.lastName}`);
    
    // Test deletion
    console.log('\n2. Testing deletion...');
    const deleteResponse = await fetch('http://localhost:3000/api/assignments', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assignment_id: testAssignment.assignment_id
      })
    });
    
    console.log(`   Delete response status: ${deleteResponse.status}`);
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.log(`   ❌ Delete failed: ${errorText}`);
      
      // Try to parse as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.log(`   Error details:`, errorJson);
      } catch (e) {
        console.log(`   Raw error: ${errorText}`);
      }
    } else {
      const result = await deleteResponse.json();
      console.log(`   ✅ Delete successful:`, result);
      
      // Verify deletion
      console.log('\n3. Verifying deletion...');
      const verifyResponse = await fetch('http://localhost:3000/api/assignments');
      const updatedAssignments = await verifyResponse.json();
      console.log(`   Assignments after deletion: ${updatedAssignments.length}`);
      
      const stillExists = updatedAssignments.find(a => a.assignment_id === testAssignment.assignment_id);
      if (stillExists) {
        console.log('   ❌ Assignment still exists after deletion');
      } else {
        console.log('   ✅ Assignment successfully deleted');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssignmentDeletion();