/**
 * Need for Action (NFA) Validation Utilities
 * 
 * This module provides validation functions for the binary Need for Action feature,
 * including conditional validation logic based on binary answers.
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Binary answer type (supports both English and Tagalog)
 */
export type BinaryAnswer = 'Yes' | 'No' | 'Oo' | 'Hindi';

/**
 * Check if a binary answer is "Yes" (in any language)
 * @param answer - The binary answer to check
 * @returns True if the answer is "Yes" or "Oo"
 */
export function isBinaryYes(answer: BinaryAnswer | string | null | undefined): boolean {
  if (!answer) return false;
  return answer === 'Yes' || answer === 'Oo';
}

/**
 * Check if a binary answer is "No" (in any language)
 * @param answer - The binary answer to check
 * @returns True if the answer is "No" or "Hindi"
 */
export function isBinaryNo(answer: BinaryAnswer | string | null | undefined): boolean {
  if (!answer) return false;
  return answer === 'No' || answer === 'Hindi';
}

/**
 * Validate that a binary answer is provided and is valid
 * 
 * Requirements:
 * - 1.3: Binary question is always required
 * 
 * @param answer - The binary answer to validate
 * @returns Validation result with user-friendly error message
 */
export function validateBinaryAnswer(answer: string | null | undefined): ValidationResult {
  // Requirement 1.3: Binary question must be answered
  if (!answer || answer.trim() === '') {
    return {
      valid: false,
      error: 'Please indicate whether this service needs improvement'
    };
  }

  // Validate that the answer is one of the valid options
  if (!isBinaryYes(answer) && !isBinaryNo(answer)) {
    return {
      valid: false,
      error: 'Please select a valid option (Yes/No or Oo/Hindi)'
    };
  }

  return { valid: true };
}

/**
 * Validate suggestion field based on binary answer
 * 
 * Requirements:
 * - 1.4: When binary is "Yes", suggestion must be non-empty
 * - 1.5: When binary is "No", suggestion is optional
 * - 6.4: Validation checks current state of binary answer
 * - 6.5: Whitespace-only suggestions are invalid when binary is "Yes"
 * 
 * @param binaryAnswer - The binary answer ('Yes'/'No' or 'Oo'/'Hindi')
 * @param suggestionText - The suggestion text to validate
 * @returns Validation result with valid flag and optional error message
 */
export function validateSuggestionField(
  binaryAnswer: BinaryAnswer | string | null | undefined,
  suggestionText: string | null | undefined
): ValidationResult {
  // Requirement 6.4: Check current state of binary answer
  // If binary answer is "Yes" or "Oo", suggestion is required
  if (isBinaryYes(binaryAnswer)) {
    // Requirement 1.4 & 6.5: Check if suggestion is empty or contains only whitespace
    if (!suggestionText || suggestionText.trim() === '') {
      return {
        valid: false,
        error: 'Please provide specific comments or suggestions for improvement'
      };
    }
    // Suggestion has content, validation passes
    return { valid: true };
  }

  // Requirement 1.5: If binary answer is "No" or "Hindi", suggestion is optional
  if (isBinaryNo(binaryAnswer)) {
    // Suggestion can be empty or have content, both are valid
    return { valid: true };
  }

  // Handle form state inconsistency gracefully
  // If binary answer is not provided or invalid, we can't validate the suggestion
  // This case should be caught by validateBinaryAnswer first
  return {
    valid: false,
    error: 'Please answer the previous question first'
  };
}

/**
 * Check if suggestion field is required based on binary answer
 * 
 * This function can be used for dynamic required attribute logic
 * 
 * @param binaryAnswer - The binary answer
 * @returns True if suggestion is required, false otherwise
 */
export function isSuggestionRequired(
  binaryAnswer: BinaryAnswer | string | null | undefined
): boolean {
  return isBinaryYes(binaryAnswer);
}

/**
 * Validate complete NFA data for a service indicator
 * 
 * Requirements:
 * - 1.3: Binary question is always required
 * - 1.4: Suggestion required when binary is "Yes"
 * - 1.5: Suggestion optional when binary is "No"
 * 
 * @param binaryAnswer - The binary answer
 * @param suggestionText - The suggestion text
 * @returns Validation result
 */
export function validateNFAData(
  binaryAnswer: BinaryAnswer | string | null | undefined,
  suggestionText: string | null | undefined
): ValidationResult {
  // First, validate the binary answer (always required)
  const binaryValidation = validateBinaryAnswer(binaryAnswer);
  if (!binaryValidation.valid) {
    return binaryValidation;
  }

  // Then, validate the suggestion field based on the binary answer
  const suggestionValidation = validateSuggestionField(binaryAnswer, suggestionText);
  if (!suggestionValidation.valid) {
    return suggestionValidation;
  }

  return { valid: true };
}

/**
 * Get the required status for a suggestion field based on form data
 * 
 * This function can be used as a callback for conditional required logic
 * 
 * @param formData - The form data object
 * @param binaryFieldId - The ID of the binary field to check
 * @returns True if suggestion is required, false otherwise
 */
export function getSuggestionRequiredStatus(
  formData: Record<string, any>,
  binaryFieldId: string
): boolean {
  const binaryAnswer = formData[binaryFieldId];
  return isSuggestionRequired(binaryAnswer);
}
