"use client"

import React from 'react';
import type { Question } from '../page'; // Import Question interface from forms page

interface QuestionProgressBarProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  isQuestionEnabled: (question: Question | undefined) => boolean;
  sectionTitle: string;
  currentSectionIndex: number; // NEW: Index of current section in assigned sections
  totalSections: number; // NEW: Total number of sections (6 for CSIS)
}

export function QuestionProgressBar({
  questions,
  currentQuestionIndex,
  answers,
  isQuestionEnabled,
  sectionTitle,
  currentSectionIndex,
  totalSections,
}: QuestionProgressBarProps) {
  const getAnsweredCount = () => {
    return questions.filter((q, index) => {
      const isCurrentlyEnabled = isQuestionEnabled(q);
      const answer = answers[q.id];
      
      // Count as answered if:
      // 1. Question is enabled and has a real answer
      // 2. Question was explicitly skipped (user passed this question)
      if (isCurrentlyEnabled) {
        if (q.type === "grouped") {
          const groupAnswer = answers[q.id];
          return groupAnswer && groupAnswer.main !== undefined && groupAnswer.main !== "";
        }
        return answer !== undefined && answer !== "";
      } else if (answer === null && answers[`${q.id}_skipReason`]) {
        // Only count as completed if user has passed this question
        // (i.e., current question index is beyond this question)
        return index < currentQuestionIndex;
      }
      
      return false;
    }).length;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
        <h2 className="text-xl font-semibold text-gray-900">{sectionTitle}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {currentSectionIndex >= 0 && (
            <span className="text-sm font-medium text-blue-600">
              Section {currentSectionIndex + 1} of {totalSections}
            </span>
          )}
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
      </div>
      <div className="flex space-x-1">
        {questions.map((question, index) => {
          let isAnswered = false;
          let isSkipped = false;
          const isCurrentlyEnabled = isQuestionEnabled(question);
          const answer = answers[question.id];

          if (isCurrentlyEnabled) {
            if (question.type === "grouped") {
              const groupAnswer = answers[question.id];
              isAnswered = groupAnswer && groupAnswer.main !== undefined && groupAnswer.main !== "";
            } else {
              isAnswered = answer !== undefined && answer !== "";
            }
          } else if (answer === null && answers[`${question.id}_skipReason`]) {
            // Question was skipped due to conditional logic
            // Only show as skipped if user has passed this question
            isSkipped = index < currentQuestionIndex;
          }

          return (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                index <= currentQuestionIndex 
                  ? (isAnswered ? "bg-green-500" : isSkipped ? "bg-yellow-500" : "bg-blue-300") 
                  : "bg-gray-300"
              }`}
              title={isSkipped ? "Skipped due to conditional logic" : isAnswered ? "Answered" : "Current/Pending"}
            />
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span>{getAnsweredCount()} of {questions.length} questions completed</span>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Skipped</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}