import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import { formatQuestionnaireId } from '@/utils/questionnaireIdParser';
import { getSectionOrder } from '@/app/survey/forms/utils/sectionAssignment';

/**
 * Generate Synthetic Survey Data
 * 
 * Creates realistic test data following the spot-based survey system:
 * - Creates spots in specified barangay
 * - Generates questionnaires with YYYY-BB-SS-QQQ format
 * - Creates survey responses with CSIS-compliant randomization
 * - Includes GPS verification and visit history
 */

// Response profiles for different testing scenarios
const RESPONSE_PROFILES = {
  'balanced': {
    name: 'Balanced (All Quadrants)',
    awarenessRange: [0.5, 0.9],
    availmentRange: [0.4, 0.8],
    satisfactionRange: [0.5, 0.9],
    needActionRange: [0.2, 0.6]
  },
  'high-performer': {
    name: 'High Performer (MAINTAIN)',
    awarenessRange: [0.85, 0.95],
    availmentRange: [0.85, 0.95],
    satisfactionRange: [0.80, 0.90],
    needActionRange: [0.05, 0.15]
  },
  'needs-improvement': {
    name: 'Needs Improvement (FIX NOW)',
    awarenessRange: [0.40, 0.60],
    availmentRange: [0.20, 0.40],
    satisfactionRange: [0.20, 0.40],
    needActionRange: [0.70, 0.85]
  },
  'mixed': {
    name: 'Mixed Responses (Realistic)',
    awarenessRange: [0.3, 0.95],
    availmentRange: [0.2, 0.9],
    satisfactionRange: [0.3, 0.95],
    needActionRange: [0.1, 0.8]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      barangayId, 
      cycleId, 
      numberOfSpots = 1, 
      questionnairesPerSpot = 5,
      profile = 'balanced'
    } = body;

    // Validation
    if (!barangayId || !cycleId) {
      return NextResponse.json(
        { error: "Missing required parameters: barangayId, cycleId" },
        { status: 400 }
      );
    }

    if (numberOfSpots < 1 || numberOfSpots > 10) {
      return NextResponse.json(
        { error: "numberOfSpots must be between 1 and 10" },
        { status: 400 }
      );
    }

    if (questionnairesPerSpot < 1 || questionnairesPerSpot > 10) {
      return NextResponse.json(
        { error: "questionnairesPerSpot must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Verify barangay exists
    const { data: barangay, error: barangayError } = await supabaseAdmin
      .from('barangay')
      .select('barangay_id, barangay_name')
      .eq('barangay_id', barangayId)
      .single();

    if (barangayError || !barangay) {
      return NextResponse.json(
        { error: `Barangay with ID ${barangayId} not found` },
        { status: 404 }
      );
    }

    // Verify cycle exists
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id, year')
      .eq('cycle_id', cycleId)
      .single();

    if (cycleError || !cycle) {
      return NextResponse.json(
        { error: `Survey cycle with ID ${cycleId} not found` },
        { status: 404 }
      );
    }

    console.log(`🎯 Generating synthetic data for ${barangay.barangay_name} (Cycle: ${cycle.year})`);
    console.log(`📊 Configuration: ${numberOfSpots} spots × ${questionnairesPerSpot} questionnaires = ${numberOfSpots * questionnairesPerSpot} total`);

    const spotsCreated = [];
    let totalQuestionnaires = 0;
    let totalResponses = 0;

    // Create spots
    for (let spotNum = 1; spotNum <= numberOfSpots; spotNum++) {
      const spotResult = await createSpotWithData(
        barangayId,
        cycleId,
        cycle.year,
        spotNum,
        questionnairesPerSpot,
        profile,
        barangay.barangay_name
      );

      if (spotResult.success) {
        spotsCreated.push(spotResult.spot);
        totalQuestionnaires += spotResult.questionnairesGenerated;
        totalResponses += spotResult.responsesGenerated;
      }
    }

    console.log(`✅ Synthetic data generation complete!`);
    console.log(`   Spots: ${spotsCreated.length}`);
    console.log(`   Questionnaires: ${totalQuestionnaires}`);
    console.log(`   Responses: ${totalResponses}`);

    return NextResponse.json({
      success: true,
      barangayId,
      barangayName: barangay.barangay_name,
      cycleId,
      cycleYear: cycle.year,
      profile,
      spotsCreated: spotsCreated.length,
      questionnairesGenerated: totalQuestionnaires,
      responsesGenerated: totalResponses,
      spots: spotsCreated
    });

  } catch (error) {
    console.error('❌ Synthetic data generation failed:', error);
    return NextResponse.json(
      { error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function createSpotWithData(
  barangayId: number,
  cycleId: number,
  year: string,
  spotNumber: number,
  questionnairesPerSpot: number,
  profile: string,
  barangayName: string
) {
  try {
    // Get a Field Interviewer to assign the spot to
    const { data: interviewers } = await supabaseAdmin
      .from('user')
      .select('id, firstName, lastName')
      .eq('role', 'interviewer')
      .limit(1);

    const assignedFiId = interviewers && interviewers.length > 0 ? interviewers[0].id : null;

    // Generate realistic spot location (Philippines coordinates)
    const baseLocation = {
      lat: 7.0 + Math.random() * 3,  // 7-10°N (Mindanao region)
      lng: 123.0 + Math.random() * 3  // 123-126°E
    };

    const spotName = `${barangayName} Test Spot ${spotNumber}`;

    // Create spot with assigned FI
    const { data: spot, error: spotError } = await supabaseAdmin
      .from('spots')
      .insert({
        cycle_id: cycleId,
        barangay_id: barangayId,
        spot_name: spotName,
        starting_point: baseLocation,
        random_start: Math.floor(Math.random() * 999) + 1,
        assigned_fi_id: assignedFiId,  // Auto-assign to FI
        status: 'Completed'  // Mark as completed since we're generating responses
      })
      .select()
      .single();

    if (spotError || !spot) {
      console.error(`❌ Failed to create spot ${spotNumber}:`, spotError);
      return { success: false };
    }

    const assignmentInfo = assignedFiId 
      ? ` (Assigned to FI ID: ${assignedFiId})`
      : ' (Unassigned)';
    console.log(`📍 Created spot: ${spotName} (ID: ${spot.spot_id})${assignmentInfo}`);

    // Create questionnaires and responses
    const questionnaires = [];
    let responsesGenerated = 0;

    for (let qNum = 1; qNum <= questionnairesPerSpot; qNum++) {
      const questionnaireId = formatQuestionnaireId(
        parseInt(year),
        barangayId,
        spotNumber,
        qNum
      );

      // Create questionnaire
      const { error: qError } = await supabaseAdmin
        .from('questionnaires')
        .insert({
          questionnaire_id: questionnaireId,
          spot_id: spot.spot_id,
          cycle_id: cycleId,
          sequence_number: qNum,
          status: 'Completed',
          visit_count: 1,
          completed_at: new Date().toISOString()
        });

      if (qError) {
        console.error(`❌ Failed to create questionnaire ${questionnaireId}:`, qError);
        continue;
      }

      questionnaires.push(questionnaireId);

      // Generate survey response
      const responseCreated = await generateSurveyResponse(
        questionnaireId,
        qNum,
        cycleId,
        barangayId,
        spot.spot_id,
        baseLocation,
        profile
      );

      if (responseCreated) {
        responsesGenerated++;
      }
    }

    return {
      success: true,
      spot: {
        spotId: spot.spot_id,
        spotName: spot.spot_name,
        questionnaires
      },
      questionnairesGenerated: questionnaires.length,
      responsesGenerated
    };

  } catch (error) {
    console.error(`❌ Error creating spot ${spotNumber}:`, error);
    return { success: false };
  }
}

async function generateSurveyResponse(
  questionnaireId: string,
  questionnaireNumber: number,
  cycleId: number,
  barangayId: number,
  spotId: number,
  spotLocation: { lat: number; lng: number },
  profile: string
) {
  try {
    const profileConfig = RESPONSE_PROFILES[profile as keyof typeof RESPONSE_PROFILES] || RESPONSE_PROFILES.balanced;

    // Generate respondent demographics
    const demographics = generateDemographics(questionnaireNumber);

    // Generate GPS location near spot (within ~200m)
    const gpsLocation = {
      lat: spotLocation.lat + (Math.random() - 0.5) * 0.002,
      lng: spotLocation.lng + (Math.random() - 0.5) * 0.002
    };

    // Get randomized section order using CSIS methodology
    const sections = getSectionOrder(questionnaireNumber);

    // Generate section data
    const sectionData: any = {};
    sections.forEach(section => {
      sectionData[section] = generateSectionData(section, profileConfig);
    });

    // Insert survey response
    const { error: responseError } = await supabaseAdmin
      .from('survey_response')
      .insert({
        survey_number: questionnaireId,
        barangay_id: barangayId,
        interviewer_id: 3,  // Default test interviewer
        respondent_name: `Test Respondent ${questionnaireNumber}`,
        respondent_age: demographics.age,
        respondent_gender: demographics.gender,
        location_lat: gpsLocation.lat,
        location_lng: gpsLocation.lng,
        location_accuracy: 10 + Math.random() * 20,
        location_timestamp: new Date(),
        status: 'completed',
        progress: 100,
        started_at: new Date(),
        completed_at: new Date(),
        submitted_at: new Date()
      });

    if (responseError) {
      console.error(`❌ Failed to create response for ${questionnaireId}:`, responseError);
      return false;
    }

    return true;

  } catch (error) {
    console.error(`❌ Error generating response for ${questionnaireId}:`, error);
    return false;
  }
}

function generateDemographics(questionnaireNumber: number) {
  // Odd = Male, Even = Female
  const gender = questionnaireNumber % 2 === 1 ? 'Male' : 'Female';
  
  const educations = ['Elementary', 'High School', 'College', 'Post Graduate'];
  const incomes = ['Below 10,000', '10,001-20,000', '20,001-50,000', 'Above 50,000'];
  
  return {
    age: 18 + Math.floor(Math.random() * 62),
    gender,
    education: educations[Math.floor(Math.random() * educations.length)],
    income: incomes[Math.floor(Math.random() * incomes.length)]
  };
}

function generateSectionData(sectionName: string, profileConfig: any) {
  const awareness = profileConfig.awarenessRange[0] + 
    Math.random() * (profileConfig.awarenessRange[1] - profileConfig.awarenessRange[0]);
  
  const availment = profileConfig.availmentRange[0] + 
    Math.random() * (profileConfig.availmentRange[1] - profileConfig.availmentRange[0]);
  
  const satisfaction = profileConfig.satisfactionRange[0] + 
    Math.random() * (profileConfig.satisfactionRange[1] - profileConfig.satisfactionRange[0]);
  
  const needAction = profileConfig.needActionRange[0] + 
    Math.random() * (profileConfig.needActionRange[1] - profileConfig.needActionRange[0]);

  return {
    awareness: awareness > 0.5 ? 'Yes' : 'No',
    availment: availment > 0.5 ? 'Yes' : 'No',
    satisfaction: Math.max(1, Math.min(5, Math.round(satisfaction * 5))),
    needAction: needAction > 0.5 ? 'Yes' : 'No',
    suggestions: generateSuggestion(sectionName, needAction)
  };
}

function generateSuggestion(sectionName: string, needActionScore: number): string {
  if (needActionScore < 0.3) return '';
  
  const suggestions: Record<string, string[]> = {
    financial: [
      'More transparent budget reporting needed',
      'Improve project implementation timeline',
      'Better communication of financial information'
    ],
    disaster: [
      'More evacuation drills needed',
      'Improve early warning systems',
      'Better disaster preparedness training'
    ],
    safety: [
      'More tanod patrols at night',
      'Improve street lighting',
      'Faster response to incidents'
    ],
    social: [
      'More health programs for seniors',
      'Improve access to social services',
      'Better support for vulnerable groups'
    ],
    business: [
      'Simplify permit processing',
      'More support for small businesses',
      'Improve business registration process'
    ],
    environmental: [
      'Better waste management',
      'More tree planting activities',
      'Improve drainage systems'
    ]
  };

  const sectionSuggestions = suggestions[sectionName] || ['General improvement needed'];
  return sectionSuggestions[Math.floor(Math.random() * sectionSuggestions.length)];
}
