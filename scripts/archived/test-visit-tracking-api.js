/**
 * Test script for Visit Tracking API endpoints
 * Tests the three new endpoints:
 * - POST /api/visits
 * - GET /api/questionnaires/:questionnaireId
 * - GET /api/fi/assignments
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testPostVisit() {
  logSection('TEST 1: POST /api/visits - Log a visit attempt');
  
  try {
    // First, get a questionnaire ID from an existing spot
    log('Fetching existing spots to get a questionnaire ID...', 'blue');
    const spotsResponse = await fetch(`${BASE_URL}/api/spots`);
    const spotsData = await spotsResponse.json();
    
    if (!spotsData.spots || spotsData.spots.length === 0) {
      log('⚠️  No spots found. Please create a spot first.', 'yellow');
      return null;
    }
    
    const firstSpot = spotsData.spots[0];
    if (!firstSpot.questionnaires || firstSpot.questionnaires.length === 0) {
      log('⚠️  No questionnaires found in spot.', 'yellow');
      return null;
    }
    
    const questionnaireId = firstSpot.questionnaires[0].questionnaireId;
    log(`Using questionnaire ID: ${questionnaireId}`, 'blue');
    
    // Test 1: Log a callback visit
    log('\nTest 1a: Logging a callback visit...', 'blue');
    const visitData = {
      questionnaireId: questionnaireId,
      outcome: 'Callback_Needed',
      notes: 'No one home, will return tomorrow',
      location: {
        lat: 8.1234,
        lng: 123.4567
      }
    };
    
    const response = await fetch(`${BASE_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log('✓ Visit logged successfully', 'green');
      log(`  Visit ID: ${data.visitId}`, 'green');
      log(`  Visit Number: ${data.visitNumber}`, 'green');
      log(`  Questionnaire Status: ${data.questionnaireStatus}`, 'green');
    } else {
      log(`✗ Failed: ${data.error}`, 'red');
    }
    
    // Test 2: Log another callback (should increment visit count)
    log('\nTest 1b: Logging second callback visit...', 'blue');
    const visit2Data = {
      questionnaireId: questionnaireId,
      outcome: 'Callback_Needed',
      notes: 'Respondent busy, scheduled for next day'
    };
    
    const response2 = await fetch(`${BASE_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visit2Data)
    });
    
    const data2 = await response2.json();
    
    if (response2.ok) {
      log('✓ Second visit logged successfully', 'green');
      log(`  Visit Number: ${data2.visitNumber}`, 'green');
      log(`  Questionnaire Status: ${data2.questionnaireStatus}`, 'green');
    } else {
      log(`✗ Failed: ${data2.error}`, 'red');
    }
    
    // Test 3: Validation - missing required fields
    log('\nTest 1c: Testing validation (missing outcome)...', 'blue');
    const invalidData = {
      questionnaireId: questionnaireId,
      notes: 'Test note'
    };
    
    const response3 = await fetch(`${BASE_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    const data3 = await response3.json();
    
    if (response3.status === 400) {
      log('✓ Validation working correctly', 'green');
      log(`  Error message: ${data3.error}`, 'green');
    } else {
      log('✗ Validation should have failed', 'red');
    }
    
    // Test 4: Invalid outcome value
    log('\nTest 1d: Testing validation (invalid outcome)...', 'blue');
    const invalidOutcome = {
      questionnaireId: questionnaireId,
      outcome: 'InvalidOutcome',
      notes: 'Test'
    };
    
    const response4 = await fetch(`${BASE_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidOutcome)
    });
    
    const data4 = await response4.json();
    
    if (response4.status === 400) {
      log('✓ Outcome validation working correctly', 'green');
      log(`  Error message: ${data4.error}`, 'green');
    } else {
      log('✗ Outcome validation should have failed', 'red');
    }
    
    return questionnaireId;
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return null;
  }
}

async function testGetQuestionnaire(questionnaireId) {
  logSection('TEST 2: GET /api/questionnaires/:questionnaireId');
  
  if (!questionnaireId) {
    log('⚠️  Skipping test - no questionnaire ID available', 'yellow');
    return;
  }
  
  try {
    log(`Fetching questionnaire: ${questionnaireId}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/questionnaires/${questionnaireId}`);
    const data = await response.json();
    
    if (response.ok) {
      log('✓ Questionnaire fetched successfully', 'green');
      log(`  Questionnaire ID: ${data.questionnaireId}`, 'green');
      log(`  Status: ${data.status}`, 'green');
      log(`  Visit Count: ${data.visitCount}`, 'green');
      log(`  Spot: ${data.spot?.spotName} (${data.spot?.barangayName})`, 'green');
      log(`  Number of visits: ${data.visits.length}`, 'green');
      
      if (data.visits.length > 0) {
        log('\n  Visit History:', 'green');
        data.visits.forEach(visit => {
          log(`    Visit ${visit.visitNumber}: ${visit.outcome} - ${visit.notes || 'No notes'}`, 'green');
        });
      }
      
      if (data.surveyData) {
        log(`\n  Survey Response: ${data.surveyData.surveyNumber} (${data.surveyData.status})`, 'green');
      } else {
        log('\n  No survey response yet', 'green');
      }
    } else {
      log(`✗ Failed: ${data.error}`, 'red');
    }
    
    // Test with invalid questionnaire ID
    log('\nTest 2b: Testing with invalid questionnaire ID...', 'blue');
    const response2 = await fetch(`${BASE_URL}/api/questionnaires/INVALID-ID`);
    const data2 = await response2.json();
    
    if (response2.status === 404) {
      log('✓ 404 error handling working correctly', 'green');
    } else {
      log('✗ Should return 404 for invalid ID', 'red');
    }
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

async function testGetFIAssignments() {
  logSection('TEST 3: GET /api/fi/assignments');
  
  try {
    log('Note: This endpoint requires authentication', 'yellow');
    log('Testing without authentication (should fail)...', 'blue');
    
    const response = await fetch(`${BASE_URL}/api/fi/assignments`);
    const data = await response.json();
    
    if (response.status === 401) {
      log('✓ Authentication check working correctly', 'green');
      log(`  Error message: ${data.error}`, 'green');
    } else {
      log('✗ Should require authentication', 'red');
    }
    
    log('\nTo test with authentication:', 'yellow');
    log('1. Log in to the application', 'yellow');
    log('2. Use browser dev tools to copy the pulse_token cookie', 'yellow');
    log('3. Make a request with the cookie included', 'yellow');
    log('\nExample with curl:', 'yellow');
    log(`curl -H "Cookie: pulse_token=YOUR_TOKEN" ${BASE_URL}/api/fi/assignments`, 'cyan');
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

async function runTests() {
  log('Visit Tracking API Test Suite', 'cyan');
  log('Testing endpoints for Task 3: Visit Tracking', 'cyan');
  
  // Run tests sequentially
  const questionnaireId = await testPostVisit();
  await testGetQuestionnaire(questionnaireId);
  await testGetFIAssignments();
  
  logSection('TEST SUMMARY');
  log('All tests completed!', 'cyan');
  log('\nEndpoints tested:', 'blue');
  log('  ✓ POST /api/visits', 'green');
  log('  ✓ GET /api/questionnaires/:questionnaireId', 'green');
  log('  ✓ GET /api/fi/assignments (authentication check)', 'green');
  log('\nNote: Some tests require existing data (spots, questionnaires)', 'yellow');
  log('Create a spot first using: node scripts/test-spot-management-api.js', 'yellow');
}

// Run the tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
