/**
 * Display ID Calculator Utility
 * 
 * Calculates a simple sequential display_id (1-150) from a hierarchical full_id.
 * The display_id is shown to users for improved usability, while the full_id
 * remains the authoritative database identifier.
 * 
 * Formula: display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number
 * 
 * Examples:
 * - Spot 1, Questionnaire 1 → display_id = 1
 * - Spot 2, Questionnaire 1 → display_id = 6
 * - Spot 30, Questionnaire 5 → display_id = 150
 */

import { parseQuestionnaireId, type ParsedQuestionnaireId } from './questionnaireIdParser';

/**
 * Parsed full_id components for display ID calculation
 */
export interface ParsedFullId {
  year: number;
  barangay_id: number;
  spot_number: number;
  questionnaire_number: number;
}

/**
 * Parse a full_id into its components
 * 
 * @param full_id - Hierarchical questionnaire ID (YYYY-BB-SS-QQQ)
 * @returns Parsed components or null if invalid
 */
export function parseFullId(full_id: string): ParsedFullId | null {
  const parsed = parseQuestionnaireId(full_id);
  
  if (!parsed.isValid) {
    return null;
  }
  
  return {
    year: parsed.year,
    barangay_id: parsed.barangayId,
    spot_number: parsed.spotNumber,
    questionnaire_number: parsed.questionnaireNumber
  };
}

/**
 * Calculate display_id from full_id
 * 
 * Formula: display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number
 * 
 * @param full_id - Hierarchical questionnaire ID (YYYY-BB-SS-QQQ)
 * @returns display_id (1-150) or null if invalid
 * 
 * @example
 * calculateDisplayId("2025-10-01-001") // Returns 1
 * calculateDisplayId("2025-10-02-001") // Returns 6
 * calculateDisplayId("2025-10-30-005") // Returns 150
 * calculateDisplayId("2025-10-00-001") // Returns null (on-the-fly questionnaire)
 * calculateDisplayId("invalid") // Returns null
 */
export function calculateDisplayId(full_id: string): number | null {
  // Validate input
  if (!full_id || typeof full_id !== 'string') {
    console.warn('Invalid full_id: null or non-string');
    return null;
  }
  
  // Parse using existing utility
  const parsed = parseQuestionnaireId(full_id);
  
  if (!parsed.isValid) {
    console.warn(`Invalid full_id format: ${full_id}`);
    return null;
  }
  
  // Handle on-the-fly questionnaires (spot_number = 0)
  if (parsed.spotNumber === 0) {
    console.info(`On-the-fly questionnaire detected: ${full_id}`);
    return null;
  }
  
  // Calculate display_id using the formula
  const display_id = ((parsed.spotNumber - 1) * 5) + parsed.questionnaireNumber;
  
  // Log warning if out of expected range (1-150) but still return the value
  if (display_id < 1 || display_id > 150) {
    console.warn(`Display ID out of expected range (1-150): ${display_id} for ${full_id}`);
  }
  
  return display_id;
}
