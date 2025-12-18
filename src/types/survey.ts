/**
 * Survey Form Type Definitions
 * 
 * This file contains TypeScript interfaces and types for the survey form,
 * including support for conditional validation and the binary Need for Action feature.
 */

/**
 * Base interface for all survey questions
 */
export interface BaseQuestion {
  id: string;
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'grouped';
  question: string;
  options?: string[];
  translatedOptions?: string[]; // Translated labels for display (while options remain as values)
  required?: boolean | ((formData: any) => boolean); // Support conditional requirement
  dependsOn?: string; // Field ID this question depends on
  dependsOnValue?: string;
  partHeader?: string;
  mainQuestion?: string;
  mainOptions?: string[];
  followUpQuestions?: BaseQuestion[];
  conditionalNext?: {
    value: string;
    skipToId: string;
  }[];
}

/**
 * Binary Need for Action question type
 * Always required, provides exactly two options
 */
export interface NeedForActionBinaryQuestion extends BaseQuestion {
  id: `${string}_nfa_binary`;
  type: 'radio';
  options: ['Yes', 'No'] | ['Oo', 'Hindi'];
  required: true;
}

/**
 * Suggestion field for Need for Action
 * Conditionally required based on binary answer
 */
export interface NeedForActionSuggestionQuestion extends BaseQuestion {
  id: `${string}_nfa_suggestion`;
  type: 'textarea';
  required: (formData: any) => boolean; // Conditional based on binary answer
  dependsOn: `${string}_nfa_binary`;
}

/**
 * Unawareness reason question type
 * Conditionally required when awareness = No
 */
export interface UnawarenessReasonQuestion extends BaseQuestion {
  id: `${string}_unawareness_reason`;
  type: 'radio';
  options: string[];
  required: (formData: any) => boolean; // Conditional based on awareness answer
  dependsOn: string; // The awareness question ID
}

/**
 * Non-availment reason question type
 * Conditionally required when awareness = Yes but availment = No
 */
export interface NonAvailmentReasonQuestion extends BaseQuestion {
  id: `${string}_non_availment_reason`;
  type: 'radio';
  options: string[];
  required: (formData: any) => boolean; // Conditional based on awareness and availment answers
  dependsOn: string; // The availment question ID
}

/**
 * Union type for all question types
 */
export type Question = BaseQuestion | NeedForActionBinaryQuestion | NeedForActionSuggestionQuestion | UnawarenessReasonQuestion | NonAvailmentReasonQuestion;

/**
 * Service indicator data structure with binary and suggestion fields
 */
export interface ServiceIndicatorData {
  satisfaction_rating?: number; // 1-5 scale
  need_for_action_binary: 'Yes' | 'No' | 'Oo' | 'Hindi';
  need_for_action_suggestion: string | null;
  unawareness_reason?: string | null; // Reason for not being aware
  non_availment_reason?: string | null; // Reason for not using the service
}

/**
 * Financial Administration section data structure
 */
export interface FinancialSectionData {
  // Projects subsection
  awarenessProjects?: 'Oo' | 'Hindi';
  benefitedProjects?: 'Oo' | 'Hindi';
  satisfactionProjects?: string; // '1' to '5'
  need_for_action_binary_projects: 'Oo' | 'Hindi';
  need_for_action_suggestion_projects: string | null;
  
  // Financial Transparency subsection
  awarenessFinancial?: 'Oo' | 'Hindi';
  usedFinancialInfo?: 'Oo' | 'Hindi';
  satisfactionFinancial?: string;
  need_for_action_binary_financial: 'Oo' | 'Hindi';
  need_for_action_suggestion_financial: string | null;
  
  // Social Programs subsection
  awarenessSocialPrograms?: 'Oo' | 'Hindi';
  participatedSocialPrograms?: 'Oo' | 'Hindi';
  satisfactionSocialPrograms?: string;
  need_for_action_binary_socialPrograms: 'Oo' | 'Hindi';
  need_for_action_suggestion_socialPrograms: string | null;
  
  // Corruption Perception subsection
  awarenessCorruption?: 'Oo (Yes)' | 'Hindi (No)';
  experiencedCorruption?: 'Oo (Yes)' | 'Hindi (No)';
  detailsCorruption?: string;
  reportedCorruption?: 'Oo (Yes)' | 'Hindi (No)';
  reasonsNotReporting?: string[];
  satisfactionReportResponse?: string;
  need_for_action_binary_corruption: 'Oo' | 'Hindi';
  need_for_action_suggestion_corruption: string | null;
}

/**
 * Disaster Preparedness section data structure
 */
export interface DisasterSectionData {
  // Disaster Information subsection
  awarenessDisasterInfo?: 'Yes' | 'No';
  availmentDisasterInfo?: 'Yes' | 'No';
  satisfactionDisasterInfo?: string;
  need_for_action_binary_disasterInfo: 'Yes' | 'No';
  need_for_action_suggestion_disasterInfo: string | null;
  
  // Evacuation Resources subsection
  awarenessEvacuation?: 'Yes' | 'No';
  locationEvacuation?: 'Yes' | 'No';
  satisfactionEvacuation?: string;
  need_for_action_binary_evacuation: 'Yes' | 'No';
  need_for_action_suggestion_evacuation: string | null;
}

/**
 * Safety & Peace Order section data structure
 */
export interface SafetySectionData {
  // Barangay Tanods subsection
  awarenessTanods?: 'Yes' | 'No';
  experienceTanods?: 'Yes' | 'No';
  satisfactionTanods?: string;
  need_for_action_binary_tanods: 'Yes' | 'No';
  need_for_action_suggestion_tanods: string | null;
  
