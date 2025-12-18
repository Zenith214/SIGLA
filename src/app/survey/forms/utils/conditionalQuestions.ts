/**
 * Conditional Questions Utility
 * 
 * This module handles the logic for the two new conditional question modules:
 * 1. Unawareness Reason Module - triggered when awareness = "No"
 * 2. Non-Availment Reason Module - triggered when awareness = "Yes" but availment = "No"
 */

import type { Question } from "@/types/survey";

/**
 * Unawareness reason options with translations
 */
export const UNAWARENESS_REASON_OPTIONS = {
  english: [
    "I get my info from other sources (e.g., neighbors, social media), not directly from the barangay.",
    "The barangay doesn't do enough to announce or promote their programs.",
    "It's not a service I was actively looking for, so I might have missed the information.",
    "Even if information is posted, it's hard to find or understand.",
    "Other Reason"
  ],
  filipino: [
    "Nakukuha ko ang aking impormasyon mula sa ibang paraan (hal., mga kapitbahay, social media), hindi direkta mula sa barangay.",
    "Kulang ang ginagawa ng barangay para i-anunsyo o i-promote ang kanilang mga programa.",
    "Hindi ito serbisyong aktibo kong hinahanap, kaya maaaring nalampasan ko ang impormasyon.",
    "Kahit na naka-paskil ang impormasyon, mahirap itong hanapin o intindihin.",
    "Iba pang dahilan"
  ],
  bisaya: [
    "Gakuha ko sa akong impormasyon gikan sa laing mga tinubdan (sama sa mga silingan, social media), dili direkta gikan sa barangay.",
    "Kulang ang gihimo sa barangay aron ipahibalo o i-promote ang ilang mga programa.",
    "Dili kini serbisyo nga aktibo nakong gipangita, mao nga tingali wala nako makita ang impormasyon.",
    "Bisan kung gipaskil ang impormasyon, lisud kini pangitaon o sabton.",
    "Laing rason"
  ]
};

/**
 * Text field labels for "Other reason"
 */
export const OTHER_REASON_LABELS = {
  english: "Please specify:",
  filipino: "Pakisabi:",
  bisaya: "Palihug isulti:"
};

/**
 * Non-availment reason options with translations
 */
export const NON_AVAILMENT_REASON_OPTIONS = {
  english: [
    "I/We did not need the service during that time.",
    "The process seemed too difficult, complicated, or took too much time.",
    "The location was too far, hard to get to, or the service hours were inconvenient.",
    "I was concerned about the cost, fees, or other expenses involved.",
    "I was not confident in the quality of the service or the staff providing it.",
    "I thought I was not qualified, or I was told I was not eligible.",
    "Other Reason"
  ],
  filipino: [
    "Hindi ko/namin kailangan ang serbisyo sa mga panahong iyon.",
    "Ang proseso ay tila napakahirap, kumplikado, o masyadong matagal.",
    "Masyadong malayo ang lokasyon, mahirap puntahan, o hindi angkop ang oras ng serbisyo.",
    "Nag-aalala ako sa gastos, bayarin, o iba pang gastusin na kasama dito.",
    "Wala akong tiwala sa kalidad ng serbisyo o sa mga tauhan na nagbibigay nito.",
    "Inakala kong hindi ako kwalipikado, o sinabihan akong hindi ako pwede.",
    "Iba pang dahilan"
  ],
  bisaya: [
    "Wala nako/namo kinahanglana ang serbisyo niadtong panahona.",
    "Ang proseso morag lisud kaayo, komplikado, o dugay kaayo.",
    "Layo kaayo ang lokasyon, lisud adtoon, o dili kombenyente ang oras sa serbisyo.",
    "Nabalaka ko sa gasto, bayronon, o uban pang mga galastuhan.",
    "Wala koy pagsalig sa kalidad sa serbisyo o sa mga kawani nga naghatag niini.",
    "Abi nako dili ko kwalipikado, o giingnan ko nga dili ko pwede.",
    "Laing rason"
  ]
};

/**
 * Get unawareness reason question text with translations
 */
export function getUnawarenessQuestionText(language: 'english' | 'filipino' | 'bisaya' = 'english'): string {
  const texts = {
    english: "There are many reasons why a resident might not hear about a service. From this list, what do you think is the main reason you were not aware of this one?",
    filipino: "Maraming dahilan kung bakit hindi nababalitaan ng isang residente ang isang serbisyo. Mula sa listahang ito, ano sa tingin mo ang pangunahing dahilan kung bakit hindi mo ito nalaman?",
    bisaya: "Adunay daghang rason nganong ang usa ka residente dili makadungog bahin sa usa ka serbisyo. Gikan niining listahan, unsa sa imong hunahuna ang nag-unang rason nga wala ka makahibalo niini?"
  };
  return texts[language];
}

/**
 * Get non-availment reason question text with translations
 */
