/**
 * Need for Action (NFA) Data Storage Validation
 * 
 * This module provides validation functions for NFA data before storage,
 * ensuring data structure completeness and binary value validity.
 * 
 * Requirements:
 * - 3.1: Validate binary answer is stored correctly
 * - 3.2: Validate suggestion text is stored correctly
 * - 3.3: Validate both fields are present in JSONB structure
 */

import { isBinaryYes, isBinaryNo } from './nfa-validation';

/**
 * Storage validation result interface
 */
export interface StorageValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Valid binary values (English and Tagalog)
 */
export const VALID_BINARY_VALUES = ['Yes', 'No', 'Oo', 'Hindi'] as const;
export type ValidBinaryValue = typeof VALID_BINARY_VALUES[number];

/**
 * Service indicator IDs that should have NFA fields
 */
export const SERVICE_INDICATORS = [
  'projects',
  'financial',
  'socialPrograms',
  'corruption',
  'disasterInfo',
  'evacuation',
  'tanods',
  'lupon',
  'antiDrug',
  'healthServices',
  'womenChildrenProtection',
  'communityParticipation',
  'businessClearance',
  'wasteManagement'
] as const;

/**
 * Check if a value is a valid binary answer
 * 
 * Requirement 3.1, 3.2: Binary values must be "Yes"/"No" or "Oo"/"Hindi"
 * 
 * @param value - The value to check
 * @returns True if the value is a valid binary answer
 */
export function isValidBinaryValue(value: any): value is ValidBinaryValue {
  return typeof value === 'string' && VALID_BINARY_VALUES.includes(value as ValidBinaryValue);
}

/**
 * Validate a single NFA field pair (binary + suggestion)
 * 
 * Requirements:
 * - 3.1: Binary answer must be valid
 * - 3.2: Suggestion text must be string or null
 * - 3.3: Both fields must be present
 * 
 * @param indicatorId - The service indicator ID
 * @param data - The section data object
 * @returns Validation result with errors
 */
