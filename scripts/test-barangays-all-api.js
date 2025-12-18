const fetch = require('node-fetch');

async function testBarangaysAllAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/barangays/all?cycle_id=17&include_awards=true');
    const data = await response.json();
    
    console.log('=== API Response Status ===');
    console.log('Status:', response.status);
    console.log('Response type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    // Check response structure
    const barangays = Array.isArray(data) ? data : (data.data || data.barangays || []);
    console.log('Total barangays:', barangays.length);
    
    // Find Balasinon
    const balasinon = barangays.find(b => b.barangay_id === 10 || b.id === 10);
    
    console.log('\n=== Balasinon Data ===');
    console.log(JSON.stringify(balasinon, null, 2));
    
    console.log('\n=== Logo Check ===');
    console.log('Has logo_url property:', 'logo_url' in balasinon);
    console.log('Logo URL value:', balasinon.logo_url);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBarangaysAllAPI();
