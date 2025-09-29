"use client"

import { useState, useEffect, useRef, JSX } from "react"
import { getQuestionsForSection } from "../utils/questions"
import type { SurveyData, Question, SectionStatus } from "../page"
import { Card, CardContent } from "@/components/ui/card"

// Import new modular components
import { QuestionRenderer } from "./QuestionRenderer"
import { QuestionFlowNavigation } from "./QuestionFlowNavigation"
import { QuestionProgressBar } from "./QuestionProgressBar"

interface QuestionFlowProps {
  sectionId: string;
  data: SurveyData;
  onUpdate: (section: keyof SurveyData, data: any) => void;
  onComplete: () => void;
  onBack: () => void;
  onResetSectionStatus: (sectionId: string, status: SectionStatus['status']) => void;
}

export function QuestionFlow({ sectionId, data, onUpdate, onComplete, onBack, onResetSectionStatus }: QuestionFlowProps): JSX.Element {
  const questions = getQuestionsForSection(sectionId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const prevSectionIdRef = useRef<string | undefined>(undefined);

  const sectionDataKey = sectionId ? getSectionDataKey(sectionId) : "financialAdmin";
  const sectionTitle = getSectionTitle(sectionId);

  useEffect(() => {
    const isNewSection = prevSectionIdRef.current !== sectionId;

    if (isNewSection) {
      setCurrentQuestionIndex(0);
      setAnswers((data[sectionDataKey] || {}) as Record<string, any>);
      prevSectionIdRef.current = sectionId;
    } else {
      setAnswers((data[sectionDataKey] || {}) as Record<string, any>);
    }
    
    // Check if section should be marked as completed
    const currentAnswers = (data[sectionDataKey] || {}) as Record<string, any>;
    checkSectionCompletion(currentAnswers);
  }, [sectionId, data, sectionDataKey]);

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
    
    // Check if section is now complete after this answer
    checkSectionCompletion(newAnswers);
  }

  // Helper function to check if section is complete
  const checkSectionCompletion = (currentAnswers: Record<string, any>) => {
    const totalQuestions = questions.length;
    const answeredOrSkipped = questions.filter(q => {
      const answer = currentAnswers[q.id];
      const skipReason = currentAnswers[`${q.id}_skipReason`];
      const isEnabled = isQuestionEnabled(q);
      
      // Count as complete if:
      // 1. Question is enabled and has an answer
      // 2. Question was skipped (has null + skip reason)
      // 3. Question is disabled due to dependencies
      return (isEnabled && answer !== undefined && answer !== null && answer !== '') ||
             (answer === null && skipReason) ||
             (!isEnabled);
    }).length;
    
    console.log(`Section ${sectionId}: ${answeredOrSkipped}/${totalQuestions} questions handled`);
    
    // If all questions are handled, mark section as completed
    if (answeredOrSkipped === totalQuestions) {
      console.log(`Marking section ${sectionId} as completed`);
      onResetSectionStatus(sectionId, "completed");
    }
  }

  const isQuestionEnabled = (question: Question | undefined) => {
    if (!question) return false;
    if (!question.dependsOn) return true;

    const dependencyAnswer = answers[question.dependsOn];
    return dependencyAnswer === question.dependsOnValue;
  }

  const isCurrentQuestionAnswered = () => {
    if (!isQuestionEnabled(currentQuestion)) {
      return true;
    }

    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "radio":
      case "text":
      case "textarea":
        return typeof answer === 'string' && answer.trim() !== '';
      case "checkbox":
        return Array.isArray(answer) && answer.length > 0;
      case "grouped":
        return answer && typeof answer.main === 'string' && answer.main.trim() !== '';
      default:
        return false;
    }
  };

  const getNextButtonText = () => {
    let text = "Next Question";
    let isSkipping = false;

    if (currentQuestion.conditionalNext) {
      const currentAnswerValue = answers[currentQuestion.id];
      const jumpCondition = currentQuestion.conditionalNext.find(
        (condition) => condition.value === currentAnswerValue
      );

      if (jumpCondition) {
        isSkipping = true;
        const skipTargetId = jumpCondition.skipToId;

        if (skipTargetId === "endOfFinancialSection" || skipTargetId === "endOfDisasterSection" || skipTargetId === "endOfSafetySection" || skipTargetId === "endOfSocialSection" || skipTargetId === "endOfBusinessSection" || skipTargetId === "endOfEnvironmentalSection") {
          text = "Complete Section";
        } else {
          text = "Skip to Next Part";
        }
      }
    }

    if (!isSkipping && isLastQuestion) {
      text = "Complete Section";
    }

    return text;
  };

  const handleNext = () => {
    if (currentQuestion.conditionalNext) {
      const currentAnswerValue = answers[currentQuestion.id];
      const jumpCondition = currentQuestion.conditionalNext.find(
        (condition) => condition.value === currentAnswerValue
      );

      if (jumpCondition) {
        // Mark skipped questions as NULL with skip reason
        const skippedQuestions = getSkippedQuestions(currentQuestionIndex, jumpCondition.skipToId);
        const updatedAnswers = { ...answers };
        
        skippedQuestions.forEach(questionId => {
          if (!(questionId in updatedAnswers)) {
            updatedAnswers[questionId] = null;
            // Also track the skip reason
            updatedAnswers[`${questionId}_skipReason`] = getSkipReason(currentQuestion.id, currentAnswerValue);
          }
        });
        
        // Update answers with skipped questions
        setAnswers(updatedAnswers);
        onUpdate(sectionDataKey, updatedAnswers);

        const targetQuestionIndex = questions.findIndex(q => q.id === jumpCondition.skipToId);
        if (targetQuestionIndex !== -1) {
          setCurrentQuestionIndex(targetQuestionIndex);
          return;
        } else if (jumpCondition.skipToId.startsWith("endOf") && jumpCondition.skipToId.endsWith("Section")) {
          // Section is complete, mark as completed and trigger completion
          console.log(`🏁 QuestionFlow: Section ${sectionId} complete (skipped to end), marking as completed`);
          onResetSectionStatus(sectionId, "completed");
          onComplete();
          return;
        }
      }
    }

    if (isLastQuestion) {
      // Section is complete, mark as completed and trigger completion
      console.log(`🏁 QuestionFlow: Last question in ${sectionId}, marking as completed`);
      onResetSectionStatus(sectionId, "completed");
      onComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  const handleBack = () => {
    if (isFirstQuestion) {
      onBack();
    } else {
      let prevIndex = currentQuestionIndex - 1;
      while (prevIndex >= 0 && !isQuestionEnabled(questions[prevIndex])) {
        prevIndex--;
      }
      if (prevIndex >= 0) {
        setCurrentQuestionIndex(prevIndex);
      } else {
        onBack();
      }
    }
  }

  const handleResetSection = () => {
    if (window.confirm("Are you sure you want to reset all answers in this section? This action cannot be undone.")) {
      setAnswers({});
      onUpdate(sectionDataKey, {});
      setCurrentQuestionIndex(0);
      onResetSectionStatus(sectionId, "pending");
    }
  };

  const getPersistentPartHeader = () => {
    for (let i = currentQuestionIndex; i >= 0; i--) {
      if (questions[i]?.partHeader) {
        return questions[i].partHeader || ''; // Ensure it's always a string
      }
    }
    return ""; 
  };

  // Helper function to get questions that will be skipped
  const getSkippedQuestions = (currentIndex: number, skipToId: string): string[] => {
    const skippedQuestions: string[] = [];
    
    if (skipToId.startsWith("endOf") && skipToId.endsWith("Section")) {
      // Skipping to end of section - mark all remaining questions as skipped
      for (let i = currentIndex + 1; i < questions.length; i++) {
        skippedQuestions.push(questions[i].id);
      }
    } else {
      // Skipping to a specific question - mark questions in between as skipped
      const targetIndex = questions.findIndex(q => q.id === skipToId);
      if (targetIndex !== -1) {
        for (let i = currentIndex + 1; i < targetIndex; i++) {
          skippedQuestions.push(questions[i].id);
        }
      }
    }
    
    return skippedQuestions;
  };

  // Helper function to determine skip reason based on the trigger question
  const getSkipReason = (triggerQuestionId: string, triggerValue: string): string => {
    if (triggerQuestionId.includes('awareness') || triggerQuestionId.includes('Awareness')) {
      return triggerValue === 'Hindi' || triggerValue === 'No' ? 'not_aware' : 'conditional_skip';
    } else if (triggerQuestionId.includes('availment') || triggerQuestionId.includes('experience') || triggerQuestionId.includes('benefited') || triggerQuestionId.includes('used')) {
      return triggerValue === 'Hindi' || triggerValue === 'No' ? 'not_available_or_used' : 'conditional_skip';
    } else {
      return 'conditional_skip';
    }
  };

  return (
    <div className="p-6">
      <QuestionProgressBar
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        isQuestionEnabled={isQuestionEnabled}
        sectionTitle={sectionTitle}
      />

      <div className="max-w-2xl mx-auto">
        {getPersistentPartHeader() && (
          <Card className="shadow-sm mb-6">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: getPersistentPartHeader() }}></h4>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: currentQuestion?.question || '' }}>
          </h3>
          <QuestionRenderer
            question={currentQuestion}
            currentAnswer={answers[currentQuestion.id]}
            onAnswerChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            isEnabled={isQuestionEnabled(currentQuestion)}
          />
          {!isQuestionEnabled(currentQuestion) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This question is disabled. Please answer the previous question with "Oo" or "Yes" to enable it.
              </p>
            </div>
          )}
        </Card>

        <QuestionFlowNavigation
          isFirstQuestion={isFirstQuestion}
          onBack={handleBack}
          onResetSection={handleResetSection}
          onNext={handleNext}
          isNextButtonDisabled={!isCurrentQuestionAnswered()}
          nextButtonText={getNextButtonText()}
        />
      </div>
    </div>
  );
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