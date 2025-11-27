const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 Testing login API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sigla.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login test successful!');
      console.log(`👤 Logged in as: ${data.user.firstName} ${data.user.lastName} (${data.user.role})`);
    } else {
      console.log('❌ Login test failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogin();