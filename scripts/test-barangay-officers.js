/**
 * Test script to verify barangay officers are being fetched correctly
 */

const BASE_URL = 'http://localhost:3000';

async function testBarangayOfficers() {
  try {
    console.log('🧪 Testing Barangay Officers API...\n');

    // Test the /api/barangays/all endpoint
    const response = await fetch(`${BASE_URL}/api/barangays/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response received');
    console.log(`📊 Total barangays: ${data.data?.length || 0}\n`);

    // Check if officers data is included
    if (data.data && data.data.length > 0) {
      console.log('🔍 Checking officers data for each barangay:\n');
      
      data.data.forEach((barangay, index) => {
        const officers = barangay.officers || [];
        console.log(`${index + 1}. ${barangay.name}`);
        console.log(`   Officers: ${officers.length}`);
        
        if (officers.length > 0) {
          officers.forEach((officer, idx) => {
            console.log(`   ${idx + 1}) ${officer.fullName} (${officer.email})`);
          });
        } else {
          console.log('   No officers designated');
        }
        console.log('');
      });

      // Summary
      const barangaysWithOfficers = data.data.filter(b => b.officers && b.officers.length > 0);
      const totalOfficers = data.data.reduce((sum, b) => sum + (b.officers?.length || 0), 0);
      
      console.log('\n📈 Summary:');
      console.log(`   Barangays with officers: ${barangaysWithOfficers.length}/${data.data.length}`);
      console.log(`   Total officers designated: ${totalOfficers}`);
    } else {
      console.log('⚠️  No barangays found in response');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Run the test
testBarangayOfficers();
