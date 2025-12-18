/**
 * Kish Grid Selection Module
 * Implements CSIS Algorithm B for standardized respondent selection
 * Based on official DILG CSIS Digital Methodology (v4.0)
 */

// TypeScript interfaces
export interface HouseholdMember {
  name: string;
  birthdate: string;
  gender: string;
  age?: number;
}

export interface KishGridResult {
  selectedMember: HouseholdMember;
  selectedIndex: number;
  lookupRow: number;
  lookupColumn: number;
  gridValue: number;
}

/**
 * Official CSIS Kish Grid (12 rows × 10 columns)
 * Row index represents number of eligible household members (1-12)
 * Column index represents questionnaire number modulo 10 (1-10)
 * Values represent the selection index (1-based) for the respondent
 */
export const KISH_GRID_TABLE: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],           // 1 eligible member
  [1, 2, 1, 1, 2, 2, 1, 1, 2, 2],           // 2 eligible members
  [1, 2, 3, 1, 2, 3, 1, 2, 3, 1],           // 3 eligible members
  [1, 2, 3, 4, 1, 2, 3, 4, 1, 2],           // 4 eligible members
  [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],           // 5 eligible members
  [1, 2, 3, 4, 5, 6, 1, 2, 3, 4],           // 6 eligible members
  [1, 2, 3, 4, 5, 6, 7, 1, 2, 3],           // 7 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 1, 2],           // 8 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 1],           // 9 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],          // 10 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],          // 11 eligible members (capped at 10)
  [1, 3, 7, 5, 6, 4, 8, 10, 12, 9]          // 12+ eligible members
];

/**
 * Custom error class for Kish Grid selection errors
 */
export class KishGridError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KishGridError';
  }
}

/**
 * Validate questionnaire number range
 * @param questionnaireNumber - The questionnaire number to validate
 * @throws KishGridError if invalid
 */
function validateQuestionnaireNumber(questionnaireNumber: number): void {
  if (typeof questionnaireNumber !== 'number' || isNaN(questionnaireNumber)) {
    throw new KishGridError(
      'INVALID_QUESTIONNAIRE_NUMBER',
      'Questionnaire number must be a valid number',
      { provided: questionnaireNumber }
    );
  }

  if (questionnaireNumber < 1 || questionnaireNumber > 150) {
    throw new KishGridError(
      'QUESTIONNAIRE_OUT_OF_RANGE',
      `Questionnaire number must be between 1 and 150. Received: ${questionnaireNumber}`,
      { provided: questionnaireNumber, validRange: '1-150' }
    );
  }
}

/**
 * Validate household member data
 * @param members - Array of household members to validate
 * @throws KishGridError if invalid
 */
function validateHouseholdMembers(members: HouseholdMember[]): void {
  if (!members) {
    throw new KishGridError(
      'INVALID_MEMBER_DATA',
      'Household members array is null or undefined',
      { provided: members }
    );
  }

  if (!Array.isArray(members)) {
    throw new KishGridError(
      'INVALID_MEMBER_DATA',
      'Household members must be an array',
      { provided: typeof members }
    );
  }

  if (members.length === 0) {
    throw new KishGridError(
      'NO_QUALIFIED_RESPONDENT',
      'No eligible household members found. All members must be 18 years or older with complete information.',
      { memberCount: 0 }
    );
  }

  // Validate each member has required fields
  members.forEach((member, index) => {
    if (!member.name || typeof member.name !== 'string' || member.name.trim() === '') {
      throw new KishGridError(
        'INVALID_MEMBER_DATA',
        `Member ${index + 1} has invalid or missing name`,
        { memberIndex: index, field: 'name', value: member.name }
      );
    }

    if (!member.birthdate || typeof member.birthdate !== 'string') {
      throw new KishGridError(
        'INVALID_MEMBER_DATA',
        `Member ${index + 1} (${member.name}) has invalid or missing birthdate`,
        { memberIndex: index, field: 'birthdate', value: member.birthdate }
      );
    }

    if (!member.gender || typeof member.gender !== 'string') {
      throw new KishGridError(
        'INVALID_MEMBER_DATA',
        `Member ${index + 1} (${member.name}) has invalid or missing gender`,
        { memberIndex: index, field: 'gender', value: member.gender }
      );
    }
  });
}

/**
 * Select respondent using CSIS Kish Grid methodology
 * Replaces simple modulo logic with official statistical selection method
 * 
 * @param questionnaireNumber - The questionnaire number (1-150)
 * @param eligibleMembers - Array of eligible household members (age 18+)
 * @returns KishGridResult containing selected member and lookup details
 * @throws KishGridError with specific error codes for different failure scenarios
 */
