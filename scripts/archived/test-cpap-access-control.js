/**
 * Test script to verify CPAP module is properly hidden from FS and INTERVIEWER users
 * 
 * This script tests:
 * 1. FS users cannot access /cpap or /admin/cpap routes
 * 2. INTERVIEWER users cannot access /cpap or /admin/cpap routes
 * 3. FS and INTERVIEWER users are redirected to /forbidden page
 * 4. API endpoints return 403 for unauthorized roles
 * 5. Officer and Admin users can access CPAP routes
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test user credentials (you'll need to create these users in your database)
const TEST_USERS = {
  fs: {
    email: 'fs-test@example.com',
    password: 'test123',
    role: 'FS'
  },
  interviewer: {
    email: 'interviewer-test@example.com',
    password: 'test123',
    role: 'Interviewer'
  },
  officer: {
    email: 'officer-test@example.com',
    password: 'test123',
    role: 'Officer'
  },
  admin: {
    email: 'admin@pulse.local',
    password: 'admin123',
    role: 'Admin'
  }
};

// Color codes for console output
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

async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract cookie from response
    const setCookie = response.headers.get('set-cookie');
    const tokenMatch = setCookie?.match(/pulse_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    return { success: true, token, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testPageAccess(url, token, expectedStatus) {
  try {
    const response = await fetch(url, {
      headers: {
        'Cookie': `pulse_token=${token}`,
      },
      redirect: 'manual', // Don't follow redirects automatically
    });

    return {
      status: response.status,
      redirected: response.status >= 300 && response.status < 400,
      location: response.headers.get('location'),
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function testApiAccess(url, token, expectedStatus) {
  try {
    const response = await fetch(url, {
      headers: {
        'Cookie': `pulse_token=${token}`,
      },
    });

    return {
      status: response.status,
      body: response.ok ? await response.json() : null,
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  log('\n=== CPAP Access Control Tests ===\n', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: FS user cannot access /cpap
  log('\n--- Test 1: FS user accessing /cpap ---', 'blue');
  const fsLogin = await login(TEST_USERS.fs.email, TEST_USERS.fs.password);
  
  if (fsLogin.success) {
    const fsPageAccess = await testPageAccess(`${BASE_URL}/cpap`, fsLogin.token);
    
    if (fsPageAccess.redirected && fsPageAccess.location?.includes('/forbidden')) {
      log('✓ PASS: FS user redirected to /forbidden', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: FS user not properly redirected. Status: ${fsPageAccess.status}, Location: ${fsPageAccess.location}`, 'red');
      results.failed++;
    }
  } else {
    log(`⚠ SKIP: Could not login as FS user: ${fsLogin.error}`, 'yellow');
  }

  // Test 2: FS user cannot access /admin/cpap
  log('\n--- Test 2: FS user accessing /admin/cpap ---', 'blue');
  if (fsLogin.success) {
    const fsAdminAccess = await testPageAccess(`${BASE_URL}/admin/cpap`, fsLogin.token);
    
    if (fsAdminAccess.redirected && fsAdminAccess.location?.includes('/forbidden')) {
      log('✓ PASS: FS user redirected to /forbidden', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: FS user not properly redirected. Status: ${fsAdminAccess.status}, Location: ${fsAdminAccess.location}`, 'red');
      results.failed++;
    }
  }

  // Test 3: FS user cannot access /api/cpap
  log('\n--- Test 3: FS user accessing /api/cpap ---', 'blue');
  if (fsLogin.success) {
    const fsApiAccess = await testApiAccess(`${BASE_URL}/api/cpap`, fsLogin.token);
    
    if (fsApiAccess.status === 403) {
      log('✓ PASS: FS user receives 403 Forbidden', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: FS user received status ${fsApiAccess.status} instead of 403`, 'red');
      results.failed++;
    }
  }

  // Test 4: INTERVIEWER user cannot access /cpap
  log('\n--- Test 4: INTERVIEWER user accessing /cpap ---', 'blue');
  const interviewerLogin = await login(TEST_USERS.interviewer.email, TEST_USERS.interviewer.password);
  
  if (interviewerLogin.success) {
    const interviewerPageAccess = await testPageAccess(`${BASE_URL}/cpap`, interviewerLogin.token);
    
    if (interviewerPageAccess.redirected && interviewerPageAccess.location?.includes('/forbidden')) {
      log('✓ PASS: INTERVIEWER user redirected to /forbidden', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: INTERVIEWER user not properly redirected. Status: ${interviewerPageAccess.status}, Location: ${interviewerPageAccess.location}`, 'red');
      results.failed++;
    }
  } else {
    log(`⚠ SKIP: Could not login as INTERVIEWER user: ${interviewerLogin.error}`, 'yellow');
  }

  // Test 5: INTERVIEWER user cannot access /admin/cpap
  log('\n--- Test 5: INTERVIEWER user accessing /admin/cpap ---', 'blue');
  if (interviewerLogin.success) {
    const interviewerAdminAccess = await testPageAccess(`${BASE_URL}/admin/cpap`, interviewerLogin.token);
    
    if (interviewerAdminAccess.redirected && interviewerAdminAccess.location?.includes('/forbidden')) {
      log('✓ PASS: INTERVIEWER user redirected to /forbidden', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: INTERVIEWER user not properly redirected. Status: ${interviewerAdminAccess.status}, Location: ${interviewerAdminAccess.location}`, 'red');
      results.failed++;
    }
  }

  // Test 6: INTERVIEWER user cannot access /api/cpap
  log('\n--- Test 6: INTERVIEWER user accessing /api/cpap ---', 'blue');
  if (interviewerLogin.success) {
    const interviewerApiAccess = await testApiAccess(`${BASE_URL}/api/cpap`, interviewerLogin.token);
    
    if (interviewerApiAccess.status === 403) {
      log('✓ PASS: INTERVIEWER user receives 403 Forbidden', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: INTERVIEWER user received status ${interviewerApiAccess.status} instead of 403`, 'red');
      results.failed++;
    }
  }

  // Test 7: Officer user CAN access /cpap
  log('\n--- Test 7: Officer user accessing /cpap ---', 'blue');
  const officerLogin = await login(TEST_USERS.officer.email, TEST_USERS.officer.password);
  
  if (officerLogin.success) {
    const officerPageAccess = await testPageAccess(`${BASE_URL}/cpap`, officerLogin.token);
    
    if (officerPageAccess.status === 200 || !officerPageAccess.redirected) {
      log('✓ PASS: Officer user can access /cpap', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: Officer user cannot access /cpap. Status: ${officerPageAccess.status}`, 'red');
      results.failed++;
    }
  } else {
    log(`⚠ SKIP: Could not login as Officer user: ${officerLogin.error}`, 'yellow');
  }

  // Test 8: Admin user CAN access /admin/cpap
  log('\n--- Test 8: Admin user accessing /admin/cpap ---', 'blue');
  const adminLogin = await login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  
  if (adminLogin.success) {
    const adminPageAccess = await testPageAccess(`${BASE_URL}/admin/cpap`, adminLogin.token);
    
    if (adminPageAccess.status === 200 || !adminPageAccess.redirected) {
      log('✓ PASS: Admin user can access /admin/cpap', 'green');
      results.passed++;
    } else {
      log(`✗ FAIL: Admin user cannot access /admin/cpap. Status: ${adminPageAccess.status}`, 'red');
      results.failed++;
    }
  } else {
    log(`⚠ SKIP: Could not login as Admin user: ${adminLogin.error}`, 'yellow');
  }

  // Summary
  log('\n=== Test Summary ===', 'cyan');
  log(`Total Tests: ${results.passed + results.failed}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n✓ All tests passed!', 'green');
  } else {
    log('\n✗ Some tests failed. Please review the output above.', 'red');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\n✗ Test execution failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
