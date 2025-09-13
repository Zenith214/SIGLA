const fetch = require('node-fetch');

async function testNextJSRoutes() {
  console.log('🔍 Testing Next.js API Routes...\n');

  const baseUrl = 'http://localhost:3000';
  
  const routes = [
    { method: 'GET', path: '/api/assignments', description: 'List assignments' },
    { method: 'GET', path: '/api/barangays/all', description: 'List all barangays' },
    { method: 'GET', path: '/api/interviewers', description: 'List interviewers' },
  ];
  
  console.log('1. Testing basic routes...');
  
  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`, {
        method: route.method
      });
      
      console.log(`   ${route.method} ${route.path}: ${response.status} (${route.description})`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`     → ${Array.isArray(data) ? data.length : 'non-array'} items`);
      } else {
        const errorText = await response.text();
        console.log(`     → Error: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ${route.method} ${route.path}: ❌ ${error.message}`);
    }
  }
  
  console.log('\n2. Testing dynamic route structure...');
  
  // Test if the [id] route structure is working
  const testIds = [1, 999, 'invalid'];
  
  for (const testId of testIds) {
    try {
      const response = await fetch(`${baseUrl}/api/assignments/${testId}`, {
        method: 'GET'
      });
      
      console.log(`   GET /api/assignments/${testId}: ${response.status}`);
      
      const responseText = await response.text();
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          console.log(`     → JSON response: ${data.error || 'success'}`);
        } catch (jsonError) {
          console.log(`     → Non-JSON response: ${responseText.substring(0, 50)}...`);
        }
      } else {
        console.log(`     → Empty response`);
      }
    } catch (error) {
      console.log(`   GET /api/assignments/${testId}: ❌ ${error.message}`);
    }
  }
  
  console.log('\n3. Testing DELETE method specifically...');
  
  // Test DELETE with different scenarios
  const deleteTests = [
    { id: 999, description: 'Non-existent ID' },
    { id: 'invalid', description: 'Invalid ID format' },
  ];
  
  for (const test of deleteTests) {
    try {
      const response = await fetch(`${baseUrl}/api/assignments/${test.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   DELETE /api/assignments/${test.id}: ${response.status} (${test.description})`);
      
      const responseText = await response.text();
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          console.log(`     → JSON: ${JSON.stringify(data)}`);
        } catch (jsonError) {
          console.log(`     → Text: ${responseText}`);
        }
      } else {
        console.log(`     → Empty response`);
      }
    } catch (error) {
      console.log(`   DELETE /api/assignments/${test.id}: ❌ ${error.message}`);
    }
  }
  
  console.log('\n4. Testing route file existence...');
  
  const fs = require('fs');
  const path = require('path');
  
  const routeFiles = [
    'src/app/api/assignments/route.ts',
    'src/app/api/assignments/[id]/route.ts',
    'src/lib/db.ts'
  ];
  
  for (const file of routeFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} exists`);
    } else {
      console.log(`   ❌ ${file} missing`);
    }
  }
  
  console.log('\n🎯 Route Testing Summary:');
  console.log('   - Verify all routes return proper HTTP status codes');
  console.log('   - Check if dynamic [id] route is working');
  console.log('   - Ensure DELETE method is properly handled');
  console.log('   - Confirm all required files exist');
}

testNextJSRoutes();