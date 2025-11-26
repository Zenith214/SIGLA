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
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        {/* Back Button - Icon only on mobile, text on desktop */}
        <button
          onClick={onBack}
          className="flex items-center justify-center md:justify-start space-x-2 w-12 h-12 md:w-auto md:px-6 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          title={isFirstQuestion ? "Back to Previous Section" : "Previous Question"}
        >
          <ArrowLeft className="w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden md:inline">{isFirstQuestion ? "Back to Previous Section" : "Previous Question"}</span>
        </button>

        {/* Reset Button - Always icon only */}
        <button
          onClick={onResetSection}
          className="flex items-center justify-center w-12 h-12 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          title="Reset all answers in this section"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Next Button - Icon only on mobile, text on desktop */}
      <button
        onClick={onNext}
        disabled={isNextButtonDisabled}
        className="flex items-center justify-center md:justify-start space-x-2 w-12 h-12 md:w-auto md:px-6 md:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={nextButtonText}
      >
        <span className="hidden md:inline">{nextButtonText}</span>
        <ArrowRight className="w-5 h-5 md:w-4 md:h-4" />
      </button>
    </div>
  );
}