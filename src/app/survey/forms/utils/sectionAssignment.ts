// Section assignment logic based on survey number (odd/even)
// Implements CSIS service area randomization based on questionnaire ID

export interface AssignedSection {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
}

// Define all available sections
export const ALL_SECTIONS = [
  { id: "financial", name: "Financial Administration" },
  { id: "disaster", name: "Disaster Preparedness" },
  { id: "safety", name: "Safety & Peace Order" },
  { id: "social", name: "Social Protection" },
  { id: "business", name: "Business Friendliness" },
  { id: "environmental", name: "Environmental Management" },
];

// Canonical section order for CSIS rotation
// All 6 service sections in standard order
export const CANONICAL_SECTION_ORDER = [
  "financial",
  "disaster",
  "social",
  "safety",
  "business",
  "environmental"
] as const;

// Section assignments based on odd/even questionnaire numbers
// ODD questionnaires: Financial, Safety, Environmental
// EVEN questionnaires: Disaster, Social, Business
// @deprecated Use getSectionOrder() for CSIS-compliant 6-section randomization
export const ODD_SECTIONS = ["financial", "safety", "environmental"];
export const EVEN_SECTIONS = ["disaster", "social", "business"];

/**
 * Complete 150-entry CSIS randomization map (CSIS Annex I)
 * Maps questionnaire number (1-150) to starting service section
 * This ensures proper randomization across all survey instances
 */
export const CSIS_RANDOMIZATION_MAP: Record<number, string> = {
  1: 'financial', 2: 'disaster', 3: 'social', 4: 'safety', 5: 'business',
  6: 'environmental', 7: 'financial', 8: 'disaster', 9: 'social', 10: 'safety',
  11: 'business', 12: 'environmental', 13: 'financial', 14: 'disaster', 15: 'social',
  16: 'safety', 17: 'business', 18: 'environmental', 19: 'financial', 20: 'disaster',
  21: 'social', 22: 'safety', 23: 'business', 24: 'environmental', 25: 'financial',
  26: 'disaster', 27: 'social', 28: 'safety', 29: 'business', 30: 'environmental',
  31: 'disaster', 32: 'social', 33: 'safety', 34: 'business', 35: 'environmental',
  36: 'financial', 37: 'disaster', 38: 'social', 39: 'safety', 40: 'business',
  41: 'environmental', 42: 'financial', 43: 'disaster', 44: 'social', 45: 'safety',
  46: 'business', 47: 'environmental', 48: 'financial', 49: 'disaster', 50: 'social',
  51: 'safety', 52: 'business', 53: 'environmental', 54: 'financial', 55: 'disaster',
  56: 'social', 57: 'safety', 58: 'business', 59: 'environmental', 60: 'financial',
  61: 'social', 62: 'safety', 63: 'business', 64: 'environmental', 65: 'financial',
  66: 'disaster', 67: 'social', 68: 'safety', 69: 'business', 70: 'environmental',
  71: 'financial', 72: 'disaster', 73: 'social', 74: 'safety', 75: 'business',
  76: 'environmental', 77: 'financial', 78: 'disaster', 79: 'social', 80: 'safety',
  81: 'business', 82: 'environmental', 83: 'financial', 84: 'disaster', 85: 'social',
  86: 'safety', 87: 'business', 88: 'environmental', 89: 'financial', 90: 'disaster',
  91: 'safety', 92: 'business', 93: 'environmental', 94: 'financial', 95: 'disaster',
  96: 'social', 97: 'safety', 98: 'business', 99: 'environmental', 100: 'financial',
  101: 'disaster', 102: 'social', 103: 'safety', 104: 'business', 105: 'environmental',
  106: 'financial', 107: 'disaster', 108: 'social', 109: 'safety', 110: 'business',
  111: 'environmental', 112: 'financial', 113: 'disaster', 114: 'social', 115: 'safety',
  116: 'business', 117: 'environmental', 118: 'financial', 119: 'disaster', 120: 'social',
  121: 'business', 122: 'environmental', 123: 'financial', 124: 'disaster', 125: 'social',
  126: 'safety', 127: 'business', 128: 'environmental', 129: 'financial', 130: 'disaster',
  131: 'social', 132: 'safety', 133: 'business', 134: 'environmental', 135: 'financial',
  136: 'disaster', 137: 'social', 138: 'safety', 139: 'business', 140: 'environmental',
  141: 'financial', 142: 'disaster', 143: 'social', 144: 'safety', 145: 'business',
  146: 'environmental', 147: 'financial', 148: 'disaster', 149: 'social', 150: 'safety'
};

