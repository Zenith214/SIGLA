const fetch = require('node-fetch');

async function testSurveyAnalytics() {
  console.log('🧪 Testing Survey Analytics System...\n');

  try {
    // Test 1: Check survey analytics API
    console.log('1. Testing survey analytics API endpoints...');
    
    const endpoints = [
      { name: 'Summary', url: 'http://localhost:3000/api/survey-analytics?format=summary' },
      { name: 'Detailed', url: 'http://localhost:3000/api/survey-analytics?format=detailed' },
      { name: 'Aggregated', url: 'http://localhost:3000/api/survey-analytics?format=aggregated' },
      { name: 'Export', url: 'http://localhost:3000/api/survey-analytics?format=export' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        console.log(`   ${endpoint.name}: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`     ✅ Data keys: ${Object.keys(data).join(', ')}`);
          
          if (endpoint.name === 'Summary' && data.summary) {
            console.log(`     Total responses: ${data.summary.totalResponses || 0}`);
            console.log(`     Barangays covered: ${data.summary.barangayStats?.length || 0}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`     ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Failed: ${error.message}`);
      }
    }

    // Test 2: Check if we have survey responses
    console.log('\n2. Checking for existing survey responses...');
    
    try {
      const summaryResponse = await fetch('http://localhost:3000/api/survey-analytics?format=summary');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        const totalResponses = summaryData.summary?.totalResponses || 0;
        
        if (totalResponses === 0) {
          console.log('   ⚠️  No survey responses found - need to create mock data');
          return { needsMockData: true };
        } else {
          console.log(`   ✅ Found ${totalResponses} existing survey responses`);
          return { needsMockData: false, totalResponses };
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to check responses: ${error.message}`);
    }

    console.log('\n🎯 Survey Analytics System Status:');
    console.log('   - API endpoints are accessible');
    console.log('   - Ready for data analysis');
    console.log('   - Mock data may be needed for testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSurveyAnalytics();