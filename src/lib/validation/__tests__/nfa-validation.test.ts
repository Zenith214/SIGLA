/**
 * Tests for Need for Action (NFA) validation utilities
 * 
 * These tests verify the conditional validation logic for the binary Need for Action feature.
 * Requirements: 1.3, 1.4, 1.5, 6.4, 6.5
 */

import {
  validateSuggestionField,
  validateBinaryAnswer,
  validateNFAData,
  isBinaryYes,
  isBinaryNo,
  isSuggestionRequired,
  getSuggestionRequiredStatus,
  type ValidationResult,
  type BinaryAnswer,
} from '../nfa-validation';

describe('isBinaryYes', () => {
  it('should return true for "Yes"', () => {
    expect(isBinaryYes('Yes')).toBe(true);
  });

  it('should return true for "Oo"', () => {
    expect(isBinaryYes('Oo')).toBe(true);
  });

  it('should return false for "No"', () => {
    expect(isBinaryYes('No')).toBe(false);
  });

  it('should return false for "Hindi"', () => {
    expect(isBinaryYes('Hindi')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBinaryYes(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBinaryYes(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isBinaryYes('')).toBe(false);
  });
});

describe('isBinaryNo', () => {
  it('should return true for "No"', () => {
    expect(isBinaryNo('No')).toBe(true);
  });

  it('should return true for "Hindi"', () => {
    expect(isBinaryNo('Hindi')).toBe(true);
  });

  it('should return false for "Yes"', () => {
    expect(isBinaryNo('Yes')).toBe(false);
  });

  it('should return false for "Oo"', () => {
    expect(isBinaryNo('Oo')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBinaryNo(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBinaryNo(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isBinaryNo('')).toBe(false);
  });
});

describe('validateBinaryAnswer', () => {
  // Requirement 1.3: Binary question is always required
  it('should fail validation when binary answer is null', () => {
    const result = validateBinaryAnswer(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('indicate whether this service needs improvement');
  });

  it('should fail validation when binary answer is undefined', () => {
    const result = validateBinaryAnswer(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('indicate whether this service needs improvement');
  });

  it('should fail validation when binary answer is empty string', () => {
    const result = validateBinaryAnswer('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('indicate whether this service needs improvement');
  });

  it('should fail validation when binary answer is whitespace only', () => {
    const result = validateBinaryAnswer('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('indicate whether this service needs improvement');
  });

  it('should pass validation for "Yes"', () => {
    const result = validateBinaryAnswer('Yes');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should pass validation for "No"', () => {
    const result = validateBinaryAnswer('No');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should pass validation for "Oo"', () => {
    const result = validateBinaryAnswer('Oo');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should pass validation for "Hindi"', () => {
    const result = validateBinaryAnswer('Hindi');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid binary value', () => {
    const result = validateBinaryAnswer('Maybe');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Please select a valid option');
  });
});

describe('validateSuggestionField', () => {
  // Requirement 1.4: When binary is "Yes", suggestion must be non-empty
  describe('when binary answer is "Yes"', () => {
    it('should fail validation when suggestion is empty', () => {
      const result = validateSuggestionField('Yes', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    it('should fail validation when suggestion is null', () => {
      const result = validateSuggestionField('Yes', null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    it('should fail validation when suggestion is undefined', () => {
      const result = validateSuggestionField('Yes', undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    // Requirement 6.5: Whitespace-only suggestions are invalid when binary is "Yes"
    it('should fail validation when suggestion is whitespace only', () => {
      const result = validateSuggestionField('Yes', '   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    it('should fail validation when suggestion is tabs and newlines', () => {
      const result = validateSuggestionField('Yes', '\t\n  \n');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    it('should pass validation when suggestion has content', () => {
      const result = validateSuggestionField('Yes', 'Need more training');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion has content with leading/trailing spaces', () => {
      const result = validateSuggestionField('Yes', '  Need more training  ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // Requirement 1.4: When binary is "Oo" (Tagalog "Yes"), suggestion must be non-empty
  describe('when binary answer is "Oo"', () => {
    it('should fail validation when suggestion is empty', () => {
      const result = validateSuggestionField('Oo', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    it('should fail validation when suggestion is whitespace only', () => {
      const result = validateSuggestionField('Oo', '   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('provide specific comments or suggestions');
    });

    it('should pass validation when suggestion has content', () => {
      const result = validateSuggestionField('Oo', 'Kailangan ng mas maraming pagsasanay');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // Requirement 1.5: When binary is "No", suggestion is optional
  describe('when binary answer is "No"', () => {
    it('should pass validation when suggestion is empty', () => {
      const result = validateSuggestionField('No', '');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion is null', () => {
      const result = validateSuggestionField('No', null);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion is undefined', () => {
      const result = validateSuggestionField('No', undefined);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion is whitespace only', () => {
      const result = validateSuggestionField('No', '   ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion has content', () => {
      const result = validateSuggestionField('No', 'Service is generally good');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // Requirement 1.5: When binary is "Hindi" (Tagalog "No"), suggestion is optional
  describe('when binary answer is "Hindi"', () => {
    it('should pass validation when suggestion is empty', () => {
      const result = validateSuggestionField('Hindi', '');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion is null', () => {
      const result = validateSuggestionField('Hindi', null);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation when suggestion has content', () => {
      const result = validateSuggestionField('Hindi', 'Mabuti ang serbisyo');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // Requirement 6.4: Validation checks current state of binary answer
  describe('when binary answer is invalid or missing', () => {
    it('should fail validation when binary answer is null', () => {
      const result = validateSuggestionField(null, 'Some suggestion');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Please answer the previous question first');
    });

    it('should fail validation when binary answer is undefined', () => {
      const result = validateSuggestionField(undefined, 'Some suggestion');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Please answer the previous question first');
    });

    it('should fail validation when binary answer is empty string', () => {
      const result = validateSuggestionField('', 'Some suggestion');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Please answer the previous question first');
    });

    it('should fail validation when binary answer is invalid value', () => {
      const result = validateSuggestionField('Maybe', 'Some suggestion');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Please answer the previous question first');
    });
  });
});

describe('isSuggestionRequired', () => {
  it('should return true when binary answer is "Yes"', () => {
    expect(isSuggestionRequired('Yes')).toBe(true);
  });

  it('should return true when binary answer is "Oo"', () => {
    expect(isSuggestionRequired('Oo')).toBe(true);
  });

  it('should return false when binary answer is "No"', () => {
    expect(isSuggestionRequired('No')).toBe(false);
  });

  it('should return false when binary answer is "Hindi"', () => {
    expect(isSuggestionRequired('Hindi')).toBe(false);
  });

  it('should return false when binary answer is null', () => {
    expect(isSuggestionRequired(null)).toBe(false);
  });

  it('should return false when binary answer is undefined', () => {
    expect(isSuggestionRequired(undefined)).toBe(false);
  });
});

describe('validateNFAData', () => {
  // Requirement 1.3: Binary question is always required
  it('should fail validation when binary answer is missing', () => {
    const result = validateNFAData(null, 'Some suggestion');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('indicate whether this service needs improvement');
  });

  // Requirement 1.4: Suggestion required when binary is "Yes"
  it('should fail validation when binary is "Yes" and suggestion is empty', () => {
    const result = validateNFAData('Yes', '');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('provide specific comments or suggestions');
  });

  it('should pass validation when binary is "Yes" and suggestion has content', () => {
    const result = validateNFAData('Yes', 'Need improvements');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  // Requirement 1.5: Suggestion optional when binary is "No"
  it('should pass validation when binary is "No" and suggestion is empty', () => {
    const result = validateNFAData('No', '');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should pass validation when binary is "No" and suggestion is null', () => {
    const result = validateNFAData('No', null);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should pass validation when binary is "No" and suggestion has content', () => {
    const result = validateNFAData('No', 'Service is good');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  // Test all combinations
  it('should pass validation for "Oo" with suggestion', () => {
    const result = validateNFAData('Oo', 'Kailangan ng pagpapabuti');
    expect(result.valid).toBe(true);
  });

  it('should fail validation for "Oo" without suggestion', () => {
    const result = validateNFAData('Oo', '');
    expect(result.valid).toBe(false);
  });

  it('should pass validation for "Hindi" without suggestion', () => {
    const result = validateNFAData('Hindi', null);
    expect(result.valid).toBe(true);
  });

  it('should pass validation for "Hindi" with suggestion', () => {
    const result = validateNFAData('Hindi', 'Mabuti na');
    expect(result.valid).toBe(true);
  });
});

describe('getSuggestionRequiredStatus', () => {
  it('should return true when binary field is "Yes"', () => {
    const formData = { projects_nfa_binary: 'Yes' };
    const result = getSuggestionRequiredStatus(formData, 'projects_nfa_binary');
    expect(result).toBe(true);
  });

  it('should return true when binary field is "Oo"', () => {
    const formData = { projects_nfa_binary: 'Oo' };
    const result = getSuggestionRequiredStatus(formData, 'projects_nfa_binary');
    expect(result).toBe(true);
  });

  it('should return false when binary field is "No"', () => {
    const formData = { projects_nfa_binary: 'No' };
    const result = getSuggestionRequiredStatus(formData, 'projects_nfa_binary');
    expect(result).toBe(false);
  });

  it('should return false when binary field is "Hindi"', () => {
    const formData = { projects_nfa_binary: 'Hindi' };
    const result = getSuggestionRequiredStatus(formData, 'projects_nfa_binary');
    expect(result).toBe(false);
  });

  it('should return false when binary field is not present', () => {
    const formData = {};
    const result = getSuggestionRequiredStatus(formData, 'projects_nfa_binary');
    expect(result).toBe(false);
  });

  it('should work with different service indicators', () => {
    const formData = {
      projects_nfa_binary: 'Yes',
      financial_nfa_binary: 'No',
      healthServices_nfa_binary: 'Oo',
    };
    
    expect(getSuggestionRequiredStatus(formData, 'projects_nfa_binary')).toBe(true);
    expect(getSuggestionRequiredStatus(formData, 'financial_nfa_binary')).toBe(false);
    expect(getSuggestionRequiredStatus(formData, 'healthServices_nfa_binary')).toBe(true);
  });
});

// Edge cases and comprehensive validation tests
describe('Edge Cases', () => {
  describe('validateSuggestionField with various whitespace patterns', () => {
    it('should fail for single space when binary is "Yes"', () => {
      const result = validateSuggestionField('Yes', ' ');
      expect(result.valid).toBe(false);
    });

    it('should fail for multiple spaces when binary is "Yes"', () => {
      const result = validateSuggestionField('Yes', '     ');
      expect(result.valid).toBe(false);
    });

    it('should fail for tabs when binary is "Yes"', () => {
      const result = validateSuggestionField('Yes', '\t\t');
      expect(result.valid).toBe(false);
    });

    it('should fail for newlines when binary is "Yes"', () => {
      const result = validateSuggestionField('Yes', '\n\n');
      expect(result.valid).toBe(false);
    });

    it('should fail for mixed whitespace when binary is "Yes"', () => {
      const result = validateSuggestionField('Yes', ' \t\n \r ');
      expect(result.valid).toBe(false);
    });

    it('should pass for text with whitespace when binary is "Yes"', () => {
      const result = validateSuggestionField('Yes', '  Valid text  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateBinaryAnswer with case sensitivity', () => {
    it('should fail for lowercase "yes"', () => {
      const result = validateBinaryAnswer('yes');
      expect(result.valid).toBe(false);
    });

    it('should fail for lowercase "no"', () => {
      const result = validateBinaryAnswer('no');
      expect(result.valid).toBe(false);
    });

    it('should fail for lowercase "oo"', () => {
      const result = validateBinaryAnswer('oo');
      expect(result.valid).toBe(false);
    });

    it('should fail for lowercase "hindi"', () => {
      const result = validateBinaryAnswer('hindi');
      expect(result.valid).toBe(false);
    });
  });
});
