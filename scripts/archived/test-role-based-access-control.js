/**
 * Test script for role-based access control
 * Tests middleware protection and user management with FS role
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUsers = {
  admin: { email: 'admin@test.com', password: 'admin123' },
  fs: { email: 'fs@test.com', password: 'fs123' },
  interviewer: { email: 'interviewer@test.com', password: 'interviewer123' },
  viewer: { email: 'viewer@test.com', password: 'viewer123' }
};

// Routes to test
const routes = {
  admin: ['/settings', '/api/users', '/api/barangays', '/api/survey-cycles'],
  fs: ['/fs-dashboard', '/api/spots', '/api/fs/monitoring'],
  interviewer: ['/survey/forms', '/api/fi/assignments', '/api/visits'],
  viewer: ['/dashboard']
};

async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    const cookies = response.headers.get('set-cookie');
    return { success: true, role: data.role, cookies };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testRouteAccess(route, cookies, shouldSucceed) {
  try {
    const response = await fetch(`${BASE_URL}${route}`, {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    const success = response.ok;
    const status = response.status;
    
    if (shouldSucceed && !success) {
      console.error(`❌ Expected access to ${route} but got ${status}`);
      return false;
    } else if (!shouldSucceed && success) {
      console.error(`❌ Expected denial for ${route} but got ${status}`);
      return false;
    } else {
      console.log(`✅ ${route}: ${shouldSucceed ? 'Allowed' : 'Denied'} (${status})`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error testing ${route}:`, error.message);
    return false;
  }
}

async function testUserManagement() {
  console.log('\n📋 Testing User Management with FS Role...\n');
  
  // Login as admin
  const adminLogin = await login(testUsers.admin.email, testUsers.admin.password);
  if (!adminLogin.success) {
    console.error('❌ Admin login failed');
    return false;
  }
  
  console.log('✅ Admin logged in successfully');
  
  // Test creating a user with FS role
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminLogin.cookies || ''
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'FS',
        email: 'test-fs@test.com',
        password: 'test123',
        role: 'fs',
        status: 'active'
      })
    });
    
    if (response.ok) {
      console.log('✅ Successfully created user with FS role');
      const data = await response.json();
      
      // Test updating user role to FS
      const updateResponse = await fetch(`${BASE_URL}/api/users/${data.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminLogin.cookies || ''
        },
        body: JSON.stringify({ role: 'fs' })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Successfully updated user role to FS');
      } else {
        console.error('❌ Failed to update user role to FS');
        return false;
      }
      
      // Clean up - delete test user
      await fetch(`${BASE_URL}/api/users/${data.user.id}`, {
        method: 'DELETE',
        headers: {
          'Cookie': adminLogin.cookies || ''
        }
      });
      
      return true;
    } else {
      console.error('❌ Failed to create user with FS role');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in user management test:', error.message);
    return false;
  }
}

async function testRoleAccess(role, credentials) {
  console.log(`\n🔐 Testing ${role.toUpperCase()} Role Access...\n`);
  
  const loginResult = await login(credentials.email, credentials.password);
  if (!loginResult.success) {
    console.error(`❌ ${role} login failed:`, loginResult.error);
    return false;
  }
  
  console.log(`✅ ${role} logged in successfully`);
  
  let allPassed = true;
  
  // Test routes this role should have access to
  const allowedRoutes = routes[role] || [];
  for (const route of allowedRoutes) {
    const passed = await testRouteAccess(route, loginResult.cookies, true);
    if (!passed) allPassed = false;
  }
  
  // Test routes this role should NOT have access to
  const deniedRoutes = Object.entries(routes)
    .filter(([r]) => r !== role && r !== 'admin') // Admin can access everything
    .flatMap(([, routeList]) => routeList)
    .filter(route => !allowedRoutes.includes(route));
  
  for (const route of deniedRoutes) {
    const passed = await testRouteAccess(route, loginResult.cookies, false);
    if (!passed) allPassed = false;
  }
  
  return allPassed;
}

async function runTests() {
  console.log('🚀 Starting Role-Based Access Control Tests\n');
  console.log('=' .repeat(60));
  
  let allTestsPassed = true;
  
  // Test user management with FS role
  const userMgmtPassed = await testUserManagement();
  if (!userMgmtPassed) allTestsPassed = false;
  
  console.log('\n' + '='.repeat(60));
  
  // Test each role's access
  for (const [role, credentials] of Object.entries(testUsers)) {
    const rolePassed = await testRoleAccess(role, credentials);
    if (!rolePassed) allTestsPassed = false;
    console.log('\n' + '='.repeat(60));
  }
  
  // Summary
  console.log('\n📊 Test Summary\n');
  if (allTestsPassed) {
    console.log('✅ All role-based access control tests passed!');
  } else {
    console.log('❌ Some tests failed. Please review the output above.');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
