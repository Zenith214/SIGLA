const fetch = require('node-fetch');

async function debugAssignmentDeletion() {
  console.log('🔍 Debugging Assignment Deletion Issue...\n');

  try {
    // Step 1: Test basic API connectivity
    console.log('1. Testing API connectivity...');
    
    const healthCheck = await fetch('http://localhost:3000/api/assignments');
    console.log(`   Assignments API status: ${healthCheck.status}`);
    
    if (!healthCheck.ok) {
      console.log('   ❌ Basic API connectivity failed');
      return;
    }
    
    const assignments = await healthCheck.json();
    console.log(`   ✅ Found ${assignments.length} assignments`);
    
    // Step 2: Test individual assignment endpoint
    if (assignments.length > 0) {
      const testAssignmentId = assignments[0].assignment_id;
      console.log(`\n2. Testing individual assignment endpoint (ID: ${testAssignmentId})...`);
      
      const individualResponse = await fetch(`http://localhost:3000/api/assignments/${testAssignmentId}`);
      console.log(`   GET /api/assignments/${testAssignmentId} status: ${individualResponse.status}`);
      
      if (individualResponse.ok) {
        const assignmentData = await individualResponse.json();
        console.log(`   ✅ Individual assignment data retrieved`);
        console.log(`   Assignment: ${assignmentData.barangay_name} -> ${assignmentData.firstName} ${assignmentData.lastName}`);
      } else {
        console.log(`   ❌ Individual assignment endpoint failed`);
        const errorText = await individualResponse.text();
        console.log(`   Error: ${errorText}`);
      }
    }
    
    // Step 3: Test database connection directly
    console.log('\n3. Testing database schema...');
    
    // Check if we can query the assignment table structure
    const schemaTest = await fetch('http://localhost:3000/api/assignments');
    if (schemaTest.ok) {
      const data = await schemaTest.json();
      if (data.length > 0) {
        console.log('   ✅ Assignment table structure:');
        const sampleAssignment = data[0];
        Object.keys(sampleAssignment).forEach(key => {
          console.log(`     - ${key}: ${typeof sampleAssignment[key]}`);
        });
      }
    }
    
    // Step 4: Create a test assignment for deletion
    console.log('\n4. Creating test assignment for deletion...');
    
    // First get barangays and interviewers
    const barangaysResponse = await fetch('http://localhost:3000/api/barangays/all');
    const interviewersResponse = await fetch('http://localhost:3000/api/interviewers');
    
    if (!barangaysResponse.ok || !interviewersResponse.ok) {
      console.log('   ❌ Cannot get barangays or interviewers for test');
      return;
    }
    
    const barangays = await barangaysResponse.json();
    const interviewers = await interviewersResponse.json();
    
    if (barangays.length === 0 || interviewers.length === 0) {
      console.log('   ❌ No barangays or interviewers available for test');
      return;
    }
    
    const testAssignment = {
      barangay_id: barangays[0].id || barangays[0].barangay_id,
      user_id: interviewers[0].id,
      status: 'Pending',
      progress: 0
    };
    
    console.log('   Creating assignment:', testAssignment);
    
    const createResponse = await fetch('http://localhost:3000/api/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAssignment)
    });
    
    if (!createResponse.ok) {
      console.log(`   ❌ Failed to create test assignment: ${createResponse.status}`);
      const errorText = await createResponse.text();
      console.log(`   Error: ${errorText}`);
      return;
    }
    
    const createdAssignment = await createResponse.json();
    console.log(`   ✅ Created test assignment ID: ${createdAssignment.assignment_id}`);
    
    // Step 5: Test deletion with detailed logging
    console.log('\n5. Testing deletion with detailed logging...');
    
    const deleteUrl = `http://localhost:3000/api/assignments/${createdAssignment.assignment_id}`;
    console.log(`   DELETE URL: ${deleteUrl}`);
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Delete response status: ${deleteResponse.status}`);
    console.log(`   Delete response headers:`, Object.fromEntries(deleteResponse.headers.entries()));
    
    // Try to get response text first
    const responseText = await deleteResponse.text();
    console.log(`   Raw response text: "${responseText}"`);
    
    if (deleteResponse.ok) {
      if (responseText) {
        try {
          const deleteResult = JSON.parse(responseText);
          console.log(`   ✅ Delete successful:`, deleteResult);
        } catch (jsonError) {
          console.log(`   ✅ Delete successful (non-JSON response)`);
        }
      } else {
        console.log(`   ✅ Delete successful (empty response)`);
      }
      
      // Verify deletion
      console.log('\n6. Verifying deletion...');
      const verifyResponse = await fetch('http://localhost:3000/api/assignments');
      const updatedAssignments = await verifyResponse.json();
      
      const stillExists = updatedAssignments.find(a => a.assignment_id === createdAssignment.assignment_id);
      if (stillExists) {
        console.log('   ❌ Assignment still exists after deletion');
      } else {
        console.log('   ✅ Assignment successfully deleted from database');
      }
      
    } else {
      console.log(`   ❌ Delete failed with status ${deleteResponse.status}`);
      
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          console.log(`   Error details:`, errorData);
        } catch (jsonError) {
          console.log(`   Raw error text: ${responseText}`);
        }
      }
    }
    
    console.log('\n🎯 Debug Summary:');
    console.log('   - Check if the server is running on port 3000');
    console.log('   - Verify database connection is working');
    console.log('   - Ensure the /api/assignments/[id] route is properly configured');
    console.log('   - Check server logs for any database errors');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure Next.js dev server is running (npm run dev)');
    console.log('   2. Check database connection in .env file');
    console.log('   3. Verify all API routes are properly configured');
    console.log('   4. Check browser network tab for actual HTTP requests');
  }
}

debugAssignmentDeletion();