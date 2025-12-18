// Test if migration was successful
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Migration Success...\n');

async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  const endpoints = [
    '/api/barangays/all',
    '/api/barangays',
    '/api/users',
    '/api/assignments'
  ];
  
  console.log('Testing API endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${response.status} - ${Array.isArray(data) ? data.length + ' items' : 'Success'}`);
        
        if (endpoint === '/api/barangays/all' && Array.isArray(data)) {
          console.log(`   📊 Barangays: ${data.map(b => b.barangay_name || b.name).join(', ')}`);
        }
      } else {
        console.log(`❌ ${endpoint}: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`💥 ${endpoint}: Network error - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎯 Migration Results:');
  console.log('If you see 200 responses above, the migration was successful!');
  console.log('If you see 500 errors, there might be API code issues to fix.');
  console.log('\n📋 Next Steps:');
  console.log('1. Check Settings → Barangays page');
  console.log('2. Try editing barangay seals');
  console.log('3. Test survey functionality');
}

testAPIs().catch(console.error);