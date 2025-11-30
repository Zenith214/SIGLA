const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createMockSurveyData() {
  console.log('🎭 Creating Mock Survey Data for Analytics Testing...\n');

  let client;
  try {
    client = await pool.connect();

    // Get available barangays and interviewers
    console.log('1. Getting available barangays and interviewers...');
    
    const barangaysResult = await client.query(`
      SELECT barangay_id, barangay_name FROM barangay 
      WHERE is_active = true 
      ORDER BY barangay_id 
      LIMIT 5
    `);
    
    const interviewersResult = await client.query(`
      SELECT id, "firstName", "lastName" FROM "user" 
      WHERE role = 'interviewer' 
      LIMIT 3
    `);

    if (barangaysResult.rows.length === 0) {
      console.log('   ❌ No barangays found');
      return;
    }

    if (interviewersResult.rows.length === 0) {
      console.log('   ❌ No interviewers found');
      return;
    }

    console.log(`   ✅ Found ${barangaysResult.rows.length} barangays and ${interviewersResult.rows.length} interviewers`);

    // Create mock survey responses
    console.log('\n2. Creating mock survey responses...');
    
    const mockResponses = [];
    const sections = [
      { key: 'demographics', name: 'Demographics' },
      { key: 'governance', name: 'Governance Services' },
      { key: 'infrastructure', name: 'Infrastructure' },
      { key: 'social_services', name: 'Social Services' },
      { key: 'economic', name: 'Economic Development' }
    ];

    // Create 20 mock responses
    for (let i = 1; i <= 20; i++) {
      const barangay = barangaysResult.rows[Math.floor(Math.random() * barangaysResult.rows.length)];
      const interviewer = interviewersResult.rows[Math.floor(Math.random() * interviewersResult.rows.length)];
      
      const surveyNumber = `SIGLA-2025-${String(i).padStart(4, '0')}`;
      const progress = Math.floor(Math.random() * 101); // 0-100%
      const status = progress === 100 ? 'completed' : progress > 50 ? 'in_progress' : 'draft';
      
      // Random coordinates within Philippines bounds
      const lat = 14.5995 + (Math.random() - 0.5) * 0.1; // Around Metro Manila
      const lng = 120.9842 + (Math.random() - 0.5) * 0.1;
      
      const respondentNames = ['Juan Dela Cruz', 'Maria Santos', 'Jose Rizal', 'Ana Garcia', 'Pedro Martinez'];
      const respondentName = respondentNames[Math.floor(Math.random() * respondentNames.length)];
      const sex = Math.random() > 0.5 ? 'Male' : 'Female';
      
      const mockResponse = {
        survey_number: surveyNumber,
        barangay_id: barangay.barangay_id,
        interviewer_id: interviewer.id,
        respondent_name: respondentName,
        respondent_age: 25 + Math.floor(Math.random() * 40), // 25-65 years old
        biological_sex: sex,
        gender_identity: sex, // Default to same as biological sex
        location_lat: lat,
        location_lng: lng,
        location_address: `${Math.floor(Math.random() * 999) + 1} Sample Street, ${barangay.barangay_name}`,
        location_barangay: barangay.barangay_name,
        location_municipality: 'Sample Municipality',
        location_province: 'Sample Province',
        location_accuracy: 5 + Math.random() * 10, // 5-15 meters
        status: status,
        progress: progress,
        started_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        completed_at: status === 'completed' ? new Date() : null,
        submitted_at: status === 'completed' ? new Date() : null
      };

      mockResponses.push(mockResponse);
    }

    // Insert survey responses
    for (const response of mockResponses) {
      const insertQuery = `
        INSERT INTO survey_response (
          survey_number, barangay_id, interviewer_id, respondent_name, 
          respondent_age, biological_sex, gender_identity, location_lat, location_lng,
          location_address, location_barangay, location_municipality, 
          location_province, location_accuracy, status, progress,
          started_at, completed_at, submitted_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
        ) RETURNING response_id
      `;

      const result = await client.query(insertQuery, [
        response.survey_number, response.barangay_id, response.interviewer_id,
        response.respondent_name, response.respondent_age, response.biological_sex, response.gender_identity,
        response.location_lat, response.location_lng, response.location_address,
        response.location_barangay, response.location_municipality, response.location_province,
        response.location_accuracy, response.status, response.progress,
        response.started_at, response.completed_at, response.submitted_at
      ]);

      const responseId = result.rows[0].response_id;

      // Create mock sections for each response
      for (const section of sections) {
        const sectionStatus = response.progress === 100 ? 'completed' : 
                            response.progress > 50 ? 'in_progress' : 'pending';
        
        // Create mock section data
        const sectionData = generateMockSectionData(section.key);
        
        const sectionQuery = `
          INSERT INTO survey_section (
            response_id, section_name, section_key, status, data,
            started_at, completed_at, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
          ) RETURNING section_id
        `;

        const sectionResult = await client.query(sectionQuery, [
          responseId, section.name, section.key, sectionStatus,
          JSON.stringify(sectionData),
          response.started_at,
          sectionStatus === 'completed' ? response.completed_at : null
        ]);

        console.log(`   Created section ${section.key} for response ${response.survey_number}`);
      }
    }

    console.log(`   ✅ Created ${mockResponses.length} mock survey responses with sections`);

    // Test the analytics with new data
    console.log('\n3. Testing analytics with mock data...');
    
    const testResponse = await fetch('http://localhost:3000/api/survey-analytics?format=summary');
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`   ✅ Analytics working: ${testData.summary?.totalResponses || 0} total responses`);
      console.log(`   Barangays covered: ${testData.summary?.barangayStats?.length || 0}`);
    }

    console.log('\n🎉 Mock Survey Data Creation Complete!');
    console.log('\n📊 What was created:');
    console.log(`   - ${mockResponses.length} survey responses`);
    console.log(`   - ${mockResponses.length * sections.length} survey sections`);
    console.log(`   - Mock data for ${sections.length} different survey sections`);
    console.log(`   - Responses across ${barangaysResult.rows.length} barangays`);
    console.log(`   - Data from ${interviewersResult.rows.length} interviewers`);

  } catch (error) {
    console.error('❌ Failed to create mock data:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

function generateMockSectionData(sectionKey) {
  const mockData = {};

  switch (sectionKey) {
    case 'demographics':
      mockData.household_size = Math.floor(Math.random() * 8) + 1; // 1-8 people
      mockData.income_level = ['Low', 'Middle', 'High'][Math.floor(Math.random() * 3)];
      mockData.education_level = ['Elementary', 'High School', 'College', 'Graduate'][Math.floor(Math.random() * 4)];
      mockData.employment_status = ['Employed', 'Unemployed', 'Self-employed', 'Retired'][Math.floor(Math.random() * 4)];
      break;

    case 'governance':
      mockData.service_quality = Math.floor(Math.random() * 5) + 1; // 1-5 rating
      mockData.transparency = Math.floor(Math.random() * 5) + 1;
      mockData.responsiveness = Math.floor(Math.random() * 5) + 1;
      mockData.accessibility = Math.floor(Math.random() * 5) + 1;
      mockData.overall_satisfaction = Math.floor(Math.random() * 5) + 1;
      break;

    case 'infrastructure':
      mockData.road_quality = Math.floor(Math.random() * 5) + 1;
      mockData.water_supply = Math.floor(Math.random() * 5) + 1;
      mockData.electricity = Math.floor(Math.random() * 5) + 1;
      mockData.waste_management = Math.floor(Math.random() * 5) + 1;
      mockData.public_facilities = Math.floor(Math.random() * 5) + 1;
      break;

    case 'social_services':
      mockData.healthcare = Math.floor(Math.random() * 5) + 1;
      mockData.education = Math.floor(Math.random() * 5) + 1;
      mockData.social_protection = Math.floor(Math.random() * 5) + 1;
      mockData.disaster_preparedness = Math.floor(Math.random() * 5) + 1;
      mockData.public_safety = Math.floor(Math.random() * 5) + 1;
      break;

    case 'economic':
      mockData.business_environment = Math.floor(Math.random() * 5) + 1;
      mockData.employment_opportunities = Math.floor(Math.random() * 5) + 1;
      mockData.market_access = Math.floor(Math.random() * 5) + 1;
      mockData.financial_services = Math.floor(Math.random() * 5) + 1;
      mockData.economic_growth = Math.floor(Math.random() * 5) + 1;
      break;
  }

  return mockData;
}

createMockSurveyData();