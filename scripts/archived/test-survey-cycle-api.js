const http = require('http');

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'admin@example.com';
const TEST_PASSWORD = 'admin123';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testLogin() {
  console.log('🔐 Testing login...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    rejectUnauthorized: false
  };

  const loginData = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  };

  try {
    const response = await makeRequest(options, loginData);
    console.log('Login response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Login successful');
      // Extract cookie for subsequent requests
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('pulse_token='));
        if (tokenCookie) {
          return tokenCookie.split(';')[0]; // Return just the token part
        }
      }
    } else {
      console.log('❌ Login failed:', response.body);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  
  return null;
}

async function testGetActiveCycle(cookie) {
  console.log('\n📋 Testing GET /api/survey-cycles/active...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey-cycles/active',
    method: 'GET',
    headers: {
      'Cookie': cookie,
    },
    rejectUnauthorized: false
  };

  try {
    const response = await makeRequest(options);
    console.log('Get active cycle response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Get active cycle successful');
      return response.body.data;
    } else if (response.status === 404) {
      console.log('ℹ️ No active cycle found (expected for new system)');
      return null;
    } else {
      console.log('❌ Get active cycle failed');
    }
  } catch (error) {
    console.log('❌ Get active cycle error:', error.message);
  }
  
  return null;
}

async function testGetAllCycles(cookie) {
  console.log('\n📋 Testing GET /api/survey-cycles...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey-cycles',
    method: 'GET',
    headers: {
      'Cookie': cookie,
    },
    rejectUnauthorized: false
  };

  try {
    const response = await makeRequest(options);
    console.log('Get all cycles response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Get all cycles successful');
      return response.body.data;
    } else {
      console.log('❌ Get all cycles failed');
    }
  } catch (error) {
    console.log('❌ Get all cycles error:', error.message);
  }
  
  return null;
}

async function testCreateCycle(cookie) {
  console.log('\n➕ Testing POST /api/survey-cycles...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey-cycles',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    rejectUnauthorized: false
  };

  const cycleData = {
    name: 'Test Survey Cycle 2024',
    year: 2024,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  };

  try {
    const response = await makeRequest(options, cycleData);
    console.log('Create cycle response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Create cycle successful');
      return response.body.data;
    } else {
      console.log('❌ Create cycle failed');
    }
  } catch (error) {
    console.log('❌ Create cycle error:', error.message);
  }
  
  return null;
}

async function testSetActiveCycle(cookie, cycleId) {
  console.log('\n🎯 Testing POST /api/survey-cycles/active...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey-cycles/active',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    rejectUnauthorized: false
  };

  const activationData = {
    cycle_id: cycleId
  };

  try {
    const response = await makeRequest(options, activationData);
    console.log('Set active cycle response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Set active cycle successful');
      return response.body.data;
    } else {
      console.log('❌ Set active cycle failed');
    }
  } catch (error) {
    console.log('❌ Set active cycle error:', error.message);
  }
  
  return null;
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing unauthorized access...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey-cycles/active',
    method: 'GET',
    rejectUnauthorized: false
  };

  try {
    const response = await makeRequest(options);
    console.log('Unauthorized access response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.log('❌ Unauthorized access not properly blocked');
    }
  } catch (error) {
    console.log('❌ Unauthorized access test error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Survey Cycle API Tests\n');
  
  // Test unauthorized access first
  await testUnauthorizedAccess();
  
  // Login to get authentication cookie
  const cookie = await testLogin();
  if (!cookie) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Test getting active cycle (should be empty initially)
  await testGetActiveCycle(cookie);
  
  // Test getting all cycles
  const allCycles = await testGetAllCycles(cookie);
  
  // Test creating a new cycle
  const newCycle = await testCreateCycle(cookie);
  
  // If we created a cycle, test setting it as active
  if (newCycle && newCycle.cycle_id) {
    await testSetActiveCycle(cookie, newCycle.cycle_id);
    
    // Test getting active cycle again (should now return the new cycle)
    await testGetActiveCycle(cookie);
  }
  
  console.log('\n🏁 Survey Cycle API Tests Complete');
}

// Run the tests
runTests().catch(console.error);