/**
 * Custom error class for section assignment errors
 */
export class SectionAssignmentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SectionAssignmentError';
  }
}

/**
 * Validate section ID
 * @param sectionId - The section ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidSectionId(sectionId: string): boolean {
  const validSections = [
    'initialization',
    'respondent-selection',
    'respondent-demographics',
    ...CANONICAL_SECTION_ORDER,
    'overall',
    'summary'
  ];
  
  return validSections.includes(sectionId);
}

/**
 * Validate that a section is in the assigned sections list
 * @param sectionId - The section ID to check
 * @param assignedSections - Array of assigned section IDs
 * @returns true if section is assigned or is a required section
 */
export function isSectionAccessible(sectionId: string, assignedSections: string[]): boolean {
  // Required sections are always accessible (including overall satisfaction)
  const requiredSections = ['initialization', 'respondent-selection', 'respondent-demographics', 'overall', 'summary'];
  if (requiredSections.includes(sectionId)) {
    return true;
  }

  // Service sections must be in assigned list
  return assignedSections.includes(sectionId);
}

/**
 * Get randomized section order based on CSIS methodology
 * Returns all 6 service sections in rotated order starting from the assigned section
 * 
 * @param questionnaireNumber - The questionnaire number (1-150)
 * @returns Array of all 6 section IDs in randomized order
 * @throws SectionAssignmentError if questionnaire number is invalid
 */
export function getSectionOrder(questionnaireNumber: number): string[] {
  // Validate questionnaire number
  if (typeof questionnaireNumber !== 'number' || isNaN(questionnaireNumber)) {
    console.error(`Invalid questionnaire number type: ${typeof questionnaireNumber}`);
    throw new SectionAssignmentError(
      'INVALID_QUESTIONNAIRE_NUMBER',
      'Questionnaire number must be a valid number',
      { provided: questionnaireNumber }
    );
  }

  if (questionnaireNumber < 1 || questionnaireNumber > 150) {
    console.warn(`Questionnaire number ${questionnaireNumber} out of range (1-150), using default order`);
    // Return default order as fallback
    return [...CANONICAL_SECTION_ORDER];
  }

  // Look up starting section from randomization map
  const startingSection = CSIS_RANDOMIZATION_MAP[questionnaireNumber];

  if (!startingSection) {
    console.error(`No mapping found for questionnaire ${questionnaireNumber}, using default order`);
    return [...CANONICAL_SECTION_ORDER];
  }

  // Find index in canonical order
  const startIndex = CANONICAL_SECTION_ORDER.indexOf(startingSection as typeof CANONICAL_SECTION_ORDER[number]);

  if (startIndex === -1) {
    console.error(`Invalid starting section ${startingSection}, using default order`);
    return [...CANONICAL_SECTION_ORDER];
  }

  // Rotate array to start from that section
  return [
    ...CANONICAL_SECTION_ORDER.slice(startIndex),
    ...CANONICAL_SECTION_ORDER.slice(0, startIndex)
  ];
}

/**
 * Get service area order based on questionnaire ID
 * Uses last digit to determine odd/even
 * Odd = [Financial, Safety, Environmental]
 * Even = [Disaster, Social, Business]
 * 
 * @deprecated Use getSectionOrder() for CSIS-compliant 6-section randomization
 * @param questionnaireId - The questionnaire ID (e.g., "2024-001-003" or "BB-2024-0001")
 * @returns Array of section IDs in the randomized order (3 sections only)
 */
export function getServiceAreaOrder(questionnaireId: string): string[] {
  // Extract the last digit from the questionnaire ID
  const lastChar = questionnaireId.slice(-1);
  const lastDigit = parseInt(lastChar);
  
  // If not a valid digit, default to odd
  if (isNaN(lastDigit)) {
    console.warn(`Invalid questionnaire ID format: ${questionnaireId}, defaulting to ODD sections`);
    return ODD_SECTIONS;
  }
  
  // Determine if odd or even
  const isOdd = lastDigit % 2 !== 0;
  
  console.log(`Questionnaire ${questionnaireId} - Last digit: ${lastDigit}, Type: ${isOdd ? 'ODD' : 'EVEN'}`);
  
  return isOdd ? ODD_SECTIONS : EVEN_SECTIONS;
}

