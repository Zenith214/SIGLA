/**
 * Validation utilities index
 * 
 * Exports all validation functions and types for easy importing
 */

export {
  validateSuggestionField,
  validateBinaryAnswer,
  validateNFAData,
  isBinaryYes,
  isBinaryNo,
  isSuggestionRequired,
  getSuggestionRequiredStatus,
  type ValidationResult,
  type BinaryAnswer,
} from './nfa-validation';
