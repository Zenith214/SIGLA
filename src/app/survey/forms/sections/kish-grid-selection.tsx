"use client"

import { useState, useEffect } from "react"
import { Users, ArrowLeft, ArrowRight, X } from "lucide-react"
import type { SurveyData } from "../page"

interface HouseholdMember {
  name: string
  age: number | string
  gender: string
}

interface KishGridSelectionProps {
  surveyNumber: string
  selectedMember: string
  data: SurveyData
  onUpdate: (section: keyof SurveyData, data: any) => void
  onNext: () => void
  onBack: () => void
}

export function KishGridSelection({ surveyNumber, selectedMember, data, onUpdate, onNext, onBack }: KishGridSelectionProps) {
  const [numberOfMembers, setNumberOfMembers] = useState<number>(1)
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([{ name: "", age: 18, gender: "" }])
  const [showModal, setShowModal] = useState(false)
  const [selectedRespondent, setSelectedRespondent] = useState<{ number: number; name: string; age: number | string; gender: string } | null>(null)
  const [inputError, setInputError] = useState<string>("")
  const [showDemographics, setShowDemographics] = useState(false)
  const [demographics, setDemographics] = useState({
    age: 0,
    gender: "",
    educationalAttainment: "",
    householdIncome: ""
  })

  // Load existing demographics data
  useEffect(() => {
    if (data.respondentDemographics) {
      setDemographics(data.respondentDemographics)
    }
  }, [data.respondentDemographics])

  // Show demographics section if member is already selected but demographics not complete
  useEffect(() => {
    if (selectedMember && (!data.respondentDemographics?.educationalAttainment || !data.respondentDemographics?.householdIncome)) {
      setShowDemographics(true)
    }
  }, [selectedMember, data.respondentDemographics])

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
    const newMembers = Array.from({ length: num }, (_, index) => ({
      name: householdMembers[index]?.name || "",
      age: householdMembers[index]?.age || 18,
      gender: householdMembers[index]?.gender || "",
    }))
    setHouseholdMembers(newMembers)
  }

  const handleMemberChange = (index: number, field: "name" | "age" | "gender", value: string | number) => {
    const updatedMembers = [...householdMembers]
    
    if (field === "age") {
      // Handle age input more carefully
      const ageValue = typeof value === "string" ? value : String(value)
      const numericAge = Number.parseInt(ageValue)
      
      // Allow empty string for editing, but ensure valid number when not empty
      if (ageValue === "" || ageValue === "0") {
        updatedMembers[index] = { ...updatedMembers[index], [field]: "" as any }
      } else if (!isNaN(numericAge) && numericAge > 0) {
        updatedMembers[index] = { ...updatedMembers[index], [field]: numericAge }
      }
      // If invalid input, don't update (keeps current value)
    } else {
      updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    }
    
    setHouseholdMembers(updatedMembers)
  }

  const selectRespondent = () => {
    if (!surveyNumber) {
      alert("Please enter a survey questionnaire number first.")
      return
    }

    // Filter eligible members (age 18+)
    const eligibleMembers = householdMembers.filter((member) => {
      const age = typeof member.age === "string" ? Number.parseInt(member.age) : member.age
      return age >= 18 && member.name.trim() !== "" && member.gender.trim() !== "" && !isNaN(age)
    })

    if (eligibleMembers.length === 0) {
      alert("No eligible household members found. All members must be 18 or older, have names, and gender specified.")
      return
    }

    // Kish Grid logic: use last digit of survey number
    const lastDigit = Number.parseInt(surveyNumber.slice(-1)) || 0
    const selectedIndex = lastDigit % eligibleMembers.length
    const selected = eligibleMembers[selectedIndex]

    // Find the original index for display
    const originalIndex = householdMembers.findIndex((member) => member === selected)

    setSelectedRespondent({
      number: originalIndex + 1,
      name: selected.name,
      age: selected.age,
      gender: selected.gender,
    })
    setShowModal(true)
  }

  const handleConfirmSelection = () => {
    if (selectedRespondent) {
      onUpdate("selectedMember", selectedRespondent.name)
      
      // Pre-populate demographics with selected respondent's basic info
      const selectedAge = typeof selectedRespondent.age === "string" ? Number.parseInt(selectedRespondent.age) : selectedRespondent.age
      setDemographics(prev => ({
        ...prev,
        age: selectedAge,
        gender: selectedRespondent.gender
      }))
      
      setShowModal(false)
      setShowDemographics(true)
    }
  }

  const handleDemographicsSubmit = () => {
    // Validate demographics
    if (!demographics.educationalAttainment || !demographics.householdIncome) {
      alert("Please complete all demographic information.")
      return
    }

    // Update survey data with demographics
    onUpdate("respondentDemographics", demographics)
    onNext()
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Household Member Details</h3>
          <div className="space-y-4">
            {householdMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="text-sm font-medium text-gray-700 mb-3">Member {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      type="number"
                      min="18"
                      max="120"
                      value={member.age === "" ? "" : member.age}
                      onChange={(e) => handleMemberChange(index, "age", e.target.value)}
                      onBlur={(e) => {
                        // Set default age if field is empty when user leaves the field
                        if (e.target.value === "" || Number.parseInt(e.target.value) < 18) {
                          handleMemberChange(index, "age", 18)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="18"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum age: 18 years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      value={member.gender}
                      onChange={(e) => handleMemberChange(index, "gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Demographics Section */}
        {showDemographics && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Respondent Demographics</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please provide additional information about the selected respondent for our analysis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={demographics.age}
                  onChange={(e) => setDemographics(prev => ({ ...prev, age: Number.parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from household member data</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={demographics.gender}
                  onChange={(e) => setDemographics(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-100"
                  disabled
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Auto-filled from household member data</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Educational Attainment *</label>
                <select
                  value={demographics.educationalAttainment}
                  onChange={(e) => setDemographics(prev => ({ ...prev, educationalAttainment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select educational level</option>
                  <option value="No formal education">No formal education</option>
                  <option value="Elementary (1-6)">Elementary (1-6)</option>
                  <option value="Elementary graduate">Elementary graduate</option>
                  <option value="High school (1-4)">High school (1-4)</option>
                  <option value="High school graduate">High school graduate</option>
                  <option value="Vocational/Technical">Vocational/Technical</option>
                  <option value="College (1-4)">College (1-4)</option>
                  <option value="College graduate">College graduate</option>
                  <option value="Post-graduate">Post-graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Household Income *</label>
                <select
                  value={demographics.householdIncome}
                  onChange={(e) => setDemographics(prev => ({ ...prev, householdIncome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select income range</option>
                  <option value="Below ₱10,000">Below ₱10,000</option>
                  <option value="₱10,000 - ₱20,000">₱10,000 - ₱20,000</option>
                  <option value="₱20,001 - ₱30,000">₱20,001 - ₱30,000</option>
                  <option value="₱30,001 - ₱50,000">₱30,001 - ₱50,000</option>
                  <option value="₱50,001 - ₱75,000">₱50,001 - ₱75,000</option>
                  <option value="₱75,001 - ₱100,000">₱75,001 - ₱100,000</option>
                  <option value="Above ₱100,000">Above ₱100,000</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleDemographicsSubmit}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue to Survey →
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          {selectedMember && !showDemographics && (
            <button
              onClick={onNext}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>Continue to Survey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRespondent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selected Respondent</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Member #{selectedRespondent.number}</h4>
                <p className="text-lg text-gray-700 mb-2">{selectedRespondent.name}</p>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Age: {selectedRespondent.age} years old</p>
                  <p>Gender: {selectedRespondent.gender}</p>
                </div>
                <p className="text-sm text-gray-500">
                  This respondent was selected using Kish Grid methodology based on your survey number.
                </p>
              </div>

              <div className="flex space-x-3">
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
