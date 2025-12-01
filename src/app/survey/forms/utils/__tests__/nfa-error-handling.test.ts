/**
 * Task 12: Error Handling Tests for NFA Binary Questions
 * 
 * This test suite validates the error handling implementation for:
 * - Missing binary answer (Requirement 1.3)
 * - "Yes" with empty suggestion (Requirement 1.4)
 * - Form state inconsistencies (Requirement 6.5)
 * - User-friendly error messages
 */

import { validateAnswer, type ValidationError } from '../validation';
import type { Question } from '@/types/survey';

describe('Task 12: NFA Error Handling', () => {
  describe('Binary Question Error Handling (Requirement 1.3)', () => {
    const binaryQuestion: Question = {
      id: 'nfaBinaryProjects',
      type: 'radio',
      question: 'Based on your experience, do you believe this service needs improvement?',
      options: ['Oo', 'Hindi'],
      required: true,
    };

    it('should return error when binary answer is missing', () => {
      const error = validateAnswer(binaryQuestion, undefined);
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('required');
      expect(error?.message).toBe('Please indicate whether this service needs improvement');
    });

    it('should return error when binary answer is empty string', () => {
      const error = validateAnswer(binaryQuestion, '');
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('required');
      expect(error?.message).toBe('Please indicate whether this service needs improvement');
    });

    it('should return error when binary answer is whitespace only', () => {
      const error = validateAnswer(binaryQuestion, '   ');
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('required');
    });

    it('should return error when binary answer is invalid value', () => {
      const error = validateAnswer(binaryQuestion, 'Maybe');
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('format');
      expect(error?.message).toBe('Please select a valid option');
    });

    it('should pass validation when binary answer is "Oo"', () => {
      const error = validateAnswer(binaryQuestion, 'Oo');
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary answer is "Hindi"', () => {
      const error = validateAnswer(binaryQuestion, 'Hindi');
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary answer is "Yes"', () => {
      const error = validateAnswer(binaryQuestion, 'Yes');
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary answer is "No"', () => {
      const error = validateAnswer(binaryQuestion, 'No');
      
      expect(error).toBeNull();
    });
  });

  describe('Suggestion Field Error Handling - Yes Case (Requirement 1.4)', () => {
    const suggestionQuestion: Question = {
      id: 'suggestionsProjects',
      type: 'textarea',
      question: 'What are your specific comments or suggestions?',
      required: false,
      dependsOn: 'nfaBinaryProjects',
      dependsOnValue: 'Oo',
    };

    it('should return error when binary is "Yes" and suggestion is empty', () => {
      const allAnswers = { nfaBinaryProjects: 'Yes' };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('required');
      expect(error?.message).toBe('Please provide specific comments or suggestions for improvement');
    });

    it('should return error when binary is "Oo" and suggestion is empty', () => {
      const allAnswers = { nfaBinaryProjects: 'Oo' };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('required');
      expect(error?.message).toBe('Please provide specific comments or suggestions for improvement');
    });

    it('should return error when binary is "Yes" and suggestion is whitespace only', () => {
      const allAnswers = { nfaBinaryProjects: 'Yes' };
      const error = validateAnswer(suggestionQuestion, '   \n\t  ', allAnswers);
      
      expect(error).not.toBeNull();
      expect(error?.type).toBe('required');
      expect(error?.message).toBe('Please provide specific comments or suggestions for improvement');
    });

    it('should pass validation when binary is "Yes" and suggestion has content', () => {
      const allAnswers = { nfaBinaryProjects: 'Yes' };
      const error = validateAnswer(suggestionQuestion, 'Need better roads', allAnswers);
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary is "Oo" and suggestion has content', () => {
      const allAnswers = { nfaBinaryProjects: 'Oo' };
      const error = validateAnswer(suggestionQuestion, 'Kailangan ng mas magandang kalsada', allAnswers);
      
      expect(error).toBeNull();
    });
  });

  describe('Suggestion Field Error Handling - No Case (Requirement 1.5)', () => {
    const suggestionQuestion: Question = {
      id: 'suggestionsProjects',
      type: 'textarea',
      question: 'What are your specific comments or suggestions?',
      required: false,
      dependsOn: 'nfaBinaryProjects',
      dependsOnValue: 'Oo',
    };

    it('should pass validation when binary is "No" and suggestion is empty', () => {
      const allAnswers = { nfaBinaryProjects: 'No' };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary is "Hindi" and suggestion is empty', () => {
      const allAnswers = { nfaBinaryProjects: 'Hindi' };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary is "No" and suggestion has content', () => {
      const allAnswers = { nfaBinaryProjects: 'No' };
      const error = validateAnswer(suggestionQuestion, 'Service is good', allAnswers);
      
      expect(error).toBeNull();
    });

    it('should pass validation when binary is "Hindi" and suggestion has content', () => {
      const allAnswers = { nfaBinaryProjects: 'Hindi' };
      const error = validateAnswer(suggestionQuestion, 'Ayos na ang serbisyo', allAnswers);
      
      expect(error).toBeNull();
    });
  });

  describe('Form State Inconsistency Handling (Requirement 6.5)', () => {
    const suggestionQuestion: Question = {
      id: 'suggestionsProjects',
      type: 'textarea',
      question: 'What are your specific comments or suggestions?',
      required: false,
      dependsOn: 'nfaBinaryProjects',
      dependsOnValue: 'Oo',
    };

    it('should handle gracefully when binary answer is not provided yet', () => {
      const allAnswers = {}; // Binary question not answered
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      // Should not show error for suggestion field if binary not answered yet
      expect(error).toBeNull();
    });

    it('should handle gracefully when binary answer is undefined', () => {
      const allAnswers = { nfaBinaryProjects: undefined };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error).toBeNull();
    });

    it('should handle gracefully when binary answer is null', () => {
      const allAnswers = { nfaBinaryProjects: null };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error).toBeNull();
    });

    it('should validate correctly after binary answer is provided', () => {
      // First, no binary answer
      let allAnswers = {};
      let error = validateAnswer(suggestionQuestion, '', allAnswers);
      expect(error).toBeNull();
      
      // Then, binary answer is "Yes" - should require suggestion
      allAnswers = { nfaBinaryProjects: 'Yes' };
      error = validateAnswer(suggestionQuestion, '', allAnswers);
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Please provide specific comments or suggestions for improvement');
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('should provide clear error message for missing binary answer', () => {
      const binaryQuestion: Question = {
        id: 'nfaBinaryProjects',
        type: 'radio',
        question: 'Do you believe this service needs improvement?',
        options: ['Yes', 'No'],
        required: true,
      };
      
      const error = validateAnswer(binaryQuestion, '');
      
      expect(error?.message).toBe('Please indicate whether this service needs improvement');
      expect(error?.message).not.toContain('required'); // Avoid technical jargon
      expect(error?.message).not.toContain('field'); // Use natural language
    });

    it('should provide clear error message for empty suggestion when Yes selected', () => {
      const suggestionQuestion: Question = {
        id: 'suggestionsProjects',
        type: 'textarea',
        question: 'What are your suggestions?',
        required: false,
        dependsOn: 'nfaBinaryProjects',
      };
      
      const allAnswers = { nfaBinaryProjects: 'Yes' };
      const error = validateAnswer(suggestionQuestion, '', allAnswers);
      
      expect(error?.message).toBe('Please provide specific comments or suggestions for improvement');
      expect(error?.message).toContain('specific'); // Guide user on what to provide
      expect(error?.message).toContain('comments or suggestions'); // Clear about what's needed
    });

    it('should provide clear error message for invalid binary value', () => {
      const binaryQuestion: Question = {
        id: 'nfaBinaryProjects',
        type: 'radio',
        question: 'Do you believe this service needs improvement?',
        options: ['Yes', 'No'],
        required: true,
      };
      
      const error = validateAnswer(binaryQuestion, 'Maybe');
      
      expect(error?.message).toBe('Please select a valid option');
      expect(error?.message).not.toContain('Invalid'); // Avoid negative language
    });
  });

  describe('Multiple Service Indicators', () => {
    it('should handle errors independently for different service indicators', () => {
      const projectsBinary: Question = {
        id: 'nfaBinaryProjects',
        type: 'radio',
        question: 'Projects need improvement?',
        options: ['Yes', 'No'],
        required: true,
      };
      
      const financialBinary: Question = {
        id: 'nfaBinaryFinancial',
        type: 'radio',
        question: 'Financial transparency needs improvement?',
        options: ['Yes', 'No'],
        required: true,
      };
      
      // Projects binary missing
      const projectsError = validateAnswer(projectsBinary, '');
      expect(projectsError).not.toBeNull();
      
      // Financial binary provided
      const financialError = validateAnswer(financialBinary, 'Yes');
      expect(financialError).toBeNull();
    });

    it('should handle suggestion validation independently for different indicators', () => {
      const projectsSuggestion: Question = {
        id: 'suggestionsProjects',
        type: 'textarea',
        question: 'Projects suggestions?',
        required: false,
        dependsOn: 'nfaBinaryProjects',
      };
      
      const financialSuggestion: Question = {
        id: 'suggestionsFinancial',
        type: 'textarea',
        question: 'Financial suggestions?',
        required: false,
        dependsOn: 'nfaBinaryFinancial',
      };
      
      const allAnswers = {
        nfaBinaryProjects: 'Yes',
        nfaBinaryFinancial: 'No',
      };
      
      // Projects suggestion required (binary is Yes)
      const projectsError = validateAnswer(projectsSuggestion, '', allAnswers);
      expect(projectsError).not.toBeNull();
      
      // Financial suggestion optional (binary is No)
      const financialError = validateAnswer(financialSuggestion, '', allAnswers);
      expect(financialError).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle binary answer with extra spaces', () => {
      const binaryQuestion: Question = {
        id: 'nfaBinaryProjects',
        type: 'radio',
        question: 'Needs improvement?',
        options: ['Yes', 'No'],
        required: true,
      };
      
      // Should trim and validate
      const error = validateAnswer(binaryQuestion, '  Yes  ');
      expect(error).toBeNull();
    });

    it('should handle suggestion with only newlines and tabs', () => {
      const suggestionQuestion: Question = {
        id: 'suggestionsProjects',
        type: 'textarea',
        question: 'Suggestions?',
        required: false,
        dependsOn: 'nfaBinaryProjects',
      };
      
      const allAnswers = { nfaBinaryProjects: 'Yes' };
      const error = validateAnswer(suggestionQuestion, '\n\n\t\t\n', allAnswers);
      
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Please provide specific comments or suggestions for improvement');
    });

    it('should handle mixed case binary answers', () => {
      const binaryQuestion: Question = {
        id: 'nfaBinaryProjects',
        type: 'radio',
        question: 'Needs improvement?',
        options: ['Yes', 'No'],
        required: true,
      };
      
      // Should be case-sensitive (only exact matches are valid)
      const errorYes = validateAnswer(binaryQuestion, 'yes');
      expect(errorYes).not.toBeNull(); // lowercase not valid
      
      const errorNo = validateAnswer(binaryQuestion, 'NO');
      expect(errorNo).not.toBeNull(); // uppercase not valid
    });
  });
});
