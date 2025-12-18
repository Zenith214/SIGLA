/**
 * Questionnaire ID Parser Utility
 * 
 * Handles parsing and validation of questionnaire IDs in the format:
 * YYYY-BB-SS-QQQ
 * 
 * Example: 2026-18-01-001
 * - YYYY: Year (2026)
 * - BB: Barangay ID (18)
 * - SS: Spot number (01)
 * - QQQ: Questionnaire number (001)
 */

export interface ParsedQuestionnaireId {
  year: number;
  barangayId: number;
  spotNumber: number;
  questionnaireNumber: number;
  isValid: boolean;
  raw: string;
}

/**
 * Parse a questionnaire ID into its components
 * 
 * @param questionnaireId - The questionnaire ID to parse (e.g., "2026-18-01-001")
 * @returns Parsed components with validation status
 */
export function parseQuestionnaireId(questionnaireId: string): ParsedQuestionnaireId {
  const result: ParsedQuestionnaireId = {
    year: 0,
    barangayId: 0,
    spotNumber: 0,
    questionnaireNumber: 0,
    isValid: false,
    raw: questionnaireId
  };

  if (!questionnaireId || typeof questionnaireId !== 'string') {
    return result;
  }

  const parts = questionnaireId.split('-');

  // Must have exactly 4 parts
  if (parts.length !== 4) {
    console.warn(`Invalid questionnaire ID format: ${questionnaireId}. Expected YYYY-BB-SS-QQQ`);
    return result;
  }

  const [yearStr, barangayIdStr, spotNumberStr, questionnaireNumberStr] = parts;

  // Parse each component
  const year = parseInt(yearStr, 10);
  const barangayId = parseInt(barangayIdStr, 10);
  const spotNumber = parseInt(spotNumberStr, 10);
  const questionnaireNumber = parseInt(questionnaireNumberStr, 10);

  // Validate all components are valid numbers
  if (isNaN(year) || isNaN(barangayId) || isNaN(spotNumber) || isNaN(questionnaireNumber)) {
    console.warn(`Invalid numeric values in questionnaire ID: ${questionnaireId}`);
    return result;
  }

  // Validate ranges
  if (year < 2000 || year > 2100) {
    console.warn(`Invalid year in questionnaire ID: ${year}`);
    return result;
  }

  if (barangayId < 1) {
    console.warn(`Invalid barangay ID in questionnaire ID: ${barangayId}`);
    return result;
  }

  if (spotNumber < 0) {
    console.warn(`Invalid spot number in questionnaire ID: ${spotNumber}`);
    return result;
  }

  if (questionnaireNumber < 1) {
    console.warn(`Invalid questionnaire number in questionnaire ID: ${questionnaireNumber}`);
    return result;
  }

  // All validations passed
  return {
    year,
    barangayId,
    spotNumber,
    questionnaireNumber,
    isValid: true,
    raw: questionnaireId
  };
}

/**
 * Get the required gender for a questionnaire based on its number
 * Odd numbers = Male, Even numbers = Female
 * 
 * @param questionnaireId - The questionnaire ID or number
 * @returns "Male" or "Female"
 */
export function getRequiredGender(questionnaireId: string | number): "Male" | "Female" {
  let questionnaireNumber: number;

  if (typeof questionnaireId === 'string') {
    const parsed = parseQuestionnaireId(questionnaireId);
    if (!parsed.isValid) {
      console.warn(`Could not determine gender for invalid questionnaire ID: ${questionnaireId}`);
      return "Male"; // Default fallback
    }
    questionnaireNumber = parsed.questionnaireNumber;
  } else {
    questionnaireNumber = questionnaireId;
  }

  return questionnaireNumber % 2 === 1 ? "Male" : "Female";
}

/**
 * Check if a questionnaire ID is from a spot (spot number > 0) or generated on-the-fly (spot number = 0)
 * 
 * @param questionnaireId - The questionnaire ID to check
 * @returns true if from a spot, false if generated on-the-fly
 */
export function isSpotQuestionnaire(questionnaireId: string): boolean {
  const parsed = parseQuestionnaireId(questionnaireId);
  return parsed.isValid && parsed.spotNumber > 0;
}

/**
 * Format components into a questionnaire ID
 * 
 * @param year - Year (e.g., 2026)
 * @param barangayId - Barangay ID (e.g., 18)
 * @param spotNumber - Spot number (e.g., 1)
 * @param questionnaireNumber - Questionnaire number (e.g., 1)
 * @returns Formatted questionnaire ID (e.g., "2026-18-01-001")
 */
export function formatQuestionnaireId(
  year: number,
  barangayId: number,
  spotNumber: number,
  questionnaireNumber: number
): string {
  const spotPart = String(spotNumber).padStart(2, '0');
  const questionnairePart = String(questionnaireNumber).padStart(3, '0');
  return `${year}-${barangayId}-${spotPart}-${questionnairePart}`;
}

/**
 * Validate a questionnaire ID format
 * 
 * @param questionnaireId - The questionnaire ID to validate
 * @returns true if valid format, false otherwise
 */
export function isValidQuestionnaireId(questionnaireId: string): boolean {
  const parsed = parseQuestionnaireId(questionnaireId);
  return parsed.isValid;
}

/**
 * Get a human-readable description of a questionnaire ID
 * 
 * @param questionnaireId - The questionnaire ID
 * @returns Human-readable description
 */
export function describeQuestionnaireId(questionnaireId: string): string {
  const parsed = parseQuestionnaireId(questionnaireId);
  
  if (!parsed.isValid) {
    return `Invalid questionnaire ID: ${questionnaireId}`;
  }

  const gender = getRequiredGender(questionnaireId);
  const spotType = parsed.spotNumber === 0 ? 'On-the-fly' : `Spot ${parsed.spotNumber}`;
  
  return `Year ${parsed.year}, Barangay ${parsed.barangayId}, ${spotType}, Questionnaire ${parsed.questionnaireNumber} (${gender})`;
}