export function getNonAvailmentQuestionText(language: 'english' | 'filipino' | 'bisaya' = 'english'): string {
  const texts = {
    english: "You mentioned you were aware of this service but didn't use it. From this list, what was the main reason you or your household did not avail of it?",
    filipino: "Nabanggit ninyo na alam ninyo ang tungkol sa serbisyong ito ngunit hindi ninyo ito ginamit. Mula sa listahang ito, ano ang pangunahing dahilan kung bakit hindi ninyo o ng inyong sambahayan ito ginamit?",
    bisaya: "Imong gihisgotan nga nahibal-an nimo kini nga serbisyo apan wala nimo kini gigamit. Gikan niining listahan, unsa ang nag-unang rason nga wala nimo o sa imong panimalay kini gipahimuslan?"
  };
  return texts[language];
}

/**
 * Create unawareness reason question for a service indicator
 * Note: Always uses English option keys - translations are handled by getTranslatedOptions()
 */
export function createUnawarenessReasonQuestion(
  serviceId: string, 
  awarenessQuestionId: string,
  language: 'english' | 'filipino' | 'bisaya' = 'english',
  customNoValue?: string  // Allow custom "No" value for special cases
): Question {
  // Determine the correct "No" value based on language
  // Use customNoValue if provided (for questions like corruption that use "Hindi (No)")
  const noValue = customNoValue || (language === 'filipino' ? 'Hindi' : language === 'bisaya' ? 'Dili' : 'No');
  
  // Use the question ID for translation lookup instead of hardcoded text
  const questionId = `${serviceId}_unawareness_reason`;
  
  // Always use English option keys - they will be translated by getTranslatedOptions()
  const englishOptions = UNAWARENESS_REASON_OPTIONS.english;
  
  const question: Question = {
    id: questionId,
    type: 'radio',
    question: getUnawarenessQuestionText(language),
    options: UNAWARENESS_REASON_OPTIONS[language],
    required: (formData: any) => {
      const answer = formData[awarenessQuestionId];
      return answer === 'No' || answer === 'Hindi' || answer === 'Hindi (No)' || answer === 'Dili';
    },
    dependsOn: awarenessQuestionId,
    dependsOnValue: noValue,
    followUpQuestions: [
      {
        id: `${serviceId}_unawareness_reason_other`,
        type: 'textarea',
        question: OTHER_REASON_LABELS[language],
        required: (formData: any) => {
          const mainAnswer = formData[questionId];
          // Check against all language versions of "Other Reason"
          return mainAnswer === 'Other Reason' || 
                 mainAnswer === 'Iba pang dahilan' || 
                 mainAnswer === 'Laing rason';
        },
        dependsOn: questionId,
        dependsOnValue: 'Other Reason' // English key
      }
    ]
  };
  
  return question;
}

/**
 * Create non-availment reason question for a service indicator
 * Note: Always uses English option keys - translations are handled by getTranslatedOptions()
 */
export function createNonAvailmentReasonQuestion(
  serviceId: string, 
  awarenessQuestionId: string,
  availmentQuestionId: string,
  language: 'english' | 'filipino' | 'bisaya' = 'english'
): Question {
  // Determine the correct "No" value based on language
  const noValue = language === 'filipino' ? 'Hindi' : language === 'bisaya' ? 'Dili' : 'No';
  
  // Use the question ID for translation lookup instead of hardcoded text
  const questionId = `${serviceId}_non_availment_reason`;
  
  // Always use English option keys - they will be translated by getTranslatedOptions()
  const englishOptions = NON_AVAILMENT_REASON_OPTIONS.english;
  
  return {
    id: questionId,
    type: 'radio',
    question: getNonAvailmentQuestionText(language),
    options: NON_AVAILMENT_REASON_OPTIONS[language],
    required: (formData: any) => {
      const isAware = formData[awarenessQuestionId] === 'Yes' || 
                     formData[awarenessQuestionId] === 'Oo' || 
                     formData[awarenessQuestionId] === 'Oo (Yes)';
      const didNotAvail = formData[availmentQuestionId] === 'No' || 
                         formData[availmentQuestionId] === 'Hindi' || 
                         formData[availmentQuestionId] === 'Hindi (No)' ||
                         formData[availmentQuestionId] === 'Dili';
      return isAware && didNotAvail;
    },
    dependsOn: availmentQuestionId,
    dependsOnValue: noValue,
    followUpQuestions: [
      {
        id: `${serviceId}_non_availment_reason_other`,
        type: 'textarea',
        question: OTHER_REASON_LABELS[language],
        required: (formData: any) => {
          const mainAnswer = formData[questionId];
          // Check against all language versions of "Other Reason"
          return mainAnswer === 'Other Reason' || 
                 mainAnswer === 'Iba pang dahilan' || 
                 mainAnswer === 'Laing rason';
        },
        dependsOn: questionId,
        dependsOnValue: 'Other Reason' // English key
      }
    ]
  };
}

/**
 * Check if a question should trigger the unawareness module
 */
