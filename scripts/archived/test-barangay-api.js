// Simple test script to check if the barangay API works
const fetch = require('node-fetch');

async function testBarangayAPI() {
  try {
    console.log('🧪 Testing barangay API...');
    
    const response = await fetch('http://localhost:3000/api/barangays');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response received');
    console.log(`📊 Found ${data.length} barangays`);
    
    if (data.length > 0) {
      console.log('📋 Sample barangay:', {
        id: data[0].id,
        name: data[0].name,
        progress: data[0].progress,
        status: data[0].status
      });
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    return null;
  }
}

// Run the test
if (require.main === module) {
  testBarangayAPI()
    .then((data) => {
      if (data) {
        console.log('🎉 Test completed successfully');
      } else {
        console.log('❌ Test failed');
      }
    });
}

module.exports = { testBarangayAPI };