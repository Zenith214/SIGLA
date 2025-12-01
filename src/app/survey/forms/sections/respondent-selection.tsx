"use client"

import { useState, useEffect } from "react"
import { Users, ArrowLeft, X, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { SurveyData } from "../page"
import { KishGridDisplay } from "@/components/survey/KishGridDisplay"
import { selectRespondentKishGrid, getKishGridErrorMessage, isKishGridErrorRetryable, getRequiredGender, KishGridError } from "../utils/kishGrid"
import { useGeotagging } from "../utils/useGeotagging"
import { parseGPSCaptureError, getGPSCaptureErrorMessage, isGPSCaptureErrorRetryable, GPSCaptureErrorType } from "../utils/gpsVerification"
import { ManualLocationPicker } from "./ManualLocationPicker"
import { calculateDisplayId } from "@/utils/displayIdCalculator"

interface GPSCoordinates {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

interface HouseholdMember {
  name: string
  birthdate: string
  gender: string
}

interface RespondentSelectionProps {
  surveyNumber: string
  onUpdate: (section: keyof SurveyData, data: any) => void
  onNext: () => void
  onBack: () => void
}

// Function to calculate age from birthdate
const calculateAge = (birthdate: string): number => {
  if (!birthdate) return 0
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Extract numeric questionnaire number from full survey number
 * Handles formats: 
 * - New format: "2025-18-01-001" → 1 (YYYY-BB-SS-QQQ)
 * - Old format: "BB-2024-0001" → 1
 * - Direct number: "123" → 123
 */
const extractQuestionnaireNumber = (surveyNumber: string): number => {
  if (surveyNumber.includes('-')) {
    const parts = surveyNumber.split('-')
    
    // New format: YYYY-BB-SS-QQQ (4 parts)
    if (parts.length === 4) {
      // Last part is the questionnaire number (QQQ)
      return parseInt(parts[3], 10)
    }
    
    // Old format: BB-YYYY-QQQQ (3 parts)
    if (parts.length === 3) {
      return parseInt(parts[2], 10)
    }
  }
  
  // Direct number
  return parseInt(surveyNumber, 10)
}

export function RespondentSelection({ surveyNumber, onUpdate, onNext, onBack }: RespondentSelectionProps) {
  const [numberOfMembers, setNumberOfMembers] = useState<number>(1)
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([{ name: "", birthdate: "", gender: "" }])
  const [showModal, setShowModal] = useState(false)
  const [selectedRespondent, setSelectedRespondent] = useState<{ number: number; name: string; birthdate: string; age: number; gender: string } | null>(null)
  const [eligibleMembers, setEligibleMembers] = useState<Array<{ name: string; birthdate: string; gender: string; age: number }>>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [inputError, setInputError] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  
  // GPS capture state
  const [gpsLocation, setGpsLocation] = useState<GPSCoordinates | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle')
  const [gpsError, setGpsError] = useState<string>('')
  const [showManualMap, setShowManualMap] = useState(false)
  const { getLocation } = useGeotagging(false)
  
  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-populate gender when survey number changes
  useEffect(() => {
    if (surveyNumber) {
      // Calculate display_id from full_id
      let displayId = calculateDisplayId(surveyNumber)
      
      // Fallback: if display_id is null or out of range, use parsed questionnaire_number
      if (displayId === null || displayId < 1 || displayId > 150) {
        console.warn(`⚠️ Display ID fallback triggered for ${surveyNumber}. Display ID: ${displayId}`)
        const questionnaireNumber = extractQuestionnaireNumber(surveyNumber)
        console.warn(`Using parsed questionnaire_number ${questionnaireNumber} as fallback`)
        displayId = questionnaireNumber
      }
      
      const requiredGender = getRequiredGender(displayId)
      // Update all existing members with the required gender
      setHouseholdMembers(prev => prev.map(member => ({
        ...member,
        gender: requiredGender
      })))
    }
  }, [surveyNumber])

  const handleNumberChange = (value: string) => {
    const num = Number.parseInt(value) || 1

    // Validate input range and show error if needed
    if (num > 10) {
      setInputError("Maximum 10 household members allowed")
      return
    } else if (num < 1) {
      setInputError("Minimum 1 household member required")
      return
    } else {
      setInputError("")
    }

    setNumberOfMembers(num)
    
    // Auto-populate gender based on display_id
    let requiredGender = ""
    if (surveyNumber) {
      // Calculate display_id from full_id
      let displayId = calculateDisplayId(surveyNumber)
      
      // Fallback: if display_id is null or out of range, use parsed questionnaire_number
      if (displayId === null || displayId < 1 || displayId > 150) {
        console.warn(`⚠️ Display ID fallback triggered for ${surveyNumber}. Display ID: ${displayId}`)
        const questionnaireNumber = extractQuestionnaireNumber(surveyNumber)
        console.warn(`Using parsed questionnaire_number ${questionnaireNumber} as fallback`)
        displayId = questionnaireNumber
      }
      
      requiredGender = getRequiredGender(displayId)
    }
    
    const newMembers = Array.from({ length: num }, (_, index) => ({
      name: householdMembers[index]?.name || "",
      birthdate: householdMembers[index]?.birthdate || "",
      gender: requiredGender, // Auto-set based on questionnaire
    }))
    setHouseholdMembers(newMembers)
  }

  const handleMemberChange = (index: number, field: "name" | "birthdate" | "gender", value: string) => {
    const updatedMembers = [...householdMembers]
    updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    setHouseholdMembers(updatedMembers)
  }

  const captureGPSLocation = async (isAutomatic = false) => {
    setGpsStatus('capturing')
    setGpsError('')
    try {
      const locationData = await getLocation({
        enableHighAccuracy: true,
        timeout: 30000, // Increased to 30 seconds for better reliability
        maximumAge: 0, // Don't use cached positions for verification
        requireAddress: false // Don't need address, just coordinates
      })
      
      const gpsCoords: GPSCoordinates = {
        lat: locationData.latitude,
        lng: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp
      }
      
      setGpsLocation(gpsCoords)
      setGpsStatus('success')
      
      // Save to survey data
      onUpdate("verificationLocation", gpsCoords)
      
      console.log(`✅ GPS captured ${isAutomatic ? 'automatically' : 'manually'}:`, gpsCoords)
    } catch (error) {
      setGpsStatus('error')
      console.error('GPS capture failed:', error)
      
      // Parse error type and get user-friendly message
      const errorType = parseGPSCaptureError(error)
      const errorMessage = getGPSCaptureErrorMessage(errorType)
      const canRetry = isGPSCaptureErrorRetryable(errorType)
      
      // Store error message for display
      setGpsError(errorMessage)
      
      // Log detailed error for debugging
      console.error('GPS capture error details:', {
        errorType,
        errorMessage,
        canRetry,
        originalError: error,
        isAutomatic
      })
    }
  }

  // Auto-capture GPS on component mount (client-side only)
  useEffect(() => {
    if (isClient) {
      console.log('🌍 Auto-capturing GPS location on mount...')
      captureGPSLocation(true)
    }
  }, [isClient])

  const proceedWithoutGPS = () => {
    // Allow proceeding without GPS but flag for review
    setGpsStatus('idle')
    console.warn('Proceeding without GPS verification - interview will be flagged for review')
    
    // Clear any captured GPS data
    setGpsLocation(null)
    onUpdate("verificationLocation", null)
  }

  const selectRespondent = () => {
    if (!surveyNumber) {
      alert("Please enter a survey questionnaire number first.")
      return
    }

    // Calculate display_id from full_id (surveyNumber)
    let displayId = calculateDisplayId(surveyNumber)
    
    // Fallback: if display_id is null or out of range (1-150), use parsed questionnaire_number from full_id
    if (displayId === null || displayId < 1 || displayId > 150) {
      console.warn(`⚠️ Display ID fallback triggered for ${surveyNumber}. Display ID: ${displayId}`)
      const questionnaireNumber = extractQuestionnaireNumber(surveyNumber)
      console.warn(`Using parsed questionnaire_number ${questionnaireNumber} as fallback for Kish Grid`)
      displayId = questionnaireNumber
    }
    
    // Determine required sex based on display_id (odd = Male, even = Female)
    const requiredSex = getRequiredGender(displayId)
    
    // Filter eligible members (age 18+ AND matching required sex)
    const eligibleMembersList = householdMembers.filter((member) => {
      const age = calculateAge(member.birthdate)
      return age >= 18 && 
             member.name.trim() !== "" && 
             member.gender.trim() !== "" && 
             member.birthdate.trim() !== "" &&
             member.gender === requiredSex // Filter by required sex
    })

    // Check if there are any eligible members of the required sex
    if (eligibleMembersList.length === 0) {
      alert(`No eligible ${requiredSex.toLowerCase()} household members found.\n\nQuestionnaire #${displayId} requires interviewing ${requiredSex.toLowerCase()} respondents only.\n\nPlease ensure:\n- At least one ${requiredSex.toLowerCase()} member is 18 years or older\n- All required information is complete`)
      return
    }
    
    // Use Kish Grid selection with comprehensive error handling
    try {
      const result = selectRespondentKishGrid(displayId, eligibleMembersList)
      
      // Prepare eligible members with ages for Kish Grid display
      const eligibleWithAges = eligibleMembersList.map((member) => ({
        ...member,
        age: calculateAge(member.birthdate)
      }))

      setEligibleMembers(eligibleWithAges)
      setSelectedIndex(result.selectedIndex)
      setSelectedRespondent({
        number: result.selectedIndex + 1,
        name: result.selectedMember.name,
        birthdate: result.selectedMember.birthdate,
        age: calculateAge(result.selectedMember.birthdate),
        gender: result.selectedMember.gender,
      })
      setShowModal(true)
    } catch (error: any) {
      console.error('Error selecting respondent:', error)
      
      // Get user-friendly error message
      const errorMessage = getKishGridErrorMessage(error)
      
      // Check if error is retryable
      const canRetry = isKishGridErrorRetryable(error)
      
      if (canRetry) {
        // Show retry option for transient errors
        if (confirm(`${errorMessage}\n\nWould you like to try again?`)) {
          selectRespondent()
        }
      } else {
        // Show error message for errors requiring user correction
        alert(errorMessage)
      }
    }
  }

  const handleConfirmSelection = () => {
    if (selectedRespondent) {
      onUpdate("selectedMember", selectedRespondent.name)

      // Pre-populate basic demographics
      onUpdate("respondentDemographics", {
        age: selectedRespondent.age,
        birthdate: selectedRespondent.birthdate,
        sex: selectedRespondent.gender, // Biological sex from Kish Grid
        genderIdentity: selectedRespondent.gender, // Auto-fill with sex, but editable
        educationalAttainment: "",
        householdIncome: "",
        purok: ""
      })

      setShowModal(false)
      onNext()
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Respondent Selection (Kish Grid)</h2>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Survey Number Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Survey Questionnaire Number</label>
          <div className="text-lg font-semibold text-blue-900">{surveyNumber || "Not provided"}</div>
          {surveyNumber && (() => {
            // Calculate display_id from full_id
            let displayId = calculateDisplayId(surveyNumber)
            
            // Fallback: if display_id is null or out of range, use parsed questionnaire_number
            if (displayId === null || displayId < 1 || displayId > 150) {
              displayId = extractQuestionnaireNumber(surveyNumber)
            }
            
            return (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Required Respondent Sex:</span>{" "}
                  <span className="font-semibold text-blue-900">
                    {getRequiredGender(displayId)}
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {displayId % 2 !== 0 
                    ? "Odd questionnaire numbers interview male respondents only" 
                    : "Even questionnaire numbers interview female respondents only"}
                </p>
              </div>
            )
          })()}
        </div>

        {/* GPS Capture Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">GPS Verification</h3>
            </div>
            {gpsStatus === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            GPS location is automatically captured to verify the interview location. This helps ensure data quality.
          </p>

          {gpsStatus === 'capturing' && (
            <div className="flex items-center justify-center space-x-2 py-3 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Capturing location automatically...</span>
            </div>
          )}

          {gpsStatus === 'success' && gpsLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Location Captured Successfully</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Latitude: {gpsLocation.lat.toFixed(6)}</p>
                <p>Longitude: {gpsLocation.lng.toFixed(6)}</p>
                {gpsLocation.accuracy && <p>Accuracy: ±{gpsLocation.accuracy.toFixed(0)}m</p>}
              </div>
              <button
                onClick={() => captureGPSLocation(false)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Recapture Location
              </button>
            </div>
          )}

          {gpsStatus === 'error' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Automatic GPS Capture Failed</span>
              </div>
              {gpsError && (
                <p className="text-xs text-gray-600 mb-3">
                  <strong>Error:</strong> {gpsError}
                </p>
              )}
              <p className="text-xs text-gray-600 mb-3">
                You can retry automatic capture, manually pin your location on a map, or continue without GPS.
              </p>
              <div className="bg-white border border-yellow-300 rounded p-2 mb-3">
                <p className="text-xs text-gray-700">
                  <strong>Note:</strong> Interviews without GPS verification will be automatically flagged for supervisor review.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => captureGPSLocation(false)}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Retry Automatic GPS</span>
                </button>
                <button
                  onClick={() => setShowManualMap(true)}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Pin Location on Map</span>
                </button>
                <button
                  onClick={proceedWithoutGPS}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Without GPS (Will be flagged)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Number of Members */}
        <div>
          <label htmlFor="numberOfMembers" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Eligible Household Members *
          </label>
          <input
            type="number"
            id="numberOfMembers"
            min="1"
            max="10"
            value={numberOfMembers}
            onChange={(e) => handleNumberChange(e.target.value)}
            className={`w-full max-w-xs px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
              inputError ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          <div className="mt-1">
            {inputError ? (
              <p className="text-xs text-red-600">{inputError}</p>
            ) : (
              <p className="text-xs text-gray-500">Enter number between 1 and 10</p>
            )}
          </div>
        </div>

        {/* Household Members */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Household Member Details</h3>
          {surveyNumber && (() => {
            // Calculate display_id from full_id
            let displayId = calculateDisplayId(surveyNumber)
            
            // Fallback: if display_id is null or out of range, use parsed questionnaire_number
            if (displayId === null || displayId < 1 || displayId > 150) {
              displayId = extractQuestionnaireNumber(surveyNumber)
            }
            
            return (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Only list household members who are{" "}
                  <strong>{getRequiredGender(displayId).toLowerCase()}</strong> and{" "}
                  <strong>18 years or older</strong>. The Kish Grid will automatically select from eligible members.
                </p>
              </div>
            )
          })()}
          <div className="space-y-4">
            {householdMembers.map((member, index) => {
              const age = member.birthdate ? calculateAge(member.birthdate) : 0
              
              // Calculate display_id from full_id with fallback
              let displayIdForMember = null
              if (surveyNumber) {
                displayIdForMember = calculateDisplayId(surveyNumber)
                if (displayIdForMember === null || displayIdForMember < 1 || displayIdForMember > 150) {
                  displayIdForMember = extractQuestionnaireNumber(surveyNumber)
                }
              }
              
              const requiredSex = displayIdForMember ? getRequiredGender(displayIdForMember) : null
              const isEligible = age >= 18 && member.gender === requiredSex && member.name.trim() !== ""
              const isWrongSex = member.gender && requiredSex && member.gender !== requiredSex
              
              return (
              <div
                key={index}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  isEligible 
                    ? 'border-green-300 bg-green-50' 
                    : isWrongSex 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Member {index + 1}</h4>
                  {isEligible && (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      ✓ Eligible
                    </span>
                  )}
                  {isWrongSex && (
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                      Wrong sex for this questionnaire
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate *</label>
                    <input
                      type="date"
                      value={member.birthdate}
                      onChange={(e) => handleMemberChange(index, "birthdate", e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {member.birthdate ? `Age: ${calculateAge(member.birthdate)} years` : 'Must be 18 or older'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Sex:</span>
                  <span className="font-semibold text-gray-900">
                    {displayIdForMember ? getRequiredGender(displayIdForMember) : 'Not set'}
                  </span>
                  <span className="text-xs text-gray-500">(auto-set based on questionnaire)</span>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Select Respondent Button */}
        <div className="text-center">
          <button
            onClick={selectRespondent}
            disabled={!!inputError}
            className={`px-8 py-3 font-medium rounded-lg shadow-md transition-colors ${
              inputError ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Select Respondent
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Manual Location Picker Modal */}
      {showManualMap && (
        <ManualLocationPicker
          onLocationSelected={(location) => {
            setGpsLocation(location)
            setGpsStatus('success')
            setShowManualMap(false)
            onUpdate("verificationLocation", location)
            console.log('📍 Manual location selected:', location)
          }}
          onCancel={() => setShowManualMap(false)}
          initialLocation={gpsLocation || undefined}
        />
      )}

      {/* Respondent Selection Modal */}
      {showModal && selectedRespondent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Respondent Selection Result</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kish Grid Display */}
              <KishGridDisplay
                members={eligibleMembers}
                selectedIndex={selectedIndex}
                questionnaireNumber={surveyNumber}
              />

              {/* Selected Respondent Summary */}
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Selected Respondent</h4>
                    <p className="text-lg font-semibold text-gray-900">{selectedRespondent.name}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 ml-13">
                  <p>Age: {selectedRespondent.age} years • Sex: {selectedRespondent.gender}</p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}