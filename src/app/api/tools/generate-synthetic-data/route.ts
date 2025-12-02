import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import { formatQuestionnaireId } from '@/utils/questionnaireIdParser';
import { getSectionOrder } from '@/app/survey/forms/utils/sectionAssignment';
import { calculateDisplayId } from '@/utils/displayIdCalculator';

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
    awarenessRange: [0.60, 0.80],      // 60-80% awareness (good awareness)
    availmentRange: [0.50, 0.70],      // 50-70% availment (moderate usage)
    satisfactionRange: [0.55, 0.75],   // 55-75% satisfaction (~3-4 stars)
    needActionRange: [0.30, 0.50]      // 30-50% need action (moderate improvements needed)
  },
  'high-performer': {
    name: 'High Performer (MAINTAIN)',
    awarenessRange: [0.80, 0.95],      // 80-95% awareness (excellent awareness)
    availmentRange: [0.70, 0.90],      // 70-90% availment (high usage)
    satisfactionRange: [0.75, 0.90],   // 75-90% satisfaction (~4-5 stars)
    needActionRange: [0.10, 0.25]      // 10-25% need action (minimal improvements)
  },
  'needs-improvement': {
    name: 'Needs Improvement (FIX NOW)',
    awarenessRange: [0.30, 0.50],      // 30-50% awareness (low awareness)
    availmentRange: [0.15, 0.35],      // 15-35% availment (low usage)
    satisfactionRange: [0.25, 0.45],   // 25-45% satisfaction (~1-2 stars)
    needActionRange: [0.65, 0.85]      // 65-85% need action (high urgency)
  },
  'mixed': {
    name: 'Mixed Responses (Realistic)',
    awarenessRange: [0.40, 0.85],      // 40-85% awareness (wide variation)
    availmentRange: [0.30, 0.75],      // 30-75% availment (wide variation)
    satisfactionRange: [0.35, 0.80],   // 35-80% satisfaction (~2-4 stars)
    needActionRange: [0.20, 0.70]      // 20-70% need action (varied urgency)
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

    if (numberOfSpots < 1 || numberOfSpots > 50) {
      return NextResponse.json(
        { error: "numberOfSpots must be between 1 and 50" },
        { status: 400 }
      );
    }

    if (questionnairesPerSpot < 1 || questionnairesPerSpot > 50) {
      return NextResponse.json(
        { error: "questionnairesPerSpot must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Validate total questionnaires (spots × questionnaires per spot)
    const requestedTotal = numberOfSpots * questionnairesPerSpot;
    if (requestedTotal > 500) {
      return NextResponse.json(
        { error: `Total questionnaires (${requestedTotal}) exceeds maximum of 500. Reduce numberOfSpots or questionnairesPerSpot.` },
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

      if (spotResult.success && spotResult.spot) {
        spotsCreated.push(spotResult.spot);
        totalQuestionnaires += spotResult.questionnairesGenerated || 0;
        totalResponses += spotResult.responsesGenerated || 0;
      }
    }

    console.log(`✅ Synthetic data generation complete!`);
    console.log(`   Spots: ${spotsCreated.length}`);
    console.log(`   Questionnaires: ${totalQuestionnaires}`);
    console.log(`   Responses: ${totalResponses}`);

    // Update survey_target table with the new response count
    console.log(`📊 Updating survey target for barangay ${barangayId}...`);
    
    // Get current target
    const { data: targetData } = await supabaseAdmin
      .from('survey_target')
      .select('target, achieved')
      .eq('barangay_id', barangayId)
      .eq('survey_cycle_id', cycleId)
      .single();

    if (targetData) {
      const newAchieved = (targetData.achieved || 0) + totalResponses;
      const newPercentage = Math.round((newAchieved / targetData.target) * 100);

      const { error: updateError } = await supabaseAdmin
        .from('survey_target')
        .update({
          achieved: newAchieved,
          percentage: newPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('barangay_id', barangayId)
        .eq('survey_cycle_id', cycleId);

      if (updateError) {
        console.error('❌ Failed to update survey target:', updateError);
      } else {
        console.log(`✅ Updated survey target: ${newAchieved}/${targetData.target} (${newPercentage}%)`);
      }
    }

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
        random_start: Math.floor(Math.random() * 5) + 1,  // Random start between 1-5
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
          visit_count: 1
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
    
    // Map gender to match database enum
    let genderValue = demographics.gender;
    if (genderValue === "LGBTQI+") {
      genderValue = "LGBTQI";
    }

    // Calculate display_id from full_id for CSIS algorithms
    const displayId = calculateDisplayId(questionnaireId);
    
    // Fallback: if display_id is null or out of range, use passed questionnaireNumber
    let questionnaireNumberForCSIS: number;
    if (displayId === null || displayId < 1 || displayId > 150) {
      console.warn(`⚠️ Display ID is ${displayId === null ? 'null' : 'out of range'} for ${questionnaireId}, using fallback questionnaire_number: ${questionnaireNumber}`);
      questionnaireNumberForCSIS = questionnaireNumber;
    } else {
      questionnaireNumberForCSIS = displayId;
      console.log(`✅ Using display_id ${displayId} for CSIS Section Order Randomization in synthetic data`);
    }

    // Get randomized section order using CSIS methodology
    const sections = getSectionOrder(questionnaireNumberForCSIS);

    // Generate section data for the 6 service areas
    const sectionData: any = {};
    sections.forEach(section => {
      sectionData[section] = generateSectionData(section, profileConfig);
    });

    // Add overall satisfaction section (after all service areas)
    sectionData['overall'] = {
      overallSatisfaction: `${Math.max(1, Math.min(5, Math.round(
        (profileConfig.satisfactionRange[0] + 
         Math.random() * (profileConfig.satisfactionRange[1] - profileConfig.satisfactionRange[0])) * 5
      )))} - ${['Very Dissatisfied / Lubos na Hindi Nasiyahan', 'Dissatisfied / Hindi Nasiyahan', 'Neutral / Neither Satisfied nor Dissatisfied', 'Satisfied / Nasiyahan', 'Very Satisfied / Lubos na Nasiyahan'][Math.max(1, Math.min(5, Math.round(
        (profileConfig.satisfactionRange[0] + 
         Math.random() * (profileConfig.satisfactionRange[1] - profileConfig.satisfactionRange[0])) * 5
      ))) - 1]}`,
      overallNeedForAction: (profileConfig.needActionRange[0] + 
        Math.random() * (profileConfig.needActionRange[1] - profileConfig.needActionRange[0])) > 0.5 ? 'Yes / Oo' : 'No / Hindi'
    };

    // Insert survey response
    const { data: response, error: responseError } = await supabaseAdmin
      .from('survey_response')
      .insert({
        survey_number: questionnaireId,
        barangay_id: barangayId,
        survey_cycle_id: cycleId,  // Link to cycle for proper deletion
        interviewer_id: 3,  // Default test interviewer
        respondent_name: `Test Respondent ${questionnaireNumber}`,
        respondent_age: demographics.age,
        respondent_gender: genderValue,
        respondent_educational_attainment: demographics.education,
        respondent_household_income: demographics.income,
        respondent_purok: demographics.purok,
        location_lat: gpsLocation.lat,
        location_lng: gpsLocation.lng,
        location_accuracy: 10 + Math.random() * 20,
        location_timestamp: new Date(),
        status: 'completed',
        progress: 100,
        started_at: new Date(),
        completed_at: new Date(),
        submitted_at: new Date()
      })
      .select()
      .single();

    if (responseError || !response) {
      console.error(`❌ Failed to create response for ${questionnaireId}:`, responseError);
      return false;
    }

    // Create respondent_demographics section data
    const demographicsSection = {
      age: demographics.age,
      birthdate: demographics.birthdate,
      sex: demographics.sex,
      genderIdentity: demographics.genderIdentity,
      educationalAttainment: demographics.education,
      householdIncome: demographics.income,
      purok: demographics.purok
    };

    // Insert survey sections with the generated data (respondent_demographics + 6 service areas + overall)
    const allSections = ['respondent_demographics', ...sections, 'overall'];
    const sectionInserts = allSections.map((sectionName, index) => {
      let sectionAnswers;
      if (sectionName === 'respondent_demographics') {
        sectionAnswers = demographicsSection;
      } else {
        sectionAnswers = sectionData[sectionName];
      }
      
      return {
        response_id: response.response_id,
        section_name: sectionName === 'respondent_demographics' ? 'Respondent Demographics' : sectionName,
        section_key: sectionName.toLowerCase(),
        status: 'completed',
        data: sectionAnswers,  // Store all answers in JSONB data column
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
    });

    const { error: sectionsError } = await supabaseAdmin
      .from('survey_section')
      .insert(sectionInserts);

    if (sectionsError) {
      console.error(`❌ Failed to create sections for ${questionnaireId}:`, sectionsError);
      // Rollback: delete the response
      await supabaseAdmin
        .from('survey_response')
        .delete()
        .eq('response_id', response.response_id);
      return false;
    }

    console.log(`✅ Created response and ${allSections.length} sections (including demographics) for ${questionnaireId}`);
    return true;

  } catch (error) {
    console.error(`❌ Error generating response for ${questionnaireId}:`, error);
    return false;
  }
}

function generateDemographics(questionnaireNumber: number) {
  // Generate varied demographics
  const sexOptions = ['Male', 'Female'];
  const genderOptions = ['Male', 'Female', 'LGBTQI+'];
  const educations = ['Elementary', 'High School', 'College', 'Post Graduate'];
  const incomes = ['Below 10,000', '10,001-20,000', '20,001-50,000', 'Above 50,000'];
  const puroks = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];
  
  // Use questionnaire number for some variation
  const sex = sexOptions[questionnaireNumber % 2];
  const genderIdentity = genderOptions[questionnaireNumber % genderOptions.length];
  const age = 18 + Math.floor(Math.random() * 62); // 18-79 years old
  
  // Generate birthdate based on age
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1; // Use 28 to avoid invalid dates
  const birthdate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
  
  return {
    age,
    birthdate,
    sex,
    genderIdentity,
    gender: genderIdentity, // For backward compatibility
    education: educations[Math.floor(Math.random() * educations.length)],
    income: incomes[Math.floor(Math.random() * incomes.length)],
    purok: puroks[Math.floor(Math.random() * puroks.length)]
  };
}

function generateSectionData(sectionName: string, profileConfig: any) {
  // Get the question structure for this section
  const sectionQuestions = getSectionQuestionStructure(sectionName);
  const sectionData: any = {};
  
  // Generate responses for each part in the section
  sectionQuestions.forEach(part => {
    // Generate awareness response - use random value against the probability range
    const awarenessProb = profileConfig.awarenessRange[0] + 
      Math.random() * (profileConfig.awarenessRange[1] - profileConfig.awarenessRange[0]);
    const isAware = Math.random() < awarenessProb; // Compare random value to probability
    sectionData[part.awarenessId] = isAware ? part.yesValue : part.noValue;
    
    // If not aware, skip the rest of this part
    if (!isAware) return;
    
    // Generate availment/usage response
    const availmentProb = profileConfig.availmentRange[0] + 
      Math.random() * (profileConfig.availmentRange[1] - profileConfig.availmentRange[0]);
    const hasAvailed = Math.random() < availmentProb; // Compare random value to probability
    sectionData[part.availmentId] = hasAvailed ? part.yesValue : part.noValue;
    
    // If hasn't availed, skip satisfaction and NFA
    if (!hasAvailed) return;
    
    // Generate satisfaction response (1-5 scale)
    const satisfactionProb = profileConfig.satisfactionRange[0] + 
      Math.random() * (profileConfig.satisfactionRange[1] - profileConfig.satisfactionRange[0]);
    sectionData[part.satisfactionId] = Math.max(1, Math.min(5, Math.round(satisfactionProb * 5))).toString();
    
    // Generate need for action response
    const needActionProb = profileConfig.needActionRange[0] + 
      Math.random() * (profileConfig.needActionRange[1] - profileConfig.needActionRange[0]);
    const needsAction = Math.random() < needActionProb; // Compare random value to probability
    sectionData[part.nfaId] = needsAction ? part.yesValue : part.noValue;
    
    // Generate suggestion if needs action
    if (needsAction && part.suggestionId) {
      sectionData[part.suggestionId] = generateSuggestion(sectionName, needActionProb);
    }
  });
  
  return sectionData;
}

function getSectionQuestionStructure(sectionName: string) {
  // Define the question structure for each section based on the actual survey
  const structures: Record<string, any[]> = {
    financial: [
      { awarenessId: 'awarenessProjects', availmentId: 'benefitedProjects', satisfactionId: 'satisfactionProjects', nfaId: 'nfaBinaryProjects', suggestionId: 'suggestionsProjects', yesValue: 'Oo', noValue: 'Hindi' },
      { awarenessId: 'awarenessFinancial', availmentId: 'usedFinancialInfo', satisfactionId: 'satisfactionFinancial', nfaId: 'nfaBinaryFinancial', suggestionId: 'suggestionsFinancial', yesValue: 'Oo', noValue: 'Hindi' },
      { awarenessId: 'awarenessSocialPrograms', availmentId: 'benefitedSocialPrograms', satisfactionId: 'satisfactionSocialPrograms', nfaId: 'nfaBinarySocialPrograms', suggestionId: 'suggestionsSocialPrograms', yesValue: 'Oo', noValue: 'Hindi' },
      { awarenessId: 'awarenessCorruption', availmentId: 'reportedCorruption', satisfactionId: 'satisfactionCorruption', nfaId: 'nfaBinaryCorruption', suggestionId: 'suggestionsCorruption', yesValue: 'Oo (Yes)', noValue: 'Hindi (No)' }
    ],
    disaster: [
      { awarenessId: 'awarenessDisasterInfo', availmentId: 'receivedDisasterInfo', satisfactionId: 'satisfactionDisasterInfo', nfaId: 'nfaBinaryDisasterInfo', suggestionId: 'suggestionsDisasterInfo', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessEvacuation', availmentId: 'usedEvacuation', satisfactionId: 'satisfactionEvacuation', nfaId: 'nfaBinaryEvacuation', suggestionId: 'suggestionsEvacuation', yesValue: 'Yes', noValue: 'No' }
    ],
    safety: [
      { awarenessId: 'awarenessTanods', availmentId: 'experiencedTanods', satisfactionId: 'satisfactionTanods', nfaId: 'nfaBinaryTanods', suggestionId: 'suggestionsTanods', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessLupon', availmentId: 'usedLupon', satisfactionId: 'satisfactionLupon', nfaId: 'nfaBinaryLupon', suggestionId: 'suggestionsLupon', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessAntiDrug', availmentId: 'participatedAntiDrug', satisfactionId: 'satisfactionAntiDrug', nfaId: 'nfaBinaryAntiDrug', suggestionId: 'suggestionsAntiDrug', yesValue: 'Yes', noValue: 'No' }
    ],
    social: [
      { awarenessId: 'awarenessHealthServices', availmentId: 'usedHealthServices', satisfactionId: 'satisfactionHealthServices', nfaId: 'nfaBinaryHealthServices', suggestionId: 'suggestionsHealthServices', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessWomenChildrenProtection', availmentId: 'accessedWomenChildrenProtection', satisfactionId: 'satisfactionWomenChildrenProtection', nfaId: 'nfaBinaryWomenChildrenProtection', suggestionId: 'suggestionsWomenChildrenProtection', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessCommunityParticipation', availmentId: 'participatedCommunity', satisfactionId: 'satisfactionCommunityParticipation', nfaId: 'nfaBinaryCommunityParticipation', suggestionId: 'suggestionsCommunityParticipation', yesValue: 'Yes', noValue: 'No' }
    ],
    business: [
      { awarenessId: 'awarenessBusinessClearance', availmentId: 'obtainedBusinessClearance', satisfactionId: 'satisfactionBusinessClearance', nfaId: 'nfaBinaryBusinessClearance', suggestionId: 'suggestionsBusinessClearance', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessBusinessSupport', availmentId: 'receivedBusinessSupport', satisfactionId: 'satisfactionBusinessSupport', nfaId: 'nfaBinaryBusinessSupport', suggestionId: 'suggestionsBusinessSupport', yesValue: 'Yes', noValue: 'No' }
    ],
    environmental: [
      { awarenessId: 'awarenessWasteManagement', availmentId: 'usedWasteManagement', satisfactionId: 'satisfactionWasteManagement', nfaId: 'nfaBinaryWasteManagement', suggestionId: 'suggestionsWasteManagement', yesValue: 'Yes', noValue: 'No' },
      { awarenessId: 'awarenessEnvironmentalPrograms', availmentId: 'participatedEnvironmentalPrograms', satisfactionId: 'satisfactionEnvironmentalPrograms', nfaId: 'nfaBinaryEnvironmentalPrograms', suggestionId: 'suggestionsEnvironmentalPrograms', yesValue: 'Yes', noValue: 'No' }
    ]
  };
  
  return structures[sectionName] || [];
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
