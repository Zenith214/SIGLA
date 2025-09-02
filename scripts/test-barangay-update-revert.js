// Test reverting the barangay update to original values
require('dotenv').config({ path: '.env.local' });
console.log('🧪 Testing Barangay Update Revert...\n');

async function revertBarangayUpdate() {
  try {
    // Revert the test barangay back to original values
    const revertPayload = {
      barangayId: 8, // Balasinon ID from previous test
      name: 'Balasinon',
      households: 2335, // Original value
      population: 9340, // Original value
      captain: null, // Original value
      seal: 'yes' // Original value
    };
    
    console.log('📤 Reverting barangay to original values:', revertPayload);
    
    const updateResponse = await fetch('http://localhost:3000/api/barangays/all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(revertPayload)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Revert failed: ${updateResponse.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const revertResult = await updateResponse.json();
    console.log('✅ Revert successful!');
    console.log('📊 Reverted data:', {
      households: revertResult.households,
      population: revertResult.population,
      captain: revertResult.captain,
      seal: revertResult.seal
    });
    
    console.log('\n🎉 Barangay successfully reverted to original values!');
    
  } catch (error) {
    console.error('💥 Revert failed:', error.message);
  }
}

revertBarangayUpdate();