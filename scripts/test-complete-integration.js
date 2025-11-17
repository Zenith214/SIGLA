/**
 * Complete Integration Test for CSIS Workflow
 * Tests end-to-end flow from FS dashboard to FI workflow to offline sync
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_CONFIG = {
  fsEmail: 'fs@test.com',
  fsPassword: 'password123',
  fiEmail: 'fi@test.com',
  fiPassword: 'password123',
  adminEmail: 'admin@test.com',
  adminPassword: 'password123',
};

// Test state
let testState = {
  fsCookie: null,
  fiCookie: null,
  adminCookie: null,
  activeCycleId: null,
  testBarangayId: null,
  testSpotId: null,
  testQuestionnaireId: null,
  testFIId: null,
};

// Helper functions
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'info');
  console.log('='.repeat(60) + '\n');
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    throw error;
  }
}

// Test functions
async function testFSLogin() {
  logSection('Test 1: FS Login');
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_CONFIG.fsEmail,
      password: TEST_CONFIG.fsPassword,
    }),
  });

  if (response.ok) {
    const cookie = response.headers.get('set-cookie');
    testState.fsCookie = cookie;
    log('✓ FS login successful', 'success');
    return true;
  } else {
    log(`✗ FS login failed: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testFILogin() {
  logSection('Test 2: FI Login');
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_CONFIG.fiEmail,
      password: TEST_CONFIG.fiPassword,
    }),
  });

  if (response.ok) {
    const cookie = response.headers.get('set-cookie');
    testState.fiCookie = cookie;
    testState.testFIId = response.data.user?.id;
    log('✓ FI login successful', 'success');
    log(`  FI ID: ${testState.testFIId}`, 'info');
    return true;
  } else {
    log(`✗ FI login failed: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testGetActiveCycle() {
  logSection('Test 3: Get Active Cycle');
  
  const response = await makeRequest('/api/survey-cycles/active', {
    headers: {
      Cookie: testState.fsCookie,
    },
  });

  if (response.ok && response.data.cycle) {
    testState.activeCycleId = response.data.cycle.cycle_id;
    log('✓ Active cycle retrieved', 'success');
    log(`  Cycle ID: ${testState.activeCycleId}`, 'info');
    log(`  Cycle Name: ${response.data.cycle.name}`, 'info');
    return true;
  } else {
    log('✗ No active cycle found', 'error');
    return false;
  }
}

async function testGetBarangays() {
  logSection('Test 4: Get Barangays');
  
  const response = await makeRequest('/api/barangays', {
    headers: {
      Cookie: testState.fsCookie,
    },
  });

  if (response.ok) {
    const barangays = response.data.data || response.data;
    if (barangays.length > 0) {
      testState.testBarangayId = barangays[0].id || barangays[0].barangay_id;
      log('✓ Barangays retrieved', 'success');
      log(`  Test Barangay ID: ${testState.testBarangayId}`, 'info');
      log(`  Test Barangay Name: ${barangays[0].name || barangays[0].barangay_name}`, 'info');
      return true;
    }
  }
  
  log('✗ Failed to get barangays', 'error');
  return false;
}

async function testCreateSpot() {
  logSection('Test 5: Create Spot (FS Dashboard)');
  
  const response = await makeRequest('/api/spots', {
    method: 'POST',
    headers: {
      Cookie: testState.fsCookie,
    },
    body: JSON.stringify({
      cycleId: testState.activeCycleId,
      barangayId: testState.testBarangayId,
      spotName: `Integration Test Spot ${Date.now()}`,
      startingPoint: { lat: 7.8381, lng: 123.2956 },
      randomStart: Math.floor(Math.random() * 999) + 1,
    }),
  });

  if (response.ok && response.data.spotId) {
    testState.testSpotId = response.data.spotId;
    testState.testQuestionnaireId = response.data.questionnaires?.[0];
    log('✓ Spot created successfully', 'success');
    log(`  Spot ID: ${testState.testSpotId}`, 'info');
    log(`  Generated Questionnaires: ${response.data.questionnaires?.length || 0}`, 'info');
    log(`  First Questionnaire ID: ${testState.testQuestionnaireId}`, 'info');
    return true;
  } else {
    log(`✗ Spot creation failed: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testAssignSpotToFI() {
  logSection('Test 6: Assign Spot to FI');
  
  const response = await makeRequest(`/api/spots/${testState.testSpotId}/assign`, {
    method: 'PUT',
    headers: {
      Cookie: testState.fsCookie,
    },
    body: JSON.stringify({
      fiId: testState.testFIId,
    }),
  });

  if (response.ok) {
    log('✓ Spot assigned to FI successfully', 'success');
    log(`  Assigned to: ${response.data.assignedTo || 'FI'}`, 'info');
    return true;
  } else {
    log(`✗ Spot assignment failed: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testFIGetAssignments() {
  logSection('Test 7: FI Get Assignments');
  
  const response = await makeRequest(`/api/fi/assignments?cycleId=${testState.activeCycleId}`, {
    headers: {
      Cookie: testState.fiCookie,
    },
  });

  if (response.ok && response.data.assignments) {
    const assignments = response.data.assignments;
    const testSpot = assignments.find(a => a.spotId === testState.testSpotId);
    
    if (testSpot) {
      log('✓ FI can see assigned spot', 'success');
      log(`  Spot Name: ${testSpot.spotName}`, 'info');
      log(`  Interviews: ${testSpot.interviews?.length || 0}`, 'info');
      log(`  Status: ${testSpot.status}`, 'info');
      return true;
    } else {
      log('✗ Test spot not found in FI assignments', 'error');
      return false;
    }
  } else {
    log(`✗ Failed to get FI assignments: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testLogVisit() {
  logSection('Test 8: Log Visit (FI Workflow)');
  
  const response = await makeRequest('/api/visits', {
    method: 'POST',
    headers: {
      Cookie: testState.fiCookie,
    },
    body: JSON.stringify({
      questionnaireId: testState.testQuestionnaireId,
      outcome: 'Callback_Needed',
      notes: 'Integration test - No one home',
      location: { lat: 7.8381, lng: 123.2956 },
    }),
  });

  if (response.ok) {
    log('✓ Visit logged successfully', 'success');
    log(`  Visit Number: ${response.data.visitNumber}`, 'info');
    log(`  Questionnaire Status: ${response.data.questionnaireStatus}`, 'info');
    return true;
  } else {
    log(`✗ Visit logging failed: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testGetQuestionnaireDetails() {
  logSection('Test 9: Get Questionnaire Details');
  
  const response = await makeRequest(`/api/questionnaires/${testState.testQuestionnaireId}`, {
    headers: {
      Cookie: testState.fiCookie,
    },
  });

  if (response.ok) {
    log('✓ Questionnaire details retrieved', 'success');
    log(`  Status: ${response.data.status}`, 'info');
    log(`  Visit Count: ${response.data.visitCount}`, 'info');
    log(`  Visits: ${response.data.visits?.length || 0}`, 'info');
    return true;
  } else {
    log(`✗ Failed to get questionnaire details: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testFSMonitoring() {
  logSection('Test 10: FS Monitoring Dashboard');
  
  const response = await makeRequest(`/api/fs/monitoring?cycleId=${testState.activeCycleId}`, {
    headers: {
      Cookie: testState.fsCookie,
    },
  });

  if (response.ok) {
    log('✓ Monitoring data retrieved', 'success');
    log(`  Total Spots: ${response.data.summary?.totalSpots || 0}`, 'info');
    log(`  Assigned Spots: ${response.data.summary?.assignedSpots || 0}`, 'info');
    log(`  Field Interviewers: ${response.data.fieldInterviewers?.length || 0}`, 'info');
    
    // Check if our test spot is in the monitoring data
    const testSpot = response.data.spots?.find(s => s.spotId === testState.testSpotId);
    if (testSpot) {
      log(`  Test Spot Status: ${testSpot.status}`, 'info');
      log(`  Test Spot Progress: ${testSpot.completedCount}/${testSpot.totalCount}`, 'info');
    }
    
    return true;
  } else {
    log(`✗ Failed to get monitoring data: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testGetSpots() {
  logSection('Test 11: Get Spots (FS Dashboard)');
  
  const response = await makeRequest(`/api/spots?cycleId=${testState.activeCycleId}`, {
    headers: {
      Cookie: testState.fsCookie,
    },
  });

  if (response.ok && response.data.spots) {
    const testSpot = response.data.spots.find(s => s.spot_id === testState.testSpotId);
    
    if (testSpot) {
      log('✓ Spots retrieved successfully', 'success');
      log(`  Test Spot Found: ${testSpot.spot_name}`, 'info');
      log(`  Status: ${testSpot.status}`, 'info');
      log(`  Assigned FI: ${testSpot.assigned_fi_name || 'None'}`, 'info');
      return true;
    } else {
      log('✗ Test spot not found in spots list', 'error');
      return false;
    }
  } else {
    log(`✗ Failed to get spots: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testSyncEndpoint() {
  logSection('Test 12: Sync Endpoint (Offline Sync)');
  
  // Create a mock survey response
  const mockResponse = {
    questionnaireId: testState.testQuestionnaireId,
    spotId: testState.testSpotId,
    surveyNumber: testState.testQuestionnaireId,
    location: {
      lat: 7.8381,
      lng: 123.2956,
      address: 'Test Address',
      barangay: 'Test Barangay',
      municipality: 'Test Municipality',
      province: 'Test Province',
    },
    selectedMember: 'Test Respondent',
    interviewerId: testState.testFIId,
    barangayId: testState.testBarangayId,
    respondentDemographics: {
      age: 30,
      gender: 'Male',
      civilStatus: 'Single',
    },
    sections: {
      demographics: { completed: true },
    },
  };

  const response = await makeRequest('/api/sync', {
    method: 'POST',
    headers: {
      Cookie: testState.fiCookie,
    },
    body: JSON.stringify({
      responses: [mockResponse],
    }),
  });

  if (response.ok) {
    log('✓ Sync endpoint working', 'success');
    log(`  Synced: ${response.data.synced}`, 'info');
    log(`  Failed: ${response.data.failed}`, 'info');
    log(`  Total: ${response.data.total}`, 'info');
    return true;
  } else {
    log(`✗ Sync failed: ${response.data.error || 'Unknown error'}`, 'error');
    return false;
  }
}

async function testCleanup() {
  logSection('Test 13: Cleanup (Delete Test Spot)');
  
  const response = await makeRequest(`/api/spots/${testState.testSpotId}`, {
    method: 'DELETE',
    headers: {
      Cookie: testState.fsCookie,
    },
  });

  if (response.ok) {
    log('✓ Test spot deleted successfully', 'success');
    return true;
  } else {
    log(`✗ Cleanup failed: ${response.data.error || 'Unknown error'}`, 'warning');
    log('  Note: You may need to manually delete the test spot', 'warning');
    return false;
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'info');
  log('║     CSIS Workflow Complete Integration Test Suite         ║', 'info');
  log('╚════════════════════════════════════════════════════════════╝', 'info');
  console.log('\n');

  const tests = [
    { name: 'FS Login', fn: testFSLogin },
    { name: 'FI Login', fn: testFILogin },
    { name: 'Get Active Cycle', fn: testGetActiveCycle },
    { name: 'Get Barangays', fn: testGetBarangays },
    { name: 'Create Spot', fn: testCreateSpot },
    { name: 'Assign Spot to FI', fn: testAssignSpotToFI },
    { name: 'FI Get Assignments', fn: testFIGetAssignments },
    { name: 'Log Visit', fn: testLogVisit },
    { name: 'Get Questionnaire Details', fn: testGetQuestionnaireDetails },
    { name: 'FS Monitoring', fn: testFSMonitoring },
    { name: 'Get Spots', fn: testGetSpots },
    { name: 'Sync Endpoint', fn: testSyncEndpoint },
    { name: 'Cleanup', fn: testCleanup },
  ];

  const results = {
    passed: 0,
    failed: 0,
    total: tests.length,
  };

  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`✗ Test "${test.name}" threw an error: ${error.message}`, 'error');
      results.failed++;
    }
  }

  // Print summary
  logSection('Test Summary');
  log(`Total Tests: ${results.total}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`, 
      results.failed === 0 ? 'success' : 'warning');

  console.log('\n');

  if (results.failed === 0) {
    log('🎉 All integration tests passed!', 'success');
    process.exit(0);
  } else {
    log('❌ Some integration tests failed. Please review the output above.', 'error');
    process.exit(1);
  }
}

// Run tests
runIntegrationTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
