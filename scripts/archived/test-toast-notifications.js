// Test the new toast notification system
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Toast Notification System...\n');

async function testToastNotifications() {
  try {
    console.log('🎯 Testing barangay update with new toast notifications...\n');
    
    // Get a barangay to test with
    console.log('1. Fetching barangays...');
    const getResponse = await fetch('http://localhost:3000/api/barangays/all');
    const barangays = await getResponse.json();
    const testBarangay = barangays[0];
    
    console.log(`   📍 Testing with: ${testBarangay.name} (ID: ${testBarangay.barangay_id})`);
    
    // Test successful update
    console.log('\n2. Testing successful update (should show success toast)...');
    const successPayload = {
      barangayId: testBarangay.barangay_id,
      name: testBarangay.name,
      households: (testBarangay.households || 0) + 1,
      population: (testBarangay.population || 0) + 5,
      captain: testBarangay.captain || 'Test Captain',
      seal: testBarangay.seal
    };
    
    const successResponse = await fetch('http://localhost:3000/api/barangays/all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(successPayload)
    });
    
    if (successResponse.ok) {
      console.log('   ✅ Success update completed - should show green success toast');
    }
    
    // Test error case (invalid barangayId)
    console.log('\n3. Testing error case (should show error toast)...');
    const errorPayload = {
      barangayId: 99999, // Invalid ID
      name: 'Test',
      households: 100,
      population: 500,
      captain: 'Test Captain',
      seal: 'yes'
    };
    
    const errorResponse = await fetch('http://localhost:3000/api/barangays/all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorPayload)
    });
    
    if (!errorResponse.ok) {
      console.log('   ✅ Error case completed - should show red error toast');
    }
    
    // Revert the successful change
    console.log('\n4. Reverting test changes...');
    const revertPayload = {
      barangayId: testBarangay.barangay_id,
      name: testBarangay.name,
      households: testBarangay.households,
      population: testBarangay.population,
      captain: testBarangay.captain,
      seal: testBarangay.seal
    };
    
    await fetch('http://localhost:3000/api/barangays/all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(revertPayload)
    });
    
    console.log('   ✅ Changes reverted');
    
    console.log('\n🎉 Toast notification test complete!');
    console.log('\n📋 What to expect in the UI:');
    console.log('   ✅ Success Toast: Green background with checkmark icon');
    console.log('   ❌ Error Toast: Red background with X icon');
    console.log('   🎨 Beautiful animations and auto-dismiss');
    console.log('   📱 Responsive design for mobile and desktop');
    console.log('\n🚀 Go to Settings → Barangays and try editing a barangay to see the new notifications!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testToastNotifications();