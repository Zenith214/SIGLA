// Survey validation utilities
import type { Question } from "../page";

export interface ValidationError {
  questionId: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'type';
}

/**
 * Validate a single answer against question requirements
 */
export function validateAnswer(question: Question, answer: any): ValidationError | null {
  // Skip validation for non-required questions if no answer provided
  if (!question.required && (answer === undefined || answer === null || answer === '')) {
    return null;
  }

  // Required field validation
  if (question.required) {
    if (answer === undefined || answer === null || answer === '') {
      return {
        questionId: question.id,
        message: 'This field is required',
        type: 'required'
      };
    }

    // Special validation for checkbox (must have at least one selection)
    if (question.type === 'checkbox') {
      if (!Array.isArray(answer) || answer.length === 0) {
        return {
          questionId: question.id,
          message: 'Please select at least one option',
          type: 'required'
        };
      }
    }

    // Special validation for grouped questions
    if (question.type === 'grouped') {
      if (!answer?.main || answer.main === '') {
        return {
          questionId: question.id,
          message: 'Please answer the main question',
          type: 'required'
        };
      }
    }
  }

  // Type-specific validation
  switch (question.type) {
    case 'text':
      return validateTextAnswer(question, answer);
    case 'textarea':
      return validateTextareaAnswer(question, answer);
    case 'radio':
      return validateRadioAnswer(question, answer);
    case 'checkbox':
      return validateCheckboxAnswer(question, answer);
    case 'grouped':
      return validateGroupedAnswer(question, answer);
    default:
      return null;
  }
}

/**
 * Validate text input
 */
function validateTextAnswer(question: Question, answer: string): ValidationError | null {
  if (!answer || answer.trim() === '') {
    return null; // Already handled by required check
  }

  // Check for minimum length (if applicable)
  if (answer.trim().length < 2) {
    return {
      questionId: question.id,
      message: 'Answer must be at least 2 characters long',
      type: 'format'
    };
  }

  // Check for maximum length
  if (answer.length > 500) {
    return {
      questionId: question.id,
      message: 'Answer must not exceed 500 characters',
      type: 'format'
    };
  }

  return null;
}

/**
 * Validate textarea input
 */
function validateTextareaAnswer(question: Question, answer: string): ValidationError | null {
  if (!answer || answer.trim() === '') {
    return null; // Already handled by required check
  }

  // Check for minimum length (if applicable)
  if (answer.trim().length < 5) {
    return {
      questionId: question.id,
      message: 'Answer must be at least 5 characters long',
      type: 'format'
    };
  }

  // Check for maximum length
  if (answer.length > 2000) {
    return {
      questionId: question.id,
      message: 'Answer must not exceed 2000 characters',
      type: 'format'
    };
  }

  return null;
}

/**
 * Validate radio button selection
 */
function validateRadioAnswer(question: Question, answer: string): ValidationError | null {
  if (!answer) {
    return null; // Already handled by required check
  }

  // Validate that the answer is one of the valid options
  if (question.options && !question.options.includes(answer)) {
    return {
      questionId: question.id,
      message: 'Please select a valid option',
      type: 'format'
    };
  }

  return null;
}

/**
 * Validate checkbox selections
 */
function validateCheckboxAnswer(question: Question, answer: string[]): ValidationError | null {
  if (!answer || !Array.isArray(answer)) {
    return null; // Already handled by required check
  }

  // Validate that all selected options are valid
  if (question.options) {
    const invalidOptions = answer.filter(opt => !question.options!.includes(opt));
    if (invalidOptions.length > 0) {
      return {
        questionId: question.id,
        message: 'Some selected options are invalid',
        type: 'format'
      };
    }
  }

  return null;
}

/**
 * Validate grouped question (main + follow-ups)
 */
function validateGroupedAnswer(question: Question, answer: any): ValidationError | null {
  if (!answer || !answer.main) {
    return null; // Already handled by required check
  }

  // Validate main answer
  if (question.mainOptions && !question.mainOptions.includes(answer.main)) {
    return {
      questionId: question.id,
      message: 'Please select a valid option for the main question',
      type: 'format'
    };
  }

  // If main answer is "Yes", validate required follow-up questions
  if (answer.main === "Yes" && question.followUpQuestions) {
    for (const followUpQ of question.followUpQuestions) {
      if (followUpQ.required) {
        const followUpAnswer = answer.followUp?.[followUpQ.id];
        
        // Check if this follow-up should be enabled
        const isEnabled = !followUpQ.dependsOn || 
          answer.followUp?.[followUpQ.dependsOn] === followUpQ.dependsOnValue;
        
        if (isEnabled && (followUpAnswer === undefined || followUpAnswer === null || followUpAnswer === '')) {
          return {
            questionId: question.id,
            message: `Please answer the required follow-up question: ${followUpQ.question}`,
            type: 'required'
          };
        }
      }
    }
  }

  return null;
}

/**
 * Validate all answers in a section
 */
export function validateSection(
  questions: Question[],
  answers: Record<string, any>,
  isQuestionEnabled: (question: Question) => boolean
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const question of questions) {
    // Only validate enabled questions
    if (!isQuestionEnabled(question)) {
      continue;
    }

    const answer = answers[question.id];
    const error = validateAnswer(question, answer);
    
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Check if a section is complete (all required questions answered)
 */
export function isSectionComplete(
  questions: Question[],
  answers: Record<string, any>,
  isQuestionEnabled: (question: Question) => boolean
): boolean {
  const errors = validateSection(questions, answers, isQuestionEnabled);
  return errors.length === 0;
}

/**
 * Get validation message for display
 */
export function getValidationMessage(error: ValidationError): string {
  return error.message;
}

/**
 * Check if answer is valid (no errors)
 */
export function isAnswerValid(question: Question, answer: any): boolean {
  const error = validateAnswer(question, answer);
  return error === null;
}
