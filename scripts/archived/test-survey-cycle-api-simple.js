const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing Survey Cycle API Implementation\n');

// Simple test to check if our API endpoints exist and return proper error codes
async function testEndpoints() {
  const endpoints = [
    { path: '/api/survey-cycles', method: 'GET', expectedStatus: 401, description: 'Get all cycles (unauthorized)' },
    { path: '/api/survey-cycles/active', method: 'GET', expectedStatus: 401, description: 'Get active cycle (unauthorized)' },
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
    
    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: endpoint.method,
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              body: body
            });
          });
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });

        req.end();
      });

      if (response.status === endpoint.expectedStatus) {
        console.log(`✅ Expected status ${endpoint.expectedStatus} received`);
      } else {
        console.log(`❌ Expected status ${endpoint.expectedStatus}, got ${response.status}`);
        console.log('Response body:', response.body);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - development server may not be running');
        console.log('   Please start the development server with: npm run dev');
        break;
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    
    console.log('');
  }
}

// Check if the endpoints are properly implemented
console.log('This test verifies that the survey cycle API endpoints are implemented');
console.log('and return proper authentication errors when accessed without credentials.\n');

testEndpoints().then(() => {
  console.log('🏁 API endpoint tests complete');
  console.log('\nTo fully test the API functionality:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Ensure you have admin user credentials in the database');
  console.log('3. Use a tool like Postman or curl to test authenticated requests');
}).catch(console.error);