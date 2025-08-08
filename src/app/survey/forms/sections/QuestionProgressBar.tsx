"use client"

import React from 'react';
import type { Question } from '../../page'; // Assuming Question interface is exported from page.tsx

interface QuestionProgressBarProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  isQuestionEnabled: (question: Question | undefined) => boolean;
  sectionTitle: string;
}

export function QuestionProgressBar({
  questions,
  currentQuestionIndex,
  answers,
  isQuestionEnabled,
  sectionTitle,
}: QuestionProgressBarProps) {
  const getAnsweredCount = () => {
    return questions.filter((q) => {
      const isCurrentlyEnabled = isQuestionEnabled(q);
      if (isCurrentlyEnabled) {
        if (q.type === "grouped") {
          const groupAnswer = answers[q.id];
          return groupAnswer && groupAnswer.main !== undefined && groupAnswer.main !== "";
        }
        return answers[q.id] !== undefined && answers[q.id] !== "";
      }
      return false;
    }).length;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900">{sectionTitle}</h2>
        <span className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>
      <div className="flex space-x-1">
        {questions.map((question, index) => {
          let isAnswered = false;
          const isCurrentlyEnabled = isQuestionEnabled(question);

          if (isCurrentlyEnabled) {
            if (question.type === "grouped") {
              const groupAnswer = answers[question.id];
              isAnswered = groupAnswer && groupAnswer.main !== undefined && groupAnswer.main !== "";
            } else {
              isAnswered = answers[question.id] !== undefined && answers[question.id] !== "";
            }
          }

          return (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                index <= currentQuestionIndex ? (isAnswered ? "bg-green-500" : "bg-blue-300") : "bg-gray-300"
              }`}
            />
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {getAnsweredCount()} of {questions.length} questions answered
      </div>
    </div>
  );
}