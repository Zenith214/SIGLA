/**
 * CSIS Workflow Utility Functions
 * Contains core utility functions for the CSIS workflow including:
 * - Questionnaire ID generation
 * - Kish Grid respondent selection
 * - Service area randomization
 * - Skip pattern logic
 */

/**
 * Generate questionnaire ID in format: {YEAR}-{SPOT_NUMBER}-{SEQUENCE}
 * Example: 2024-001-003
 * 
 * @param year - The year (e.g., 2024)
 * @param spotNumber - The spot number (1-999)
 * @param sequence - The sequence within spot (1-5)
 * @returns Formatted questionnaire ID
 */
export function generateQuestionnaireId(
  year: number,
  spotNumber: number,
  sequence: number
): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Year must be an integer between 2000 and 2100');
  }
  
  if (!Number.isInteger(spotNumber) || spotNumber < 1 || spotNumber > 999) {
    throw new Error('Spot number must be an integer between 1 and 999');
  }
  
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 5) {
    throw new Error('Sequence must be an integer between 1 and 5');
  }
  
  return `${year}-${String(spotNumber).padStart(3, '0')}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Household member interface for Kish Grid selection
 */
export interface HouseholdMember {
  name: string;
  age: number;
  gender: 'Male' | 'Female';
}

/**
 * Kish Grid selection matrix
 * Rows represent household size (1-6+)
 * Columns represent selection key (0-9)
 * Values represent the index of the selected member (0-based)
 */
const KISH_GRID_MATRIX: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1 member
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // 2 members
  [0, 1, 2, 0, 1, 2, 0, 1, 2, 0], // 3 members
  [0, 1, 2, 3, 0, 1, 2, 3, 0, 1], // 4 members
  [0, 1, 2, 3, 4, 0, 1, 2, 3, 4], // 5 members
  [0, 1, 2, 3, 4, 5, 0, 1, 2, 3], // 6+ members
];

/**
 * Select a respondent from household members using the Kish Grid method
 * 
 * @param members - Array of household members (must be 18+ years old)
 * @param questionnaireId - The questionnaire ID (last digit used as selection key)
 * @returns The selected household member
 */
export function selectRespondentKishGrid(
  members: HouseholdMember[],
  questionnaireId: string
): HouseholdMember {
  if (!members || members.length === 0) {
    throw new Error('Household must have at least one member');
  }
  
  // Filter members who are 18 or older
  const eligibleMembers = members.filter(m => m.age >= 18);
  
  if (eligibleMembers.length === 0) {
    throw new Error('Household must have at least one member aged 18 or older');
  }
  
  // Extract last digit from questionnaire ID as selection key
  const lastChar = questionnaireId.slice(-1);
  const selectionKey = parseInt(lastChar);
  
  if (isNaN(selectionKey)) {
    throw new Error('Questionnaire ID must end with a numeric digit');
  }
  
  // Determine household size category (max 6)
  const householdSize = Math.min(eligibleMembers.length, 6);
  
  // Get the selection index from Kish Grid matrix
  const selectedIndex = KISH_GRID_MATRIX[householdSize - 1][selectionKey];
  
  // Return the selected member
  return eligibleMembers[selectedIndex];
}

/**
 * Service area categories
 */
export type ServiceArea = 
  | 'financialAdmin'
  | 'safetyPeace'
  | 'environmental'
  | 'disasterPrep'
  | 'socialProtection'
  | 'businessFriendly';

/**
 * Get the randomized service area order based on questionnaire ID
 * Odd last digit: Financial, Safety, Environmental
 * Even last digit: Disaster, Social, Business
 * 
 * @param questionnaireId - The questionnaire ID
 * @returns Array of service areas in randomized order
 */
export function getServiceAreaOrder(questionnaireId: string): ServiceArea[] {
  const lastChar = questionnaireId.slice(-1);
  const lastDigit = parseInt(lastChar);
  
  if (isNaN(lastDigit)) {
    throw new Error('Questionnaire ID must end with a numeric digit');
  }
  
  const isOdd = lastDigit % 2 !== 0;
  
  const ODD_ORDER: ServiceArea[] = [
    'financialAdmin',
    'safetyPeace',
    'environmental'
  ];
  
  const EVEN_ORDER: ServiceArea[] = [
    'disasterPrep',
    'socialProtection',
    'businessFriendly'
  ];
  
  return isOdd ? ODD_ORDER : EVEN_ORDER;
}

/**
 * Question interface for skip pattern logic
 */
export interface Question {
  id: string;
  dependsOn?: string;
  dependsOnValue?: string | string[];
  [key: string]: any;
}

/**
 * Determine if a question should be shown based on skip pattern logic
 * 
 * @param question - The question to evaluate
 * @param answers - Object containing all current answers
 * @returns true if the question should be shown, false otherwise
 */
export function shouldShowQuestion(
  question: Question,
  answers: Record<string, any>
): boolean {
  // If no dependency, always show
  if (!question.dependsOn) {
    return true;
  }
  
  // Get the answer to the dependent question
  const dependentAnswer = answers[question.dependsOn];
  
  // If dependent question hasn't been answered, don't show
  if (dependentAnswer === undefined || dependentAnswer === null) {
    return false;
  }
  
  // Check if the dependent answer matches the required value
  if (Array.isArray(question.dependsOnValue)) {
    return question.dependsOnValue.includes(dependentAnswer);
  }
  
  return dependentAnswer === question.dependsOnValue;
}

/**
 * Filter questions based on skip pattern logic
 * 
 * @param questions - Array of questions
 * @param answers - Object containing all current answers
 * @returns Filtered array of questions that should be shown
 */
export function filterQuestionsBySkipPattern(
  questions: Question[],
  answers: Record<string, any>
): Question[] {
  return questions.filter(question => shouldShowQuestion(question, answers));
}
