/**
 * Conditional Flow Handler
 * 
 * This utility manages the flow logic for conditional questions,
 * determining when to show unawareness and non-availment modules.
 */

import { 
  shouldTriggerUnawarenessModule, 
  shouldTriggerNonAvailmentModule,
  getServiceIdFromQuestionId 
} from "./conditionalQuestions";

/**
 * Determine the next question ID based on current answer and form data
 */
export function getNextQuestionId(
  currentQuestionId: string,
  currentAnswer: string,
  formData: Record<string, any>,
  allQuestions: any[]
): string | null {
  // Check if this answer triggers the unawareness module
  if (shouldTriggerUnawarenessModule(currentQuestionId, currentAnswer)) {
    const serviceId = getServiceIdFromQuestionId(currentQuestionId);
    if (serviceId) {
      return `${serviceId}_unawareness_reason`;
    }
  }

  // Check if this answer triggers the non-availment module
  if (shouldTriggerNonAvailmentModule(currentQuestionId, currentAnswer, formData)) {
    const serviceId = getServiceIdFromQuestionId(currentQuestionId);
    if (serviceId) {
      return `${serviceId}_non_availment_reason`;
    }
  }

  // Check for existing conditional logic in the question
  const currentQuestion = allQuestions.find(q => q.id === currentQuestionId);
  if (currentQuestion?.conditionalNext) {
    const conditionalRule = currentQuestion.conditionalNext.find(
      (rule: any) => rule.value === currentAnswer
    );
    if (conditionalRule) {
      return conditionalRule.skipToId;
    }
  }

  // Default: proceed to next question in sequence
  const currentIndex = allQuestions.findIndex(q => q.id === currentQuestionId);
  if (currentIndex >= 0 && currentIndex < allQuestions.length - 1) {
    return allQuestions[currentIndex + 1].id;
  }

  return null; // End of section
}

/**
 * Check if a question should be shown based on dependencies and conditional logic
 */
export function shouldShowQuestion(
  questionId: string,
  formData: Record<string, any>,
  allQuestions: any[]
): boolean {
  const question = allQuestions.find(q => q.id === questionId);
  if (!question) return false;

  // Check basic dependency
  if (question.dependsOn && question.dependsOnValue) {
    const dependentValue = formData[question.dependsOn];
    if (dependentValue !== question.dependsOnValue) {
      return false;
    }
  }

  // Check conditional requirement for unawareness questions
  if (questionId.endsWith('_unawareness_reason')) {
    const serviceId = questionId.replace('_unawareness_reason', '');
    const awarenessQuestionId = getAwarenessQuestionId(serviceId);
    if (awarenessQuestionId) {
      const awarenessAnswer = formData[awarenessQuestionId];
      return shouldTriggerUnawarenessModule(awarenessQuestionId, awarenessAnswer);
    }
  }

  // Check conditional requirement for non-availment questions
  if (questionId.endsWith('_non_availment_reason')) {
    const serviceId = questionId.replace('_non_availment_reason', '');
    const { awarenessQuestionId, availmentQuestionId } = getServiceQuestionIds(serviceId);
    if (awarenessQuestionId && availmentQuestionId) {
      const availmentAnswer = formData[availmentQuestionId];
      return shouldTriggerNonAvailmentModule(availmentQuestionId, availmentAnswer, formData);
    }
  }

  return true;
}

/**
 * Get the awareness question ID for a service
 */
function getAwarenessQuestionId(serviceId: string): string | null {
  const mapping: Record<string, string> = {
    'projects': 'awarenessProjects',
    'financial': 'awarenessFinancial',
    'socialPrograms': 'awarenessSocialPrograms',
    'corruption': 'awarenessCorruption',
    'disasterInfo': 'awarenessDisasterInfo',
    'evacuation': 'awarenessEvacuation',
    'tanods': 'awarenessTanods',
    'lupon': 'awarenessLupon',
    'antiDrug': 'awarenessAntiDrug',
    'healthServices': 'awarenessHealthServices',
    'womenChildrenProtection': 'awarenessWomenChildrenProtection',
    'communityParticipation': 'awarenessCommunityParticipation',
    'businessClearance': 'awarenessBusinessClearance',
    'wasteManagement': 'awarenessWasteManagement'
  };
  return mapping[serviceId] || null;
}

/**
 * Get both awareness and availment question IDs for a service
 */
function getServiceQuestionIds(serviceId: string): { awarenessQuestionId: string | null, availmentQuestionId: string | null } {
  const awarenessMapping: Record<string, string> = {
    'projects': 'awarenessProjects',
    'financial': 'awarenessFinancial',
    'socialPrograms': 'awarenessSocialPrograms',
    'disasterInfo': 'awarenessDisasterInfo',
    'evacuation': 'awarenessEvacuation',
    'tanods': 'awarenessTanods',
    'lupon': 'awarenessLupon',
    'antiDrug': 'awarenessAntiDrug',
    'healthServices': 'awarenessHealthServices',
    'womenChildrenProtection': 'awarenessWomenChildrenProtection',
    'communityParticipation': 'awarenessCommunityParticipation',
    'businessClearance': 'awarenessBusinessClearance',
    'wasteManagement': 'awarenessWasteManagement'
  };

  const availmentMapping: Record<string, string> = {
    'projects': 'benefitedProjects',
    'financial': 'usedFinancialInfo',
    'socialPrograms': 'participatedSocialPrograms',
    'disasterInfo': 'availmentDisasterInfo',
    'evacuation': 'locationEvacuation',
    'tanods': 'experienceTanods',
    'lupon': 'experienceLupon',
    'antiDrug': 'experienceAntiDrug',
    'healthServices': 'availmentHealthServices',
    'womenChildrenProtection': 'availmentWomenChildrenProtection',
    'communityParticipation': 'availmentCommunityParticipation',
    'businessClearance': 'availmentBusinessClearance',
    'wasteManagement': 'availmentWasteManagement'
  };

  return {
    awarenessQuestionId: awarenessMapping[serviceId] || null,
    availmentQuestionId: availmentMapping[serviceId] || null
  };
}

/**
 * Process form data to extract conditional question responses
 */
export function extractConditionalResponses(formData: Record<string, any>): {
  unawarenessReasons: Record<string, string>;
  nonAvailmentReasons: Record<string, string>;
} {
  const unawarenessReasons: Record<string, string> = {};
  const nonAvailmentReasons: Record<string, string> = {};

  Object.keys(formData).forEach(key => {
    if (key.endsWith('_unawareness_reason')) {
      const serviceId = key.replace('_unawareness_reason', '');
      unawarenessReasons[serviceId] = formData[key];
    } else if (key.endsWith('_non_availment_reason')) {
      const serviceId = key.replace('_non_availment_reason', '');
      nonAvailmentReasons[serviceId] = formData[key];
    }
  });

  return { unawarenessReasons, nonAvailmentReasons };
}

/**
 * Validate conditional question responses
 */
export function validateConditionalResponses(
  formData: Record<string, any>,
  allQuestions: any[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if required conditional questions are answered
  allQuestions.forEach(question => {
    if (question.id.endsWith('_unawareness_reason') || question.id.endsWith('_non_availment_reason')) {
      if (shouldShowQuestion(question.id, formData, allQuestions)) {
        const isRequired = typeof question.required === 'function' 
          ? question.required(formData) 
          : question.required;
        
        if (isRequired && !formData[question.id]) {
          errors.push(`${question.id} is required but not answered`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}