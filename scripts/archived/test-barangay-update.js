// Test barangay update functionality
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Barangay Update Functionality...\n');

async function testBarangayUpdate() {
  try {
    // First, get all barangays to find one to update
    console.log('1. Fetching barangays...');
    const getResponse = await fetch('http://localhost:3000/api/barangays/all');
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch barangays: ${getResponse.status}`);
    }
    
    const barangays = await getResponse.json();
    console.log(`   ✅ Found ${barangays.length} barangays`);
    
    if (barangays.length === 0) {
      console.log('   ❌ No barangays found to test with');
      return;
    }
    
    // Pick the first barangay to test with
    const testBarangay = barangays[0];
    console.log(`   📍 Testing with: ${testBarangay.name} (ID: ${testBarangay.barangay_id})`);
    console.log(`   📊 Current data:`, {
      households: testBarangay.households,
      population: testBarangay.population,
      captain: testBarangay.captain,
      seal: testBarangay.seal
    });
    
    // Test update
    console.log('\n2. Testing update...');
    const updatePayload = {
      barangayId: testBarangay.barangay_id,
      name: testBarangay.name,
      households: (testBarangay.households || 0) + 1, // Increment by 1 for testing
      population: (testBarangay.population || 0) + 10, // Increment by 10 for testing
      captain: testBarangay.captain || 'Test Captain',
      seal: testBarangay.seal === 'yes' ? 'no' : 'yes' // Toggle seal for testing
    };
    
    console.log('   📤 Sending update payload:', updatePayload);
    
    const updateResponse = await fetch('http://localhost:3000/api/barangays/all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Update failed: ${updateResponse.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('   ✅ Update successful!');
    console.log('   📊 Updated data:', {
      households: updateResult.households,
      population: updateResult.population,
      captain: updateResult.captain,
      seal: updateResult.seal
    });
    
    // Verify the update by fetching again
    console.log('\n3. Verifying update...');
    const verifyResponse = await fetch('http://localhost:3000/api/barangays/all');
    const updatedBarangays = await verifyResponse.json();
    const verifiedBarangay = updatedBarangays.find(b => b.barangay_id === testBarangay.barangay_id);
    
    if (verifiedBarangay) {
      console.log('   ✅ Verification successful!');
      console.log('   📊 Verified data:', {
        households: verifiedBarangay.households,
        population: verifiedBarangay.population,
        captain: verifiedBarangay.captain,
        seal: verifiedBarangay.seal
      });
      
      // Check if the changes were applied
      const changesApplied = 
        verifiedBarangay.households === updatePayload.households &&
        verifiedBarangay.population === updatePayload.population &&
        verifiedBarangay.captain === updatePayload.captain &&
        verifiedBarangay.seal === updatePayload.seal;
        
      if (changesApplied) {
        console.log('   🎉 All changes were successfully applied to the database!');
      } else {
        console.log('   ⚠️  Some changes may not have been applied correctly');
      }
    } else {
      console.log('   ❌ Could not find updated barangay in verification');
    }
    
    console.log('\n🎯 Barangay update functionality test complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBarangayUpdate();