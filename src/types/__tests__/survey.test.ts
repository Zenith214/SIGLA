/**
 * Tests for survey type definitions and field naming helpers
 */

import {
  FieldNamingHelpers,
  SERVICE_INDICATORS,
  type NeedForActionBinaryQuestion,
  type NeedForActionSuggestionQuestion,
  type ServiceIndicatorData,
  type FinancialSectionData,
} from '../survey';

describe('FieldNamingHelpers', () => {
  describe('getBinaryFieldId', () => {
    it('should generate correct binary field ID', () => {
      expect(FieldNamingHelpers.getBinaryFieldId('projects')).toBe('projects_nfa_binary');
      expect(FieldNamingHelpers.getBinaryFieldId('financial')).toBe('financial_nfa_binary');
      expect(FieldNamingHelpers.getBinaryFieldId('healthServices')).toBe('healthServices_nfa_binary');
    });
  });

  describe('getSuggestionFieldId', () => {
    it('should generate correct suggestion field ID', () => {
      expect(FieldNamingHelpers.getSuggestionFieldId('projects')).toBe('projects_nfa_suggestion');
      expect(FieldNamingHelpers.getSuggestionFieldId('financial')).toBe('financial_nfa_suggestion');
      expect(FieldNamingHelpers.getSuggestionFieldId('healthServices')).toBe('healthServices_nfa_suggestion');
    });
  });

  describe('getBinaryDataFieldName', () => {
    it('should generate correct binary data field name', () => {
      expect(FieldNamingHelpers.getBinaryDataFieldName('projects')).toBe('need_for_action_binary_projects');
      expect(FieldNamingHelpers.getBinaryDataFieldName('financial')).toBe('need_for_action_binary_financial');
      expect(FieldNamingHelpers.getBinaryDataFieldName('healthServices')).toBe('need_for_action_binary_healthServices');
    });
  });

  describe('getSuggestionDataFieldName', () => {
    it('should generate correct suggestion data field name', () => {
      expect(FieldNamingHelpers.getSuggestionDataFieldName('projects')).toBe('need_for_action_suggestion_projects');
      expect(FieldNamingHelpers.getSuggestionDataFieldName('financial')).toBe('need_for_action_suggestion_financial');
      expect(FieldNamingHelpers.getSuggestionDataFieldName('healthServices')).toBe('need_for_action_suggestion_healthServices');
    });
  });

  describe('isBinaryField', () => {
    it('should correctly identify binary fields', () => {
      expect(FieldNamingHelpers.isBinaryField('projects_nfa_binary')).toBe(true);
      expect(FieldNamingHelpers.isBinaryField('financial_nfa_binary')).toBe(true);
      expect(FieldNamingHelpers.isBinaryField('projects_nfa_suggestion')).toBe(false);
      expect(FieldNamingHelpers.isBinaryField('someOtherField')).toBe(false);
    });
  });

  describe('isSuggestionField', () => {
    it('should correctly identify suggestion fields', () => {
      expect(FieldNamingHelpers.isSuggestionField('projects_nfa_suggestion')).toBe(true);
      expect(FieldNamingHelpers.isSuggestionField('financial_nfa_suggestion')).toBe(true);
      expect(FieldNamingHelpers.isSuggestionField('projects_nfa_binary')).toBe(false);
      expect(FieldNamingHelpers.isSuggestionField('someOtherField')).toBe(false);
    });
  });

  describe('extractServiceId', () => {
    it('should extract service ID from binary field', () => {
      expect(FieldNamingHelpers.extractServiceId('projects_nfa_binary')).toBe('projects');
      expect(FieldNamingHelpers.extractServiceId('financial_nfa_binary')).toBe('financial');
      expect(FieldNamingHelpers.extractServiceId('healthServices_nfa_binary')).toBe('healthServices');
    });

    it('should extract service ID from suggestion field', () => {
      expect(FieldNamingHelpers.extractServiceId('projects_nfa_suggestion')).toBe('projects');
      expect(FieldNamingHelpers.extractServiceId('financial_nfa_suggestion')).toBe('financial');
      expect(FieldNamingHelpers.extractServiceId('healthServices_nfa_suggestion')).toBe('healthServices');
    });

    it('should return null for non-NFA fields', () => {
      expect(FieldNamingHelpers.extractServiceId('someOtherField')).toBe(null);
      expect(FieldNamingHelpers.extractServiceId('awarenessProjects')).toBe(null);
    });
  });
});

describe('SERVICE_INDICATORS', () => {
  it('should have correct structure for all service areas', () => {
    expect(SERVICE_INDICATORS.financial).toEqual(['projects', 'financial', 'socialPrograms', 'corruption']);
    expect(SERVICE_INDICATORS.disaster).toEqual(['disasterInfo', 'evacuation']);
    expect(SERVICE_INDICATORS.safety).toEqual(['tanods', 'lupon', 'antiDrug']);
    expect(SERVICE_INDICATORS.social).toEqual(['healthServices', 'womenChildrenProtection', 'communityParticipation']);
    expect(SERVICE_INDICATORS.business).toEqual(['businessClearance']);
    expect(SERVICE_INDICATORS.environmental).toEqual(['wasteManagement']);
  });

  it('should have 14 total service indicators', () => {
    const allIndicators = Object.values(SERVICE_INDICATORS).flat();
    expect(allIndicators).toHaveLength(14);
  });
});

describe('Type Definitions', () => {
  it('should allow valid ServiceIndicatorData', () => {
    const validData: ServiceIndicatorData = {
      satisfaction_rating: 5,
      need_for_action_binary: 'Yes',
      need_for_action_suggestion: 'Some suggestion',
    };
    expect(validData).toBeDefined();
  });

  it('should allow null suggestion when binary is No', () => {
    const validData: ServiceIndicatorData = {
      need_for_action_binary: 'No',
      need_for_action_suggestion: null,
    };
    expect(validData).toBeDefined();
  });

  it('should allow valid FinancialSectionData', () => {
    const validData: FinancialSectionData = {
      awarenessProjects: 'Oo',
      benefitedProjects: 'Oo',
      satisfactionProjects: '5',
      need_for_action_binary_projects: 'Oo',
      need_for_action_suggestion_projects: 'Need more projects',
      awarenessFinancial: 'Hindi',
      need_for_action_binary_financial: 'Hindi',
      need_for_action_suggestion_financial: null,
      need_for_action_binary_socialPrograms: 'Oo',
      need_for_action_suggestion_socialPrograms: 'More programs needed',
      need_for_action_binary_corruption: 'Hindi',
      need_for_action_suggestion_corruption: null,
    };
    expect(validData).toBeDefined();
  });
});

describe('NeedForActionBinaryQuestion Type', () => {
  it('should enforce correct structure for binary questions', () => {
    const validBinaryQuestion: NeedForActionBinaryQuestion = {
      id: 'projects_nfa_binary',
      type: 'radio',
      question: 'Does this service need improvement?',
      options: ['Yes', 'No'],
      required: true,
    };
    expect(validBinaryQuestion).toBeDefined();
  });
});

describe('NeedForActionSuggestionQuestion Type', () => {
  it('should enforce correct structure for suggestion questions', () => {
    const validSuggestionQuestion: NeedForActionSuggestionQuestion = {
      id: 'projects_nfa_suggestion',
      type: 'textarea',
      question: 'Please provide suggestions',
      required: (formData: any) => formData['projects_nfa_binary'] === 'Yes',
      dependsOn: 'projects_nfa_binary',
    };
    expect(validSuggestionQuestion).toBeDefined();
  });
});
