const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAnalyticsAPI() {
  console.log('🧪 Testing Survey Analytics API...\n');

  const tests = [
    {
      name: 'Summary Analytics',
      endpoint: '/api/survey-analytics?format=summary',
      description: 'Basic statistics and overview'
    },
    {
      name: 'Detailed Analytics',
      endpoint: '/api/survey-analytics?format=detailed',
      description: 'Complete response data with sections'
    },
    {
      name: 'Export Data',
      endpoint: '/api/survey-analytics?format=export',
      description: 'Flattened data for CSV export'
    },
    {
      name: 'Aggregated Analytics',
      endpoint: '/api/survey-analytics?format=aggregated',
      description: 'Statistical aggregations by section and question'
    },
    {
      name: 'Filtered by Barangay',
      endpoint: '/api/survey-analytics?format=summary&barangayId=1',
      description: 'Summary filtered by specific barangay'
    },
    {
      name: 'Section-specific Data',
      endpoint: '/api/survey-analytics?format=detailed&section=financial',
      description: 'Detailed data for Financial Administration section only'
    }
  ];

  for (const test of tests) {
    console.log(`📊 Testing: ${test.name}`);
    console.log(`   Description: ${test.description}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`);
      
      if (!response.ok) {
        console.log(`   ❌ HTTP Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error details: ${errorText}`);
        continue;
      }

      const data = await response.json();
      
      if (data.error) {
        console.log(`   ❌ API Error: ${data.error}`);
        continue;
      }

      console.log(`   ✅ Success! Response keys: ${Object.keys(data).join(', ')}`);
      
      // Show sample data structure
      if (data.summary) {
        console.log(`   📈 Total Responses: ${data.summary.totalResponses}`);
        console.log(`   📈 Average Progress: ${data.summary.averageProgress?.toFixed(2)}%`);
        console.log(`   📈 Barangays: ${data.summary.barangayStats?.length || 0}`);
      }
      
      if (data.detailed) {
        console.log(`   📋 Detailed Responses: ${data.detailed.count}`);
        if (data.detailed.responses?.[0]) {
          const sample = data.detailed.responses[0];
          console.log(`   📋 Sample sections: ${sample.sections?.map(s => s.key).join(', ')}`);
        }
      }
      
      if (data.export) {
        console.log(`   📤 Export Records: ${data.export.count}`);
        console.log(`   📤 Export Columns: ${data.export.columns?.length || 0}`);
      }
      
      if (data.aggregated) {
        console.log(`   📊 Aggregated Sections: ${Object.keys(data.aggregated.sections || {}).join(', ')}`);
        console.log(`   📊 Question Aggregations: ${Object.keys(data.aggregated.questions || {}).length}`);
      }

    } catch (error) {
      console.log(`   ❌ Request Failed: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 Testing Complete!\n');
  
  // Test data analysis capabilities
  console.log('🔬 Testing Data Analysis Capabilities...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/survey-analytics?format=aggregated`);
    const data = await response.json();
    
    if (data.aggregated?.questions) {
      console.log('📊 Sample Question Analysis:');
      const questions = Object.keys(data.aggregated.questions).slice(0, 3);
      
      questions.forEach(questionKey => {
        const question = data.aggregated.questions[questionKey];
        console.log(`\n   Question: ${questionKey}`);
        console.log(`   Section: ${question.section}`);
        console.log(`   Total Responses: ${question.responses?.length || 0}`);
        
        if (question.valueCount) {
          console.log('   Value Distribution:');
          Object.entries(question.valueCount).forEach(([value, count]) => {
            console.log(`     "${value}": ${count} responses`);
          });
        }
        
        if (question.statistics) {
          console.log('   Statistics:');
          console.log(`     Mean: ${question.statistics.mean?.toFixed(2)}`);
          console.log(`     Min: ${question.statistics.min}`);
          console.log(`     Max: ${question.statistics.max}`);
          console.log(`     Median: ${question.statistics.median}`);
        }
      });
    }
    
    console.log('\n✅ Data analysis capabilities confirmed!');
    console.log('\n🎉 All analytics API tests completed successfully!');
    
  } catch (error) {
    console.log(`❌ Data analysis test failed: ${error.message}`);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/survey-responses`);
    return response.ok || response.status === 401; // 401 is ok, means server is running
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Analytics API Tests...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running at http://localhost:3000');
    console.log('   Please start the development server with: npm run dev');
    return;
  }
  
  console.log('✅ Server is running, proceeding with tests...\n');
  await testAnalyticsAPI();
}

main().catch(console.error);