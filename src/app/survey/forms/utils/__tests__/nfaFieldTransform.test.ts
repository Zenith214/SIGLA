/**
 * Tests for NFA Field Transformation Utilities
 * 
 * Requirements: 2.2, 2.3, 2.4, 3.1, 3.2
 */

import {
  normalizeBinaryValue,
  isValidBinaryValue,
  transformNFAFields,
  validateNFAFields,
  validateAllSections
} from '../nfaFieldTransform';

describe('normalizeBinaryValue', () => {
  it('should normalize Tagalog "Oo" to "Yes"', () => {
    expect(normalizeBinaryValue('Oo')).toBe('Yes');
  });

  it('should normalize Tagalog "Hindi" to "No"', () => {
    expect(normalizeBinaryValue('Hindi')).toBe('No');
  });

  it('should handle English values with parentheses', () => {
    expect(normalizeBinaryValue('Oo (Yes)')).toBe('Yes');
    expect(normalizeBinaryValue('Hindi (No)')).toBe('No');
  });

  it('should return English values as-is', () => {
    expect(normalizeBinaryValue('Yes')).toBe('Yes');
    expect(normalizeBinaryValue('No')).toBe('No');
  });

  it('should return non-string values as-is', () => {
    expect(normalizeBinaryValue(null)).toBe(null);
    expect(normalizeBinaryValue(undefined)).toBe(undefined);
    expect(normalizeBinaryValue(123)).toBe(123);
  });

  it('should handle whitespace', () => {
    expect(normalizeBinaryValue('  Oo  ')).toBe('Yes');
    expect(normalizeBinaryValue('  Hindi  ')).toBe('No');
  });
});

describe('isValidBinaryValue', () => {
  it('should accept valid Tagalog values', () => {
    expect(isValidBinaryValue('Oo')).toBe(true);
    expect(isValidBinaryValue('Hindi')).toBe(true);
  });

  it('should accept valid English values', () => {
    expect(isValidBinaryValue('Yes')).toBe(true);
    expect(isValidBinaryValue('No')).toBe(true);
  });

  it('should accept values with parentheses', () => {
    expect(isValidBinaryValue('Oo (Yes)')).toBe(true);
    expect(isValidBinaryValue('Hindi (No)')).toBe(true);
  });

  it('should reject invalid values', () => {
    expect(isValidBinaryValue('Maybe')).toBe(false);
    expect(isValidBinaryValue('yes')).toBe(false); // case-sensitive
    expect(isValidBinaryValue('')).toBe(false);
    expect(isValidBinaryValue(null)).toBe(false);
    expect(isValidBinaryValue(undefined)).toBe(false);
  });
});

describe('transformNFAFields', () => {
  it('should transform binary field names to standardized format', () => {
    const input = {
      nfaBinaryProjects: 'Oo',
      suggestionsProjects: 'Need more projects',
      otherField: 'value'
    };

    const result = transformNFAFields(input);

    expect(result).toEqual({
      need_for_action_binary_projects: 'Yes', // Normalized
      need_for_action_suggestion_projects: 'Need more projects',
      otherField: 'value'
    });
  });

  it('should transform all financial section fields', () => {
    const input = {
      nfaBinaryProjects: 'Oo',
      suggestionsProjects: 'More projects',
      nfaBinaryFinancial: 'Hindi',
      suggestionsFinancial: '',
      nfaBinarySocialPrograms: 'Yes',
      suggestionsSocialPrograms: 'Better programs',
      nfaBinaryCorruption: 'No',
      suggestionsCorruption: null
    };

    const result = transformNFAFields(input);

    expect(result).toEqual({
      need_for_action_binary_projects: 'Yes',
      need_for_action_suggestion_projects: 'More projects',
      need_for_action_binary_financial: 'No',
      need_for_action_suggestion_financial: '',
      need_for_action_binary_social_programs: 'Yes',
      need_for_action_suggestion_social_programs: 'Better programs',
      need_for_action_binary_corruption: 'No',
      need_for_action_suggestion_corruption: null
    });
  });

  it('should transform disaster section fields', () => {
    const input = {
      nfaBinaryDisasterInfo: 'Yes',
      suggestionsDisasterInfo: 'Better info',
      nfaBinaryEvacuation: 'No',
      suggestionsEvacuation: ''
    };

    const result = transformNFAFields(input);

    expect(result).toEqual({
      need_for_action_binary_disaster_info: 'Yes',
      need_for_action_suggestion_disaster_info: 'Better info',
      need_for_action_binary_evacuation: 'No',
      need_for_action_suggestion_evacuation: ''
    });
  });

  it('should transform safety section fields', () => {
    const input = {
      nfaBinaryTanods: 'Oo',
      suggestionsTanods: 'More patrols',
      nfaBinaryLupon: 'Hindi',
      suggestionsLupon: '',
      nfaBinaryAntiDrug: 'Yes',
      suggestionsAntiDrug: 'Better programs'
    };

    const result = transformNFAFields(input);

    expect(result).toEqual({
      need_for_action_binary_tanods: 'Yes',
      need_for_action_suggestion_tanods: 'More patrols',
      need_for_action_binary_lupon: 'No',
      need_for_action_suggestion_lupon: '',
      need_for_action_binary_anti_drug: 'Yes',
      need_for_action_suggestion_anti_drug: 'Better programs'
    });
  });

  it('should keep non-NFA fields unchanged', () => {
    const input = {
      awarenessProjects: 'Oo',
      satisfactionProjects: '4',
      nfaBinaryProjects: 'Yes',
      suggestionsProjects: 'Test'
    };

    const result = transformNFAFields(input);

    expect(result).toEqual({
      awarenessProjects: 'Oo',
      satisfactionProjects: '4',
      need_for_action_binary_projects: 'Yes',
      need_for_action_suggestion_projects: 'Test'
    });
  });
});

