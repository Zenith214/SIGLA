/**
 * Tests for dynamic validation updates in the survey form
 * 
 * Requirements tested:
 * - 6.1: Binary answer change from "Yes" to "No" removes required validation
 * - 6.2: Binary answer change from "No" to "Yes" applies required validation
 * - 6.3: Text preservation when binary answer changes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionRenderer } from '../QuestionRenderer';
import type { Question } from '@/types/survey';

describe('Dynamic Validation Updates', () => {
  const binaryQuestion: Question = {
    id: 'nfaBinaryProjects',
    type: 'radio',
    question: 'Do you believe this service needs improvement?',
    options: ['Oo', 'Hindi'],
    required: true
  };

  const suggestionQuestion: Question = {
    id: 'suggestionsProjects',
    type: 'textarea',
    question: 'What are your suggestions?',
    required: false,
    dependsOn: 'nfaBinaryProjects',
    dependsOnValue: 'Oo'
  };

  describe('Requirement 6.1: Binary change from Yes to No removes required validation', () => {
    it('should not show validation error when binary changes from Oo to Hindi with empty suggestion', async () => {
      const onAnswerChange = jest.fn();
      const allAnswers = {
        nfaBinaryProjects: 'Oo',
        suggestionsProjects: ''
      };

      const { rerender } = render(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer=""
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={allAnswers}
        />
      );

      // Initially with "Oo", should show validation error for empty suggestion
      await waitFor(() => {
        const errorMessage = screen.queryByText(/provide specific comments/i);
        expect(errorMessage).toBeInTheDocument();
      });

      // Change binary answer to "Hindi"
      const updatedAnswers = {
        ...allAnswers,
        nfaBinaryProjects: 'Hindi'
      };

      rerender(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer=""
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={updatedAnswers}
        />
      );

      // After changing to "Hindi", validation error should disappear
      await waitFor(() => {
        const errorMessage = screen.queryByText(/provide specific comments/i);
        expect(errorMessage).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirement 6.2: Binary change from No to Yes applies required validation', () => {
    it('should show validation error when binary changes from Hindi to Oo with empty suggestion', async () => {
      const onAnswerChange = jest.fn();
      const allAnswers = {
        nfaBinaryProjects: 'Hindi',
        suggestionsProjects: ''
      };

      const { rerender } = render(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer=""
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={allAnswers}
        />
      );

      // Initially with "Hindi", should not show validation error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/provide specific comments/i);
        expect(errorMessage).not.toBeInTheDocument();
      });

      // Change binary answer to "Oo"
      const updatedAnswers = {
        ...allAnswers,
        nfaBinaryProjects: 'Oo'
      };

      rerender(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer=""
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={updatedAnswers}
        />
      );

      // After changing to "Oo", validation error should appear
      await waitFor(() => {
        const errorMessage = screen.queryByText(/provide specific comments/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 6.3: Text preservation during validation changes', () => {
    it('should preserve suggestion text when binary changes from Oo to Hindi', async () => {
      const onAnswerChange = jest.fn();
      const suggestionText = 'Need better infrastructure';
      const allAnswers = {
        nfaBinaryProjects: 'Oo',
        suggestionsProjects: suggestionText
      };

      const { rerender } = render(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer={suggestionText}
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={allAnswers}
        />
      );

      // Verify text is displayed
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(suggestionText);

      // Change binary answer to "Hindi"
      const updatedAnswers = {
        ...allAnswers,
        nfaBinaryProjects: 'Hindi'
      };

      rerender(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer={suggestionText}
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={updatedAnswers}
        />
      );

      // Text should still be preserved
      expect(textarea.value).toBe(suggestionText);
      
      // And no validation error should be shown
      const errorMessage = screen.queryByText(/provide specific comments/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should preserve suggestion text when binary changes from Hindi to Oo', async () => {
      const onAnswerChange = jest.fn();
      const suggestionText = 'Keep up the good work';
      const allAnswers = {
        nfaBinaryProjects: 'Hindi',
        suggestionsProjects: suggestionText
      };

      const { rerender } = render(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer={suggestionText}
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={allAnswers}
        />
      );

      // Verify text is displayed
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(suggestionText);

      // Change binary answer to "Oo"
      const updatedAnswers = {
        ...allAnswers,
        nfaBinaryProjects: 'Oo'
      };

      rerender(
        <QuestionRenderer
          question={suggestionQuestion}
          currentAnswer={suggestionText}
          onAnswerChange={onAnswerChange}
          isEnabled={true}
          showValidation={true}
          allAnswers={updatedAnswers}
        />
      );

      // Text should still be preserved
      expect(textarea.value).toBe(suggestionText);
      
      // And no validation error should be shown (because text is present)
      const errorMessage = screen.queryByText(/provide specific comments/i);
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  describe('Validation updates without page refresh', () => {
    it('should update validation immediately without page refresh', async () => {
      const onAnswerChange = jest.fn();
      let currentBinaryAnswer = 'Hindi';
      
      const TestComponent = () => {
        const [allAnswers, setAllAnswers] = React.useState({
          nfaBinaryProjects: currentBinaryAnswer,
          suggestionsProjects: ''
        });

        return (
          <div>
            <button
              onClick={() => {
                currentBinaryAnswer = 'Oo';
                setAllAnswers({
                  ...allAnswers,
                  nfaBinaryProjects: 'Oo'
                });
              }}
            >
              Change to Oo
            </button>
            <QuestionRenderer
              question={suggestionQuestion}
              currentAnswer=""
              onAnswerChange={onAnswerChange}
              isEnabled={true}
              showValidation={true}
              allAnswers={allAnswers}
            />
          </div>
        );
      };

      render(<TestComponent />);

      // Initially no error
      expect(screen.queryByText(/provide specific comments/i)).not.toBeInTheDocument();

      // Click button to change binary answer
      const button = screen.getByText('Change to Oo');
      fireEvent.click(button);

      // Validation error should appear immediately without page refresh
      await waitFor(() => {
        expect(screen.getByText(/provide specific comments/i)).toBeInTheDocument();
      });
    });
  });
});
