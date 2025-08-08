import React from 'react';
import type { Question } from '../../page'; 

interface QuestionRendererProps {
  question: Question;
  currentAnswer: any;
  onAnswerChange: (value: any) => void;
  isEnabled: boolean;
}

export function QuestionRenderer({ question, currentAnswer, onAnswerChange, isEnabled }: QuestionRendererProps) {
  const disabledClass = isEnabled ? "" : "opacity-50 pointer-events-none";
  const isSatisfactionQuestion = question.options?.some((opt: string) => ["1", "2", "3", "4", "5"].includes(opt));

  switch (question.type) {
    case "radio":
      return (
        <div className={`space-y-3 ${isSatisfactionQuestion ? "flex flex-wrap gap-x-4 justify-center" : ""} ${disabledClass}`}>
          {question.options?.map((option: string) => (
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
                checked={currentAnswer === option}
                onChange={(e) => onAnswerChange(e.target.value)}
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
          {question.options?.map((option: string) => (
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
                  onAnswerChange(newArray)
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
          onChange={(e) => onAnswerChange(e.target.value)}
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
          onChange={(e) => onAnswerChange(e.target.value)}
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
                      onAnswerChange(newAnswer);
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
                const isThisQuestionEnabled =
                  isFollowUpEnabled &&
                  (!followUpQ.dependsOn || followUpAnswers[followUpQ.dependsOn] === followUpQ.dependsOnValue)

                return (
                  <div key={followUpQ.id} className="mb-6">
                    <h6
                      className={`text-sm font-medium mb-3 ${!isThisQuestionEnabled ? "text-gray-400" : "text-gray-700"}`}
                      dangerouslySetInnerHTML={{ __html: followUpQ.question }}
                    ></h6>

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
                              name={`${question.id}_${followUpQ.id}`}
                              value={option}
                              checked={followUpAnswer === option}
                              onChange={(e) => {
                                if (isThisQuestionEnabled) {
                                  const newFollowUp = { ...followUpAnswers, [followUpQ.id]: e.target.value }
                                  const newAnswer = { ...currentAnswer, followUp: newFollowUp }
                                  onAnswerChange(newAnswer)
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
                            onAnswerChange(newAnswer)
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