describe('validateNFAFields', () => {
  it('should pass validation for valid data with Yes and suggestion', () => {
    const data = {
      nfaBinaryProjects: 'Yes',
      suggestionsProjects: 'Need more projects'
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should pass validation for valid data with No and empty suggestion', () => {
    const data = {
      nfaBinaryProjects: 'No',
      suggestionsProjects: ''
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should pass validation for Tagalog values', () => {
    const data = {
      nfaBinaryProjects: 'Oo',
      suggestionsProjects: 'Kailangan ng mas maraming proyekto'
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should fail validation for invalid binary value', () => {
    const data = {
      nfaBinaryProjects: 'Maybe',
      suggestionsProjects: 'Test'
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Invalid binary value');
  });

  it('should fail validation when Yes has empty suggestion', () => {
    const data = {
      nfaBinaryProjects: 'Yes',
      suggestionsProjects: ''
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Suggestion required');
  });

  it('should fail validation when Oo has whitespace-only suggestion', () => {
    const data = {
      nfaBinaryProjects: 'Oo',
      suggestionsProjects: '   '
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Suggestion required');
  });

  it('should skip validation for undefined fields', () => {
    const data = {
      otherField: 'value'
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate multiple indicators in one section', () => {
    const data = {
      nfaBinaryProjects: 'Yes',
      suggestionsProjects: 'Good suggestion',
      nfaBinaryFinancial: 'No',
      suggestionsFinancial: '',
      nfaBinarySocialPrograms: 'Yes',
      suggestionsSocialPrograms: '' // Invalid: Yes with empty suggestion
    };

    const result = validateNFAFields(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('suggestionsSocialPrograms');
  });
});

describe('validateAllSections', () => {
  it('should validate all sections successfully', () => {
    const sections = {
      financial: {
        data: {
          nfaBinaryProjects: 'Yes',
          suggestionsProjects: 'Good'
        }
      },
      disaster: {
        data: {
          nfaBinaryDisasterInfo: 'No',
          suggestionsDisasterInfo: ''
        }
      }
    };

    const result = validateAllSections(sections);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should collect errors from multiple sections', () => {
    const sections = {
      financial: {
        data: {
          nfaBinaryProjects: 'Yes',
          suggestionsProjects: '' // Invalid
        }
      },
      disaster: {
        data: {
          nfaBinaryDisasterInfo: 'Maybe', // Invalid
          suggestionsDisasterInfo: 'Test'
        }
      }
    };

    const result = validateAllSections(sections);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain('financial');
    expect(result.errors[1]).toContain('disaster');
  });

  it('should handle sections without data property', () => {
    const sections = {
      financial: {
        someOtherProperty: 'value'
      }
    };

    const result = validateAllSections(sections);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
