import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

// Survey sections available
const ALL_SECTIONS = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];

// Response profiles for different testing scenarios
const RESPONSE_PROFILES = {
  'balanced': {
    name: 'Balanced (All Quadrants)',
    distribution: { highPerformer: 0.25, needsImprovement: 0.25, growthPotential: 0.25, stableLow: 0.25 }
  },
  'high-performer': {
    name: 'High Performer (MAINTAIN)',
    distribution: { highPerformer: 1.0, needsImprovement: 0, growthPotential: 0, stableLow: 0 }
  },
  'needs-improvement': {
    name: 'Needs Improvement (FIX NOW)',
    distribution: { highPerformer: 0, needsImprovement: 1.0, growthPotential: 0, stableLow: 0 }
  },
  'mixed': {
    name: 'Mixed Responses (Realistic)',
    distribution: { mixed: 1.0 }
  },
  'extreme-mixed': {
    name: 'Extreme Mixed (Edge Cases)',
    distribution: { extremeMixed: 1.0 }
  }
};

// Service score ranges for different performance profiles
const SCORE_RANGES = {
  highPerformer: {
    awareness: [0.85, 0.95],
    availment: [0.80, 0.90],
    satisfaction: [0.75, 0.85],
    needAction: [0.10, 0.25]
  },
  needsImprovement: {
    awareness: [0.40, 0.60],
    availment: [0.20, 0.40],
    satisfaction: [0.20, 0.40],
    needAction: [0.70, 0.85]
  },
  growthPotential: {
    awareness: [0.75, 0.85],
    availment: [0.70, 0.80],
    satisfaction: [0.70, 0.80],
    needAction: [0.60, 0.75]
  },
  stableLow: {
    awareness: [0.50, 0.65],
    availment: [0.45, 0.60],
    satisfaction: [0.40, 0.55],
    needAction: [0.20, 0.35]
  },
  mixed: {
    // Random distribution for mixed profile
    awareness: [0, 1],
    availment: [0, 1],
    satisfaction: [0, 1],
    needAction: [0, 1]
  },
  extremeMixed: {
    // Extreme variation for edge case testing
    awareness: [0, 1],
    availment: [0, 1],
    satisfaction: [0, 1],
    needAction: [0, 1]
  }
};

// Helper function to get next available questionnaire number for a barangay/year
async function getNextQuestionnaireNumber(client: any, barangayId: number, year: number): Promise<number> {
  const formattedBarangayId = barangayId.toString().padStart(2, '0');
  const pattern = `${formattedBarangayId}-${year}-%`;
  
  const query = `
    SELECT survey_number 
    FROM survey_response 
    WHERE survey_number LIKE $1 
    ORDER BY survey_number DESC 
    LIMIT 1
  `;
  
  const result = await client.query(query, [pattern]);
  
  if (result.rows.length === 0) {
    return 1; // First questionnaire for this barangay/year
  }
  
  // Extract questionnaire number from format BB-YYYY-NNNN
  const lastSurveyNumber = result.rows[0].survey_number;
  const parts = lastSurveyNumber.split('-');
  const lastQuestionnaireNumber = parseInt(parts[2]) || 0;
  
  return lastQuestionnaireNumber + 1;
}

