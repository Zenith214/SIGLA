const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testSurveyCycleAPI() {
  console.log('Testing Survey Cycle API endpoints...\n');

  try {
    // Test GET endpoint
    console.log('1. Testing GET /api/survey-cycles');
    const getResponse = await fetch(`${BASE_URL}/api/survey-cycles`);
    console.log('Status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await getResponse.text();
      console.log('Error:', error);
    }

    console.log('\n2. Testing POST /api/survey-cycles');
    const postResponse = await fetch(`${BASE_URL}/api/survey-cycles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: '2024',
        status: 'Active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        responses: 0
      })
    });
    
    console.log('Status:', postResponse.status);
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await postResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('\nNote: Make sure the Next.js development server is running on port 3000');
    console.log('Run: npm run dev');
  }
}

testSurveyCycleAPI();