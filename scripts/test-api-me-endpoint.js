// Test the /api/me endpoint directly
const fetch = require('node-fetch');

async function testMeEndpoint() {
  try {
    // You need to get your actual cookie value from the browser
    // Open DevTools > Application > Cookies > localhost:3000 > pulse_token
    console.log('Testing /api/me endpoint...');
    console.log('Note: This test needs a valid pulse_token cookie');
    console.log('\nTo get your token:');
    console.log('1. Open DevTools (F12)');
    console.log('2. Go to Application tab');
    console.log('3. Expand Cookies > http://localhost:3000');
    console.log('4. Copy the value of "pulse_token"');
    console.log('5. Paste it below in the script\n');
    
    // Replace this with your actual token
    const token = 'YOUR_TOKEN_HERE';
    
    if (token === 'YOUR_TOKEN_HERE') {
      console.log('❌ Please update the token in the script first!');
      return;
    }
    
    const response = await fetch('http://localhost:3000/api/me', {
      headers: {
        'Cookie': `pulse_token=${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('=== /api/me Response ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n=== Check ===');
    console.log('Has barangayDesignation:', 'barangayDesignation' in data);
    console.log('Value:', data.barangayDesignation);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMeEndpoint();
