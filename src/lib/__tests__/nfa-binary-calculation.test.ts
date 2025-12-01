/**
 * Unit tests for NFA binary field calculation
 * Tests the updated calculateNeedForActionMetrics function
 */

import {
  calculateNeedForActionMetrics,
  type SurveyResponse,
} from '../funnel-calculations';

describe('NFA Binary Field Calculation', () => {
  describe('calculateNeedForActionMetrics with binary fields', () => {
    it('should calculate NFA rate using only binary "Yes" responses', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes',
              need_for_action_suggestion_projects: 'Need more funding'
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 2,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'No',
              need_for_action_suggestion_projects: ''
            }
          }
        },
        {
          response_id: 3,
          respondent_id: 3,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes',
              need_for_action_suggestion_projects: 'Better communication needed'
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      // 2 out of 3 answered "Yes" = 66.7%
      expect(result.count).toBe(2);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(66.7);
    });

    it('should calculate NFA rate using Tagalog "Oo" responses', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Oo',
              need_for_action_suggestion_projects: 'Kailangan ng mas maraming pondo'
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 2,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Hindi',
              need_for_action_suggestion_projects: ''
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      // 1 out of 2 answered "Oo" = 50%
      expect(result.count).toBe(1);
      expect(result.total).toBe(2);
      expect(result.percentage).toBe(50);
    });

    it('should return 0 percentage when no responses exist', () => {
      const responses: SurveyResponse[] = [];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      expect(result.count).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0); // Edge case: return 0 instead of null
    });

    it('should ignore suggestion field content and only use binary field', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'No',
              need_for_action_suggestion_projects: 'This suggestion should be ignored'
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 2,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes',
              need_for_action_suggestion_projects: '' // Empty suggestion
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      // Only 1 out of 2 answered "Yes", regardless of suggestion content
      expect(result.count).toBe(1);
      expect(result.total).toBe(2);
      expect(result.percentage).toBe(50);
    });

    it('should handle multiple binary fields in same section', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes',
              need_for_action_suggestion_projects: 'Need improvement',
              need_for_action_binary_financial: 'No',
              need_for_action_suggestion_financial: ''
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      // Should count as needing action if ANY binary field is "Yes"
      expect(result.count).toBe(1);
      expect(result.total).toBe(1);
      expect(result.percentage).toBe(100);
    });

    it('should handle all "No" responses correctly', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'No',
              need_for_action_suggestion_projects: ''
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 2,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'No',
              need_for_action_suggestion_projects: ''
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      expect(result.count).toBe(0);
      expect(result.total).toBe(2);
      expect(result.percentage).toBe(0);
    });

    it('should handle all "Yes" responses correctly', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes',
              need_for_action_suggestion_projects: 'Suggestion 1'
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 2,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes',
              need_for_action_suggestion_projects: 'Suggestion 2'
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      expect(result.count).toBe(2);
      expect(result.total).toBe(2);
      expect(result.percentage).toBe(100);
    });

    it('should handle mixed English and Tagalog responses', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes'
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 2,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Oo'
            }
          }
        },
        {
          response_id: 3,
          respondent_id: 3,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'No'
            }
          }
        },
        {
          response_id: 4,
          respondent_id: 4,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Hindi'
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      // 2 out of 4 answered "Yes" or "Oo" = 50%
      expect(result.count).toBe(2);
      expect(result.total).toBe(4);
      expect(result.percentage).toBe(50);
    });

    it('should only count each respondent once even with multiple sections', () => {
      const responses: SurveyResponse[] = [
        {
          response_id: 1,
          respondent_id: 1,
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_projects: 'Yes'
            }
          }
        },
        {
          response_id: 2,
          respondent_id: 1, // Same respondent
          survey_section: {
            section_key: 'financial',
            data: {
              need_for_action_binary_financial: 'Yes'
            }
          }
        }
      ];

      const result = calculateNeedForActionMetrics(responses, 'financial');

      // Should count respondent 1 only once
      expect(result.count).toBe(1);
      expect(result.total).toBe(1);
      expect(result.percentage).toBe(100);
    });
  });
});
