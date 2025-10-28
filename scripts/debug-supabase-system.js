const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 SIGLA System Debug - Supabase Edition\n');
console.log('=' .repeat(50));

async function testSupabaseConnection() {
  console.log('\n1. 🗄️  Supabase Connection Test');
  console.log('=' .repeat(50));
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic query
    const { data, error } = await supabase
      .from('barangay')
      .select('barangay_id, barangay_name')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase Error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase: Connected');
    console.log('✅ Sample barangay:', data[0]?.barangay_name || 'No data');
    return true;
  } catch (error) {
    console.log('❌ Supabase: Connection failed');
    console.log('💥 Error:', error.message);
    return false;
  }
}

async function testPostgresConnection() {
  console.log('\n2. 🐘 PostgreSQL Direct Connection Test');
  console.log('=' .repeat(50));
  
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL: Connected');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) FROM barangay');
    console.log(`✅ Barangays in database: ${result.rows[0].count}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL: Connection failed');
    console.log('💥 Error:', error.message);
    await pool.end();
    return false;
  }
}

async function testActiveCycle() {
  console.log('\n3. 🔄 Active Survey Cycle Test');
  console.log('=' .repeat(50));
  
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT cycle_id, year, name, is_active FROM survey_cycle WHERE is_active = true'
    );
    
    if (result.rows.length === 0) {
      console.log('⚠️  No active survey cycle found');
      console.log('💡 Set an active cycle in Settings → Survey Cycles');
    } else {
      const cycle = result.rows[0];
      console.log('✅ Active Cycle:', cycle.name);
      console.log('   Year:', cycle.year);
      console.log('   ID:', cycle.cycle_id);
    }
    
    client.release();
    await pool.end();
    return result.rows.length > 0;
  } catch (error) {
    console.log('❌ Error checking active cycle:', error.message);
    await pool.end();
    return false;
  }
}

async function testMLCache() {
  console.log('\n4. 🤖 ML Cache Data Test');
  console.log('=' .repeat(50));
  
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT COUNT(*) as count FROM ml_cache'
    );
    
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
      console.log('⚠️  ML Cache is empty (0 records)');
      console.log('💡 This is why dashboard shows 0% satisfaction');
      console.log('💡 Run: psql -f database/populate-ml-cache-sample-data.sql');
    } else {
      console.log(`✅ ML Cache has ${count} records`);
      
      // Check sample data
      const sample = await client.query(
        `SELECT barangay_id, cycle_id, 
         data->>'financial_assistance_satisfaction' as satisfaction
         FROM ml_cache LIMIT 1`
      );
      
      if (sample.rows[0]?.satisfaction) {
        console.log('✅ Sample satisfaction score:', sample.rows[0].satisfaction);
      } else {
        console.log('⚠️  Data exists but satisfaction scores are null');
      }
    }
    
    client.release();
    await pool.end();
    return count > 0;
  } catch (error) {
    console.log('❌ Error checking ML cache:', error.message);
    await pool.end();
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n5. 📡 API Endpoints Test (via localhost:3000)');
  console.log('=' .repeat(50));
  
  const endpoints = [
    { name: 'Barangays', url: 'http://localhost:3000/api/barangays' },
    { name: 'Active Cycle', url: 'http://localhost:3000/api/survey-cycles/active' },
    { name: 'Service Rankings', url: 'http://localhost:3000/api/analytics/service-area-rankings' },
    { name: 'Service Trends', url: 'http://localhost:3000/api/analytics/service-trends?service=financial_assistance' },
  ];
  
  let working = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: Working`);
        working++;
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 APIs Working: ${working}/${endpoints.length}`);
  return working === endpoints.length;
}

async function checkSurveyData() {
  console.log('\n6. 📋 Survey Data Check');
  console.log('=' .repeat(50));
  
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  
  try {
    const client = await pool.connect();
    
    // Check survey responses
    const responses = await client.query(
      'SELECT COUNT(*) as count FROM survey_response'
    );
    console.log(`📝 Survey Responses: ${responses.rows[0].count}`);
    
    // Check survey targets
    const targets = await client.query(
      'SELECT COUNT(*) as count FROM survey_target'
    );
    console.log(`🎯 Survey Targets: ${targets.rows[0].count}`);
    
    // Check assignments
    const assignments = await client.query(
      'SELECT COUNT(*) as count FROM assignment'
    );
    console.log(`👥 Assignments: ${assignments.rows[0].count}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Error checking survey data:', error.message);
    await pool.end();
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive system check...\n');
  
  const results = {
    supabase: await testSupabaseConnection(),
    postgres: await testPostgresConnection(),
    activeCycle: await testActiveCycle(),
    mlCache: await testMLCache(),
    surveyData: await checkSurveyData(),
    apis: await testAPIEndpoints(),
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n✅ Passed: ${passed}/${total} checks`);
  
  if (!results.supabase || !results.postgres) {
    console.log('\n🔴 CRITICAL: Database connection failed');
    console.log('   Check your .env file and Supabase credentials');
  } else if (!results.activeCycle) {
    console.log('\n🟡 WARNING: No active survey cycle');
    console.log('   Go to Settings → Survey Cycles and activate one');
  } else if (!results.mlCache) {
    console.log('\n🟡 WARNING: ML Cache is empty');
    console.log('   Dashboard will show 0% satisfaction scores');
    console.log('   Run: psql -f database/populate-ml-cache-sample-data.sql');
  } else if (!results.apis) {
    console.log('\n🟡 WARNING: Some APIs are not responding');
    console.log('   Make sure dev server is running: npm run dev');
  } else {
    console.log('\n🟢 SYSTEM HEALTHY: All checks passed!');
  }
  
  console.log('\n💡 Next Steps:');
  if (!results.supabase || !results.postgres) {
    console.log('   1. Verify Supabase credentials in .env');
    console.log('   2. Check Supabase dashboard is accessible');
    console.log('   3. Test connection: node scripts/test-supabase-connection.js');
  } else if (!results.activeCycle) {
    console.log('   1. Open http://localhost:3000/settings');
    console.log('   2. Go to Survey Cycles tab');
    console.log('   3. Click "Set Active" on a cycle');
  } else if (!results.mlCache) {
    console.log('   1. Populate ML cache with sample data');
    console.log('   2. Or wait for real survey data to be processed');
  } else {
    console.log('   1. Open http://localhost:3000');
    console.log('   2. Start using the system!');
  }
  
  console.log('\n' + '=' .repeat(50));
}

// Run all tests
runAllTests().catch(console.error);
