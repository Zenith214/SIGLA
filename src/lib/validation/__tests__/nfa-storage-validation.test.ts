/**
 * Tests for NFA Storage Validation
 * 
 * Requirements:
 * - 3.1: Validate binary answer is stored correctly
 * - 3.2: Validate suggestion text is stored correctly
 * - 3.3: Validate both fields are present in JSONB structure
 */

import {
  isValidBinaryValue,
  validateNFAFieldPair,
  validateSectionNFAData,
  validateSurveyNFAData,
  sanitizeNFAData,
  VALID_BINARY_VALUES
} from '../nfa-storage-validation';

describe('NFA Storage Validation', () => {
  describe('isValidBinaryValue', () => {
    it('should accept valid English binary values', () => {
      expect(isValidBinaryValue('Yes')).toBe(true);
      expect(isValidBinaryValue('No')).toBe(true);
    });

    it('should accept valid Tagalog binary values', () => {
      expect(isValidBinaryValue('Oo')).toBe(true);
      expect(isValidBinaryValue('Hindi')).toBe(true);
    });

    it('should reject invalid binary values', () => {
      expect(isValidBinaryValue('yes')).toBe(false); // lowercase
      expect(isValidBinaryValue('YES')).toBe(false); // uppercase
      expect(isValidBinaryValue('Maybe')).toBe(false);
      expect(isValidBinaryValue('')).toBe(false);
      expect(isValidBinaryValue(null)).toBe(false);
      expect(isValidBinaryValue(undefined)).toBe(false);
      expect(isValidBinaryValue(123)).toBe(false);
      expect(isValidBinaryValue(true)).toBe(false);
    });
  });

  describe('validateNFAFieldPair', () => {
    it('should pass validation when both fields are present and valid', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: 'Need more funding'
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with Tagalog binary values', () => {
      const data = {
        need_for_action_binary_projects: 'Oo',
        need_for_action_suggestion_projects: 'Kailangan ng mas maraming pondo'
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation when binary is No and suggestion is null', () => {
      const data = {
        need_for_action_binary_projects: 'No',
        need_for_action_suggestion_projects: null
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when binary field is missing', () => {
      const data = {
        need_for_action_suggestion_projects: 'Some suggestion'
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Missing binary field 'need_for_action_binary_projects' for indicator 'projects'"
      );
    });

    it('should fail validation when suggestion field is missing', () => {
      const data = {
        need_for_action_binary_projects: 'Yes'
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Missing suggestion field 'need_for_action_suggestion_projects' for indicator 'projects'"
      );
    });

    it('should fail validation with invalid binary value', () => {
      const data = {
        need_for_action_binary_projects: 'Maybe',
        need_for_action_suggestion_projects: 'Some suggestion'
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid binary value');
      expect(result.errors[0]).toContain('Maybe');
    });

    it('should fail validation with invalid suggestion type', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: 123 // Should be string or null
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid suggestion value type');
    });

    it('should warn when binary is Yes but suggestion is empty', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: ''
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(true); // Still valid, but with warning
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      expect(result.warnings![0]).toContain('suggestion is empty');
    });

    it('should return warning when both fields are missing', () => {
      const data = {
        some_other_field: 'value'
      };

      const result = validateNFAFieldPair('projects', data);
      expect(result.valid).toBe(true); // Valid because section might be incomplete
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('are missing');
    });
  });

  describe('validateSectionNFAData', () => {
    it('should validate all indicators in financial section', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: 'Need improvement',
        need_for_action_binary_financial: 'No',
        need_for_action_suggestion_financial: null,
        need_for_action_binary_socialPrograms: 'Yes',
        need_for_action_suggestion_socialPrograms: 'More programs needed',
        need_for_action_binary_corruption: 'No',
        need_for_action_suggestion_corruption: null
      };

      const result = validateSectionNFAData('financial', data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors from multiple indicators', () => {
      const data = {
        need_for_action_binary_projects: 'Invalid',
        need_for_action_suggestion_projects: 'Some text',
        need_for_action_binary_financial: 'Yes',
        // Missing suggestion for financial
      };

      const result = validateSectionNFAData('financial', data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should return valid for sections with no NFA fields', () => {
      const data = {
        some_other_field: 'value'
      };

      const result = validateSectionNFAData('overall', data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateSurveyNFAData', () => {
    it('should validate complete survey with all sections', () => {
      const sections = {
        financial: {
          data: {
            need_for_action_binary_projects: 'Yes',
            need_for_action_suggestion_projects: 'Need improvement',
            need_for_action_binary_financial: 'No',
            need_for_action_suggestion_financial: null,
            need_for_action_binary_socialPrograms: 'Yes',
            need_for_action_suggestion_socialPrograms: 'More programs',
            need_for_action_binary_corruption: 'No',
            need_for_action_suggestion_corruption: null
          }
        },
        disaster: {
          data: {
            need_for_action_binary_disasterInfo: 'Yes',
            need_for_action_suggestion_disasterInfo: 'Better communication',
            need_for_action_binary_evacuation: 'No',
            need_for_action_suggestion_evacuation: null
          }
        }
      };

      const result = validateSurveyNFAData(sections);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle sections without nested data property', () => {
      const sections = {
        financial: {
          need_for_action_binary_projects: 'Yes',
          need_for_action_suggestion_projects: 'Need improvement'
        }
      };

      const result = validateSurveyNFAData(sections);
      expect(result.valid).toBe(true);
    });

    it('should fail validation with invalid sections structure', () => {
      const result = validateSurveyNFAData(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid sections data');
    });

    it('should collect errors from multiple sections', () => {
      const sections = {
        financial: {
          data: {
            need_for_action_binary_projects: 'Invalid',
            need_for_action_suggestion_projects: 'text'
          }
        },
        disaster: {
          data: {
            need_for_action_binary_disasterInfo: 'Yes'
            // Missing suggestion
          }
        }
      };

      const result = validateSurveyNFAData(sections);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should collect warnings from multiple sections', () => {
      const sections = {
        financial: {
          data: {
            need_for_action_binary_projects: 'Yes',
            need_for_action_suggestion_projects: '' // Empty suggestion with Yes
          }
        },
        disaster: {
          data: {
            need_for_action_binary_disasterInfo: 'Oo',
            need_for_action_suggestion_disasterInfo: '   ' // Whitespace only
          }
        }
      };

      const result = validateSurveyNFAData(sections);
      expect(result.valid).toBe(true); // Valid but with warnings
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeNFAData', () => {
    it('should remove invalid binary values', () => {
      const data = {
        need_for_action_binary_projects: 'Invalid',
        need_for_action_suggestion_projects: 'Some text',
        other_field: 'value'
      };

      const sanitized = sanitizeNFAData(data);
      expect(sanitized.need_for_action_binary_projects).toBeUndefined();
      expect(sanitized.need_for_action_suggestion_projects).toBe('Some text');
      expect(sanitized.other_field).toBe('value');
    });

    it('should keep valid binary values', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: 'Some text'
      };

      const sanitized = sanitizeNFAData(data);
      expect(sanitized.need_for_action_binary_projects).toBe('Yes');
      expect(sanitized.need_for_action_suggestion_projects).toBe('Some text');
    });

    it('should convert non-string suggestions to string or null', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: 123
      };

      const sanitized = sanitizeNFAData(data);
      expect(sanitized.need_for_action_suggestion_projects).toBe('123');
    });

    it('should not modify other fields', () => {
      const data = {
        need_for_action_binary_projects: 'Yes',
        need_for_action_suggestion_projects: 'text',
        satisfaction_rating: 5,
        awareness: 'Oo'
      };

      const sanitized = sanitizeNFAData(data);
      expect(sanitized.satisfaction_rating).toBe(5);
      expect(sanitized.awareness).toBe('Oo');
    });
  });
});
