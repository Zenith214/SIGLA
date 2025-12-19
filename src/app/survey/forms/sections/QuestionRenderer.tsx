import React, { useState, useEffect } from 'react';
import type { Question } from '@/types/survey';
import { validateAnswer, type ValidationError } from '../utils/validation';

interface QuestionRendererProps {
  question: Question;
  currentAnswer: any;
  onAnswerChange: (value: any) => void;
  isEnabled: boolean;
  showValidation?: boolean;
  allAnswers?: Record<string, any>; // For conditional validation
}

export function QuestionRenderer({ question, currentAnswer, onAnswerChange, isEnabled, showValidation = false, allAnswers }: QuestionRendererProps) {
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [touched, setTouched] = useState(false);
  
  const disabledClass = isEnabled ? "" : "opacity-50 pointer-events-none";
  const isSatisfactionQuestion = question.options?.some((opt: string) => ["1", "2", "3", "4", "5"].includes(opt));

  /**
   * Dynamic Validation Implementation for Task 5
   * 
   * This component implements dynamic validation updates for NFA binary questions:
   * - Requirement 6.1: Removes required validation when binary changes from "Yes" to "No"
   * - Requirement 6.2: Applies required validation when binary changes from "No" to "Yes"
   * - Requirement 6.3: Preserves existing text when validation rules change
   * 
   * The validation updates happen immediately without page refresh through React's
   * useEffect hooks that monitor changes to allAnswers (which includes the binary answer).
   */

  // Validate on answer change or when showValidation changes
  // IMPORTANT: Also re-validate when allAnswers changes (for conditional validation)
  useEffect(() => {
    if (isEnabled && (touched || showValidation)) {
      const error = validateAnswer(question, currentAnswer, allAnswers);
      setValidationError(error);
    }
  }, [currentAnswer, question, isEnabled, touched, showValidation, allAnswers]);

  // Dynamic validation update: Re-validate when binary answer changes
  // This ensures suggestion fields update their required status immediately
  // Requirement 6.1, 6.2: Update validation when binary answer changes
  useEffect(() => {
    // Check if this is a suggestion field that depends on a binary NFA question
    if (question.id.startsWith('suggestions') && question.dependsOn?.startsWith('nfaBinary')) {
      const binaryFieldId = question.dependsOn;
      const binaryAnswer = allAnswers?.[binaryFieldId];
      
      // Re-validate whenever the binary answer changes, even if not touched yet
      // This ensures the required status updates immediately
      if (binaryAnswer !== undefined) {
        const error = validateAnswer(question, currentAnswer, allAnswers);
        setValidationError(error);
        
        // If the binary answer changed to "No" and we have an error, clear it
        // since the field is no longer required
        const isNo = binaryAnswer === 'No' || binaryAnswer === 'Hindi';
        if (isNo && error?.type === 'required') {
          setValidationError(null);
        }
      }
    }
  }, [allAnswers, question, currentAnswer, touched]);

  // Handle answer change with validation
  // Requirement 6.3: Preserve existing text when validation rules change
  const handleChange = (value: any) => {
    setTouched(true);
    onAnswerChange(value);
    
    // For binary NFA questions, trigger re-validation of dependent suggestion fields
    // Requirement 6.1, 6.2: Dynamic validation updates when binary answer changes
    // This ensures the suggestion field's required status updates immediately
    if (question.id.startsWith('nfaBinary')) {
      // The dependent suggestion field will re-validate via the useEffect above
      // The suggestion text is preserved in the parent state and will remain unchanged
      // Only the validation status (required/optional) will update
    }
  };

  const inputClassName = validationError && touched 
    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

  switch (question.type) {
    case "radio": {
      // Check if this radio question has followUpQuestions
      const hasFollowUps = question.followUpQuestions && question.followUpQuestions.length > 0;
      const mainAnswer = hasFollowUps ? currentAnswer?.main : currentAnswer;
      const followUpAnswers = hasFollowUps ? (currentAnswer?.followUp || {}) : {};
      
      return (
        <div>
          <div className={`space-y-3 ${isSatisfactionQuestion ? "flex flex-wrap gap-x-4 justify-center" : ""} ${disabledClass}`}>
            {question.options?.map((option: string, index: number) => {
              // Use original option for value, translated option for display
              const displayLabel = (question as any).translatedOptions?.[index] || option;
              return (
                <label
                  key={option}
                  className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg ${
                    isEnabled ? "hover:bg-gray-50" : "cursor-not-allowed"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={mainAnswer === option}
                    onChange={(e) => {
                      if (hasFollowUps) {
                        // Store as object with main and followUp
                        const newAnswer = {
                          main: e.target.value,
                          followUp: followUpAnswers
                        };
                        handleChange(newAnswer);
                      } else {
                        // Store as simple string
                        handleChange(e.target.value);
                      }
                    }}
                    disabled={!isEnabled}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className={`text-gray-700 ${!isEnabled ? "text-gray-400" : ""}`}>{displayLabel}</span>
                </label>
              );
            })}
          </div>
          
          {/* Render followUpQuestions if they exist */}
          {hasFollowUps && (
            <div className="mt-6 space-y-6">
              {question.followUpQuestions?.map((followUpQ: any) => {
                const followUpAnswer = followUpAnswers[followUpQ.id];
                // Check if this followUp depends on the main question or another followUp
                const dependsOnValue = followUpQ.dependsOn === question.id 
                  ? mainAnswer  // Main question answer
                  : followUpAnswers[followUpQ.dependsOn]; // Another followUp answer
                const isThisQuestionEnabled =
                  isEnabled &&
                  (!followUpQ.dependsOn || dependsOnValue === followUpQ.dependsOnValue);

                return (
                  <div key={followUpQ.id} className={`ml-6 pl-4 border-l-2 ${isThisQuestionEnabled ? 'border-blue-300' : 'border-gray-200'}`}>
                    <h6
                      className={`text-sm font-medium mb-3 ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}
                      dangerouslySetInnerHTML={{ __html: followUpQ.question }}
                    ></h6>

                    {followUpQ.type === "textarea" && (
                      <textarea
                        value={followUpAnswer || ""}
                        onChange={(e) => {
                          if (isThisQuestionEnabled) {
                            const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value };
                            const newAnswer = { main: mainAnswer, followUp: newFollowUp };
                            handleChange(newAnswer);
                          }
                        }}
                        disabled={!isThisQuestionEnabled}
                        rows={4}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                          !isThisQuestionEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
                        }`}
                        placeholder={
                          isThisQuestionEnabled
                            ? "Please specify your reason..."
                            : "This field will be enabled when you select the corresponding option"
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case "checkbox": {
      // Check if this checkbox question has followUpQuestions
      const hasFollowUps = question.followUpQuestions && question.followUpQuestions.length > 0;
      const checkboxAnswer = hasFollowUps && typeof currentAnswer === 'object' && currentAnswer !== null && !Array.isArray(currentAnswer)
        ? currentAnswer.main
        : currentAnswer;
      const followUpAnswers = hasFollowUps && typeof currentAnswer === 'object' && currentAnswer !== null && !Array.isArray(currentAnswer)
        ? (currentAnswer.followUp || {})
        : {};
      
      return (
        <div>
          <div className={`space-y-3 ${disabledClass}`}>
            {question.options?.map((option: string, index: number) => {
              // Use original option for value, translated option for display
              const displayLabel = (question as any).translatedOptions?.[index] || option;
              return (
                <label
                  key={option}
                  className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg ${
                    isEnabled ? "hover:bg-gray-50" : "cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(checkboxAnswer) && checkboxAnswer.includes(option)}
                    onChange={(e) => {
                      const currentArray = Array.isArray(checkboxAnswer) ? checkboxAnswer : []
                      const newArray = e.target.checked
                        ? [...currentArray, option]
                        : currentArray.filter((item) => item !== option)
                      
                      if (hasFollowUps) {
                        // Store as object with main and followUp
                        const newAnswer = {
                          main: newArray,
                          followUp: followUpAnswers
                        };
                        handleChange(newAnswer);
                      } else {
                        // Store as simple array
                        handleChange(newArray);
                      }
                    }}
                    disabled={!isEnabled}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded disabled:opacity-50"
                  />
                  <span className={`text-gray-700 ${!isEnabled ? "text-gray-400" : ""}`}>{displayLabel}</span>
                </label>
              );
            })}
          </div>
          
          {/* Render followUpQuestions if they exist */}
          {hasFollowUps && (
            <div className="mt-6 space-y-6">
              {question.followUpQuestions?.map((followUpQ: any) => {
                const followUpAnswer = followUpAnswers[followUpQ.id];
                // For checkbox, check if the dependsOnValue is in the array
                const isOtherSelected = Array.isArray(checkboxAnswer) && (
                  checkboxAnswer.includes("Iba pa (Other)") ||
                  checkboxAnswer.includes("Laing rason (Other)") ||
                  checkboxAnswer.includes("Other")
                );
                const isThisQuestionEnabled = isEnabled && isOtherSelected;

                return (
                  <div key={followUpQ.id} className={`ml-6 pl-4 border-l-2 ${isThisQuestionEnabled ? 'border-blue-300' : 'border-gray-200'}`}>
                    <h6
                      className={`text-sm font-medium mb-3 ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}
                    >
                      {followUpQ.question}
                    </h6>

                    {followUpQ.type === "textarea" && (
                      <textarea
                        value={followUpAnswer || ""}
                        onChange={(e) => {
                          if (isThisQuestionEnabled) {
                            const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value };
                            const newAnswer = { main: checkboxAnswer, followUp: newFollowUp };
                            handleChange(newAnswer);
                          }
                        }}
                        disabled={!isThisQuestionEnabled}
                        rows={4}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                          !isThisQuestionEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
                        }`}
                        placeholder={
                          isThisQuestionEnabled
                            ? "Please specify your reason..."
                            : "This field will be enabled when you select 'Other'"
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case "text":
      return (
        <div>
          <input
            type="text"
            value={currentAnswer || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={!isEnabled}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
              !isEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            } ${inputClassName}`}
            placeholder={
              isEnabled ? "Enter your answer..." : "This field will be enabled when the previous question is answered"
            }
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <textarea
            value={currentAnswer || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={!isEnabled}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors resize-none ${
              !isEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            } ${inputClassName}`}
            placeholder={
              isEnabled
                ? "Enter your detailed response..."
                : "This field will be enabled when the previous question is answered"
            }
          />
          {currentAnswer && (
            <p className="mt-1 text-xs text-gray-500 text-right">
              {currentAnswer.length} / 2000 characters
            </p>
          )}
        </div>
      );

    case "grouped": {
      const mainAnswer = currentAnswer?.main;
      const followUpAnswers = currentAnswer?.followUp || {};
      const isFollowUpEnabled = mainAnswer === "Yes"; // Assuming "Yes" enables follow-ups

      return (
        <div className="space-y-8">
          {/* Main Question */}
          <div>
            <h4 className="text-base font-medium text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: question.question }}></h4>
            <div className="space-y-3">
              {question.mainOptions?.map((option: string) => (
                <label
                  key={option}
                  className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={mainAnswer === option}
                    onChange={(e) => {
                      const newAnswer = {
                        ...currentAnswer,
                        main: e.target.value,
                        followUp: e.target.value === "Yes" ? followUpAnswers : {}, // Clear follow-ups if main is not "Yes"
                      };
                      handleChange(newAnswer);
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Follow-up Questions */}
          <div className={`space-y-6 ${!isFollowUpEnabled ? "opacity-50" : ""}`}>
            <div className="border-l-4 border-blue-200 pl-6">
              <h5 className="text-sm font-medium text-gray-600 mb-4 uppercase tracking-wide">
                Follow-up Questions
                {!isFollowUpEnabled && (
                  <span className="ml-2 text-xs text-yellow-600 font-normal normal-case">
                    (Select "Yes" above to enable)
                  </span>
                )}
              </h5>

              {question.followUpQuestions?.map((followUpQ: any) => {
                const followUpAnswer = followUpAnswers[followUpQ.id];
                // Check if this followUp depends on the main question or another followUp
                const dependsOnValue = followUpQ.dependsOn === question.id 
                  ? mainAnswer  // Main question answer
                  : followUpAnswers[followUpQ.dependsOn]; // Another followUp answer
                const isThisQuestionEnabled =
                  isFollowUpEnabled &&
                  (!followUpQ.dependsOn || dependsOnValue === followUpQ.dependsOnValue)

                return (
                  <div key={followUpQ.id} className="mb-6">
                    <h6
                      className={`text-sm font-medium mb-3 ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}
                      dangerouslySetInnerHTML={{ __html: followUpQ.question }}
                    ></h6>

                    {followUpQ.type === "radio" && (
                      <div className={`space-y-2 ${!isThisQuestionEnabled ? "pointer-events-none" : ""}`}>
                        {(followUpQ.translatedOptions || followUpQ.options)?.map((displayOption: string, index: number) => {
                          const valueOption = followUpQ.options?.[index] || displayOption;
                          return (
                            <label
                              key={valueOption}
                              className={`flex items-center space-x-3 p-2 rounded-lg ${
                                isThisQuestionEnabled ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`${question.id}_${followUpQ.id}`}
                                value={valueOption}
                                checked={followUpAnswer === valueOption}
                                onChange={(e) => {
                                  if (isThisQuestionEnabled) {
                                    const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value }
                                    const newAnswer = { ...currentAnswer, followUp: newFollowUp }
                                    handleChange(newAnswer)
                                  }
                                }}
                                disabled={!isThisQuestionEnabled}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className={`text-sm ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}>
                                {displayOption}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {followUpQ.type === "text" && (
                      <input
                        type="text"
                        value={followUpAnswer || ""}
                        onChange={(e) => {
                          if (isThisQuestionEnabled) {
                            const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value }
                            const newAnswer = { ...currentAnswer, followUp: newFollowUp }
                            handleChange(newAnswer)
                          }
                        }}
                        disabled={!isThisQuestionEnabled}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                          !isThisQuestionEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
                        }`}
                        placeholder={
                          isThisQuestionEnabled
                            ? "Enter your answer..."
                            : "This field will be enabled when conditions are met"
                        }
                      />
                    )}

                    {followUpQ.type === "textarea" && (
                      <textarea
                        value={followUpAnswer || ""}
                        onChange={(e) => {
                          if (isThisQuestionEnabled) {
                            const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value }
                            const newAnswer = { ...currentAnswer, followUp: newFollowUp }
                            handleChange(newAnswer)
                          }
                        }}
                        disabled={!isThisQuestionEnabled}
                        rows={4}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                          !isThisQuestionEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
                        }`}
                        placeholder={
                          isThisQuestionEnabled
                            ? "Please specify your reason..."
                            : "This field will be enabled when conditions are met"
                        }
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}