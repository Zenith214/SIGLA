// Test barangays API
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Barangays API...\n');

async function testBarangaysAPI() {
  try {
    console.log('Testing /api/barangays/all...');
    
    const response = await fetch('http://localhost:3000/api/barangays/all');
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Barangays API working!');
      console.log(`📊 Total barangays: ${data.length}`);
      
      if (data.length > 0) {
        console.log('📝 Sample barangay:');
        console.log(`   Name: ${data[0].name}`);
        console.log(`   Seal: ${data[0].seal}`);
        console.log(`   Population: ${data[0].population}`);
        
        // Count awardees
        const awardees = data.filter(b => b.seal === 'yes');
        console.log(`🏆 Awardees: ${awardees.length}`);
        console.log(`   Names: ${awardees.map(b => b.name).join(', ')}`);
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Barangays API failed');
      console.log('Error response:', errorData);
    }
    
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

testBarangaysAPI();