/**
 * Get assigned sections based on survey number
 * Supports both old format (numbers) and new format (BB-YYYY-NNNN)
 */
export function getAssignedSections(surveyNumber: string | number): AssignedSection[] {
  let num: number;
  
  if (typeof surveyNumber === 'string') {
    // Handle new format BB-YYYY-NNNN (extract questionnaire number)
    if (surveyNumber.includes('-')) {
      const parts = surveyNumber.split('-');
      if (parts.length === 3) {
        num = parseInt(parts[2]); // Extract NNNN part
      } else {
        num = parseInt(surveyNumber);
      }
    } else {
      num = parseInt(surveyNumber);
    }
  } else {
    num = surveyNumber;
  }
  
  if (isNaN(num) || num < 1) {
    return [];
  }

  const isOdd = num % 2 === 1;
  const assignedSectionIds = isOdd ? ODD_SECTIONS : EVEN_SECTIONS;
  
  return assignedSectionIds.map(id => {
    const section = ALL_SECTIONS.find(s => s.id === id);
    return {
      id,
      name: section?.name || id,
      status: "pending" as const
    };
  });
}

/**
 * Get section assignment type (odd/even)
 * Supports both old format (numbers) and new format (BB-YYYY-NNNN)
 */
export function getAssignmentType(surveyNumber: string | number): 'odd' | 'even' | null {
  let num: number;
  
  if (typeof surveyNumber === 'string') {
    // Handle new format BB-YYYY-NNNN (extract questionnaire number)
    if (surveyNumber.includes('-')) {
      const parts = surveyNumber.split('-');
      if (parts.length === 3) {
        num = parseInt(parts[2]); // Extract NNNN part
      } else {
        num = parseInt(surveyNumber);
      }
    } else {
      num = parseInt(surveyNumber);
    }
  } else {
    num = surveyNumber;
  }
  
  if (isNaN(num) || num < 1) {
    return null;
  }

  return num % 2 === 1 ? 'odd' : 'even';
}

/**
 * Get section assignment description
 */
export function getAssignmentDescription(surveyNumber: string | number): string {
  const assignedSections = getAssignedSections(surveyNumber);
  
  if (assignedSections.length === 0) {
    return '';
  }

  const sectionNames = assignedSections.map(s => s.name).join(', ');
  return `Survey #${surveyNumber} - You will complete: ${sectionNames}`;
}

/**
 * Check if a section is assigned for given survey number
 */
export function isSectionAssigned(surveyNumber: string | number, sectionId: string): boolean {
  const assignedSections = getAssignedSections(surveyNumber);
  return assignedSections.some(section => section.id === sectionId);
}

/**
 * Get next assigned section after current section
 */
export function getNextAssignedSection(surveyNumber: string | number, currentSectionId: string): string | null {
  const assignedSections = getAssignedSections(surveyNumber);
  const currentIndex = assignedSections.findIndex(s => s.id === currentSectionId);
  
  if (currentIndex === -1 || currentIndex === assignedSections.length - 1) {
    return "summary"; // Last section goes to summary
  }
  
  return assignedSections[currentIndex + 1].id;
}

/**
 * Get previous assigned section before current section
 */
export function getPreviousAssignedSection(surveyNumber: string | number, currentSectionId: string): string | null {
  const assignedSections = getAssignedSections(surveyNumber);
  const currentIndex = assignedSections.findIndex(s => s.id === currentSectionId);
  
  if (currentIndex <= 0) {
    return "kish-grid"; // First section goes back to Kish Grid
  }
  
  return assignedSections[currentIndex - 1].id;
}

/**
 * Calculate progress percentage for assigned sections
 */
export function calculateAssignedProgress(surveyNumber: string | number, completedSections: string[]): number {
  const assignedSections = getAssignedSections(surveyNumber);
  
  if (assignedSections.length === 0) {
    return 0;
  }
  
  const completedAssignedSections = completedSections.filter(sectionId => 
    assignedSections.some(assigned => assigned.id === sectionId)
  );
  
  return Math.round((completedAssignedSections.length / assignedSections.length) * 100);
}

/**
 * Get next section in navigation flow with validation
 * @param currentSection - Current section ID
 * @param assignedSections - Array of assigned section IDs (6 sections)
 * @returns Next section ID or 'summary' if at end
 */
