// Simple test script to check the community voice API
const fetch = require('node-fetch');

async function testCommunityVoiceAPI() {
  try {
    console.log('Testing Community Voice API...');
    
    // Test without barangay filter
    const response = await fetch('http://localhost:3000/api/community-voice', {
      headers: {
        'Cookie': 'your-auth-cookie-here' // You'll need to add proper auth
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testCommunityVoiceAPI();