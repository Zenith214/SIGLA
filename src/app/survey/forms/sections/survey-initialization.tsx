"use client"

import { useState, useEffect } from "react"
import { Hash, CheckCircle, AlertCircle, Loader2, Clock, MapPin, User } from "lucide-react"
import { useSearchParams } from "next/navigation"
import type { SurveyData } from "../page"
import { getSurveyRecordByQuestionnaire, addVisit, type Visit } from "@/lib/indexedDB"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRequiredGender } from "@/utils/questionnaireIdParser"
import { calculateDisplayId } from "@/utils/displayIdCalculator"

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
  const [visitHistory, setVisitHistory] = useState<Visit[]>([])
  const [requiredSex, setRequiredSex] = useState<'Male' | 'Female' | null>(null)
  const [displayId, setDisplayId] = useState<number | null>(null)
  
  // Get questionnaire context from URL
  const questionnaireIdParam = searchParams.get('questionnaireId')
  const cycleIdParam = searchParams.get('cycleId')
  const hasQuestionnaireContext = !!questionnaireIdParam // Has questionnaire ID from spot assignment
  const isCallback = hasQuestionnaireContext && currentVisitCount > 0 // Has existing visits
  
  // Auto-switch to log tab for callbacks
  const [activeTab, setActiveTab] = useState<'reminders' | 'log'>(isCallback ? 'log' : 'reminders')
  
  // Visit status form state
  const [visitType, setVisitType] = useState<string>("")
  const [outcome, setOutcome] = useState<string>("")
  const [callbackReason, setCallbackReason] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [errors, setErrors] = useState<{ visitType?: string; outcome?: string; callbackReason?: string }>({})

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load visit count and history from IndexedDB, and calculate required sex
  useEffect(() => {
    const loadVisitData = async () => {
      if (questionnaireIdParam) {
        try {
          // Calculate display ID and required sex
          const calculatedDisplayId = calculateDisplayId(questionnaireIdParam)
          if (calculatedDisplayId !== null) {
            setDisplayId(calculatedDisplayId)
            const sex = getRequiredGender(calculatedDisplayId)
            setRequiredSex(sex)
            console.log(`📋 Questionnaire ${questionnaireIdParam} (Display ID: ${calculatedDisplayId}) requires ${sex} respondent`)
          }

          // Load visit history
          const record = await getSurveyRecordByQuestionnaire(questionnaireIdParam)
          if (record) {
            setCurrentVisitCount(record.visits.length)
            setVisitHistory(record.visits)
            // Auto-switch to log tab if this is a callback (has existing visits)
            if (record.visits.length > 0) {
              setActiveTab('log')
            }
          }
        } catch (error) {
          console.error('Error loading visit data:', error)
        }
      }
    }
    loadVisitData()
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
    if (!hasQuestionnaireContext) return true // No validation needed if no questionnaire context
    
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
        // Convert outcome from underscore format to space format for IndexedDB
        const outcomeForIndexedDB = outcome.replace(/_/g, ' ') as any
        await addVisit(
          questionnaireIdParam,
          parseInt(cycleIdParam),
          outcomeForIndexedDB,
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
    // If on Reminders tab, just switch to Visitation Log tab
    if (activeTab === 'reminders') {
      setActiveTab('log')
      return
    }

    // If on Visitation Log tab, proceed with the actual logic
    // Validate visit form if questionnaire context exists and user filled out visit form
    if (hasQuestionnaireContext && outcome && !validateVisitForm()) {
      return
    }

    setIsGeneratingNumber(true)
    setIsLoggingVisit(hasQuestionnaireContext && !!outcome)

    try {
      // FIRST VISIT + CALLBACK: Log visit and return to spots
      if (hasQuestionnaireContext && outcome === "Callback_Needed" && currentVisitCount === 0) {
        await logVisit()
        
        console.log(`📍 First visit callback logged. Redirecting to spots dashboard...`)
        
        alert("Visit logged successfully. You can return later to complete the interview. Remember: up to 3 total visits allowed for callbacks.");
        
        // Redirect back to survey dashboard
        window.location.href = `/survey`;
        return;
      }

      // OTHER OUTCOMES (NQR, OR, Moved, etc.): Log visit and return to spots
      if (hasQuestionnaireContext && outcome && outcome !== "Interview_Started") {
        await logVisit()
        
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

      // FIRST VISIT + INTERVIEW STARTED: Don't log visit yet, continue to survey
      // Visit will be logged when survey responses are submitted
      if (hasQuestionnaireContext && outcome === "Interview_Started" && currentVisitCount === 0) {
        console.log(`📝 First visit - interview started. Visit will be logged on survey submission.`)
        onNext()
        return
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

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reminders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'log'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Visitation Log {visitHistory.length > 0 && `(${visitHistory.length})`}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Reminders Tab Content */}
        {activeTab === 'reminders' && (
          <>
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

            {/* Required Sex Indicator - shown when questionnaire context exists */}
            {hasQuestionnaireContext && requiredSex && displayId && (
              <div className={`p-4 border-2 rounded-lg ${
                requiredSex === 'Male' 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-pink-50 border-pink-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    requiredSex === 'Male' 
                      ? 'bg-blue-100' 
                      : 'bg-pink-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      requiredSex === 'Male' 
                        ? 'text-blue-600' 
                        : 'text-pink-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${
                      requiredSex === 'Male' 
                        ? 'text-blue-900' 
                        : 'text-pink-900'
                    }`}>
                      Required Respondent Sex
                    </p>
                    <p className={`text-lg font-bold ${
                      requiredSex === 'Male' 
                        ? 'text-blue-700' 
                        : 'text-pink-700'
                    }`}>
                      {requiredSex}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Questionnaire #{displayId} • Interview only {requiredSex.toLowerCase()} respondents aged 18+
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions - Always shown in Reminders tab */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Before You Begin</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[20px]">1.</span>
                    <p>Introduce yourself and explain the purpose of the survey</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[20px]">2.</span>
                    <p>Ensure you are at the correct household location</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[20px]">3.</span>
                    <p>If using a mobile device, turn on location services</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[20px]">4.</span>
                    <p>Verify that you have a stable internet connection</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[20px]">5.</span>
                    <p>Have your device fully charged or connected to power</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Survey Flow</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Step 1:</strong> Select respondent using Kish Grid</p>
                  <p><strong>Step 2:</strong> Collect respondent demographics</p>
                  <p><strong>Step 3:</strong> Complete 6 randomized service sections</p>
                  <p><strong>Step 4:</strong> Overall evaluation questions</p>
                  <p><strong>Step 5:</strong> Review and submit</p>
                </div>
              </div>

              {!isCallback && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Once you click "Continue to Survey", a unique questionnaire number will be generated. Make sure you're ready to begin the interview.
                  </p>
                </div>
              )}

              {hasQuestionnaireContext && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {isCallback ? (
                      <><strong>Callback Interview:</strong> This is a return visit. If you need to log a callback, go to the <strong>Visitation Log</strong> tab before continuing to the survey.</>
                    ) : (
                      <><strong>First Visit:</strong> If you encounter any issues (no one home, refusal, etc.), go to the <strong>Visitation Log</strong> tab to record the outcome. If starting the interview, your visit will be logged automatically when you submit the survey responses.</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Generating Indicator */}
            {isGeneratingNumber && !isLoggingVisit && (
              <div className="flex items-center justify-center space-x-2 py-8 text-blue-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Generating questionnaire number...</span>
              </div>
            )}
          </>
        )}

        {/* Visitation Log Tab Content */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            {/* Visit History Display */}
            {visitHistory.length > 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Visit History</h3>
                  <span className="text-xs text-gray-500">{visitHistory.length} visit{visitHistory.length !== 1 ? 's' : ''} recorded</span>
                </div>
                
                {visitHistory.map((visit, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{visit.visitNumber}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Visit #{visit.visitNumber}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(visit.timestamp).toLocaleString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        visit.outcome === 'Interview Completed' ? 'bg-green-100 text-green-800' :
                        visit.outcome === 'Interview Started' ? 'bg-blue-100 text-blue-800' :
                        visit.outcome === 'Callback Needed' ? 'bg-yellow-100 text-yellow-800' :
                        visit.outcome === 'Refused' ? 'bg-red-100 text-red-800' :
                        visit.outcome === 'Household Moved' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {visit.outcome}
                      </span>
                    </div>
                    
                    {visit.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 whitespace-pre-wrap">{visit.notes}</p>
                      </div>
                    )}
                    
                    {visit.location && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {visit.location.lat.toFixed(6)}, {visit.location.lng.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Visit Logging Form - shown when questionnaire context exists */}
            {hasQuestionnaireContext ? (
              <div className="space-y-4">
                {/* Required Sex Reminder */}
                {requiredSex && displayId && (
                  <div className={`p-3 border rounded-lg ${
                    requiredSex === 'Male' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-pink-50 border-pink-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <User className={`w-4 h-4 ${
                        requiredSex === 'Male' 
                          ? 'text-blue-600' 
                          : 'text-pink-600'
                      }`} />
                      <p className="text-sm">
                        <strong className={
                          requiredSex === 'Male' 
                            ? 'text-blue-900' 
                            : 'text-pink-900'
                        }>
                          Required Sex: {requiredSex}
                        </strong>
                        <span className="text-gray-600 ml-2">
                          (Q#{displayId} • 18+ years old)
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Log Current Visit</strong> - Record the outcome of this visit attempt.
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
                          No Qualified Respondent (NQR) - {requiredSex ? `No ${requiredSex.toLowerCase()} members 18+` : 'Wrong sex or all under 18'}
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

                {/* Logging Indicator */}
                {isLoggingVisit && (
                  <div className="flex items-center justify-center space-x-2 py-8 text-blue-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Logging visit...</span>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state when no questionnaire context (shouldn't happen in normal flow) */
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Visit logging not available</p>
                <p className="text-gray-400 text-xs mt-1">Visit logging is only available when accessing from a spot assignment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={isGeneratingNumber || isLoggingVisit}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingVisit ? 'Logging Visit...' : 
           isGeneratingNumber ? 'Generating Number...' : 
           activeTab === 'reminders' ? 'Next →' :
           (hasQuestionnaireContext && outcome === "Callback_Needed" && currentVisitCount === 0) ? 'Log Visit & Return to Spots' :
           (hasQuestionnaireContext && outcome && outcome !== "Interview_Started") ? 'Log Visit & Return to Spots' :
           (hasQuestionnaireContext && outcome === "Interview_Started") ? 'Continue to Survey →' :
           'Continue to Survey →'}
        </button>
      </div>
    </div>
  )
}
