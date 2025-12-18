/**
 * Test the /api/barangays endpoint with awards
 */

const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing /api/barangays with awards...\n');
    
    const response = await fetch('http://localhost:3000/api/barangays?include_awards=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status);
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log('\n🔍 Checking Balasinon:');
      const balasinon = data.data.find(b => b.name === 'Balasinon');
      if (balasinon) {
        console.log('Name:', balasinon.name);
        console.log('Officers:', JSON.stringify(balasinon.officers, null, 2));
        console.log('Officers count:', balasinon.officers?.length || 0);
      } else {
        console.log('Balasinon not found');
      }
      
      console.log('\n📊 Summary:');
      const barangaysWithOfficers = data.data.filter(b => b.officers && b.officers.length > 0);
      console.log(`Barangays with officers: ${barangaysWithOfficers.length}/${data.data.length}`);
    } else {
      console.log('No data returned');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
