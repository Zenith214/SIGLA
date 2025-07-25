"use client"

import { useState, useEffect, useRef, JSX } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getQuestionsForSection } from "../utils/questions"
import type { SurveyData, Question } from "../page"

interface QuestionFlowProps {
  sectionId: string;
  data: SurveyData;
  onUpdate: (section: keyof SurveyData, data: any) => void;
  onComplete: (nextSection: string) => void;
  onBack: () => void;
}

export function QuestionFlow({ sectionId, data, onUpdate, onComplete, onBack }: QuestionFlowProps): JSX.Element {
  const questions = getQuestionsForSection(sectionId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Use ref to track the previous sectionId to detect actual section changes
  const prevSectionIdRef = useRef<string | undefined>(undefined);

  const sectionDataKey = sectionId ? getSectionDataKey(sectionId) : "financialAdmin";

  const sectionTitle = getSectionTitle(sectionId);

  // Only reset to first question when section actually changes, not on re-renders
  useEffect(() => {
    const isNewSection = prevSectionIdRef.current !== sectionId;

    if (isNewSection) {
      // Only reset question index when switching to a different section
      setCurrentQuestionIndex(0);
      prevSectionIdRef.current = sectionId;
    }
  }, [sectionId]);

  // Ensure questions array is not empty and index is valid
  const safeQuestions: Question[] =
    questions.length > 0
      ? questions
      : [{ id: "placeholder", type: "text", question: "No questions available for this section." as any }];
  const safeIndex = Math.min(Math.max(0, currentQuestionIndex), safeQuestions.length - 1);
  const currentQuestion = safeQuestions[safeIndex];
  const isLastQuestion = safeIndex === safeQuestions.length - 1;
  const isFirstQuestion = safeIndex === 0;

  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    onUpdate(sectionDataKey, newAnswers);
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const nextSectionMap: Record<string, string> = {
        financial: "disaster",
        disaster: "safety",
        safety: "social",
        social: "business",
        business: "environmental",
        environmental: "summary",
      };
      onComplete(nextSectionMap[sectionId] || "summary");
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  const handleBack = () => {
    if (isFirstQuestion) {
      onBack()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  const getAnsweredCount = () => {
    return questions.filter((q) => {
      if (q.type === "grouped") {
        const groupAnswer = answers[q.id];
        return groupAnswer && groupAnswer.main !== undefined && groupAnswer.main !== "";
      }
      return answers[q.id] !== undefined && answers[q.id] !== "";
    }).length
  }

  const isQuestionEnabled = (question: Question | undefined) => {
    if (!question) return false;
    if (!question.dependsOn) return true;
    return answers[question.dependsOn] === question.dependsOnValue;
  }

  const renderQuestion = () => {
    if (!currentQuestion) {
      return <div className="text-center py-4 text-gray-500">No question available</div>;
    }

    const currentAnswer = answers[currentQuestion.id];
    const isEnabled = isQuestionEnabled(currentQuestion);

    // For questions that depend on other questions
    const disabledClass = isEnabled ? "" : "opacity-50 pointer-events-none";

    switch (currentQuestion.type) {
      case "radio":
        return (
          <div className={`space-y-3 ${disabledClass}`}>
            {currentQuestion.options?.map((option: string) => (
              <label
                key={option}
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg ${
                  isEnabled ? "hover:bg-gray-50" : "cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  disabled={!isEnabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className={`text-gray-700 ${!isEnabled ? "text-gray-400" : ""}`}>{option}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className={`space-y-3 ${disabledClass}`}>
            {currentQuestion.options?.map((option: string) => (
              <label
                key={option}
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg ${
                  isEnabled ? "hover:bg-gray-50" : "cursor-not-allowed"
                }`}
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : []
                    const newArray = e.target.checked
                      ? [...currentArray, option]
                      : currentArray.filter((item) => item !== option)
                    handleAnswerChange(currentQuestion.id, newArray)
                  }}
                  disabled={!isEnabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded disabled:opacity-50"
                />
                <span className={`text-gray-700 ${!isEnabled ? "text-gray-400" : ""}`}>{option}</span>
              </label>
            ))}
          </div>
        );

      case "text":
        return (
          <input
            type="text"
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            disabled={!isEnabled}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              !isEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }`}
            placeholder={
              isEnabled ? "Enter your answer..." : "This field will be enabled when the previous question is answered"
            }
          />
        );

      case "textarea":
        return (
          <textarea
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            disabled={!isEnabled}
            rows={4}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              !isEnabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }`}
            placeholder={
              isEnabled
                ? "Enter your detailed response..."
                : "This field will be enabled when the previous question is answered"
            }
          />
        );

      case "grouped": {
        const mainAnswer = currentAnswer?.main;
        const followUpAnswers = currentAnswer?.followUp || {};
        const isFollowUpEnabled = mainAnswer === "Yes";

        return (
          <div className="space-y-8">
            {/* Main Question */}
            <div>
              <h4 className="text-base font-medium text-gray-800 mb-4">{currentQuestion.question}</h4>
              <div className="space-y-3">
                {currentQuestion.mainOptions?.map((option: string) => (
                  <label
                    key={option}
                    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50`}
                  >
                    <input
                      type="radio"
                      name={`${currentQuestion.id}_main`}
                      value={option}
                      checked={mainAnswer === option}
                      onChange={(e) => {
                        const newAnswer = {
                          ...currentAnswer,
                          main: e.target.value,
                          followUp: e.target.value === "Yes" ? followUpAnswers : {},
                        };
                        handleAnswerChange(currentQuestion.id, newAnswer);
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

                {currentQuestion.followUpQuestions?.map((followUpQ: any) => {
                  const followUpAnswer = followUpAnswers[followUpQ.id];
                  const isThisQuestionEnabled =
                    isFollowUpEnabled &&
                    (!followUpQ.dependsOn || followUpAnswers[followUpQ.dependsOn] === followUpQ.dependsOnValue)

                  return (
                    <div key={followUpQ.id} className="mb-6">
                      <h6
                        className={`text-sm font-medium mb-3 ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}
                      >
                        {followUpQ.question}
                      </h6>

                      {followUpQ.type === "radio" && (
                        <div className={`space-y-2 ${!isThisQuestionEnabled ? "pointer-events-none" : ""}`}>
                          {followUpQ.options?.map((option: string) => (
                            <label
                              key={option}
                              className={`flex items-center space-x-3 p-2 rounded-lg ${
                                isThisQuestionEnabled ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`${currentQuestion.id}_${followUpQ.id}`}
                                value={option}
                                checked={followUpAnswer === option}
                                onChange={(e) => {
                                  if (isThisQuestionEnabled) {
                                    const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value }
                                    const newAnswer = { ...currentAnswer, followUp: newFollowUp }
                                    handleAnswerChange(currentQuestion.id, newAnswer)
                                  }
                                }}
                                disabled={!isThisQuestionEnabled}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className={`text-sm ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}>
                                {option}
                              </span>
                            </label>
                          ))}
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
                              handleAnswerChange(currentQuestion.id, newAnswer)
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

  return (
    <div className="p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">{sectionTitle}</h2>
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex space-x-1">
          {questions.map((question, index) => {
            let isAnswered = false

            if (question.type === "grouped") {
              const groupAnswer = answers[question.id];
              isAnswered = groupAnswer && groupAnswer.main !== undefined && groupAnswer.main !== "";
            } else {
              isAnswered = answers[question.id] !== undefined && answers[question.id] !== "";
            }

            return (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  index <= currentQuestionIndex ? (isAnswered ? "bg-green-500" : "bg-blue-300") : "bg-gray-300"
                }`}
              />
            )
          })}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {getAnsweredCount()} of {questions.length} questions answered
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          {currentQuestion?.type === "grouped" ? (
            <>
              {/* Group main question */}
              {currentQuestion.mainQuestion && (
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {currentQuestion.mainQuestion}
                </h3>
              )}
              {renderQuestion()}
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {currentQuestion?.question}
              </h3>
              {renderQuestion()}
            </>
          )}
          {!isQuestionEnabled(currentQuestion) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This question is disabled. Please answer the previous question with "Yes" to enable it.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isFirstQuestion ? "Back to Previous Section" : "Previous Question"}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>{isLastQuestion ? "Complete Section" : "Next Question"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function getSectionDataKey(sectionId: string): keyof SurveyData {
  const keyMap: Record<string, keyof SurveyData> = {
    financial: "financialAdmin",
    disaster: "disasterPrep",
    safety: "safetyPeace",
    social: "socialProtection",
    business: "businessFriendly",
    environmental: "environmental",
  }
  return keyMap[sectionId] || "financialAdmin";
}

function getSectionTitle(sectionId: string): string {
  const titleMap: Record<string, string> = {
    financial: "Financial Administration and Sustainability",
    disaster: "Disaster Preparedness",
    safety: "Safety, Peace and Order",
    social: "Social Protection and Security",
    business: "Business Friendliness and Competitiveness",
    environmental: "Environmental Management",
  }
  return titleMap[sectionId] || "Survey Section";
}