require('dotenv').config();

async function testSurveyResponseAPI() {
  console.log('🧪 Testing Survey Response API with Cycle Awareness');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Create a survey response
    console.log('\n1. Testing survey response creation...');
    
    const surveyData = {
      location: {
        lat: 10.3157,
        lng: 123.8854,
        address: "Test Location",
        accuracy: 15,
        timestamp: new Date().toISOString(),
        barangay: "Test Barangay",
        municipality: "Test Municipality",
        province: "Cebu"
      },
      selectedMember: "Test Respondent",
      interviewerId: 1,
      barangayId: 8,
      respondentDemographics: {
        age: 30,
        gender: "Male",
        educationalAttainment: "College",
        householdIncome: "20,001-50,000"
      },
      sections: {
        financial: {
          data: {
            awarenessProjects: "Oo",
            benefitedProjects: "Oo",
            satisfactionProjects: "4"
          }
        }
      }
    };
    
    const createResponse = await fetch(`${baseUrl}/api/survey-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData)
    });
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Survey response created successfully:');
      console.log(`   - Response ID: ${result.responseId}`);
      console.log(`   - Survey Number: ${result.surveyNumber}`);
      console.log(`   - Cycle ID: ${result.cycleId}`);
      console.log(`   - Cycle Name: ${result.cycleName}`);
      
      // Test 2: Retrieve survey responses
      console.log('\n2. Testing survey response retrieval...');
      
      const getResponse = await fetch(`${baseUrl}/api/survey-responses?barangayId=8`);
      
      if (getResponse.ok) {
        const responses = await getResponse.json();
        console.log(`✅ Retrieved ${responses.length} survey responses`);
        
        if (responses.length > 0) {
          const firstResponse = responses[0];
          console.log(`   - First response: ${firstResponse.survey_number}`);
          console.log(`   - Respondent: ${firstResponse.respondent_name}`);
          console.log(`   - Status: ${firstResponse.status}`);
        }
      } else {
        console.log('❌ Failed to retrieve survey responses:', await getResponse.text());
      }
      
      // Test 3: Test cycle filtering
      console.log('\n3. Testing cycle-specific filtering...');
      
      const cycleFilterResponse = await fetch(`${baseUrl}/api/survey-responses?cycleId=${result.cycleId}`);
      
      if (cycleFilterResponse.ok) {
        const cycleResponses = await cycleFilterResponse.json();
        console.log(`✅ Retrieved ${cycleResponses.length} responses for cycle ${result.cycleId}`);
      } else {
        console.log('❌ Failed to filter by cycle:', await cycleFilterResponse.text());
      }
      
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Failed to create survey response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Survey Response API test completed!');
}

// Check if we're running a development server
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/survey-cycles/active');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Development server is not running on localhost:3000');
    console.log('💡 Please start the server with: npm run dev');
    return;
  }
  
  await testSurveyResponseAPI();
}

main();