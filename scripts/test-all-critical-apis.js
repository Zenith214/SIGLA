// Test all critical APIs that have been migrated to Supabase
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing All Critical APIs...\n');

async function testAllAPIs() {
  const tests = [
    { name: 'Barangays (awardees)', url: '/api/barangays' },
    { name: 'All Barangays', url: '/api/barangays/all' },
    { name: 'Survey Cycles', url: '/api/survey-cycles' },
    { name: 'Survey Targets', url: '/api/survey-targets' },
    { name: 'Assignments', url: '/api/assignments' },
    { name: 'Users', url: '/api/users' },
    { name: 'Login', url: '/api/login', method: 'POST', body: { email: 'admin@sigla.com', password: 'password' } }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      
      const options = {
        method: test.method || 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(`http://localhost:3000${test.url}`, options);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${test.name}: Status ${response.status}`);
        
        if (Array.isArray(data)) {
          console.log(`      📊 Returned ${data.length} items`);
        } else if (data.users && Array.isArray(data.users)) {
          console.log(`      📊 Returned ${data.users.length} users`);
        } else if (data.token) {
          console.log(`      🔑 Login successful`);
        }
        
        passedTests++;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ ${test.name}: Status ${response.status}`);
        console.log(`      Error: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   💥 ${test.name}: Network error - ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log(`🎯 Test Results: ${passedTests}/${totalTests} APIs working`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All critical APIs are working with Supabase!');
    console.log('✅ Your application should now be fully functional');
  } else {
    console.log('⚠️  Some APIs still need attention');
  }
}

testAllAPIs();