export function selectRespondentKishGrid(
  questionnaireNumber: number,
  eligibleMembers: HouseholdMember[]
): KishGridResult {
  try {
    // Validate questionnaire number
    validateQuestionnaireNumber(questionnaireNumber);

    // Validate household members
    validateHouseholdMembers(eligibleMembers);

    // 1. Calculate lookup column (1-10)
    // Questionnaire number modulo 10, treating 0 as 10
    let col = questionnaireNumber % 10;
    if (col === 0) col = 10;

    // 2. Calculate lookup row (1-12, capped)
    // Number of eligible members, capped at 12
    let row = eligibleMembers.length;
    if (row > 12) row = 12;

    // 3. Retrieve selection index from grid (1-based)
    // Convert to 0-based array indices for lookup
    const gridValue = KISH_GRID_TABLE[row - 1][col - 1];

    // 4. Select member (convert to 0-based array index)
    // Grid values are 1-based, array indices are 0-based
    const selectedIndex = gridValue - 1;
    
    // Validate that the selected index is within bounds
    if (selectedIndex < 0 || selectedIndex >= eligibleMembers.length) {
      throw new KishGridError(
        'INVALID_GRID_SELECTION',
        `Grid selection index ${selectedIndex} is out of bounds for ${eligibleMembers.length} members`,
        { 
          selectedIndex, 
          memberCount: eligibleMembers.length,
          gridValue,
          row,
          col
        }
      );
    }

    const selectedMember = eligibleMembers[selectedIndex];

    // Final validation of selected member
    if (!selectedMember) {
      throw new KishGridError(
        'INVALID_GRID_SELECTION',
        'Selected member is null or undefined',
        { selectedIndex, memberCount: eligibleMembers.length }
      );
    }

    return {
      selectedMember,
      selectedIndex,
      lookupRow: row,
      lookupColumn: col,
      gridValue
    };
  } catch (error) {
    // Re-throw KishGridError as-is
    if (error instanceof KishGridError) {
      throw error;
    }

    // Wrap unexpected errors
    throw new KishGridError(
      'UNEXPECTED_ERROR',
      `Unexpected error during Kish Grid selection: ${error instanceof Error ? error.message : String(error)}`,
      { originalError: error }
    );
  }
}

/**
 * Get the Kish Grid cell value for display purposes
 * Useful for showing the grid visualization to users
 * 
 * @param row - Row number (1-12)
 * @param col - Column number (1-10)
 * @returns The grid value at that position
 */
export function getKishGridValue(row: number, col: number): number | null {
  if (row < 1 || row > 12 || col < 1 || col > 10) {
    return null;
  }
  return KISH_GRID_TABLE[row - 1][col - 1];
}

/**
 * Calculate required gender based on questionnaire number parity
 * Odd questionnaire numbers require male respondents
 * Even questionnaire numbers require female respondents
 * 
 * @param questionnaireNumber - The questionnaire number
 * @returns 'Male' or 'Female'
 */
export function getRequiredGender(questionnaireNumber: number): 'Male' | 'Female' {
  const isOdd = questionnaireNumber % 2 !== 0;
  return isOdd ? 'Male' : 'Female';
}

/**
 * Get user-friendly error message for Kish Grid errors
 * Converts technical error codes into messages suitable for field interviewers
 * 
 * @param error - The KishGridError or Error object
 * @returns User-friendly error message
 */
export function getKishGridErrorMessage(error: Error | KishGridError): string {
  if (error instanceof KishGridError) {
    switch (error.code) {
      case 'NO_QUALIFIED_RESPONDENT':
        return 'No eligible household members found. All members must be 18 years or older with complete information (name, birthdate, and gender).';
      
      case 'QUESTIONNAIRE_OUT_OF_RANGE':
        return `Invalid questionnaire number. The number must be between 1 and 150. Please check your survey number and try again.`;
      
      case 'INVALID_QUESTIONNAIRE_NUMBER':
        return 'Invalid questionnaire number format. Please ensure you have a valid survey number.';
      
      case 'INVALID_MEMBER_DATA':
        return error.message; // Already user-friendly
      
      case 'INVALID_GRID_SELECTION':
        return 'An error occurred during respondent selection. Please verify all household member information and try again.';
      
      case 'UNEXPECTED_ERROR':
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
      
      default:
        return 'An error occurred during respondent selection. Please try again.';
    }
  }

  // Fallback for non-KishGridError errors
  return error.message || 'An error occurred during respondent selection. Please try again.';
}

/**
 * Check if an error is retryable
 * Some errors (like invalid data) require user correction, while others can be retried
 * 
 * @param error - The error to check
 * @returns true if the operation can be retried
 */
export function isKishGridErrorRetryable(error: Error | KishGridError): boolean {
  if (error instanceof KishGridError) {
    switch (error.code) {
      case 'UNEXPECTED_ERROR':
      case 'INVALID_GRID_SELECTION':
        return true; // These might be transient
      
      case 'NO_QUALIFIED_RESPONDENT':
      case 'QUESTIONNAIRE_OUT_OF_RANGE':
      case 'INVALID_QUESTIONNAIRE_NUMBER':
      case 'INVALID_MEMBER_DATA':
        return false; // These require user correction
      
      default:
        return false;
    }
  }
  
  return true; // Unknown errors might be retryable
}
