/**
 * Unit tests for funnel calculation functions.
 * 
 * Tests cover:
 * - Basic three-stage funnel calculation
 * - Zero awareness edge case
 * - Zero availment edge case
 * - Missing questions edge case
 * - Respondent filtering logic
 * - Subset validation (availed ⊆ aware ⊆ all)
 * - Satisfaction exclusion of non-availed respondents
 */

import {
  calculateServiceFunnelMetrics,
  identifyAwareRespondents,
  identifyAvailedRespondents,
  calculateSatisfactionFromAvailed,
  isYesAnswer,
  parseRating,
  findAwarenessQuestions,
  findAvailmentQuestions,
  findSatisfactionQuestions,
  type SurveyResponse,
  type ServiceFunnelMetrics,
} from '../funnel-calculations';

describe('Funnel Calculations', () => {
  describe('Helper Functions', () => {
    describe('isYesAnswer', () => {
      it('should recognize various "yes" answer formats', () => {
        const yesVariations = ['Yes', 'yes', 'YES', 'Oo', 'oo', 'OO', 1, '1', true, 'true'];
        
        yesVariations.forEach(answer => {
          expect(isYesAnswer(answer)).toBe(true);
        });
      });

      it('should reject "no" answers', () => {
        const noVariations = ['No', 'no', 'NO', 'Hindi', 0, '0', false, 'false'];
        
        noVariations.forEach(answer => {
          expect(isYesAnswer(answer)).toBe(false);
        });
      });
    });

    describe('parseRating', () => {
      it('should parse valid ratings (1-5)', () => {
        expect(parseRating(1)).toBe(1);
        expect(parseRating(3)).toBe(3);
        expect(parseRating(5)).toBe(5);
        expect(parseRating('4')).toBe(4);
      });

      it('should return null for invalid ratings', () => {
        expect(parseRating(0)).toBeNull();
        expect(parseRating(6)).toBeNull();
        expect(parseRating('invalid')).toBeNull();
        expect(parseRating(null)).toBeNull();
      });
    });

    describe('Question Identification', () => {
      it('should identify awareness questions', () => {
        const data = {
          'aware_financial': 'Yes',
          'know about_services': 'Yes',
          'availed_service': 'Yes',
          'satisfaction_rating': '5'
        };
        
        const awarenessQuestions = findAwarenessQuestions(data);
        expect(awarenessQuestions).toContain('aware_financial');
        expect(awarenessQuestions).toContain('know about_services');
        expect(awarenessQuestions).not.toContain('availed_service');
      });

      it('should identify availment questions', () => {
        const data = {
          'aware_financial': 'Yes',
          'availed_service': 'Yes',
          'experienced_benefit': 'Yes',
          'satisfaction_rating': '5'
        };
        
        const availmentQuestions = findAvailmentQuestions(data);
        expect(availmentQuestions).toContain('availed_service');
        expect(availmentQuestions).toContain('experienced_benefit');
        expect(availmentQuestions).not.toContain('aware_financial');
      });

      it('should identify satisfaction questions', () => {
        const data = {
          'aware_financial': 'Yes',
          'availed_service': 'Yes',
          'satisfaction_rating': '5',
          'rate_quality': '4'
        };
        
        const satisfactionQuestions = findSatisfactionQuestions(data);
        expect(satisfactionQuestions).toContain('satisfaction_rating');
        expect(satisfactionQuestions).toContain('rate_quality');
        expect(satisfactionQuestions).not.toContain('aware_financial');
      });
    });
  });

  describe('Core Funnel Functions', () => {
    describe('identifyAwareRespondents', () => {
      it('should identify respondents who answered yes to awareness questions', () => {
        const responses: SurveyResponse[] = [
          {
            response_id: 1,
            respondent_id: 1,
            survey_section: {
              section_key: 'financial',
              data: { aware_financial: 'Yes' }
            }
          },
          {
            response_id: 2,
            respondent_id: 2,
            survey_section: {
              section_key: 'financial',
              data: { aware_financial: 'No' }
            }
          },
          {
            response_id: 3,
            respondent_id: 3,
            survey_section: {
              section_key: 'financial',
              data: { aware_financial: 'Yes' }
            }
          }
        ];

        const awareIds = identifyAwareRespondents(responses, 'financial');
        
        expect(awareIds.size).toBe(2);
        expect(awareIds.has(1)).toBe(true);
        expect(awareIds.has(3)).toBe(true);
        expect(awareIds.has(2)).toBe(false);
      });
    });

    describe('identifyAvailedRespondents', () => {
      it('should only identify availed respondents from aware respondents', () => {
        const responses: SurveyResponse[] = [
          {
            response_id: 1,
            respondent_id: 1,
            survey_section: {
              section_key: 'financial',
              data: { 
                aware_financial: 'Yes',
                availed_service: 'Yes'
              }
            }
          },
          {
            response_id: 2,
            respondent_id: 2,
            survey_section: {
              section_key: 'financial',
              data: { 
                aware_financial: 'Yes',
                availed_service: 'No'
              }
            }
          },
          {
            response_id: 3,
            respondent_id: 3,
            survey_section: {
              section_key: 'financial',
              data: { 
                aware_financial: 'No',
                availed_service: 'Yes'  // Should be excluded (not aware)
              }
            }
          }
        ];

        const awareIds = new Set([1, 2]); // Only 1 and 2 are aware
        const availedIds = identifyAvailedRespondents(responses, 'financial', awareIds);
        
        expect(availedIds.size).toBe(1);
        expect(availedIds.has(1)).toBe(true);
        expect(availedIds.has(2)).toBe(false);
        expect(availedIds.has(3)).toBe(false); // Not aware, so excluded
      });
    });

    describe('calculateSatisfactionFromAvailed', () => {
      it('should calculate satisfaction only from availed respondents', () => {
        const responses: SurveyResponse[] = [
          {
            response_id: 1,
            respondent_id: 1,
            survey_section: {
              section_key: 'financial',
              data: { satisfaction_rating: '5' }
            }
          },
          {
            response_id: 2,
            respondent_id: 2,
            survey_section: {
              section_key: 'financial',
              data: { satisfaction_rating: '4' }
            }
          },
          {
            response_id: 3,
            respondent_id: 3,
            survey_section: {
              section_key: 'financial',
              data: { satisfaction_rating: '1' }  // Should be excluded (not availed)
            }
          }
        ];

        const availedIds = new Set([1, 2]); // Only 1 and 2 availed
        const satisfaction = calculateSatisfactionFromAvailed(responses, 'financial', availedIds);
        
        expect(satisfaction.total).toBe(2);
        expect(satisfaction.percentage).not.toBeNull();
        // Both respondents have rating >= 4 (satisfied), so 2/2 = 100%
        expect(satisfaction.count).toBe(2);
        expect(satisfaction.percentage).toBe(100);
      });

      it('should return null percentage when no one availed', () => {
        const responses: SurveyResponse[] = [];
        const availedIds = new Set<number>();
        
        const satisfaction = calculateSatisfactionFromAvailed(responses, 'financial', availedIds);
        
        expect(satisfaction.count).toBe(0);
        expect(satisfaction.total).toBe(0);
        expect(satisfaction.percentage).toBeNull();
      });
    });
  });

  describe('Complete Funnel Calculations', () => {
    describe('Basic Three-Stage Funnel', () => {
      it('should calculate correct percentages for all three stages', () => {
        // Scenario: 50 respondents, 45 aware (90%), 30 availed (66.7% of aware), satisfaction from availed
        const responses: SurveyResponse[] = [];
        
        // Create 50 respondents
        for (let i = 1; i <= 50; i++) {
          const data: Record<string, any> = {};
          
          // 45 respondents are aware (1-45)
          if (i <= 45) {
            data.aware_financial = 'Yes';
            
            // 30 of the aware respondents availed (1-30)
            if (i <= 30) {
              data.availed_service = 'Yes';
              
              // 25 of the availed are highly satisfied (1-25)
              if (i <= 25) {
                data.satisfaction_rating = '5';
              } else {
                // 5 are not satisfied (26-30)
                data.satisfaction_rating = '2';
              }
            } else {
              // 15 aware but did not avail (31-45)
              data.availed_service = 'No';
            }
          } else {
            // 5 respondents are not aware (46-50)
            data.aware_financial = 'No';
          }
          
          responses.push({
            response_id: i,
            respondent_id: i,
            survey_section: {
              section_key: 'financial',
              data
            }
          });
        }
        
        const result = calculateServiceFunnelMetrics(responses, 'financial');
        
        // Verify awareness stage
        expect(result.awareness.count).toBe(45);
        expect(result.awareness.total).toBe(50);
        expect(result.awareness.percentage).toBe(90);
        
        // Verify availment stage (30 out of 45 aware = 66.7%)
        expect(result.availment.count).toBe(30);
        expect(result.availment.total).toBe(45);
        expect(result.availment.percentage).toBe(66.7); // One decimal place precision
        
        // Verify satisfaction stage (calculated from availed respondents)
        expect(result.satisfaction.total).toBe(30);
        expect(result.satisfaction.percentage).not.toBeNull();
        // 25 out of 30 have rating >= 4 (satisfied), so 25/30 = 83.3%
        expect(result.satisfaction.count).toBe(25);
        expect(result.satisfaction.percentage).toBe(83.3);
      });
    });

    describe('Zero Awareness Edge Case', () => {
      it('should return null for availment and satisfaction when no one is aware', () => {
        const responses: SurveyResponse[] = [];
        
        // Create 50 respondents, none aware
        for (let i = 1; i <= 50; i++) {
          responses.push({
            response_id: i,
            respondent_id: i,
            survey_section: {
              section_key: 'financial',
              data: { aware_financial: 'No' }
            }
          });
        }
        
        const result = calculateServiceFunnelMetrics(responses, 'financial');
        
        // Verify awareness is 0%
        expect(result.awareness.count).toBe(0);
        expect(result.awareness.total).toBe(50);
        expect(result.awareness.percentage).toBe(0);
        
        // Verify availment is null (cannot calculate with 0 aware)
        expect(result.availment.count).toBe(0);
        expect(result.availment.total).toBe(0);
        expect(result.availment.percentage).toBeNull();
        
        // Verify satisfaction is null
        expect(result.satisfaction.count).toBe(0);
        expect(result.satisfaction.total).toBe(0);
        expect(result.satisfaction.percentage).toBeNull();
      });
    });

    describe('Zero Availment Edge Case', () => {
      it('should return null for satisfaction when no one availed', () => {
        const responses: SurveyResponse[] = [];
        
        // Create 50 respondents, 45 aware, 0 availed
        for (let i = 1; i <= 50; i++) {
          const data: Record<string, any> = {};
          
          if (i <= 45) {
            data.aware_financial = 'Yes';
            data.availed_service = 'No'; // All aware but did not avail
          } else {
            data.aware_financial = 'No';
          }
          
          responses.push({
            response_id: i,
            respondent_id: i,
            survey_section: {
              section_key: 'financial',
              data
            }
          });
        }
        
        const result = calculateServiceFunnelMetrics(responses, 'financial');
        
        // Verify awareness
        expect(result.awareness.count).toBe(45);
        expect(result.awareness.total).toBe(50);
        expect(result.awareness.percentage).toBe(90);
        
        // Verify availment is 0%
        expect(result.availment.count).toBe(0);
        expect(result.availment.total).toBe(45);
        expect(result.availment.percentage).toBe(0);
        
        // Verify satisfaction is null (cannot calculate with 0 availed)
        expect(result.satisfaction.count).toBe(0);
        expect(result.satisfaction.total).toBe(0);
        expect(result.satisfaction.percentage).toBeNull();
      });
    });

    describe('Missing Questions Edge Case', () => {
      it('should handle missing awareness questions gracefully', () => {
        const responses: SurveyResponse[] = [];
        
        // Create responses without awareness questions
        for (let i = 1; i <= 50; i++) {
          responses.push({
            response_id: i,
            respondent_id: i,
            survey_section: {
              section_key: 'financial',
              data: { 
                satisfaction_rating: '4' // Only satisfaction, no awareness
              }
            }
          });
        }
        
        const result = calculateServiceFunnelMetrics(responses, 'financial');
        
        // Verify awareness is 0 (no awareness questions answered positively)
        expect(result.awareness.count).toBe(0);
        expect(result.awareness.total).toBe(50);
        expect(result.awareness.percentage).toBe(0);
        
        // Verify availment is null
        expect(result.availment.count).toBe(0);
        expect(result.availment.percentage).toBeNull();
        
        // Verify satisfaction is null
        expect(result.satisfaction.count).toBe(0);
        expect(result.satisfaction.percentage).toBeNull();
      });
    });

    describe('Respondent Filtering Logic', () => {
      it('should validate subset relationships: availed ⊆ aware ⊆ all', () => {
        const responses: SurveyResponse[] = [];
        
        // Create 30 respondents with proper funnel progression
        for (let i = 1; i <= 30; i++) {
          const data: Record<string, any> = {};
          
          // 20 respondents are aware (1-20)
          if (i <= 20) {
            data.aware_disaster = 'Yes';
            
            // 10 of the aware respondents availed (1-10)
            if (i <= 10) {
              data.availed_disaster = 'Yes';
              data.satisfaction_rating = '5';
            } else {
              data.availed_disaster = 'No';
            }
          } else {
            // 10 respondents are not aware (21-30)
            data.aware_disaster = 'No';
          }
          
          responses.push({
            response_id: i,
            respondent_id: i,
            survey_section: {
              section_key: 'disaster',
              data
            }
          });
        }
        
        // Get the sets
        const allRespondentIds = new Set(responses.map(r => r.respondent_id || r.response_id));
        const awareIds = identifyAwareRespondents(responses, 'disaster');
        const availedIds = identifyAvailedRespondents(responses, 'disaster', awareIds);
        
        // Verify subset relationships
        expect(allRespondentIds.size).toBe(30);
        expect(awareIds.size).toBe(20);
        expect(availedIds.size).toBe(10);
        
        // Verify availed ⊆ aware
        for (const id of availedIds) {
          expect(awareIds.has(id)).toBe(true);
        }
        
        // Verify aware ⊆ all
        for (const id of awareIds) {
          expect(allRespondentIds.has(id)).toBe(true);
        }
      });

      it('should exclude non-availed respondents from satisfaction calculations', () => {
        const responses: SurveyResponse[] = [];
        
        // Create 20 respondents
        for (let i = 1; i <= 20; i++) {
          const data: Record<string, any> = {
            aware_safety: 'Yes' // All 20 are aware
          };
          
          // Only 10 availed (1-10)
          if (i <= 10) {
            data.availed_safety = 'Yes';
            data.satisfaction_rating = '5'; // High satisfaction
          } else {
            // Respondents 11-20 did not avail
            data.availed_safety = 'No';
            data.satisfaction_rating = '1'; // Low rating that should be excluded
          }
          
          responses.push({
            response_id: i,
            respondent_id: i,
            survey_section: {
              section_key: 'safety',
              data
            }
          });
        }
        
        const result = calculateServiceFunnelMetrics(responses, 'safety');
        
        // Verify only 10 respondents are included in satisfaction calculation
        expect(result.satisfaction.total).toBe(10);
        
        // Verify high satisfaction percentage (should be 100% since all availed gave 5/5)
        expect(result.satisfaction.percentage).toBe(100);
        
        // If non-availed were included, satisfaction would be much lower
        // This confirms they are properly excluded
      });
    });

    describe('Empty Responses', () => {
      it('should handle empty response list gracefully', () => {
        const responses: SurveyResponse[] = [];
        
        const result = calculateServiceFunnelMetrics(responses, 'financial');
        
        // Should handle gracefully with 0 respondents
        expect(result.awareness.count).toBe(0);
        expect(result.awareness.total).toBe(0);
        expect(result.awareness.percentage).toBeNull();
        
        expect(result.availment.count).toBe(0);
        expect(result.availment.total).toBe(0);
        expect(result.availment.percentage).toBeNull();
        
        expect(result.satisfaction.count).toBe(0);
        expect(result.satisfaction.total).toBe(0);
        expect(result.satisfaction.percentage).toBeNull();
      });
    });

    describe('Multiple Service Areas', () => {
      it('should calculate metrics independently for different service areas', () => {
        const responses: SurveyResponse[] = [];
        
        // Create respondents with data for multiple service areas
        for (let i = 1; i <= 20; i++) {
          // Financial service area - high awareness
          responses.push({
            response_id: i * 2 - 1,
            respondent_id: i,
            survey_section: {
              section_key: 'financial',
              data: {
                aware_financial: i <= 18 ? 'Yes' : 'No', // 90% aware
                availed_financial: i <= 12 ? 'Yes' : 'No',
                satisfaction_rating: '5'
              }
            }
          });
          
          // Disaster service area - lower awareness
          responses.push({
            response_id: i * 2,
            respondent_id: i,
            survey_section: {
              section_key: 'disaster',
              data: {
                aware_disaster: i <= 10 ? 'Yes' : 'No', // 50% aware
                availed_disaster: i <= 5 ? 'Yes' : 'No',
                satisfaction_rating: '4'
              }
            }
          });
        }
        
        const financialResult = calculateServiceFunnelMetrics(responses, 'financial');
        const disasterResult = calculateServiceFunnelMetrics(responses, 'disaster');
        
        // Verify financial has higher awareness
        expect(financialResult.awareness.percentage).toBeGreaterThan(
          disasterResult.awareness.percentage || 0
        );
        
        // Verify both have valid metrics
        expect(financialResult.awareness.count).toBe(18);
        expect(disasterResult.awareness.count).toBe(10);
      });
    });
  });
});
