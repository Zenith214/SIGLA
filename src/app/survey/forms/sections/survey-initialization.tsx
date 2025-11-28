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

    // Validate logical combinations
    const replacementOutcomes = ["No_Qualified_Respondent", "Outright_Refusal", "Household_Moved"]
    if (replacementOutcomes.includes(outcome) && visitType !== "First Visit") {
      newErrors.outcome = "Replacement outcomes (NQR/OR/Moved) can only be used on First Visit"
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
        
        // If outcome is not "Interview_Started", redirect back to spots dashboard
        if (outcome !== "Interview_Started") {
          console.log(`📍 Visit logged with outcome: ${outcome}. Redirecting to spots dashboard...`)
          
          // Different messages based on outcome type
          let message = "Visit logged successfully. ";
          
          if (outcome === "Callback_Needed") {
            message += "You can return later to complete the interview. Remember: up to 3 total visits allowed for callbacks.";
          } else if (outcome === "No_Qualified_Respondent") {
            message += "No Qualified Respondent (NQR). Move to the next household following the interval rule (skip one house).";
          } else if (outcome === "Outright_Refusal") {
            message += "Outright Refusal (OR). Move to the next household following the interval rule (skip one house).";
          } else if (outcome === "Household_Moved") {
            message += "Household moved. Move to the next household following the interval rule (skip one house).";
          } else {
            message += "Returning to spots dashboard.";
          }
          
          alert(message);
          
          // Redirect back to survey dashboard
          window.location.href = `/survey`;
          return;
        }
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

            {/* CSIS Protocol Guide */}
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs">
              <p className="font-semibold text-gray-900 mb-2">CSIS Protocol:</p>
              <ul className="space-y-1 text-gray-700">
                <li><strong>Callback:</strong> Respondent unavailable → Return up to 3 times → Then substitute</li>
                <li><strong>Replacement:</strong> NQR/OR/Moved → Move to next household immediately (skip one house)</li>
              </ul>
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
                    First Visit (Initial attempt)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Second Visit" id="second-visit" />
                  <Label htmlFor="second-visit" className="font-normal cursor-pointer">
                    Second Visit (First callback)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Last Visit" id="last-visit" />
                  <Label htmlFor="last-visit" className="font-normal cursor-pointer">
                    Last Visit (3rd Attempt - Final callback)
                  </Label>
                </div>
              </RadioGroup>
              {errors.visitType && (
                <p className="text-sm text-red-500">{errors.visitType}</p>
              )}
              {visitType === "First Visit" && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>First Visit:</strong> Initial attempt at this household. Use NQR/OR for immediate replacement, or Callback if respondent is unavailable.
                </div>
              )}
              {visitType === "Second Visit" && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>Second Visit:</strong> First callback attempt. You have one more visit (3rd) if still unavailable.
                </div>
              )}
              {visitType === "Last Visit" && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Last Visit (3rd Attempt):</strong> Final callback attempt. If still unavailable, this respondent will be marked for substitution (not replacement).
                </div>
              )}
            </div>

            {/* Visit Outcome Radio Group */}
            <div className="space-y-3">
              <Label>
                Visit Outcome <span className="text-red-500">*</span>
              </Label>
              <RadioGroup value={outcome} onValueChange={setOutcome}>
                {/* Callback Outcomes (3-visit protocol) */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mt-2">Callback (Same Household - Up to 3 Visits):</p>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="Callback_Needed" id="callback" />
                    <Label htmlFor="callback" className="font-normal cursor-pointer">
                      Callback Needed (Respondent unavailable/busy)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="Interview_Started" id="started" />
                    <Label htmlFor="started" className="font-normal cursor-pointer">
                      Interview Started (Respondent available)
                    </Label>
                  </div>
                </div>

                {/* Replacement Outcomes (1 visit only - move to next household) */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mt-4">Replacement (Move to Next Household Immediately):</p>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="No_Qualified_Respondent" id="nqr" />
                    <Label htmlFor="nqr" className="font-normal cursor-pointer">
                      No Qualified Respondent (NQR) - Wrong sex or all under 18
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="Outright_Refusal" id="or" />
                    <Label htmlFor="or" className="font-normal cursor-pointer">
                      Outright Refusal (OR) - Household refused before Kish Grid
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="Household_Moved" id="moved" />
                    <Label htmlFor="moved" className="font-normal cursor-pointer">
                      Household Moved - No longer at this location
                    </Label>
                  </div>
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

            {/* Warning for replacement outcomes (NQR, OR, Moved) */}
            {outcome && (outcome === "No_Qualified_Respondent" || outcome === "Outright_Refusal" || outcome === "Household_Moved") && (
              <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Replacement Required</p>
                  <p className="text-orange-700 mt-1">
                    This household is invalid. After logging, move to the next household following the interval rule (skip one house).
                  </p>
                </div>
              </div>
            )}

            {/* Warning for last visit with callback outcome */}
            {visitType === "Last Visit" && outcome === "Callback_Needed" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Warning: Final Callback Attempt</p>
                  <p className="text-red-600 mt-1">
                    This is the 3rd attempt. After logging, this respondent will be marked for <strong>substitution</strong> (not replacement). A person with matching demographics will be found later.
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
