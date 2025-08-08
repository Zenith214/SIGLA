"use client"

import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface QuestionFlowNavigationProps {
  isFirstQuestion: boolean;
  onBack: () => void;
  onResetSection: () => void;
  onNext: () => void;
  isNextButtonDisabled: boolean;
  nextButtonText: string;
}

export function QuestionFlowNavigation({
  isFirstQuestion,
  onBack,
  onResetSection,
  onNext,
  isNextButtonDisabled,
  nextButtonText,
}: QuestionFlowNavigationProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-5">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFirstQuestion ? "Back to Previous Section" : "Previous Question"}</span>
        </button>

        <button
          onClick={onResetSection}
          className="flex items-center justify-center w-12 h-12 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          title="Reset all answers in this section"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={onNext}
        disabled={isNextButtonDisabled}
        className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{nextButtonText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}