export async function POST(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { barangayId, responseCount, profile } = body;

    if (!barangayId || !responseCount || !profile) {
      return NextResponse.json(
        { error: "Missing required parameters: barangayId, responseCount, profile" },
        { status: 400 }
      );
    }

    // Debug: Check if barangay exists in database
    const barangayCheckQuery = 'SELECT barangay_id, barangay_name FROM barangay WHERE barangay_id = $1';
    const barangayCheckResult = await client.query(barangayCheckQuery, [parseInt(barangayId)]);
    
    console.log(`🔍 Barangay check for ID ${barangayId}:`, barangayCheckResult.rows);
    
    if (barangayCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Barangay with ID ${barangayId} not found in database` },
        { status: 404 }
      );
    }

    // Get starting questionnaire number
    const currentYear = new Date().getFullYear();
    const startingQuestionnaireNumber = await getNextQuestionnaireNumber(client, parseInt(barangayId), currentYear);
    
    console.log(`📋 Starting questionnaire number for Barangay ${barangayId} (${currentYear}): ${startingQuestionnaireNumber}`);

    const profileConfig = RESPONSE_PROFILES[profile as keyof typeof RESPONSE_PROFILES];
    if (!profileConfig) {
      return NextResponse.json(
        { error: `Invalid profile: ${profile}` },
        { status: 400 }
      );
    }

    console.log(`🛠️ Generating ${responseCount} mock responses for Barangay ${barangayId} using ${profileConfig.name} profile`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Generate responses
    for (let i = 0; i < responseCount; i++) {
      try {
        const questionnaireNumber = startingQuestionnaireNumber + i;
        
        // Determine assigned sections based on questionnaire number (odd/even logic)
        const assignedSections = getAssignedSections(questionnaireNumber);

        // Generate response data
        const responseData = generateResponseData(questionnaireNumber, assignedSections, profile, parseInt(barangayId));

        // Submit to database
        const submitResult = await submitSurveyResponse(client, barangayId, responseData);

        if (submitResult.success) {
          successCount++;
          results.push({
            surveyNumber: responseData.surveyNumber,
            status: 'success',
            sections: assignedSections.length
          });
        } else {
          errorCount++;
          results.push({
            surveyNumber: responseData.surveyNumber,
            status: 'error',
            error: submitResult.error
          });
        }

        // Progress logging
        if ((i + 1) % 10 === 0 || (i + 1) === responseCount) {
          console.log(`📊 Progress: ${i + 1}/${responseCount} responses generated (${successCount} success, ${errorCount} errors)`);
        }

      } catch (error) {
        errorCount++;
        const questionnaireNumber = startingQuestionnaireNumber + i;
        const currentYear = new Date().getFullYear();
        const formattedBarangayId = barangayId.toString().padStart(2, '0');
        const formattedQuestionnaireNumber = questionnaireNumber.toString().padStart(4, '0');
        const surveyNumber = `${formattedBarangayId}-${currentYear}-${formattedQuestionnaireNumber}`;
        
        console.error(`❌ Error generating response ${surveyNumber}:`, error);
        results.push({
          surveyNumber: surveyNumber,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Generation complete: ${successCount}/${responseCount} responses submitted successfully`);

    return NextResponse.json({
      success: true,
      barangayId,
      profile,
      totalRequested: responseCount,
      successCount,
      errorCount,
      results: results.slice(-10), // Last 10 results for UI
      summary: {
        profile: profileConfig.name,
        sectionsAssigned: getAssignedSections(1).length, // Sample assignment
        expectedQuadrants: getExpectedQuadrants(profile)
      }
    });

  } catch (error) {
    console.error('❌ Mock data generation failed:', error);
    return NextResponse.json(
      { error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Get assigned sections based on survey number (odd/even logic)
function getAssignedSections(surveyNumber: number): string[] {
  const num = parseInt(surveyNumber.toString());

  if (num % 2 === 1) {
    // Odd numbers: financial, safety, business
    return ['financial', 'safety', 'business'];
  } else {
    // Even numbers: disaster, social, environmental
    return ['disaster', 'social', 'environmental'];
  }
}

// Generate response data for a survey
function generateResponseData(surveyNumber: number, sections: string[], profile: string, barangayId: number) {
  // Create survey number in BB-YYYY-NNNN format
  const currentYear = new Date().getFullYear();
  const formattedBarangayId = barangayId.toString().padStart(2, '0');
  const formattedQuestionnaireNumber = surveyNumber.toString().padStart(4, '0');
  const surveyNumberFormatted = `${formattedBarangayId}-${currentYear}-${formattedQuestionnaireNumber}`;
  
  const responseData = {
    surveyNumber: surveyNumberFormatted,
    location: {
      lat: 10.3157 + (Math.random() - 0.5) * 0.01, // Random location near Cebu
      lng: 123.8854 + (Math.random() - 0.5) * 0.01,
      address: `Sample Location ${surveyNumber}`,
      accuracy: 10 + Math.random() * 20
    },
    selectedMember: `Respondent ${surveyNumber}`,
    interviewerId: 1, // Default interviewer
    barangayId: barangayId,
    respondentDemographics: generateDemographics(),
    sections: {} as { [key: string]: any }
  };

  // Generate section data
  sections.forEach(section => {
    responseData.sections[section] = generateSectionData(section, profile);
  });

  return responseData;
}

// Generate realistic demographics
function generateDemographics() {
  const genders = ['Male', 'Female'];
  const educations = ['Elementary', 'High School', 'College', 'Post Graduate'];
  const incomes = ['Below 10,000', '10,001-20,000', '20,001-50,000', 'Above 50,000'];

  return {
    age: 18 + Math.floor(Math.random() * 62), // 18-80 years old
    gender: genders[Math.floor(Math.random() * genders.length)],
    educationalAttainment: educations[Math.floor(Math.random() * educations.length)],
    householdIncome: incomes[Math.floor(Math.random() * incomes.length)]
  };
}

// Generate realistic section data that matches actual survey question formats
function generateSectionData(sectionName: string, profile: string) {
  const sectionData: { [key: string]: any } = {};

  // Get performance profile for this response
  let actualProfile = profile;
  if (profile === 'balanced') {
    const profiles = ['highPerformer', 'needsImprovement', 'growthPotential', 'stableLow'];
    const weights = [0.25, 0.25, 0.25, 0.25];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < profiles.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        actualProfile = profiles[i];
        break;
      }
    }
  }

  const profileRanges = SCORE_RANGES[actualProfile as keyof typeof SCORE_RANGES] || SCORE_RANGES.mixed;

  // Generate responses based on actual survey questions for each section
  switch (sectionName) {
    case 'financial':
      generateFinancialSectionData(sectionData, profileRanges, profile);
      break;
    case 'disaster':
      generateDisasterSectionData(sectionData, profileRanges, profile);
      break;
    case 'safety':
      generateSafetySectionData(sectionData, profileRanges, profile);
      break;
    case 'social':
      generateSocialSectionData(sectionData, profileRanges, profile);
      break;
    case 'business':
      generateBusinessSectionData(sectionData, profileRanges, profile);
      break;
    case 'environmental':
      generateEnvironmentalSectionData(sectionData, profileRanges, profile);
      break;
  }

  return { data: sectionData };
}

// Generate realistic responses for Financial Administration section
function generateFinancialSectionData(sectionData: { [key: string]: any }, profileRanges: any, profile: string) {
  const awarenessScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.awareness[0] + Math.random() * (profileRanges.awareness[1] - profileRanges.awareness[0]);

  const availmentScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.availment[0] + Math.random() * (profileRanges.availment[1] - profileRanges.availment[0]);

  const satisfactionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.satisfaction[0] + Math.random() * (profileRanges.satisfaction[1] - profileRanges.satisfaction[0]);

  const needActionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.needAction[0] + Math.random() * (profileRanges.needAction[1] - profileRanges.needAction[0]);

  // Part A: Barangay Projects
  sectionData['awarenessProjects'] = awarenessScore > 0.5 ? "Oo" : "Hindi";

  if (sectionData['awarenessProjects'] === "Oo") {
    sectionData['benefitedProjects'] = availmentScore > 0.5 ? "Oo" : "Hindi";

    if (sectionData['benefitedProjects'] === "Oo") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionProjects'] = satisfactionRating.toString();

      sectionData['suggestionsProjects'] = generateRealisticTextareaResponse('projects', needActionScore);
    }
  }

  // Part B: Financial Transparency
  sectionData['awarenessFinancial'] = awarenessScore > 0.6 ? "Oo" : "Hindi";

  if (sectionData['awarenessFinancial'] === "Oo") {
    sectionData['usedFinancialInfo'] = availmentScore > 0.6 ? "Oo" : "Hindi";

    if (sectionData['usedFinancialInfo'] === "Oo") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionFinancial'] = satisfactionRating.toString();

      sectionData['suggestionsFinancial'] = generateRealisticTextareaResponse('financial', needActionScore);
    }
  }

  // Part C: Social Programs
  sectionData['awarenessSocialPrograms'] = awarenessScore > 0.55 ? "Oo" : "Hindi";

  if (sectionData['awarenessSocialPrograms'] === "Oo") {
    sectionData['participatedSocialPrograms'] = availmentScore > 0.55 ? "Oo" : "Hindi";

    if (sectionData['participatedSocialPrograms'] === "Oo") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionSocialPrograms'] = satisfactionRating.toString();

      sectionData['suggestionsSocialPrograms'] = generateRealisticTextareaResponse('socialPrograms', needActionScore);
    }
  }

  // Part D: Corruption Perception
  sectionData['awarenessCorruption'] = awarenessScore > 0.7 ? "Oo (Yes)" : "Hindi (No)";

  if (sectionData['awarenessCorruption'] === "Oo (Yes)") {
    sectionData['experiencedCorruption'] = needActionScore > 0.6 ? "Oo (Yes)" : "Hindi (No)";

    if (sectionData['experiencedCorruption'] === "Oo (Yes)") {
      sectionData['detailsCorruption'] = "I witnessed officials taking bribes during permit processing.";
      sectionData['reportedCorruption'] = Math.random() > 0.7 ? "Oo (Yes)" : "Hindi (No)";

      if (sectionData['reportedCorruption'] === "Hindi (No)") {
        sectionData['reasonsNotReporting'] = ["Natakot akong magsumbong. (I feared for my safety)"];
      } else {
        sectionData['satisfactionReportResponse'] = "3";
      }

      sectionData['suggestionsCorruption'] = generateRealisticTextareaResponse('corruption', needActionScore);
    }
  }
}

