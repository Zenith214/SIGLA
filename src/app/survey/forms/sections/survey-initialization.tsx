"use client"

import { useState, useEffect } from "react"
import { Hash, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import type { SurveyData } from "../page"
import { getSurveyRecordByQuestionnaire, addVisit } from "@/lib/indexedDB"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SurveyInitializationProps {
   data: SurveyData
   onUpdate: (section: keyof SurveyData, data: any) => void
   onNext: () => void
   preselectedBarangayId?: number
 }

export function SurveyInitialization({ data, onUpdate, onNext, preselectedBarangayId }: SurveyInitializationProps) {
  const searchParams = useSearchParams()
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [preselectedBarangayName, setPreselectedBarangayName] = useState<string>('')
  const [currentVisitCount, setCurrentVisitCount] = useState(0)
  const [isLoggingVisit, setIsLoggingVisit] = useState(false)
  
  // Visit status form state
  const [visitType, setVisitType] = useState<string>("")
  const [outcome, setOutcome] = useState<string>("")
  const [callbackReason, setCallbackReason] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [errors, setErrors] = useState<{ visitType?: string; outcome?: string; callbackReason?: string }>({})
  
  // Get questionnaire context from URL
  const questionnaireIdParam = searchParams.get('questionnaireId')
  const cycleIdParam = searchParams.get('cycleId')
  const isCallback = !!questionnaireIdParam

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load visit count from IndexedDB
  useEffect(() => {
    const loadVisitCount = async () => {
      if (questionnaireIdParam) {
        try {
          const record = await getSurveyRecordByQuestionnaire(questionnaireIdParam)
          if (record) {
            setCurrentVisitCount(record.visits.length)
          }
        } catch (error) {
          console.error('Error loading visit count:', error)
        }
      }
    }
    loadVisitCount()
  }, [questionnaireIdParam])

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

  const validateVisitForm = (): boolean => {
    if (!isCallback) return true // No validation needed for new surveys
    
    const newErrors: typeof errors = {}

    if (!visitType) {
      newErrors.visitType = "Please select which visit this is"
    }

    if (!outcome) {
      newErrors.outcome = "Please select a visit outcome"
    }

    if (outcome === "Callback_Needed" && !callbackReason) {
      newErrors.callbackReason = "Please select a callback reason"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const logVisit = async () => {
    if (!questionnaireIdParam || !cycleIdParam) return

    try {
      // Get current location if available
      let location = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            })
          })
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        } catch (error) {
          console.log("Could not get location:", error)
        }
      }

      // Prepare notes with visit type and callback reason if applicable
      let finalNotes = `Visit Type: ${visitType}\n`
      if (outcome === "Callback_Needed" && callbackReason) {
        finalNotes += `Callback Reason: ${callbackReason}\n`
      }
      if (notes.trim()) {
        finalNotes += `\nNotes: ${notes.trim()}`
      }

      // Save to IndexedDB
      const record = await getSurveyRecordByQuestionnaire(questionnaireIdParam)
      if (record) {
        await addVisit(
          questionnaireIdParam,
          parseInt(cycleIdParam),
          outcome as any,
          finalNotes || "",
          location || undefined
        )
        console.log(`✅ Visit logged to IndexedDB for ${questionnaireIdParam}`)
      }

      // Save to API
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireId: questionnaireIdParam,
          outcome,
          notes: finalNotes || null,
          location,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to log visit")
      }

      console.log(`✅ Visit logged to API for ${questionnaireIdParam}`)
    } catch (error) {
      console.error("Error logging visit:", error)
      throw error
    }
  }

  const handleNext = async () => {
    // Validate visit form if this is a callback
    if (isCallback && !validateVisitForm()) {
      return
    }

    setIsGeneratingNumber(true)
    setIsLoggingVisit(isCallback)

    try {
      // Log visit if this is a callback
      if (isCallback && outcome) {
        await logVisit()
      }

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
    } catch (error) {
      console.error("Error in handleNext:", error)
      alert("Failed to proceed. Please try again.")
    } finally {
      setIsGeneratingNumber(false)
      setIsLoggingVisit(false)
    }
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
        {/* Pre-selected Barangay Indicator */}
        {preselectedBarangayId && preselectedBarangayName && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Barangay:</strong> {preselectedBarangayName}
              </span>
            </div>
          </div>
        )}

        {/* Visit Status Fields - shown inline for callbacks */}
        {isCallback && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Log Visit Status</strong> - Select which visit this is and record the outcome.
              </p>
            </div>

            {/* Visit Type Selection */}
            <div className="space-y-3">
              <Label>
                Which Visit Is This? <span className="text-red-500">*</span>
              </Label>
              <RadioGroup value={visitType} onValueChange={setVisitType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="First Visit" id="first-visit" />
                  <Label htmlFor="first-visit" className="font-normal cursor-pointer">
                    First Visit
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Second Visit" id="second-visit" />
                  <Label htmlFor="second-visit" className="font-normal cursor-pointer">
                    Second Visit
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Last Visit" id="last-visit" />
                  <Label htmlFor="last-visit" className="font-normal cursor-pointer">
                    Last Visit (3rd Attempt)
                  </Label>
                </div>
              </RadioGroup>
              {errors.visitType && (
                <p className="text-sm text-red-500">{errors.visitType}</p>
              )}
              {visitType === "Last Visit" && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> After this visit, you should move to another spot if the interview cannot be completed.
                </div>
              )}
            </div>

            {/* Visit Outcome Radio Group */}
            <div className="space-y-3">
              <Label>
                Visit Outcome <span className="text-red-500">*</span>
              </Label>
              <RadioGroup value={outcome} onValueChange={setOutcome}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Callback_Needed" id="callback" />
                  <Label htmlFor="callback" className="font-normal cursor-pointer">
                    Callback Needed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Interview_Started" id="started" />
                  <Label htmlFor="started" className="font-normal cursor-pointer">
                    Interview Started
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Refused" id="refused" />
                  <Label htmlFor="refused" className="font-normal cursor-pointer">
                    Refused to Participate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Household_Moved" id="moved" />
                  <Label htmlFor="moved" className="font-normal cursor-pointer">
                    Household Moved
                  </Label>
                </div>
              </RadioGroup>
              {errors.outcome && (
                <p className="text-sm text-red-500">{errors.outcome}</p>
              )}
            </div>

            {/* Callback Reason Dropdown */}
            {outcome === "Callback_Needed" && (
              <div className="space-y-2">
                <Label htmlFor="callbackReason">
                  Callback Reason <span className="text-red-500">*</span>
                </Label>
                <Select value={callbackReason} onValueChange={setCallbackReason}>
                  <SelectTrigger className={errors.callbackReason ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No one home">No one home</SelectItem>
                    <SelectItem value="Respondent busy">Respondent busy</SelectItem>
                    <SelectItem value="Respondent unavailable">Respondent unavailable</SelectItem>
                    <SelectItem value="Bad weather">Bad weather</SelectItem>
                    <SelectItem value="Other">Other (specify in notes)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.callbackReason && (
                  <p className="text-sm text-red-500">{errors.callbackReason}</p>
                )}
              </div>
            )}

            {/* Digital Fieldwork Diary Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Digital Fieldwork Diary Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes about this visit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoggingVisit}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Optional: Add any observations or details about this visit
              </p>
            </div>

            {/* Warning for last visit with failed outcome */}
            {visitType === "Last Visit" && outcome && outcome !== "Interview_Started" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Warning: Last Visit</p>
                  <p className="text-red-600 mt-1">
                    This is the final attempt. After logging this visit, you should move to another spot. The questionnaire will be flagged for substitution.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generating/Logging Indicator */}
        {(isGeneratingNumber || isLoggingVisit) && (
          <div className="flex items-center justify-center space-x-2 py-8 text-blue-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{isLoggingVisit ? "Logging visit..." : "Generating questionnaire number..."}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={isGeneratingNumber || isLoggingVisit}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingVisit ? 'Logging Visit...' : isGeneratingNumber ? 'Generating Number...' : isCallback ? 'Log Visit & Continue →' : 'Continue to Survey →'}
        </button>
      </div>
    </div>
  )
}