  // Lupon/Dispute Resolution subsection
  awarenessLupon?: 'Yes' | 'No';
  experienceLupon?: 'Yes' | 'No';
  satisfactionLupon?: string;
  need_for_action_binary_lupon: 'Yes' | 'No';
  need_for_action_suggestion_lupon: string | null;
  
  // Anti-Drug Programs subsection
  awarenessAntiDrug?: 'Yes' | 'No';
  experienceAntiDrug?: 'Yes' | 'No';
  satisfactionAntiDrug?: string;
  need_for_action_binary_antiDrug: 'Yes' | 'No';
  need_for_action_suggestion_antiDrug: string | null;
}

/**
 * Social Protection section data structure
 */
export interface SocialProtectionSectionData {
  // Health Services subsection
  awarenessHealthServices?: 'Yes' | 'No';
  availmentHealthServices?: 'Yes' | 'No';
  satisfactionHealthServices?: string;
  need_for_action_binary_healthServices: 'Yes' | 'No';
  need_for_action_suggestion_healthServices: string | null;
  
  // Women & Children Protection subsection
  awarenessWomenChildrenProtection?: 'Yes' | 'No';
  availmentWomenChildrenProtection?: 'Yes' | 'No';
  satisfactionWomenChildrenProtection?: string;
  need_for_action_binary_womenChildrenProtection: 'Yes' | 'No';
  need_for_action_suggestion_womenChildrenProtection: string | null;
  
  // Community Participation subsection
  awarenessCommunityParticipation?: 'Yes' | 'No';
  availmentCommunityParticipation?: 'Yes' | 'No';
  satisfactionCommunityParticipation?: string;
  need_for_action_binary_communityParticipation: 'Yes' | 'No';
  need_for_action_suggestion_communityParticipation: string | null;
}

/**
 * Business Friendliness section data structure
 */
export interface BusinessSectionData {
  // Business Clearance subsection
  awarenessBusinessClearance?: 'Yes' | 'No';
  availmentBusinessClearance?: 'Yes' | 'No';
  satisfactionBusinessClearance?: string;
  need_for_action_binary_businessClearance: 'Yes' | 'No';
  need_for_action_suggestion_businessClearance: string | null;
}

/**
 * Environmental Management section data structure
 */
export interface EnvironmentalSectionData {
  // Waste Management subsection
  awarenessWasteManagement?: 'Yes' | 'No';
  availmentWasteManagement?: 'Yes' | 'No';
  satisfactionWasteManagement?: string;
  need_for_action_binary_wasteManagement: 'Yes' | 'No';
  need_for_action_suggestion_wasteManagement: string | null;
}

/**
 * Field naming convention helpers
 */
export const FieldNamingHelpers = {
  /**
   * Generate binary field ID for a service indicator
   * @param serviceId - The service indicator ID (e.g., 'projects', 'financial')
   * @returns Binary field ID following convention: {service_id}_nfa_binary
   */
  getBinaryFieldId: (serviceId: string): string => {
    return `${serviceId}_nfa_binary`;
  },

  /**
   * Generate suggestion field ID for a service indicator
   * @param serviceId - The service indicator ID (e.g., 'projects', 'financial')
   * @returns Suggestion field ID following convention: {service_id}_nfa_suggestion
   */
  getSuggestionFieldId: (serviceId: string): string => {
    return `${serviceId}_nfa_suggestion`;
  },

  /**
   * Generate data field name for binary response
   * @param serviceId - The service indicator ID
   * @returns Data field name: need_for_action_binary_{service_id}
   */
  getBinaryDataFieldName: (serviceId: string): string => {
    return `need_for_action_binary_${serviceId}`;
  },

  /**
   * Generate data field name for suggestion response
   * @param serviceId - The service indicator ID
   * @returns Data field name: need_for_action_suggestion_{service_id}
   */
  getSuggestionDataFieldName: (serviceId: string): string => {
    return `need_for_action_suggestion_${serviceId}`;
  },

  /**
   * Check if a field ID is a binary NFA field
   * @param fieldId - The field ID to check
   * @returns True if the field is a binary NFA field
   */
  isBinaryField: (fieldId: string): boolean => {
    return fieldId.endsWith('_nfa_binary');
  },

  /**
   * Check if a field ID is a suggestion NFA field
   * @param fieldId - The field ID to check
   * @returns True if the field is a suggestion NFA field
   */
  isSuggestionField: (fieldId: string): boolean => {
    return fieldId.endsWith('_nfa_suggestion');
  },

  /**
   * Extract service ID from a binary or suggestion field ID
   * @param fieldId - The field ID (e.g., 'projects_nfa_binary')
   * @returns The service ID (e.g., 'projects')
   */
  extractServiceId: (fieldId: string): string | null => {
    if (fieldId.endsWith('_nfa_binary')) {
      return fieldId.replace('_nfa_binary', '');
    }
    if (fieldId.endsWith('_nfa_suggestion')) {
      return fieldId.replace('_nfa_suggestion', '');
    }
    return null;
  }
};

/**
 * Service indicator mapping
 * Maps service areas to their indicators
 */
export const SERVICE_INDICATORS = {
  financial: ['projects', 'financial', 'socialPrograms', 'corruption'],
  disaster: ['disasterInfo', 'evacuation'],
  safety: ['tanods', 'lupon', 'antiDrug'],
  social: ['healthServices', 'womenChildrenProtection', 'communityParticipation'],
  business: ['businessClearance'],
  environmental: ['wasteManagement']
} as const;

/**
 * Type for service area keys
 */
export type ServiceArea = keyof typeof SERVICE_INDICATORS;

/**
 * Type for all service indicator IDs
 */
export type ServiceIndicatorId = typeof SERVICE_INDICATORS[ServiceArea][number];