export function getNextSectionSafe(currentSection: string, assignedSections: string[]): string {
  // Validate current section
  if (!isValidSectionId(currentSection)) {
    console.error(`Invalid current section: ${currentSection}, navigating to summary`);
    return 'summary';
  }

  // Handle fixed sections
  if (currentSection === 'initialization') {
    return 'respondent-selection';
  }
  if (currentSection === 'respondent-selection') {
    return 'respondent-demographics';
  }
  if (currentSection === 'respondent-demographics') {
    // Go to first assigned section
    if (assignedSections && assignedSections.length > 0) {
      return assignedSections[0];
    }
    return 'summary';
  }

  // Handle service sections
  if (assignedSections && assignedSections.includes(currentSection)) {
    const currentIndex = assignedSections.indexOf(currentSection);
    if (currentIndex < assignedSections.length - 1) {
      return assignedSections[currentIndex + 1];
    }
    // After last service section, go to overall satisfaction
    return 'overall';
  }

  // After overall satisfaction, go to summary
  if (currentSection === 'overall') {
    return 'summary';
  }

  // Fallback to summary
  console.warn(`Unable to determine next section from ${currentSection}, navigating to summary`);
  return 'summary';
}

/**
 * Get previous section in navigation flow with validation
 * @param currentSection - Current section ID
 * @param assignedSections - Array of assigned section IDs (6 sections)
 * @returns Previous section ID or current section if at start
 */
export function getPreviousSectionSafe(currentSection: string, assignedSections: string[]): string {
  // Validate current section
  if (!isValidSectionId(currentSection)) {
    console.error(`Invalid current section: ${currentSection}, staying on current section`);
    return currentSection;
  }

  // Handle fixed sections
  if (currentSection === 'respondent-selection') {
    return 'initialization';
  }
  if (currentSection === 'respondent-demographics') {
    return 'respondent-selection';
  }
  if (currentSection === 'overall') {
    // Go back to last assigned section
    if (assignedSections && assignedSections.length > 0) {
      return assignedSections[assignedSections.length - 1];
    }
    return 'respondent-demographics';
  }
  if (currentSection === 'summary') {
    // Go back to overall satisfaction
    return 'overall';
  }

  // Handle service sections
  if (assignedSections && assignedSections.includes(currentSection)) {
    const currentIndex = assignedSections.indexOf(currentSection);
    if (currentIndex > 0) {
      return assignedSections[currentIndex - 1];
    }
    return 'respondent-demographics';
  }

  // Fallback - stay on current section
  console.warn(`Unable to determine previous section from ${currentSection}, staying on current section`);
  return currentSection;
}

/**
 * Validate section navigation
 * Prevents skipping required sections
 * @param fromSection - Current section
 * @param toSection - Target section
 * @param assignedSections - Array of assigned section IDs
 * @param completedSections - Array of completed section IDs
 * @returns true if navigation is allowed
 */
export function canNavigateToSection(
  fromSection: string,
  toSection: string,
  assignedSections: string[],
  completedSections: string[]
): boolean {
  // Always allow backward navigation
  const sectionOrder = ['initialization', 'respondent-selection', 'respondent-demographics', ...assignedSections, 'summary'];
  const fromIndex = sectionOrder.indexOf(fromSection);
  const toIndex = sectionOrder.indexOf(toSection);
  
  if (toIndex < fromIndex) {
    return true; // Backward navigation always allowed
  }

  // For forward navigation, check if all previous sections are completed
  for (let i = fromIndex; i < toIndex; i++) {
    const section = sectionOrder[i];
    if (!completedSections.includes(section)) {
      console.warn(`Cannot skip to ${toSection} - ${section} is not completed`);
      return false;
    }
  }

  return true;
}

/**
 * Get user-friendly error message for section navigation errors
 * @param error - The error object
 * @returns User-friendly error message
 */
export function getSectionNavigationErrorMessage(error: Error | SectionAssignmentError): string {
  if (error instanceof SectionAssignmentError) {
    switch (error.code) {
      case 'INVALID_QUESTIONNAIRE_NUMBER':
        return 'Invalid questionnaire number. Please ensure you have a valid survey number.';
      
      case 'INVALID_SECTION':
        return 'Invalid section. Returning to summary.';
      
      case 'SECTION_NOT_ASSIGNED':
        return 'This section is not assigned for your questionnaire. Please follow the assigned section order.';
      
      default:
        return 'An error occurred during navigation. Returning to summary.';
    }
  }

  return error.message || 'An error occurred during navigation.';
}