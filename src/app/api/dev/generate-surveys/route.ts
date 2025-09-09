import { NextRequest, NextResponse } from "next/server"
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Mock data generators
const generateRandomDemographics = () => ({
  age: Math.floor(Math.random() * 50) + 18, // 18-67 years old
  gender: Math.random() > 0.5 ? 'Male' : 'Female',
  educationalAttainment: ['Elementary', 'High School', 'College', 'Graduate'][Math.floor(Math.random() * 4)],
  householdIncome: ['Below 10,000', '10,000-25,000', '25,000-50,000', '50,000-100,000', 'Above 100,000'][Math.floor(Math.random() * 5)]
});



const generateRandomLocation = () => ({
  lat: 8.4542 + (Math.random() - 0.5) * 0.1, // Around Roxas City area
  lng: 123.1887 + (Math.random() - 0.5) * 0.1,
  address: `Mock Address ${Math.floor(Math.random() * 1000)}`,
  accuracy: Math.floor(Math.random() * 20) + 5,
  barangay: 'Mock Barangay',
  municipality: 'Roxas City',
  province: 'Capiz'
});

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('🚀 Starting survey generation...');
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const {
      count = 50,
      barangayIds = [],
      quality = 'random',
      dateRange = 7, // days
      interviewerId = 1
    } = body;
    
    console.log(`📊 Generation parameters:`, {
      count,
      barangayIds,
      quality,
      dateRange,
      interviewerId
    });

    // Get available barangays if none specified
    let targetBarangays = barangayIds;
    console.log('🏘️ Initial barangay IDs:', targetBarangays);
    
    if (targetBarangays.length === 0) {
      console.log('🔍 No barangays specified, fetching from database...');
      const barangayQuery = 'SELECT barangay_id, barangay_name FROM barangay WHERE is_active = true LIMIT 10';
      console.log('📋 Barangay query:', barangayQuery);
      
      const barangayResult = await client.query(barangayQuery);
      console.log('📊 Barangay query result:', barangayResult.rows);
      
      targetBarangays = barangayResult.rows.map(row => row.barangay_id);
      console.log('🎯 Target barangays:', targetBarangays);
    }

    if (targetBarangays.length === 0) {
      console.error('❌ No barangays available for survey generation');
      return NextResponse.json({ error: "No barangays available" }, { status: 400 });
    }
    
    console.log(`✅ Will generate surveys for ${targetBarangays.length} barangays:`, targetBarangays);

    const generatedSurveys = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    console.log(`📅 Date range: ${startDate.toISOString()} to ${new Date().toISOString()}`);
    
    // Get the current maximum survey number to start from
    console.log('🔍 Finding next available survey number...');
    const maxGlobalSurveyQuery = 'SELECT COALESCE(MAX(CAST(survey_number AS INTEGER)), 89999) as max_num FROM survey_response';
    const maxGlobalResult = await client.query(maxGlobalSurveyQuery);
    let nextSurveyNumber = (maxGlobalResult.rows[0].max_num || 89999) + 1;
    
    // Ensure we start from at least 90000 for mock data
    if (nextSurveyNumber < 90000) {
      nextSurveyNumber = 90000;
    }
    
    console.log(`📊 Starting survey numbers from: ${nextSurveyNumber}`);
    
    console.log(`🔄 Starting to generate ${count} surveys...`);
    for (let i = 0; i < count; i++) {
      if (i % 10 === 0) {
        console.log(`📈 Progress: ${i}/${count} surveys generated`);
      }
      const barangayId = targetBarangays[Math.floor(Math.random() * targetBarangays.length)];
      
      // Use sequential survey numbers starting from the max found
      const surveyNumber = nextSurveyNumber + i;
      const demographics = generateRandomDemographics();
      const location = generateRandomLocation();
      
      // Generate random date within range
      const randomDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
      
      // Determine assigned sections based on survey number (for logging purposes)
      const isOdd = surveyNumber % 2 === 1;
      const assignedSections = isOdd 
        ? ['financial', 'safety', 'environmental']
        : ['disaster', 'social', 'business'];

      if (i === 0) {
        console.log(`📋 Survey #${surveyNumber} (${isOdd ? 'ODD' : 'EVEN'}) assigned sections:`, assignedSections);
      }

      // Insert survey response
      const insertQuery = `
        INSERT INTO survey_response (
          survey_number, barangay_id, interviewer_id, respondent_name,
          respondent_age, respondent_gender, location_lat, location_lng,
          location_address, location_accuracy, location_barangay, 
          location_municipality, location_province, status, progress,
          completed_at, submitted_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING response_id
      `;
      
      const insertParams = [
        surveyNumber.toString(),
        barangayId,
        interviewerId,
        `Mock Respondent ${i + 1}`,
        demographics.age,
        demographics.gender,
        location.lat,
        location.lng,
        location.address,
        location.accuracy,
        location.barangay,
        location.municipality,
        location.province,
        'completed',
        100,
        randomDate,
        randomDate,
        randomDate
      ];
      
      if (i === 0) {
        console.log('📝 First survey insert query:', insertQuery);
        console.log('📝 First survey parameters:', insertParams);
      }
      
      const responseResult = await client.query(insertQuery, insertParams);

      generatedSurveys.push({
        responseId: responseResult.rows[0].response_id,
        surveyNumber,
        barangayId,
        assignedSections
      });
    }

    console.log(`✅ Generated ${generatedSurveys.length} surveys successfully`);
    
    // Update survey targets for affected barangays
    console.log('🎯 Updating survey targets...');
    for (const barangayId of targetBarangays) {
      const countQuery = 'SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = $1';
      const countResult = await client.query(countQuery, [barangayId]);
      const achievedCount = parseInt(countResult.rows[0].count);
      
      const targetQuery = 'SELECT target FROM survey_target WHERE barangay_id = $1';
      const targetResult = await client.query(targetQuery, [barangayId]);
      const target = targetResult.rows[0]?.target || 150;
      
      const percentage = Math.min(Math.round((achievedCount / target) * 100), 100);
      
      console.log(`📊 Barangay ${barangayId}: ${achievedCount}/${target} (${percentage}%)`);
      
      // Check if survey target exists, then update or insert
      const existingTargetQuery = 'SELECT target_id FROM survey_target WHERE barangay_id = $1';
      const existingTargetResult = await client.query(existingTargetQuery, [barangayId]);
      
      if (existingTargetResult.rows.length > 0) {
        // Update existing target
        await client.query(
          'UPDATE survey_target SET achieved = $1, percentage = $2, updated_at = NOW() WHERE barangay_id = $3',
          [achievedCount, percentage, barangayId]
        );
      } else {
        // Insert new target
        await client.query(
          'INSERT INTO survey_target (barangay_id, target, achieved, percentage, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [barangayId, target, achievedCount, percentage]
        );
      }
    }
    
    console.log('🎉 Survey generation completed successfully!');

    return NextResponse.json({
      success: true,
      generated: count,
      surveys: generatedSurveys,
      affectedBarangays: targetBarangays
    });

  } catch (error) {
    console.error("❌ Error generating mock surveys:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate mock surveys",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection');
      client.release();
    }
  }
}