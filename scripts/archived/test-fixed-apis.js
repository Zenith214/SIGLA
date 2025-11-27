// Test the fixed APIs
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Fixed APIs...\n');

async function testAPIs() {
  try {
    // Test /api/barangays (awardees only)
    console.log('1. Testing /api/barangays (awardees only)...');
    const response1 = await fetch('http://localhost:3000/api/barangays');
    console.log('   Status:', response1.status);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`   ✅ Awardees API: ${data1.length} barangays`);
    } else {
      const error1 = await response1.text();
      console.log('   ❌ Awardees API failed:', error1);
    }
    
    // Test /api/barangays/all (all barangays)
    console.log('\n2. Testing /api/barangays/all (all barangays)...');
    const response2 = await fetch('http://localhost:3000/api/barangays/all');
    console.log('   Status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`   ✅ All barangays API: ${data2.length} barangays`);
    } else {
      const error2 = await response2.text();
      console.log('   ❌ All barangays API failed:', error2);
    }
    
    // Test /api/survey-cycles
    console.log('\n3. Testing /api/survey-cycles...');
    const response3 = await fetch('http://localhost:3000/api/survey-cycles');
    console.log('   Status:', response3.status);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`   ✅ Survey cycles API: ${data3.length} cycles`);
    } else {
      const error3 = await response3.text();
      console.log('   ❌ Survey cycles API failed:', error3);
    }
    
    console.log('\n🎉 All APIs should now be working with Supabase!');
    
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

testAPIs();