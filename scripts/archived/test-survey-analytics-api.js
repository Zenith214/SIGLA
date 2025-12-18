#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Survey Analytics API...\n');

// Test the API endpoint
function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey-analytics?format=aggregated&barangayId=1',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📄 Response Body:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ API is working correctly');
        } else {
          console.log('\n⚠️  API returned non-200 status');
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('\n❌ Invalid JSON response');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Make sure your dev server is running: npm run dev');
    console.log('2. Check if the API route exists: src/app/api/survey-analytics/route.ts');
    console.log('3. Verify database connection is working');
    console.log('4. Check for any compilation errors in the API route');
  });

  req.end();
}

console.log('🚀 Testing API endpoint: /api/survey-analytics');
console.log('📍 URL: http://localhost:3000/api/survey-analytics?format=aggregated&barangayId=1');
console.log('⏳ Making request...\n');

testAPI();

// Also provide manual testing instructions
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Manual Testing Instructions:');
  console.log('1. Open your browser');
  console.log('2. Navigate to: http://localhost:3000/api/survey-analytics?format=aggregated&barangayId=1');
  console.log('3. You should see JSON data or an error message');
  console.log('4. If you see an error, check the browser console and server logs');
  
  console.log('\n🛠️  Alternative API endpoints to test:');
  console.log('• http://localhost:3000/api/barangays (should work)');
  console.log('• http://localhost:3000/api/survey-responses (might work)');
  console.log('• http://localhost:3000/api/survey-analytics (the problematic one)');
}, 2000);