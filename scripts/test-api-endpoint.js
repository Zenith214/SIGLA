const fetch = require('node-fetch')

async function testAPIEndpoint() {
  try {
    console.log('🧪 Testing survey response API endpoint...')
    
    const testData = {
      surveyNumber: `API-TEST-${Date.now()}`,
      location: {
        lat: 8.4542,
        lng: 124.6319,
        address: 'Test Address, Butuan City',
        accuracy: 10.5,
        timestamp: Date.now(),
        barangay: 'Katipunan',
        municipality: 'Butuan City',
        province: 'Agusan del Norte'
      },
      selectedMember: 'Test Respondent',
      interviewerId: 1,
      barangayId: 26,
      financialAdmin: { q1: 'Satisfied', q2: 'Good' },
      disasterPrep: { q1: 'Very Satisfied', q2: 'Excellent' },
      safetyPeace: { q1: 'Satisfied', q2: 'Good' },
      businessFriendly: { q1: 'Neutral', q2: 'Fair' },
      environmental: { q1: 'Dissatisfied', q2: 'Poor' },
      socialProtection: { q1: 'Very Satisfied', q2: 'Excellent' }
    }

    console.log('📤 Sending POST request to /api/survey-responses...')
    const response = await fetch('http://localhost:3000/api/survey-responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ API Response:', result)
      
      // Test GET endpoint
      console.log('📥 Testing GET endpoint...')
      const getResponse = await fetch(`http://localhost:3000/api/survey-responses?barangayId=26`)
      
      if (getResponse.ok) {
        const responses = await getResponse.json()
        console.log(`✅ Retrieved ${responses.length} survey responses`)
        
        // Find our test response
        const testResponse = responses.find(r => r.survey_number.startsWith('API-TEST-'))
        if (testResponse) {
          console.log('✅ Found our test response:', testResponse.survey_number)
          console.log('- Sections:', testResponse.survey_section.length)
        }
      } else {
        console.log('❌ GET request failed:', getResponse.status)
      }
      
    } else {
      const error = await response.json()
      console.log('❌ API Error:', error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('💡 Make sure the development server is running: npm run dev')
  }
}

testAPIEndpoint()