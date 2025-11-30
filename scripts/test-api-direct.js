/**
 * Direct API test with authentication
 */

const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API directly...\n');
    
    // First, let's test without auth to see the error
    const response = await fetch('http://localhost:3000/api/barangays/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('\n🔍 First barangay (Balasinon):');
      const balasinon = data.data.find(b => b.name === 'Balasinon');
      if (balasinon) {
        console.log('Name:', balasinon.name);
        console.log('Officers:', balasinon.officers);
        console.log('Officers count:', balasinon.officers?.length || 0);
      } else {
        console.log('Balasinon not found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
