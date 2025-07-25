"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getQuestionsForSection } from "../utils/questions"
import type { SurveyData } from "../page"

interface QuestionFlowProps {
  sectionId: string
  data: SurveyData
  onUpdate: (section: keyof SurveyData, data: any) => void
  onComplete: (nextSection: string) => void
  onBack: () => void
}

export function QuestionFlow({ sectionId, data, onUpdate, onComplete, onBack }: QuestionFlowProps) {
  const questions = getQuestionsForSection(sectionId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  // Use ref to track the previous sectionId to detect actual section changes
  const prevSectionIdRef = useRef<string>()

  const sectionDataKey = getSectionDataKey(sectionId)
  const sectionTitle = getSectionTitle(sectionId)

  // Only reset to first question when section actually changes, not on re-renders
  useEffect(() => {
    const isNewSection = prevSectionIdRef.current !== sectionId

    if (isNewSection) {
      // Only reset question index when switching to a different section
      setCurrentQuestionIndex(0)
      prevSectionIdRef.current = sectionId
    }

    // Always load existing answers for this section
    const existingData = data[sectionDataKey] || {}
    setAnswers(existingData)
  }, [sectionId, data, sectionDataKey])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    onUpdate(sectionDataKey, newAnswers)
    // Do NOT reset currentQuestionIndex here - this was causing the bug
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
      }
      onComplete(nextSectionMap[sectionId] || "summary")
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleBack = () => {
    if (isFirstQuestion) {
      onBack()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getAnsweredCount = () => {
    return questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const currentAnswer = answers[currentQuestion.id]

    switch (currentQuestion.type) {
      case "radio":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
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
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case "text":
        return (
          <input
            type="text"
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your answer..."
          />
        )

      case "textarea":
        return (
          <textarea
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Enter your detailed response..."
          />
        )

      default:
        return null
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
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                index <= currentQuestionIndex
                  ? answers[questions[index].id] !== undefined && answers[questions[index].id] !== ""
                    ? "bg-green-500"
                    : "bg-blue-300"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {getAnsweredCount()} of {questions.length} questions answered
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">{currentQuestion?.question}</h3>
          {renderQuestion()}
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
  return keyMap[sectionId] || "financialAdmin"
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
  return titleMap[sectionId] || "Survey Section"
}
