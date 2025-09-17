const fetch = require('node-fetch');

async function debugAssignmentAPI() {
  console.log('🔍 Debugging Assignment API Issues...\n');

  try {
    // Test 1: Check if the endpoint exists
    console.log('1. Testing /api/barangays-with-assignments endpoint...');
    
    try {
      const response = await fetch('http://localhost:3000/api/barangays-with-assignments');
      console.log(`   Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Error response: ${errorText}`);
        
        // Try to parse as JSON for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.log(`   Error details:`, errorJson);
        } catch (e) {
          console.log(`   Raw error text: ${errorText}`);
        }
      } else {
        const data = await response.json();
        console.log(`   ✅ Success: Found ${data.length} barangays with assignments`);
        if (data.length > 0) {
          console.log(`   Sample:`, data[0]);
        }
      }
    } catch (fetchError) {
      console.log(`   ❌ Fetch failed: ${fetchError.message}`);
    }

    // Test 2: Check basic assignments endpoint
    console.log('\n2. Testing basic /api/assignments endpoint...');
    
    try {
      const assignmentsResponse = await fetch('http://localhost:3000/api/assignments');
      console.log(`   Status: ${assignmentsResponse.status}`);
      
      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json();
        console.log(`   ✅ Found ${assignments.length} assignments`);
      } else {
        const errorText = await assignmentsResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (fetchError) {
      console.log(`   ❌ Fetch failed: ${fetchError.message}`);
    }

    // Test 3: Check barangays endpoint
    console.log('\n3. Testing /api/barangays endpoint...');
    
    try {
      const barangaysResponse = await fetch('http://localhost:3000/api/barangays');
      console.log(`   Status: ${barangaysResponse.status}`);
      
      if (barangaysResponse.ok) {
        const barangays = await barangaysResponse.json();
        console.log(`   ✅ Found ${barangays.length} barangays`);
      } else {
        const errorText = await barangaysResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (fetchError) {
      console.log(`   ❌ Fetch failed: ${fetchError.message}`);
    }

    // Test 4: Check interviewers endpoint
    console.log('\n4. Testing /api/interviewers endpoint...');
    
    try {
      const interviewersResponse = await fetch('http://localhost:3000/api/interviewers');
      console.log(`   Status: ${interviewersResponse.status}`);
      
      if (interviewersResponse.ok) {
        const interviewers = await interviewersResponse.json();
        console.log(`   ✅ Found ${interviewers.length} interviewers`);
      } else {
        const errorText = await interviewersResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (fetchError) {
      console.log(`   ❌ Fetch failed: ${fetchError.message}`);
    }

    console.log('\n🔧 Troubleshooting Steps:');
    console.log('   1. Ensure Next.js server is running (npm run dev)');
    console.log('   2. Check if the API file exists: src/app/api/barangays-with-assignments/route.ts');
    console.log('   3. Verify database connection is working');
    console.log('   4. Check server logs for detailed error messages');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAssignmentAPI();