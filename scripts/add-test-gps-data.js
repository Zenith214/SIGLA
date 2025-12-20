/**
 * Script to add test GPS coordinates to visits for testing GPS verification
 * This simulates GPS data capture for interviews
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function addTestGPSData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Finding visits without GPS data...\n');
    
    // Find visits without GPS data (NULL or 0,0)
    const { rows: visitsWithoutGPS } = await client.query(`
      SELECT 
        v.visit_id,
        v.questionnaire_id,
        v.visit_number,
        q.spot_id,
        s.starting_point,
        s.spot_name,
        b.barangay_name
      FROM visits v
      JOIN questionnaires q ON v.questionnaire_id = q.questionnaire_id
      LEFT JOIN spots s ON q.spot_id = s.spot_id
      LEFT JOIN barangay b ON q.barangay_id = b.barangay_id
      WHERE (v.location_lat IS NULL OR v.location_lng IS NULL 
             OR (v.location_lat = 0 AND v.location_lng = 0))
        AND s.starting_point IS NOT NULL
      ORDER BY v.visit_timestamp DESC
      LIMIT 10
    `);
    
    if (visitsWithoutGPS.length === 0) {
      console.log('✅ No visits found without GPS data');
      return;
    }
    
    console.log(`Found ${visitsWithoutGPS.length} visits without GPS data:\n`);
    
    for (const visit of visitsWithoutGPS) {
      const spotCoords = typeof visit.starting_point === 'string' 
        ? JSON.parse(visit.starting_point) 
        : visit.starting_point;
      
      if (!spotCoords || !spotCoords.lat || !spotCoords.lng) {
        console.log(`⚠️  Visit ${visit.visit_id} - No spot coordinates available`);
        continue;
      }
      
      // Generate test GPS coordinates near the spot (within 50-150 meters)
      // Add small random offset to simulate real GPS capture
      const latOffset = (Math.random() - 0.5) * 0.002; // ~±100m
      const lngOffset = (Math.random() - 0.5) * 0.002; // ~±100m
      
      const testLat = spotCoords.lat + latOffset;
      const testLng = spotCoords.lng + lngOffset;
      
      // Calculate approximate distance for verification
      const R = 6371e3; // Earth's radius in meters
      const φ1 = spotCoords.lat * Math.PI / 180;
      const φ2 = testLat * Math.PI / 180;
      const Δφ = (testLat - spotCoords.lat) * Math.PI / 180;
      const Δλ = (testLng - spotCoords.lng) * Math.PI / 180;
      
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = Math.round(R * c);
      
      // Update the visit with test GPS data
      await client.query(`
        UPDATE visits
        SET location_lat = $1, location_lng = $2
        WHERE visit_id = $3
      `, [testLat, testLng, visit.visit_id]);
      
      console.log(`✅ Visit ${visit.visit_id} (${visit.questionnaire_id})`);
      console.log(`   Barangay: ${visit.barangay_name}`);
      console.log(`   Spot: ${visit.spot_name || 'N/A'}`);
      console.log(`   Spot coords: (${spotCoords.lat.toFixed(6)}, ${spotCoords.lng.toFixed(6)})`);
      console.log(`   Test coords: (${testLat.toFixed(6)}, ${testLng.toFixed(6)})`);
      console.log(`   Distance: ~${distance}m\n`);
    }
    
    console.log(`\n✅ Added test GPS data to ${visitsWithoutGPS.length} visits`);
    console.log('🔄 Refresh the GPS Verification page to see the results');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addTestGPSData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
