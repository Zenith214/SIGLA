const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testMLCacheReading() {
  console.log('🔍 Testing ML Cache Data Reading\n');
  console.log('=' .repeat(60));
  
  try {
    const client = await pool.connect();
    
    // Get active cycle
    const cycleResult = await client.query(
      'SELECT cycle_id, year, name FROM survey_cycle WHERE is_active = true'
    );
    
    if (cycleResult.rows.length === 0) {
      console.log('❌ No active cycle found');
      client.release();
      await pool.end();
      return;
    }
    
    const activeCycle = cycleResult.rows[0];
    console.log(`✅ Active Cycle: ${activeCycle.name} (ID: ${activeCycle.cycle_id})`);
    console.log('');
    
    // Get ML cache data for active cycle
    const mlResult = await client.query(
      'SELECT barangay_id, cycle_id, data FROM ml_cache WHERE cycle_id = $1',
      [activeCycle.cycle_id]
    );
    
    console.log(`📊 ML Cache Records: ${mlResult.rows.length}`);
    console.log('');
    
    if (mlResult.rows.length === 0) {
      console.log('⚠️  No ML cache data for active cycle');
      console.log(`   Try cycle 17 instead (has ${await getRecordCount(client, 17)} records)`);
      client.release();
      await pool.end();
      return;
    }
    
    // Test reading different service areas
    const services = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
    
    console.log('Testing Service Data Extraction:');
    console.log('-'.repeat(60));
    
    const sampleRecord = mlResult.rows[0];
    const barangayId = sampleRecord.barangay_id;
    
    // Get barangay name
    const barangayResult = await client.query(
      'SELECT barangay_name FROM barangay WHERE barangay_id = $1',
      [barangayId]
    );
    const barangayName = barangayResult.rows[0]?.barangay_name || 'Unknown';
    
    console.log(`\nBarangay: ${barangayName} (ID: ${barangayId})`);
    console.log('');
    
    services.forEach(service => {
      const data = sampleRecord.data;
      
      // Try action_grid structure
      let satisfaction = null;
      let needAction = null;
      
      if (data?.action_grid?.[service]) {
        satisfaction = data.action_grid[service].satisfaction_score;
        needAction = data.action_grid[service].need_action_score;
      } else if (data?.service_scores?.[service]) {
        satisfaction = data.service_scores[service].satisfaction;
        needAction = data.service_scores[service].need_action;
      }
      
      if (satisfaction !== null) {
        console.log(`  ${service.padEnd(15)} Satisfaction: ${satisfaction.toFixed(1)}%  Need Action: ${needAction.toFixed(1)}%`);
      } else {
        console.log(`  ${service.padEnd(15)} ❌ No data found`);
      }
    });
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('✅ Data Structure Test Complete');
    console.log('');
    console.log('💡 The data is stored in: data.action_grid.{service}.satisfaction_score');
    console.log('💡 The API should be able to read this structure');
    console.log('');
    console.log('🔍 To debug dashboard issues:');
    console.log('   1. Open http://localhost:3000');
    console.log('   2. Login with your credentials');
    console.log('   3. Open browser DevTools (F12)');
    console.log('   4. Check Console for [SERVICE RANKINGS] logs');
    console.log('   5. Check Network tab for API responses');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

async function getRecordCount(client, cycleId) {
  const result = await client.query(
    'SELECT COUNT(*) as count FROM ml_cache WHERE cycle_id = $1',
    [cycleId]
  );
  return result.rows[0].count;
}

testMLCacheReading();
