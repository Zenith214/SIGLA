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
  onComplete: (nextSection: string) => void;
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
        const targetQuestionIndex = questions.findIndex(q => q.id === jumpCondition.skipToId);
        if (targetQuestionIndex !== -1) {
          setCurrentQuestionIndex(targetQuestionIndex);
          return;
        } else if (jumpCondition.skipToId === "endOfFinancialSection") {
          const nextSectionMap: Record<string, string> = { financial: "disaster" };
          onComplete(nextSectionMap[sectionId] || "summary");
          return;
        } else if (jumpCondition.skipToId === "endOfDisasterSection") {
          const nextSectionMap: Record<string, string> = { disaster: "safety" };
          onComplete(nextSectionMap[sectionId] || "summary");
          return;
        } else if (jumpCondition.skipToId === "endOfSafetySection") {
          const nextSectionMap: Record<string, string> = { safety: "social" };
          onComplete(nextSectionMap[sectionId] || "summary");
          return;
        } else if (jumpCondition.skipToId === "endOfSocialSection") {
          const nextSectionMap: Record<string, string> = { social: "business" };
          onComplete(nextSectionMap[sectionId] || "summary");
          return;
        } else if (jumpCondition.skipToId === "endOfBusinessSection") {
          const nextSectionMap: Record<string, string> = { business: "environmental" };
          onComplete(nextSectionMap[sectionId] || "summary");
          return;
        } else if (jumpCondition.skipToId === "endOfEnvironmentalSection") {
          // This is the final section, so it should go to summary
          onComplete("summary");
          return;
        }
      }
    }

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