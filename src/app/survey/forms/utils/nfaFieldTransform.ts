/**
 * NFA Field Transformation Utilities
 * 
 * Transforms NFA field names from the internal format (nfaBinaryProjects, suggestionsProjects)
 * to the standardized database format (need_for_action_binary_projects, need_for_action_suggestion_projects)
 * 
 * Requirements: 2.2, 2.3, 2.4, 3.1, 3.2
 */

/**
 * Mapping of internal NFA binary field names to standardized database field names
 */
const NFA_BINARY_FIELD_MAP: Record<string, string> = {
  // Financial Administration
  nfaBinaryProjects: 'need_for_action_binary_projects',
  nfaBinaryFinancial: 'need_for_action_binary_financial',
  nfaBinarySocialPrograms: 'need_for_action_binary_social_programs',
  nfaBinaryCorruption: 'need_for_action_binary_corruption',
  
  // Disaster Preparedness
  nfaBinaryDisasterInfo: 'need_for_action_binary_disaster_info',
  nfaBinaryEvacuation: 'need_for_action_binary_evacuation',
  
  // Safety & Peace Order
  nfaBinaryTanods: 'need_for_action_binary_tanods',
  nfaBinaryLupon: 'need_for_action_binary_lupon',
  nfaBinaryAntiDrug: 'need_for_action_binary_anti_drug',
  
  // Social Protection
  nfaBinaryHealthServices: 'need_for_action_binary_health_services',
  nfaBinaryWomenChildrenProtection: 'need_for_action_binary_women_children_protection',
  nfaBinaryCommunityParticipation: 'need_for_action_binary_community_participation',
  
  // Business Friendliness
  nfaBinaryBusinessClearance: 'need_for_action_binary_business_clearance',
  
  // Environmental Management
  nfaBinaryWasteManagement: 'need_for_action_binary_waste_management',
};

/**
 * Mapping of internal NFA suggestion field names to standardized database field names
 */
const NFA_SUGGESTION_FIELD_MAP: Record<string, string> = {
  // Financial Administration
  suggestionsProjects: 'need_for_action_suggestion_projects',
  suggestionsFinancial: 'need_for_action_suggestion_financial',
  suggestionsSocialPrograms: 'need_for_action_suggestion_social_programs',
  suggestionsCorruption: 'need_for_action_suggestion_corruption',
  
  // Disaster Preparedness
  suggestionsDisasterInfo: 'need_for_action_suggestion_disaster_info',
  suggestionsEvacuation: 'need_for_action_suggestion_evacuation',
  
  // Safety & Peace Order
  suggestionsTanods: 'need_for_action_suggestion_tanods',
  suggestionsLupon: 'need_for_action_suggestion_lupon',
  suggestionsAntiDrug: 'need_for_action_suggestion_anti_drug',
  
  // Social Protection
  suggestionsHealthServices: 'need_for_action_suggestion_health_services',
  suggestionsWomenChildrenProtection: 'need_for_action_suggestion_women_children_protection',
  suggestionsCommunityParticipation: 'need_for_action_suggestion_community_participation',
  
  // Business Friendliness
  suggestionsBusinessClearance: 'need_for_action_suggestion_business_clearance',
  
  // Environmental Management
  suggestionsWasteManagement: 'need_for_action_suggestion_waste_management',
};

/**
 * Normalizes binary values to a consistent format
 * Handles both English (Yes/No) and Tagalog (Oo/Hindi) values
 * 
 * @param value - The binary value to normalize
 * @returns Normalized value ("Yes" or "No") or the original value if not a binary value
 */
export function normalizeBinaryValue(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }
  
  const normalized = value.trim();
  
  // Handle Tagalog values
  if (normalized === 'Oo') return 'Yes';
  if (normalized === 'Hindi') return 'No';
  
  // Handle English values with parentheses (e.g., "Oo (Yes)")
  if (normalized.includes('(Yes)')) return 'Yes';
  if (normalized.includes('(No)')) return 'No';
  
  // Return as-is if already in English format
  return normalized;
}

/**
 * Validates that a binary value is valid (Yes/No or Oo/Hindi)
 * 
 * @param value - The value to validate
 * @returns true if valid, false otherwise
 */
export function isValidBinaryValue(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  const normalized = value.trim();
  const validValues = ['Yes', 'No', 'Oo', 'Hindi', 'Oo (Yes)', 'Hindi (No)'];
  
  return validValues.includes(normalized);
}

/**
 * Transforms section data by renaming NFA fields to the standardized format
 * 
 * @param sectionData - The raw section data from the form
 * @returns Transformed section data with standardized field names
 */
export function transformNFAFields(sectionData: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(sectionData)) {
    // Transform binary fields
    if (key in NFA_BINARY_FIELD_MAP) {
      const newKey = NFA_BINARY_FIELD_MAP[key];
      transformed[newKey] = normalizeBinaryValue(value);
    }
    // Transform suggestion fields
    else if (key in NFA_SUGGESTION_FIELD_MAP) {
      const newKey = NFA_SUGGESTION_FIELD_MAP[key];
      transformed[newKey] = value;
    }
    // Keep other fields as-is
    else {
      transformed[key] = value;
    }
  }
  
  return transformed;
}

/**
 * Validates NFA field structure in section data
 * Ensures that:
 * - Binary fields have valid values (Yes/No or Oo/Hindi)
 * - If binary is "Yes", suggestion field should not be empty
 * 
 * @param sectionData - The section data to validate
 * @returns Object with isValid flag and array of error messages
 */
export function validateNFAFields(sectionData: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check each binary field
  for (const [internalKey, dbKey] of Object.entries(NFA_BINARY_FIELD_MAP)) {
    const binaryValue = sectionData[internalKey];
    
    // Skip if field doesn't exist (not all sections have all indicators)
    if (binaryValue === undefined || binaryValue === null) {
      continue;
    }
    
    // Validate binary value format
    if (!isValidBinaryValue(binaryValue)) {
      errors.push(`Invalid binary value for ${internalKey}: "${binaryValue}". Expected Yes/No or Oo/Hindi.`);
      continue;
    }
    
    // Check if suggestion is required (when binary is Yes/Oo)
    const normalizedBinary = normalizeBinaryValue(binaryValue);
    if (normalizedBinary === 'Yes') {
      // Find corresponding suggestion field
      const suggestionKey = internalKey.replace('nfaBinary', 'suggestions');
      const suggestionValue = sectionData[suggestionKey];
      
      // Suggestion should not be empty when binary is Yes
      if (!suggestionValue || (typeof suggestionValue === 'string' && suggestionValue.trim() === '')) {
        errors.push(`Suggestion required for ${suggestionKey} when binary answer is "Yes"`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates all sections data structure before submission
 * 
 * @param sections - All sections data
 * @returns Object with isValid flag and array of error messages
 */
export function validateAllSections(sections: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const allErrors: string[] = [];
  
  for (const [sectionKey, sectionData] of Object.entries(sections)) {
    if (sectionData && typeof sectionData === 'object' && 'data' in sectionData) {
      const validation = validateNFAFields(sectionData.data);
      if (!validation.isValid) {
        allErrors.push(`Section ${sectionKey}: ${validation.errors.join(', ')}`);
      }
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