export function shouldTriggerUnawarenessModule(questionId: string, answer: string): boolean {
  const awarenessQuestions = [
    'awarenessProjects', 'awarenessFinancial', 'awarenessSocialPrograms', 'awarenessCorruption',
    'awarenessDisasterInfo', 'awarenessEvacuation',
    'awarenessTanods', 'awarenessLupon', 'awarenessAntiDrug',
    'awarenessHealthServices', 'awarenessWomenChildrenProtection', 'awarenessCommunityParticipation',
    'awarenessBusinessClearance',
    'awarenessWasteManagement'
  ];
  
  const negativeAnswers = ['No', 'Hindi', 'Hindi (No)'];
  
  return awarenessQuestions.includes(questionId) && negativeAnswers.includes(answer);
}

/**
 * Check if a question should trigger the non-availment module
 */
export function shouldTriggerNonAvailmentModule(
  questionId: string, 
  answer: string, 
  formData: Record<string, any>
): boolean {
  const availmentQuestions = [
    'benefitedProjects', 'usedFinancialInfo', 'participatedSocialPrograms',
    'availmentDisasterInfo', 'locationEvacuation',
    'experienceTanods', 'experienceLupon', 'experienceAntiDrug',
    'availmentHealthServices', 'availmentWomenChildrenProtection', 'availmentCommunityParticipation',
    'availmentBusinessClearance',
    'availmentWasteManagement'
  ];
  
  const negativeAnswers = ['No', 'Hindi', 'Hindi (No)'];
  
  if (!availmentQuestions.includes(questionId) || !negativeAnswers.includes(answer)) {
    return false;
  }
  
  // Check if the corresponding awareness question was answered positively
  const awarenessMapping: Record<string, string> = {
    'benefitedProjects': 'awarenessProjects',
    'usedFinancialInfo': 'awarenessFinancial',
    'participatedSocialPrograms': 'awarenessSocialPrograms',
    'availmentDisasterInfo': 'awarenessDisasterInfo',
    'locationEvacuation': 'awarenessEvacuation',
    'experienceTanods': 'awarenessTanods',
    'experienceLupon': 'awarenessLupon',
    'experienceAntiDrug': 'awarenessAntiDrug',
    'availmentHealthServices': 'awarenessHealthServices',
    'availmentWomenChildrenProtection': 'awarenessWomenChildrenProtection',
    'availmentCommunityParticipation': 'awarenessCommunityParticipation',
    'availmentBusinessClearance': 'awarenessBusinessClearance',
    'availmentWasteManagement': 'awarenessWasteManagement'
  };
  
  const awarenessQuestionId = awarenessMapping[questionId];
  if (!awarenessQuestionId) return false;
  
  const positiveAnswers = ['Yes', 'Oo', 'Oo (Yes)'];
  return positiveAnswers.includes(formData[awarenessQuestionId]);
}

/**
 * Get the service ID from a question ID
 */
export function getServiceIdFromQuestionId(questionId: string): string | null {
  const mapping: Record<string, string> = {
    // Financial section
    'awarenessProjects': 'projects',
    'benefitedProjects': 'projects',
    'awarenessFinancial': 'financial',
    'usedFinancialInfo': 'financial',
    'awarenessSocialPrograms': 'socialPrograms',
    'participatedSocialPrograms': 'socialPrograms',
    'awarenessCorruption': 'corruption',
    
    // Disaster section
    'awarenessDisasterInfo': 'disasterInfo',
    'availmentDisasterInfo': 'disasterInfo',
    'awarenessEvacuation': 'evacuation',
    'locationEvacuation': 'evacuation',
    
    // Safety section
    'awarenessTanods': 'tanods',
    'experienceTanods': 'tanods',
    'awarenessLupon': 'lupon',
    'experienceLupon': 'lupon',
    'awarenessAntiDrug': 'antiDrug',
    'experienceAntiDrug': 'antiDrug',
    
    // Social section
    'awarenessHealthServices': 'healthServices',
    'availmentHealthServices': 'healthServices',
    'awarenessWomenChildrenProtection': 'womenChildrenProtection',
    'availmentWomenChildrenProtection': 'womenChildrenProtection',
    'awarenessCommunityParticipation': 'communityParticipation',
    'availmentCommunityParticipation': 'communityParticipation',
    
    // Business section
    'awarenessBusinessClearance': 'businessClearance',
    'availmentBusinessClearance': 'businessClearance',
    
    // Environmental section
    'awarenessWasteManagement': 'wasteManagement',
    'availmentWasteManagement': 'wasteManagement'
  };
  
  return mapping[questionId] || null;
}

/**
 * Determine the language based on the section or question content
 */
export function detectLanguage(sectionId: string, questionText?: string): 'english' | 'filipino' | 'bisaya' {
  // Check if the section uses Filipino/Tagalog
  if (sectionId === 'financial' || (questionText && questionText.includes('Oo'))) {
    return 'filipino';
  }
  
  // Check if the section uses Bisaya (currently not implemented in the questions)
  if (questionText && questionText.includes('Bisaya')) {
    return 'bisaya';
  }
  
  // Default to English for disaster, safety, social, business, environmental sections
  return 'english';
}