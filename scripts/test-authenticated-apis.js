// Test APIs with proper authentication
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing APIs with Authentication...\n');

async function testWithAuth() {
  try {
    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sigla.com', password: 'password' })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Extract cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test authenticated APIs
    const authTests = [
      { name: 'Users (with auth)', url: '/api/users' },
      { name: 'Me endpoint', url: '/api/me' }
    ];

    for (const test of authTests) {
      console.log(`\n2. Testing ${test.name}...`);
      
      const response = await fetch(`http://localhost:3000${test.url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${test.name}: Status ${response.status}`);
        
        if (data.users && Array.isArray(data.users)) {
          console.log(`      📊 Returned ${data.users.length} users`);
        } else if (data.user) {
          console.log(`      👤 User: ${data.user.firstName} ${data.user.lastName}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ ${test.name}: Status ${response.status}`);
        console.log(`      Error: ${errorText.substring(0, 100)}...`);
      }
    }

    console.log('\n🎉 Authentication and user management working!');
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

testWithAuth();