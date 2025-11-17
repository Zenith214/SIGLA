"use client"

import { useState, useEffect } from "react"
import { Hash, CheckCircle } from "lucide-react"
import type { SurveyData } from "../page"

interface SurveyInitializationProps {
   data: SurveyData
   onUpdate: (section: keyof SurveyData, data: any) => void
   onNext: () => void
   preselectedBarangayId?: number
 }

export function SurveyInitialization({ data, onUpdate, onNext, preselectedBarangayId }: SurveyInitializationProps) {
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [preselectedBarangayName, setPreselectedBarangayName] = useState<string>('')

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch barangay name when preselectedBarangayId is provided
  useEffect(() => {
    if (preselectedBarangayId && isClient) {
      const fetchBarangayName = async () => {
        try {
          const response = await fetch(`/api/barangays/${preselectedBarangayId}`)
          if (response.ok) {
            const barangayData = await response.json()
            setPreselectedBarangayName(barangayData.barangay_name)
          }
        } catch (error) {
          console.error('Failed to fetch barangay name:', error)
        }
      }
      fetchBarangayName()
    }
  }, [preselectedBarangayId, isClient])

  const generateQuestionnaireNumber = async () => {
    setIsGeneratingNumber(true)
    try {
      // Get barangayId
      const barangayIdToUse = preselectedBarangayId || data.barangayId
      
      if (!barangayIdToUse) {
        alert('Please select a barangay first.')
        return null
      }

      // Generate the actual questionnaire number NOW
      const response = await fetch('/api/questionnaire-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barangayId: barangayIdToUse })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questionnaire number')
      }

      const responseData = await response.json()
      const surveyNumber = responseData.surveyNumber // Full format: BB-YYYY-NNNN
      const questionnaireNumber = responseData.questionnaireNumber // Just the number
      
      console.log(`✅ Generated survey number: ${surveyNumber} (Questionnaire #${questionnaireNumber})`)
      
      return { surveyNumber, questionnaireNumber }
      
    } catch (error) {
      console.error('Error generating questionnaire number:', error)
      alert('Failed to generate questionnaire number. Please try again.')
      return null
    } finally {
      setIsGeneratingNumber(false)
    }
  }

  const handleNext = async () => {
    // Check if we already have a survey number (from localStorage after refresh)
    if (data.surveyNumber && data.surveyNumber !== "PENDING") {
      console.log(`📋 Using existing survey number from localStorage: ${data.surveyNumber}`)
      onNext()
      return
    }

    // Generate questionnaire number NOW (will be saved to localStorage)
    const result = await generateQuestionnaireNumber()
    if (!result) {
      return // Failed to generate
    }

    // Store the survey number
    onUpdate("surveyNumber", result.surveyNumber)
    onNext()
  }



  // Don't render buttons until client-side
  if (!isClient) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Hash className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Initialize Survey</h2>
        </div>
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Hash className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Initialize Survey</h2>
      </div>

      <div className="space-y-6">
        {/* Questionnaire Number Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Questionnaire Assignment</h4>
          </div>
          <p className="text-sm text-blue-700">
            Click continue to generate a unique questionnaire number. This will determine which service sections you'll complete and the respondent selection method.
          </p>
          {isGeneratingNumber && (
            <div className="flex items-center space-x-2 mt-3 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Generating questionnaire number...</span>
            </div>
          )}
        </div>

        {/* Pre-selected Barangay Indicator */}
        {preselectedBarangayId && preselectedBarangayName && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Barangay Pre-selected:</strong> {preselectedBarangayName} (ID: {preselectedBarangayId})
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              This survey is assigned to the selected barangay.
            </p>
          </div>
        )}

        {/* Survey Flow Information */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Survey Flow</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Generate questionnaire number</li>
            <li>Select household respondent using Kish Grid</li>
            <li>Capture GPS location at household</li>
            <li>Complete respondent demographics</li>
            <li>Complete all six service sections</li>
            <li>Review and submit survey</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={isGeneratingNumber}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingNumber ? 'Generating Number...' : 'Continue to Survey →'}
        </button>
      </div>
    </div>
  )
}
