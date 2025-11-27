const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testSettingsAPI() {
  console.log('🧪 Testing Settings API Endpoints...\n');

  const tests = [
    {
      name: 'Survey Cycles API',
      endpoint: '/api/survey-cycles',
      method: 'GET'
    },
    {
      name: 'Assignments API',
      endpoint: '/api/assignments',
      method: 'GET'
    },
    {
      name: 'Survey Targets API',
      endpoint: '/api/survey-targets',
      method: 'GET'
    },
    {
      name: 'Users API',
      endpoint: '/api/users',
      method: 'GET'
    },
    {
      name: 'Barangays API',
      endpoint: '/api/barangays',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    console.log(`📊 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.method} ${test.endpoint}`);
    
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success! Response type: ${Array.isArray(data) ? 'Array' : 'Object'}`);
        
        if (Array.isArray(data)) {
          console.log(`   📊 Records found: ${data.length}`);
        } else if (data.users && Array.isArray(data.users)) {
          console.log(`   📊 Users found: ${data.users.length}`);
        } else {
          console.log(`   📊 Response keys: ${Object.keys(data).join(', ')}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request Failed: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 Testing Complete!\n');
  
  // Test creating a survey cycle
  console.log('🔬 Testing Survey Cycle Creation...\n');
  
  try {
    const createResponse = await fetch(`${BASE_URL}/api/survey-cycles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: '2025',
        status: 'Active',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        responses: 0
      })
    });
    
    console.log(`Create Survey Cycle Status: ${createResponse.status}`);
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log(`✅ Survey cycle created successfully!`);
      console.log(`   ID: ${created.cycle_id}`);
      console.log(`   Year: ${created.year}`);
      console.log(`   Status: ${created.status}`);
    } else {
      const errorText = await createResponse.text();
      console.log(`❌ Failed to create survey cycle: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Survey cycle creation test failed: ${error.message}`);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/barangays`);
    return response.ok || response.status === 401 || response.status === 403; // These are ok, means server is running
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Settings API Tests...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running at http://localhost:3000');
    console.log('   Please start the development server with: npm run dev');
    return;
  }
  
  console.log('✅ Server is running, proceeding with tests...\n');
  await testSettingsAPI();
}

main().catch(console.error);