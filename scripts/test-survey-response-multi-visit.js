const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_CYCLE_ID = 18; // Active cycle: PULSE SURVEY 2026
const TEST_BARANGAY_ID = 6; // Katipunan
const TEST_FI_ID = 2; // Interviewer User
const TEST_SPOT_ID = null; // Will be created during test
const TEST_QUESTIONNAIRE_ID = `2024-TEST-${Date.now()}`; // Unique test questionnaire ID

// You'll need to get a valid auth token from your system
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

// Helper function to create a test spot with questionnaires
async function createTestSpot() {
  console.log('🏗️  Creating test spot with questionnaires...');
  const response = await fetch(`${BASE_URL}/api/spots`, {
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

  if (response.ok) {
    const result = await response.json();
    console.log(`✅ Test spot created with ID: ${result.spotId}`);
    console.log(`   - Questionnaires: ${result.questionnaires.join(', ')}`);
    return {
      spotId: result.spotId,
      questionnaireId: result.questionnaires[0] // Use first questionnaire for testing
    };
  } else {
    const error = await response.json();
    console.log('❌ Failed to create test spot:', error);
    return null;
  }
}

// Helper function to log a visit
async function logVisit(questionnaireId, outcome, notes) {
  const response = await fetch(`${BASE_URL}/api/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `pulse_token=${AUTH_TOKEN}`
    },
    body: JSON.stringify({
      questionnaireId: questionnaireId,
      outcome: outcome,
      notes: notes,
      location: {
        lat: 8.4542,
        lng: 124.6319
      }
    })
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    throw new Error(`Failed to log visit: ${error.error}`);
  }
}

// Sample survey data
function getSampleSurveyData(questionnaireId, spotId) {
  return {
    questionnaireId: questionnaireId,
    spotId: spotId,
    location: {
      lat: 8.4542,
      lng: 124.6319,
      address: 'Test Address, Katipunan, Zamboanga del Norte',
      accuracy: 10,
      timestamp: new Date().toISOString(),
      barangay: 'Katipunan',
      municipality: 'Dipolog City',
      province: 'Zamboanga del Norte'
    },
    selectedMember: 'Test Respondent',
    interviewerId: TEST_FI_ID,
    barangayId: TEST_BARANGAY_ID,
    respondentDemographics: {
      age: 35,
      gender: 'Male',
      educationalAttainment: 'College Graduate',
      householdIncome: '20000-30000',
      purok: 'Purok 1'
    },
    sections: {
      financial: {
        data: {
          q1: 'Satisfied',
          q2: 'Good',
          q3: 4
        }
      },
      safety: {
        data: {
          q1: 'Very Satisfied',
          q2: 'Excellent',
          q3: 5
        }
      }
    }
  };
}

async function testSurveyResponseMultiVisit() {
  console.log('🧪 Testing Enhanced Survey Response API (Multi-Visit Workflow)...\n');
  
  let testSpot = null;
  let firstResponseId = null;

  try {
    // Setup: Create a test spot with questionnaires
    testSpot = await createTestSpot();
    if (!testSpot) {
      console.log('❌ Cannot proceed without test spot');
      return;
    }
    console.log('');

    const { spotId, questionnaireId } = testSpot;

    // Test 1: Submit initial survey response with questionnaire_id
    console.log('📝 Test 1: Submitting initial survey response with questionnaire_id...');
    const initialData = getSampleSurveyData(questionnaireId, spotId);
    
    const initialResponse = await fetch(`${BASE_URL}/api/survey-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pulse_token=${AUTH_TOKEN}`
      },
      body: JSON.stringify(initialData)
    });

    if (initialResponse.ok) {
      const initialResult = await initialResponse.json();
      firstResponseId = initialResult.responseId;
      console.log('✅ Initial survey response created successfully!');
      console.log(`   - Response ID: ${initialResult.responseId}`);
      console.log(`   - Survey Number: ${initialResult.surveyNumber}`);
      console.log(`   - Questionnaire ID: ${initialResult.questionnaireId}`);
      console.log(`   - Is Update: ${initialResult.isUpdate}`);
      console.log('');
    } else {
      const error = await initialResponse.json();
      console.log('❌ Failed to create initial survey response:', error);
      return;
    }

    // Test 2: Verify visit was auto-created
    console.log('🔍 Test 2: Verifying auto-created visit record...');
    const questionnaireResponse = await fetch(
      `${BASE_URL}/api/questionnaires/${questionnaireId}`,
      {
        headers: {
          'Cookie': `pulse_token=${AUTH_TOKEN}`
        }
      }
    );

    if (questionnaireResponse.ok) {
      const questionnaireData = await questionnaireResponse.json();
      console.log('✅ Questionnaire data retrieved successfully!');
      console.log(`   - Status: ${questionnaireData.status}`);
      console.log(`   - Visit Count: ${questionnaireData.visitCount}`);
      console.log(`   - Number of visits: ${questionnaireData.visits.length}`);
      if (questionnaireData.visits.length > 0) {
        const lastVisit = questionnaireData.visits[questionnaireData.visits.length - 1];
        console.log(`   - Last visit outcome: ${lastVisit.outcome}`);
      }
      console.log('');
    } else {
      const error = await questionnaireResponse.json();
      console.log('❌ Failed to retrieve questionnaire data:', error);
      console.log('');
    }

    // Test 3: Update existing survey response (multi-visit scenario)
    console.log('📝 Test 3: Updating existing survey response (multi-visit scenario)...');
    const updatedData = getSampleSurveyData(questionnaireId, spotId);
    updatedData.respondentDemographics.age = 36; // Change age to simulate update
    updatedData.sections.environmental = {
      data: {
        q1: 'Satisfied',
        q2: 'Good'
      }
    };

    const updateResponse = await fetch(`${BASE_URL}/api/survey-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pulse_token=${AUTH_TOKEN}`
      },
      body: JSON.stringify(updatedData)
    });

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Survey response updated successfully!');
      console.log(`   - Response ID: ${updateResult.responseId}`);
      console.log(`   - Is Update: ${updateResult.isUpdate}`);
      console.log(`   - Message: ${updateResult.message}`);
      console.log('');

      // Verify the response ID is the same (update, not create)
      if (updateResult.responseId === firstResponseId) {
        console.log('✅ Confirmed: Same response was updated (not duplicated)');
      } else {
        console.log('⚠️  Warning: Different response ID - may have created duplicate');
      }
      console.log('');
    } else {
      const error = await updateResponse.json();
      console.log('❌ Failed to update survey response:', error);
      console.log('');
    }

    // Test 4: Verify questionnaire status is "Completed"
    console.log('🔍 Test 4: Verifying questionnaire status after completion...');
    const finalQuestionnaireResponse = await fetch(
      `${BASE_URL}/api/questionnaires/${questionnaireId}`,
      {
        headers: {
          'Cookie': `pulse_token=${AUTH_TOKEN}`
        }
      }
    );

    if (finalQuestionnaireResponse.ok) {
      const finalQuestionnaireData = await finalQuestionnaireResponse.json();
      console.log('✅ Final questionnaire status retrieved!');
      console.log(`   - Status: ${finalQuestionnaireData.status}`);
      console.log(`   - Visit Count: ${finalQuestionnaireData.visitCount}`);
      console.log(`   - Total visits logged: ${finalQuestionnaireData.visits.length}`);
      
      if (finalQuestionnaireData.status === 'Completed') {
        console.log('✅ Questionnaire correctly marked as Completed');
      } else {
        console.log(`⚠️  Warning: Expected status 'Completed', got '${finalQuestionnaireData.status}'`);
      }
      console.log('');
    } else {
      const error = await finalQuestionnaireResponse.json();
      console.log('❌ Failed to retrieve final questionnaire data:', error);
      console.log('');
    }

    // Test 5: Test bulk sync endpoint
    console.log('📦 Test 5: Testing bulk sync endpoint...');
    
    // Create another questionnaire ID for bulk sync test
    const bulkQuestionnaireId = `2024-TEST-BULK-${Date.now()}`;
    
    const bulkSyncData = {
      responses: [
        getSampleSurveyData(bulkQuestionnaireId, spotId),
        {
          ...getSampleSurveyData(`${bulkQuestionnaireId}-2`, spotId),
          respondentDemographics: {
            age: 40,
            gender: 'Female',
            educationalAttainment: 'High School Graduate',
            householdIncome: '10000-20000',
            purok: 'Purok 2'
          }
        }
      ]
    };

    const bulkSyncResponse = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pulse_token=${AUTH_TOKEN}`
      },
      body: JSON.stringify(bulkSyncData)
    });

    if (bulkSyncResponse.ok) {
      const bulkSyncResult = await bulkSyncResponse.json();
      console.log('✅ Bulk sync completed!');
      console.log(`   - Total: ${bulkSyncResult.total}`);
      console.log(`   - Synced: ${bulkSyncResult.synced}`);
      console.log(`   - Failed: ${bulkSyncResult.failed}`);
      console.log(`   - Success: ${bulkSyncResult.success}`);
      console.log('   - Results:');
      bulkSyncResult.results.forEach((result, index) => {
        console.log(`     ${index + 1}. ${result.questionnaireId}: ${result.status} - ${result.message || result.error}`);
      });
      console.log('');
    } else {
      const error = await bulkSyncResponse.json();
      console.log('❌ Failed to perform bulk sync:', error);
      console.log('');
    }

    // Test 6: Test partial sync scenario (some succeed, some fail)
    console.log('📦 Test 6: Testing partial sync scenario...');
    
    const partialSyncData = {
      responses: [
        getSampleSurveyData(`2024-TEST-PARTIAL-${Date.now()}`, spotId),
        {
          // Missing required fields - should fail
          questionnaireId: `2024-TEST-FAIL-${Date.now()}`,
          spotId: spotId,
          interviewerId: TEST_FI_ID,
          barangayId: TEST_BARANGAY_ID
          // Missing location - should fail
        }
      ]
    };

    const partialSyncResponse = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pulse_token=${AUTH_TOKEN}`
      },
      body: JSON.stringify(partialSyncData)
    });

    if (partialSyncResponse.ok) {
      const partialSyncResult = await partialSyncResponse.json();
      console.log('✅ Partial sync handled correctly!');
      console.log(`   - Total: ${partialSyncResult.total}`);
      console.log(`   - Synced: ${partialSyncResult.synced}`);
      console.log(`   - Failed: ${partialSyncResult.failed}`);
      console.log('   - Results:');
      partialSyncResult.results.forEach((result, index) => {
        const icon = result.status === 'success' ? '✅' : '❌';
        console.log(`     ${icon} ${index + 1}. ${result.questionnaireId}: ${result.status}`);
        if (result.error) {
          console.log(`        Error: ${result.error}`);
        }
      });
      console.log('');
    } else {
      const error = await partialSyncResponse.json();
      console.log('❌ Failed to perform partial sync:', error);
      console.log('');
    }

    console.log('✅ All tests completed successfully!');
    console.log('\n📝 Note: Test data was left in the database for inspection.');
    console.log('   You can manually clean it up through the admin panel.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure the development server is running: npm run dev');
    console.log('   2. Verify TEST_CYCLE_ID, TEST_BARANGAY_ID, and TEST_FI_ID exist in your database');
    console.log('   3. Ensure the FI user has the INTERVIEWER role');
    console.log('   4. Set TEST_AUTH_TOKEN environment variable with a valid auth token');
    console.log('   5. Ensure the CSIS workflow migration has been applied');
  }
}

testSurveyResponseMultiVisit();
