/**
 * Integration tests for survey form submission with NFA field transformation
 * 
 * Tests the complete flow from form data collection to API submission
 * Requirements: 2.2, 2.3, 2.4, 3.1, 3.2
 */

import { transformNFAFields, validateAllSections } from '../nfaFieldTransform';

describe('Survey Submission Integration', () => {
  describe('Financial Administration Section', () => {
    it('should transform and validate complete financial section data', () => {
      const financialData = {
        awarenessProjects: 'Oo',
        benefitedProjects: 'Oo',
        satisfactionProjects: '4',
        nfaBinaryProjects: 'Oo',
        suggestionsProjects: 'Kailangan ng mas maraming proyekto sa aming lugar',
        
        awarenessFinancial: 'Oo',
        usedFinancialInfo: 'Hindi',
        satisfactionFinancial: '3',
        nfaBinaryFinancial: 'Hindi',
        suggestionsFinancial: '',
        
        participatedSocialPrograms: 'Oo',
        satisfactionSocialPrograms: '5',
        nfaBinarySocialPrograms: 'Oo',
        suggestionsSocialPrograms: 'Maganda na ang programa',
        
        awarenessCorruption: 'Hindi',
        nfaBinaryCorruption: 'Hindi',
        suggestionsCorruption: ''
      };

      // Transform the data
      const transformed = transformNFAFields(financialData);

      // Verify transformation
      expect(transformed.need_for_action_binary_projects).toBe('Yes');
      expect(transformed.need_for_action_suggestion_projects).toBe('Kailangan ng mas maraming proyekto sa aming lugar');
      expect(transformed.need_for_action_binary_financial).toBe('No');
      expect(transformed.need_for_action_suggestion_financial).toBe('');
      expect(transformed.need_for_action_binary_social_programs).toBe('Yes');
      expect(transformed.need_for_action_suggestion_social_programs).toBe('Maganda na ang programa');
      expect(transformed.need_for_action_binary_corruption).toBe('No');
      expect(transformed.need_for_action_suggestion_corruption).toBe('');

      // Verify non-NFA fields are preserved
      expect(transformed.awarenessProjects).toBe('Oo');
      expect(transformed.satisfactionProjects).toBe('4');

      // Validate the original data (before transformation)
      const sections = {
        financial: { data: financialData }
      };
      const validation = validateAllSections(sections);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Disaster Preparedness Section', () => {
    it('should transform and validate disaster section with English values', () => {
      const disasterData = {
        awarenessDisasterInfo: 'Yes',
        receivedDisasterInfo: 'Yes',
        satisfactionDisasterInfo: '4',
        nfaBinaryDisasterInfo: 'Yes',
        suggestionsDisasterInfo: 'Need more frequent updates during typhoon season',
        
        awarenessEvacuation: 'Yes',
        usedEvacuation: 'No',
        satisfactionEvacuation: '3',
        nfaBinaryEvacuation: 'No',
        suggestionsEvacuation: ''
      };

      const transformed = transformNFAFields(disasterData);

      expect(transformed.need_for_action_binary_disaster_info).toBe('Yes');
      expect(transformed.need_for_action_suggestion_disaster_info).toBe('Need more frequent updates during typhoon season');
      expect(transformed.need_for_action_binary_evacuation).toBe('No');
      expect(transformed.need_for_action_suggestion_evacuation).toBe('');

      const sections = {
        disaster: { data: disasterData }
      };
      const validation = validateAllSections(sections);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Safety & Peace Order Section', () => {
    it('should transform and validate safety section', () => {
      const safetyData = {
        awarenessTanods: 'Yes',
        satisfactionTanods: '5',
        nfaBinaryTanods: 'No',
        suggestionsTanods: '',
        
        awarenessLupon: 'Yes',
        usedLupon: 'Yes',
        satisfactionLupon: '4',
        nfaBinaryLupon: 'Yes',
        suggestionsLupon: 'Faster resolution of disputes needed',
        
        awarenessAntiDrug: 'Yes',
        satisfactionAntiDrug: '4',
        nfaBinaryAntiDrug: 'Yes',
        suggestionsAntiDrug: 'More community education programs'
      };

      const transformed = transformNFAFields(safetyData);

      expect(transformed.need_for_action_binary_tanods).toBe('No');
      expect(transformed.need_for_action_binary_lupon).toBe('Yes');
      expect(transformed.need_for_action_suggestion_lupon).toBe('Faster resolution of disputes needed');
      expect(transformed.need_for_action_binary_anti_drug).toBe('Yes');
      expect(transformed.need_for_action_suggestion_anti_drug).toBe('More community education programs');

      const sections = {
        safety: { data: safetyData }
      };
      const validation = validateAllSections(sections);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Multiple Sections Submission', () => {
    it('should transform and validate data from multiple sections', () => {
      const submissionData = {
        financial: {
          data: {
            nfaBinaryProjects: 'Oo',
            suggestionsProjects: 'Test suggestion',
            satisfactionProjects: '4'
          }
        },
        disaster: {
          data: {
            nfaBinaryDisasterInfo: 'Yes',
            suggestionsDisasterInfo: 'Better communication',
            satisfactionDisasterInfo: '3'
          }
        },
        safety: {
          data: {
            nfaBinaryTanods: 'No',
            suggestionsTanods: '',
            satisfactionTanods: '5'
          }
        }
      };

      // Validate before transformation
      const validation = validateAllSections(submissionData);
      expect(validation.isValid).toBe(true);

      // Transform each section
      const transformedSections = Object.entries(submissionData).reduce((acc, [key, section]) => {
        acc[key] = {
          ...section,
          data: transformNFAFields(section.data)
        };
        return acc;
      }, {} as Record<string, any>);

      // Verify transformations
      expect(transformedSections.financial.data.need_for_action_binary_projects).toBe('Yes');
      expect(transformedSections.disaster.data.need_for_action_binary_disaster_info).toBe('Yes');
      expect(transformedSections.safety.data.need_for_action_binary_tanods).toBe('No');

      // Verify non-NFA fields preserved
      expect(transformedSections.financial.data.satisfactionProjects).toBe('4');
      expect(transformedSections.disaster.data.satisfactionDisasterInfo).toBe('3');
      expect(transformedSections.safety.data.satisfactionTanods).toBe('5');
    });
  });

  describe('Validation Error Scenarios', () => {
    it('should catch validation errors before submission', () => {
      const invalidData = {
        financial: {
          data: {
            nfaBinaryProjects: 'Yes',
            suggestionsProjects: '', // Invalid: Yes with empty suggestion
            nfaBinaryFinancial: 'Maybe', // Invalid: not a valid binary value
            suggestionsFinancial: 'Test'
          }
        }
      };

      const validation = validateAllSections(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('financial');
    });

    it('should allow No with empty suggestion', () => {
      const validData = {
        financial: {
          data: {
            nfaBinaryProjects: 'No',
            suggestionsProjects: ''
          }
        }
      };

      const validation = validateAllSections(validData);
      expect(validation.isValid).toBe(true);
    });

    it('should reject Yes with whitespace-only suggestion', () => {
      const invalidData = {
        financial: {
          data: {
            nfaBinaryProjects: 'Yes',
            suggestionsProjects: '   \n\t   '
          }
        }
      };

      const validation = validateAllSections(invalidData);
      expect(validation.isValid).toBe(false);
    });
  });

  describe('Mixed Language Support', () => {
    it('should handle mixed English and Tagalog values in same section', () => {
      const mixedData = {
        nfaBinaryProjects: 'Oo', // Tagalog
        suggestionsProjects: 'Tagalog suggestion',
        nfaBinaryFinancial: 'Yes', // English
        suggestionsFinancial: 'English suggestion',
        nfaBinarySocialPrograms: 'Hindi', // Tagalog
        suggestionsSocialPrograms: ''
      };

      const transformed = transformNFAFields(mixedData);

      expect(transformed.need_for_action_binary_projects).toBe('Yes');
      expect(transformed.need_for_action_binary_financial).toBe('Yes');
      expect(transformed.need_for_action_binary_social_programs).toBe('No');

      const sections = {
        financial: { data: mixedData }
      };
      const validation = validateAllSections(sections);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Field Naming Convention', () => {
    it('should follow naming convention: need_for_action_binary_{indicator}', () => {
      const data = {
        nfaBinaryProjects: 'Yes',
        suggestionsProjects: 'Test'
      };

      const transformed = transformNFAFields(data);

      // Verify binary field follows convention
      expect(transformed).toHaveProperty('need_for_action_binary_projects');
      expect(transformed.need_for_action_binary_projects).toBe('Yes');
    });

    it('should follow naming convention: need_for_action_suggestion_{indicator}', () => {
      const data = {
        nfaBinaryProjects: 'Yes',
        suggestionsProjects: 'Test suggestion'
      };

      const transformed = transformNFAFields(data);

      // Verify suggestion field follows convention
      expect(transformed).toHaveProperty('need_for_action_suggestion_projects');
      expect(transformed.need_for_action_suggestion_projects).toBe('Test suggestion');
    });

    it('should transform all 13 service indicators correctly', () => {
      const allIndicators = {
        // Financial (4 indicators)
        nfaBinaryProjects: 'Yes',
        suggestionsProjects: 'Test',
        nfaBinaryFinancial: 'Yes',
        suggestionsFinancial: 'Test',
        nfaBinarySocialPrograms: 'Yes',
        suggestionsSocialPrograms: 'Test',
        nfaBinaryCorruption: 'Yes',
        suggestionsCorruption: 'Test',
        
        // Disaster (2 indicators)
        nfaBinaryDisasterInfo: 'Yes',
        suggestionsDisasterInfo: 'Test',
        nfaBinaryEvacuation: 'Yes',
        suggestionsEvacuation: 'Test',
        
        // Safety (3 indicators)
        nfaBinaryTanods: 'Yes',
        suggestionsTanods: 'Test',
        nfaBinaryLupon: 'Yes',
        suggestionsLupon: 'Test',
        nfaBinaryAntiDrug: 'Yes',
        suggestionsAntiDrug: 'Test',
        
        // Social (3 indicators)
        nfaBinaryHealthServices: 'Yes',
        suggestionsHealthServices: 'Test',
        nfaBinaryWomenChildrenProtection: 'Yes',
        suggestionsWomenChildrenProtection: 'Test',
        nfaBinaryCommunityParticipation: 'Yes',
        suggestionsCommunityParticipation: 'Test',
        
        // Business (1 indicator)
        nfaBinaryBusinessClearance: 'Yes',
        suggestionsBusinessClearance: 'Test',
        
        // Environmental (1 indicator)
        nfaBinaryWasteManagement: 'Yes',
        suggestionsWasteManagement: 'Test'
      };

      const transformed = transformNFAFields(allIndicators);

      // Verify all 13 binary fields are transformed
      expect(transformed).toHaveProperty('need_for_action_binary_projects');
      expect(transformed).toHaveProperty('need_for_action_binary_financial');
      expect(transformed).toHaveProperty('need_for_action_binary_social_programs');
      expect(transformed).toHaveProperty('need_for_action_binary_corruption');
      expect(transformed).toHaveProperty('need_for_action_binary_disaster_info');
      expect(transformed).toHaveProperty('need_for_action_binary_evacuation');
      expect(transformed).toHaveProperty('need_for_action_binary_tanods');
      expect(transformed).toHaveProperty('need_for_action_binary_lupon');
      expect(transformed).toHaveProperty('need_for_action_binary_anti_drug');
      expect(transformed).toHaveProperty('need_for_action_binary_health_services');
      expect(transformed).toHaveProperty('need_for_action_binary_women_children_protection');
      expect(transformed).toHaveProperty('need_for_action_binary_community_participation');
      expect(transformed).toHaveProperty('need_for_action_binary_business_clearance');
      expect(transformed).toHaveProperty('need_for_action_binary_waste_management');

      // Verify all 13 suggestion fields are transformed
      expect(transformed).toHaveProperty('need_for_action_suggestion_projects');
      expect(transformed).toHaveProperty('need_for_action_suggestion_financial');
      expect(transformed).toHaveProperty('need_for_action_suggestion_social_programs');
      expect(transformed).toHaveProperty('need_for_action_suggestion_corruption');
      expect(transformed).toHaveProperty('need_for_action_suggestion_disaster_info');
      expect(transformed).toHaveProperty('need_for_action_suggestion_evacuation');
      expect(transformed).toHaveProperty('need_for_action_suggestion_tanods');
      expect(transformed).toHaveProperty('need_for_action_suggestion_lupon');
      expect(transformed).toHaveProperty('need_for_action_suggestion_anti_drug');
      expect(transformed).toHaveProperty('need_for_action_suggestion_health_services');
      expect(transformed).toHaveProperty('need_for_action_suggestion_women_children_protection');
      expect(transformed).toHaveProperty('need_for_action_suggestion_community_participation');
      expect(transformed).toHaveProperty('need_for_action_suggestion_business_clearance');
      expect(transformed).toHaveProperty('need_for_action_suggestion_waste_management');
    });
  });
});