// Generate realistic responses for Disaster Preparedness section
function generateDisasterSectionData(sectionData: { [key: string]: any }, profileRanges: any, profile: string) {
  const awarenessScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.awareness[0] + Math.random() * (profileRanges.awareness[1] - profileRanges.awareness[0]);

  const availmentScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.availment[0] + Math.random() * (profileRanges.availment[1] - profileRanges.availment[0]);

  const satisfactionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.satisfaction[0] + Math.random() * (profileRanges.satisfaction[1] - profileRanges.satisfaction[0]);

  // Part A: Disaster Information
  sectionData['awarenessDisasterInfo'] = awarenessScore > 0.5 ? "Yes" : "No";

  if (sectionData['awarenessDisasterInfo'] === "Yes") {
    sectionData['availmentDisasterInfo'] = availmentScore > 0.5 ? "Yes" : "No";

    if (sectionData['availmentDisasterInfo'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionDisasterInfo'] = satisfactionRating.toString();

      sectionData['suggestionsDisasterInfo'] = generateRealisticTextareaResponse('disasterInfo', satisfactionScore);
    }
  }

  // Part B: Evacuation Resources
  sectionData['awarenessEvacuation'] = awarenessScore > 0.6 ? "Yes" : "No";

  if (sectionData['awarenessEvacuation'] === "Yes") {
    sectionData['locationEvacuation'] = availmentScore > 0.6 ? "Yes" : "No";

    if (sectionData['locationEvacuation'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionEvacuation'] = satisfactionRating.toString();

      sectionData['suggestionsEvacuation'] = generateRealisticTextareaResponse('evacuation', satisfactionScore);
    }
  }
}

// Generate realistic responses for Safety & Peace Order section
function generateSafetySectionData(sectionData: { [key: string]: any }, profileRanges: any, profile: string) {
  const awarenessScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.awareness[0] + Math.random() * (profileRanges.awareness[1] - profileRanges.awareness[0]);

  const availmentScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.availment[0] + Math.random() * (profileRanges.availment[1] - profileRanges.availment[0]);

  const satisfactionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.satisfaction[0] + Math.random() * (profileRanges.satisfaction[1] - profileRanges.satisfaction[0]);

  // Part A: Barangay Tanods
  sectionData['awarenessTanods'] = awarenessScore > 0.5 ? "Yes" : "No";

  if (sectionData['awarenessTanods'] === "Yes") {
    sectionData['experienceTanods'] = availmentScore > 0.5 ? "Yes" : "No";

    if (sectionData['experienceTanods'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionTanods'] = satisfactionRating.toString();

      sectionData['suggestionsTanods'] = generateRealisticTextareaResponse('tanods', satisfactionScore);
    }
  }

  // Part B: Lupon (Dispute Resolution)
  sectionData['awarenessLupon'] = awarenessScore > 0.6 ? "Yes" : "No";

  if (sectionData['awarenessLupon'] === "Yes") {
    sectionData['experienceLupon'] = availmentScore > 0.6 ? "Yes" : "No";

    if (sectionData['experienceLupon'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionLupon'] = satisfactionRating.toString();

      sectionData['suggestionsLupon'] = generateRealisticTextareaResponse('lupon', satisfactionScore);
    }
  }

  // Part C: Anti-Drug Programs
  sectionData['awarenessAntiDrug'] = awarenessScore > 0.55 ? "Yes" : "No";

  if (sectionData['awarenessAntiDrug'] === "Yes") {
    sectionData['experienceAntiDrug'] = availmentScore > 0.55 ? "Yes" : "No";

    if (sectionData['experienceAntiDrug'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionAntiDrug'] = satisfactionRating.toString();

      sectionData['suggestionsAntiDrug'] = generateRealisticTextareaResponse('antiDrug', satisfactionScore);
    }
  }
}

// Generate realistic responses for Social Protection section
function generateSocialSectionData(sectionData: { [key: string]: any }, profileRanges: any, profile: string) {
  const awarenessScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.awareness[0] + Math.random() * (profileRanges.awareness[1] - profileRanges.awareness[0]);

  const availmentScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.availment[0] + Math.random() * (profileRanges.availment[1] - profileRanges.availment[0]);

  const satisfactionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.satisfaction[0] + Math.random() * (profileRanges.satisfaction[1] - profileRanges.satisfaction[0]);

  // Part A: Health Services
  sectionData['awarenessHealthServices'] = awarenessScore > 0.5 ? "Yes" : "No";

  if (sectionData['awarenessHealthServices'] === "Yes") {
    sectionData['availmentHealthServices'] = availmentScore > 0.5 ? "Yes" : "No";

    if (sectionData['availmentHealthServices'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionHealthServices'] = satisfactionRating.toString();

      sectionData['suggestionsHealthServices'] = generateRealisticTextareaResponse('health', satisfactionScore);
    }
  }

  // Part B: Women & Children Protection
  sectionData['awarenessWomenChildrenProtection'] = awarenessScore > 0.6 ? "Yes" : "No";

  if (sectionData['awarenessWomenChildrenProtection'] === "Yes") {
    sectionData['availmentWomenChildrenProtection'] = availmentScore > 0.6 ? "Yes" : "No";

    if (sectionData['availmentWomenChildrenProtection'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionWomenChildrenProtection'] = satisfactionRating.toString();

      sectionData['suggestionsWomenChildrenProtection'] = generateRealisticTextareaResponse('womenChildren', satisfactionScore);
    }
  }

  // Part C: Community Participation
  sectionData['awarenessCommunityParticipation'] = awarenessScore > 0.55 ? "Yes" : "No";

  if (sectionData['awarenessCommunityParticipation'] === "Yes") {
    sectionData['availmentCommunityParticipation'] = availmentScore > 0.55 ? "Yes" : "No";

    if (sectionData['availmentCommunityParticipation'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionCommunityParticipation'] = satisfactionRating.toString();

      sectionData['suggestionsCommunityParticipation'] = generateRealisticTextareaResponse('community', satisfactionScore);
    }
  }
}

// Generate realistic responses for Business Friendliness section
function generateBusinessSectionData(sectionData: { [key: string]: any }, profileRanges: any, profile: string) {
  const awarenessScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.awareness[0] + Math.random() * (profileRanges.awareness[1] - profileRanges.awareness[0]);

  const availmentScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.availment[0] + Math.random() * (profileRanges.availment[1] - profileRanges.availment[0]);

  const satisfactionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.satisfaction[0] + Math.random() * (profileRanges.satisfaction[1] - profileRanges.satisfaction[0]);

  // Business Clearance
  sectionData['awarenessBusinessClearance'] = awarenessScore > 0.5 ? "Yes" : "No";

  if (sectionData['awarenessBusinessClearance'] === "Yes") {
    sectionData['availmentBusinessClearance'] = availmentScore > 0.5 ? "Yes" : "No";

    if (sectionData['availmentBusinessClearance'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionBusinessClearance'] = satisfactionRating.toString();

      sectionData['suggestionsBusinessClearance'] = generateRealisticTextareaResponse('business', satisfactionScore);
    }
  }
}

// Generate realistic responses for Environmental Management section
function generateEnvironmentalSectionData(sectionData: { [key: string]: any }, profileRanges: any, profile: string) {
  const awarenessScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.awareness[0] + Math.random() * (profileRanges.awareness[1] - profileRanges.awareness[0]);

  const availmentScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.availment[0] + Math.random() * (profileRanges.availment[1] - profileRanges.availment[0]);

  const satisfactionScore = profile === 'mixed' || profile === 'extreme-mixed'
    ? Math.random()
    : profileRanges.satisfaction[0] + Math.random() * (profileRanges.satisfaction[1] - profileRanges.satisfaction[0]);

  // Waste Management
  sectionData['awarenessWasteManagement'] = awarenessScore > 0.5 ? "Yes" : "No";

  if (sectionData['awarenessWasteManagement'] === "Yes") {
    sectionData['availmentWasteManagement'] = availmentScore > 0.5 ? "Yes" : "No";

    if (sectionData['availmentWasteManagement'] === "Yes") {
      const satisfactionRating = Math.max(1, Math.min(5, Math.round(satisfactionScore * 5)));
      sectionData['satisfactionWasteManagement'] = satisfactionRating.toString();

      sectionData['suggestionsWasteManagement'] = generateRealisticTextareaResponse('waste', satisfactionScore);
    }
  }
}

// Generate realistic textarea responses
function generateRealisticTextareaResponse(type: string, score: number): string {
  const responses = {
    projects: [
      "We need better road quality and more frequent maintenance.",
      "The barangay hall needs renovation and more facilities.",
      "More street lighting and pedestrian walkways would be helpful.",
      "The drainage system needs improvement to prevent flooding."
    ],
    financial: [
      "Make the budget documents easier to understand for regular residents.",
      "Hold more frequent barangay assemblies to discuss spending.",
      "Provide digital access to financial reports online.",
      "Train more residents on how to read budget documents."
    ],
    socialPrograms: [
      "More financial assistance for senior citizens is needed.",
      "Expand the youth development programs and activities.",
      "Better coordination between different social services.",
      "More support for persons with disabilities."
    ],
    corruption: [
      "Implement stricter monitoring of official transactions.",
      "Create anonymous reporting channels for corruption.",
      "Regular audits of barangay financial transactions.",
      "Better training for officials on anti-corruption measures."
    ],
    disasterInfo: [
      "More frequent disaster preparedness drills are needed.",
      "Better distribution of hazard maps to all households.",
      "Improve early warning systems with louder sirens.",
      "More educational campaigns about disaster preparedness."
    ],
    evacuation: [
      "The evacuation center needs better facilities and supplies.",
      "Clearer signage to locate evacuation centers quickly.",
      "Better maintenance of emergency equipment.",
      "More training for evacuation center staff."
    ],
    tanods: [
      "Increase the number of barangay tanods on patrol.",
      "Better equipment and training for security personnel.",
      "More visible presence during night hours.",
      "Better coordination with police for emergency response."
    ],
    lupon: [
      "Faster resolution of disputes between residents.",
      "More training for lupon members on mediation skills.",
      "Better facilities for conducting mediation sessions.",
      "More promotion of the dispute resolution services."
    ],
    antiDrug: [
      "More information campaigns about drug prevention.",
      "Better rehabilitation programs for drug surrenderers.",
      "Increased patrols in high-risk areas.",
      "More community involvement in anti-drug efforts."
    ],
    health: [
      "Extend health center operating hours.",
      "More doctors and nurses assigned to the barangay.",
      "Better equipment and medical supplies.",
      "More health education programs for residents."
    ],
    womenChildren: [
      "More training for VAW desk personnel.",
      "Better facilities for counseling and support services.",
      "Increased awareness campaigns about women's rights.",
      "More support programs for abused women and children."
    ],
    community: [
      "Start a barangay community garden project.",
      "Create more recreational activities for youth.",
      "Establish a kasambahay desk for domestic workers.",
      "Organize regular community clean-up drives."
    ],
    business: [
      "Faster processing of business clearance applications.",
      "Reduce fees for small business owners.",
      "Online application system for clearances.",
      "More assistance for new business owners."
    ],
    waste: [
      "More frequent garbage collection schedules.",
      "Better enforcement of waste segregation rules.",
      "More recycling programs and facilities.",
      "Education campaigns on proper waste management."
    ]
  };

  const typeResponses = responses[type as keyof typeof responses] || responses.projects;
  return typeResponses[Math.floor(Math.random() * typeResponses.length)];
}

// Submit survey response to database
async function submitSurveyResponse(client: any, barangayId: number, responseData: any) {
  try {
    console.log(`📝 Submitting survey response for barangay_id: ${barangayId}, survey_number: ${responseData.surveyNumber}`);
    
    // Check if survey number already exists
    const duplicateCheck = await client.query(
      'SELECT survey_number FROM survey_response WHERE survey_number = $1',
      [responseData.surveyNumber]
    );
    
    if (duplicateCheck.rows.length > 0) {
      throw new Error(`Survey number ${responseData.surveyNumber} already exists`);
    }
    
    // Create the survey response record
    const insertQuery = `
      INSERT INTO survey_response (
        survey_number, barangay_id, interviewer_id, respondent_name,
        respondent_age, respondent_gender, respondent_educational_attainment,
        respondent_household_income, location_lat, location_lng,
        location_address, location_accuracy, location_timestamp,
        location_barangay, location_municipality, location_province,
        status, progress, completed_at, submitted_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW(), NOW())
      RETURNING response_id
    `;

    const responseResult = await client.query(insertQuery, [
      responseData.surveyNumber,
      barangayId,
      responseData.interviewerId,
      responseData.selectedMember,
      responseData.respondentDemographics.age,
      responseData.respondentDemographics.gender,
      responseData.respondentDemographics.educationalAttainment,
      responseData.respondentDemographics.householdIncome,
      responseData.location.lat,
      responseData.location.lng,
      responseData.location.address,
      responseData.location.accuracy,
      new Date(),
      'Sample Barangay',
      'Sample Municipality',
      'Cebu',
      'completed',
      100
    ]);

    const responseId = responseResult.rows[0].response_id;

    // Save survey sections data
    for (const [sectionKey, sectionData] of Object.entries(responseData.sections)) {
      const sectionInsertQuery = `
        INSERT INTO survey_section (
          response_id, section_key, section_name, status, data, started_at, completed_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
      `;

      // Map section keys to readable names
      const sectionNames: Record<string, string> = {
        financial: 'Financial Administration',
        disaster: 'Disaster Preparedness',
        safety: 'Safety & Peace Order',
        social: 'Social Protection',
        business: 'Business Friendliness',
        environmental: 'Environmental Management'
      };

      const sectionName = sectionNames[sectionKey] || sectionKey;

      await client.query(sectionInsertQuery, [
        responseId,
        sectionKey,
        sectionName,
        'completed',
        JSON.stringify((sectionData as any).data)
      ]);
    }

    // Update survey target progress (but cap at 100%)
    const targetQuery = 'SELECT * FROM survey_target WHERE barangay_id = $1 LIMIT 1';
    const targetResult = await client.query(targetQuery, [barangayId]);

    if (targetResult.rows.length > 0) {
      const surveyTarget = targetResult.rows[0];
      const newAchieved = (surveyTarget.achieved || 0) + 1;
      const newPercentage = Math.min(100, Math.round((newAchieved / surveyTarget.target) * 100));

      await client.query(
        'UPDATE survey_target SET achieved = $1, percentage = $2, updated_at = NOW() WHERE target_id = $3',
        [newAchieved, newPercentage, surveyTarget.target_id]
      );
    }

    return { success: true, responseId };

  } catch (error) {
    console.error('Error submitting survey response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get expected quadrants for a profile
function getExpectedQuadrants(profile: string) {
  switch (profile) {
    case 'high-performer':
      return ['MAINTAIN'];
    case 'needs-improvement':
      return ['FIX NOW'];
    case 'balanced':
      return ['MAINTAIN', 'OPPORTUNITIES', 'MONITOR', 'FIX NOW'];
    case 'mixed':
    case 'extreme-mixed':
      return ['MONITOR', 'OPPORTUNITIES']; // Mixed signals
    default:
      return ['MONITOR'];
  }
}