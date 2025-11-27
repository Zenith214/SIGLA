const fetch = require('node-fetch');
require('dotenv').config();

async function testAPI() {
  console.log('🧪 Testing Service Rankings API\n');
  console.log('=' .repeat(60));
  
  // Note: This will fail with 401 because we're not authenticated
  // This is just to show the structure
  
  const url = 'http://localhost:3000/api/analytics/service-area-rankings?service_area=financial&cycle_id=18';
  
  console.log(`\n📡 Calling: ${url}\n`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('⚠️  Expected 401 (authentication required)');
      console.log('   This API requires login via browser');
      console.log('\n💡 To test properly:');
      console.log('   1. Open http://localhost:3000/analytics-test');
      console.log('   2. Login if needed');
      console.log('   3. Click "Test Service Rankings"');
      return;
    }
    
    console.log(`Status: ${response.status}\n`);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.rankings) {
      console.log(`\n📊 Found ${data.rankings.length} barangays`);
      
      // Check for duplicates
      const barangayIds = data.rankings.map(r => r.barangay_id);
      const uniqueIds = new Set(barangayIds);
      
      if (barangayIds.length !== uniqueIds.size) {
        console.log('❌ DUPLICATES FOUND!');
        const duplicates = barangayIds.filter((id, index) => barangayIds.indexOf(id) !== index);
        console.log('   Duplicate barangay IDs:', [...new Set(duplicates)]);
      } else {
        console.log('✅ No duplicates');
      }
      
      // Show top 3
      console.log('\n🏆 Top 3 Barangays:');
      data.rankings.slice(0, 3).forEach(r => {
        console.log(`   ${r.rank}. ${r.name}: ${r.satisfaction}% satisfaction`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