export function validateNFAFieldPair(
  indicatorId: string,
  data: Record<string, any>
): StorageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const binaryFieldName = `need_for_action_binary_${indicatorId}`;
  const suggestionFieldName = `need_for_action_suggestion_${indicatorId}`;

  // Requirement 3.3: Check if both fields are present
  const hasBinaryField = binaryFieldName in data;
  const hasSuggestionField = suggestionFieldName in data;

  if (!hasBinaryField && !hasSuggestionField) {
    // Both fields missing - this might be intentional if the section wasn't completed
    warnings.push(`NFA fields for '${indicatorId}' are missing (may be incomplete section)`);
    return { valid: true, errors: [], warnings };
  }

  if (!hasBinaryField) {
    errors.push(`Missing binary field '${binaryFieldName}' for indicator '${indicatorId}'`);
  }

  if (!hasSuggestionField) {
    errors.push(`Missing suggestion field '${suggestionFieldName}' for indicator '${indicatorId}'`);
  }

  // If either field is missing, return early
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Requirement 3.1: Validate binary value
  const binaryValue = data[binaryFieldName];
  if (!isValidBinaryValue(binaryValue)) {
    errors.push(
      `Invalid binary value '${binaryValue}' for '${binaryFieldName}'. ` +
      `Must be one of: ${VALID_BINARY_VALUES.join(', ')}`
    );
  }

  // Requirement 3.2: Validate suggestion field type
  const suggestionValue = data[suggestionFieldName];
  if (suggestionValue !== null && typeof suggestionValue !== 'string') {
    errors.push(
      `Invalid suggestion value type for '${suggestionFieldName}'. ` +
      `Must be string or null, got ${typeof suggestionValue}`
    );
  }

  // Additional validation: Check logical consistency
  if (isValidBinaryValue(binaryValue) && isBinaryYes(binaryValue)) {
    // Only check for empty suggestion if it's a valid string type
    if (typeof suggestionValue === 'string' && suggestionValue.trim() === '') {
      warnings.push(
        `Binary answer is 'Yes' for '${indicatorId}' but suggestion is empty. ` +
        `This may indicate incomplete data.`
      );
    } else if (!suggestionValue) {
      warnings.push(
        `Binary answer is 'Yes' for '${indicatorId}' but suggestion is empty. ` +
        `This may indicate incomplete data.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validate NFA data structure completeness for a section
 * 
 * Requirement 3.3: Validate both fields are present in JSONB structure
 * 
 * @param sectionKey - The section key (e.g., 'financial', 'disaster')
 * @param sectionData - The section data object
 * @returns Validation result with all errors and warnings
 */
export function validateSectionNFAData(
  sectionKey: string,
  sectionData: Record<string, any>
): StorageValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Get relevant indicators for this section
  const sectionIndicators = getSectionIndicators(sectionKey);

  if (sectionIndicators.length === 0) {
    // No NFA fields expected for this section
    return { valid: true, errors: [] };
  }

  // Validate each indicator's NFA fields
  for (const indicatorId of sectionIndicators) {
    const result = validateNFAFieldPair(indicatorId, sectionData);
    allErrors.push(...result.errors);
    if (result.warnings) {
      allWarnings.push(...result.warnings);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  };
}

/**
 * Validate complete survey response NFA data
 * 
 * Requirements:
 * - 3.1: Binary values are valid
 * - 3.2: Suggestion values are valid
 * - 3.3: Data structure is complete
 * 
 * @param sections - The sections object from survey response
 * @returns Validation result with all errors and warnings
 */
export function validateSurveyNFAData(
  sections: Record<string, any>
): StorageValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!sections || typeof sections !== 'object') {
    return {
      valid: false,
      errors: ['Invalid sections data: must be an object']
    };
  }

  // Validate each section
  for (const [sectionKey, sectionData] of Object.entries(sections)) {
    // Skip if section data is not valid
    if (!sectionData || typeof sectionData !== 'object') {
      continue;
    }

    // Extract the actual data object (handle both direct data and nested structure)
    const data = 'data' in sectionData ? sectionData.data : sectionData;
    
    if (!data || typeof data !== 'object') {
      continue;
    }

    const result = validateSectionNFAData(sectionKey, data);
    allErrors.push(...result.errors);
    if (result.warnings) {
      allWarnings.push(...result.warnings);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  };
}

/**
 * Get service indicators for a given section
 * 
 * @param sectionKey - The section key
 * @returns Array of indicator IDs for that section
 */
function getSectionIndicators(sectionKey: string): string[] {
  const sectionMap: Record<string, string[]> = {
    financial: ['projects', 'financial', 'socialPrograms', 'corruption'],
    disaster: ['disasterInfo', 'evacuation'],
    safety: ['tanods', 'lupon', 'antiDrug'],
    social: ['healthServices', 'womenChildrenProtection', 'communityParticipation'],
    business: ['businessClearance'],
    environmental: ['wasteManagement']
  };

  return sectionMap[sectionKey] || [];
}

/**
 * Sanitize NFA data by removing invalid values
 * 
 * This function can be used to clean data before storage if needed
 * 
 * @param data - The data object to sanitize
 * @returns Sanitized data object
 */
export function sanitizeNFAData(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    // Check if this is a binary field
    if (key.includes('need_for_action_binary_')) {
      const value = sanitized[key];
      if (!isValidBinaryValue(value)) {
        // Remove invalid binary values
        delete sanitized[key];
      }
    }

    // Check if this is a suggestion field
    if (key.includes('need_for_action_suggestion_')) {
      const value = sanitized[key];
      if (value !== null && typeof value !== 'string') {
        // Convert to string or null
        sanitized[key] = value ? String(value) : null;
      }
    }
  }

  return sanitized;
}
