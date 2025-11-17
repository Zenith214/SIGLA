const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_CYCLE_ID = 1; // Adjust based on your database
const TEST_BARANGAY_ID = 26; // Adjust based on your database
const TEST_FI_ID = 2; // Adjust based on your database (must have INTERVIEWER role)

// You'll need to get a valid auth token from your system
// For now, this test assumes you're running it while logged in
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

async function testSpotManagementAPI() {
  console.log('🧪 Testing Spot Management API endpoints...\n');
  
  let createdSpotId = null;

  try {
    // Test 1: Create a spot
    console.log('📝 Test 1: Creating a new spot...');
    const createResponse = await fetch(`${BASE_URL}/api/spots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pulse_token=${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        cycleId: TEST_CYCLE_ID,
        barangayId: TEST_BARANGAY_ID,
        spotName: `Test Spot ${Date.now()}`,
        startingPoint: {
          lat: 8.4542,
          lng: 124.6319
        },
        randomStart: 123
      })
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      createdSpotId = createResult.spotId;
      console.log('✅ Spot created successfully!');
      console.log(`   - Spot ID: ${createResult.spotId}`);
      console.log(`   - Spot Name: ${createResult.spotName}`);
      console.log(`   - Questionnaires: ${createResult.questionnaires.join(', ')}`);
      console.log('');
    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create spot:', error);
      return;
    }

    // Test 2: Get all spots
    console.log('📋 Test 2: Retrieving all spots...');
    const getResponse = await fetch(
      `${BASE_URL}/api/spots?cycleId=${TEST_CYCLE_ID}&barangayId=${TEST_BARANGAY_ID}`,
      {
        headers: {
          'Cookie': `pulse_token=${AUTH_TOKEN}`
        }
      }
    );

    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log(`✅ Retrieved ${getResult.spots.length} spot(s)`);
      if (getResult.spots.length > 0) {
        const spot = getResult.spots[0];
        console.log(`   - First spot: ${spot.spotName}`);
        console.log(`   - Status: ${spot.status}`);
        console.log(`   - Progress: ${spot.completedCount}/${spot.totalCount}`);
      }
      console.log('');
    } else {
      const error = await getResponse.json();
      console.log('❌ Failed to retrieve spots:', error);
    }

    // Test 3: Assign spot to FI
    if (createdSpotId) {
      console.log('👤 Test 3: Assigning spot to Field Interviewer...');
      const assignResponse = await fetch(
        `${BASE_URL}/api/spots/${createdSpotId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `pulse_token=${AUTH_TOKEN}`
          },
          body: JSON.stringify({
            fiId: TEST_FI_ID
          })
        }
      );

      if (assignResponse.ok) {
        const assignResult = await assignResponse.json();
        console.log('✅ Spot assigned successfully!');
        console.log(`   - Assigned to: ${assignResult.assignedTo}`);
        console.log(`   - Email: ${assignResult.assignedToEmail}`);
        console.log('');
      } else {
        const error = await assignResponse.json();
        console.log('❌ Failed to assign spot:', error);
        console.log('');
      }
    }

    // Test 4: Try to delete assigned spot (should fail)
    if (createdSpotId) {
      console.log('🗑️  Test 4: Attempting to delete assigned spot (should fail)...');
      const deleteResponse = await fetch(
        `${BASE_URL}/api/spots/${createdSpotId}`,
        {
          method: 'DELETE',
          headers: {
            'Cookie': `pulse_token=${AUTH_TOKEN}`
          }
        }
      );

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        console.log('✅ Correctly prevented deletion of assigned spot');
        console.log(`   - Error: ${error.error}`);
        console.log('');
      } else {
        console.log('❌ Should not have allowed deletion of assigned spot!');
        console.log('');
      }
    }

    // Test 5: Get spots filtered by assigned FI
    console.log('🔍 Test 5: Retrieving spots assigned to specific FI...');
    const getFiSpotsResponse = await fetch(
      `${BASE_URL}/api/spots?cycleId=${TEST_CYCLE_ID}&assignedFiId=${TEST_FI_ID}`,
      {
        headers: {
          'Cookie': `pulse_token=${AUTH_TOKEN}`
        }
      }
    );

    if (getFiSpotsResponse.ok) {
      const getFiSpotsResult = await getFiSpotsResponse.json();
      console.log(`✅ Retrieved ${getFiSpotsResult.spots.length} spot(s) for FI`);
      console.log('');
    } else {
      const error = await getFiSpotsResponse.json();
      console.log('❌ Failed to retrieve FI spots:', error);
      console.log('');
    }

    console.log('✅ All tests completed!');
    console.log('\n📝 Note: The test spot was left in the database for inspection.');
    console.log('   You can manually unassign and delete it through the UI or API.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure the development server is running: npm run dev');
    console.log('   2. Verify TEST_CYCLE_ID, TEST_BARANGAY_ID, and TEST_FI_ID exist in your database');
    console.log('   3. Ensure the FI user has the INTERVIEWER role');
    console.log('   4. Set TEST_AUTH_TOKEN environment variable with a valid auth token');
  }
}

testSpotManagementAPI();
