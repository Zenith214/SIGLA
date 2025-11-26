"use client"

import { useState, useEffect } from "react"
import { User, ArrowLeft } from "lucide-react"
import type { SurveyData } from "../page"

interface RespondentDemographicsProps {
  data: SurveyData
  onUpdate: (section: keyof SurveyData, data: any) => void
  onNext: () => void
  onBack: () => void
}

export function RespondentDemographics({ data, onUpdate, onNext, onBack }: RespondentDemographicsProps) {
  const [demographics, setDemographics] = useState({
    age: data.respondentDemographics?.age ?? 0,
    birthdate: data.respondentDemographics?.birthdate ?? "",
    sex: data.respondentDemographics?.sex ?? "",
    genderIdentity: data.respondentDemographics?.genderIdentity ?? "",
    educationalAttainment: data.respondentDemographics?.educationalAttainment ?? "",
    householdIncome: data.respondentDemographics?.householdIncome ?? "",
    purok: data.respondentDemographics?.purok ?? ""
  })

  // Update local state when data changes
  useEffect(() => {
    if (data.respondentDemographics) {
      setDemographics(data.respondentDemographics)
    }
  }, [data.respondentDemographics])

  const handleDemographicsChange = (field: string, value: string | number) => {
    const updatedDemographics = { ...demographics, [field]: value }
    setDemographics(updatedDemographics)
  }

  const handleSubmit = () => {
    // Validate required fields
    if (!demographics.educationalAttainment || !demographics.householdIncome) {
      alert("Please complete all required demographic information.")
      return
    }

    // Update survey data
    onUpdate("respondentDemographics", demographics)
    onNext()
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Respondent Demographics</h2>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Selected Respondent Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Respondent</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Name:</strong> {data.selectedMember || "Not selected"}</p>
            <p><strong>Birthdate:</strong> {demographics.birthdate ? new Date(demographics.birthdate).toLocaleDateString() : "Not provided"}</p>
            <p><strong>Age:</strong> {demographics.age} years old</p>
            <p><strong>Sex:</strong> {demographics.sex}</p>
            <p><strong>Gender Identity:</strong> {demographics.genderIdentity || "Not specified"}</p>
          </div>
        </div>

        {/* Demographics Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-6">
            Please provide additional information about the selected respondent for our analysis.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birthdate</label>
              <input
                type="date"
                value={demographics.birthdate || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from respondent selection</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={demographics.age || 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Calculated from birthdate</p>
            </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender Identity</label>
              <select
                value={demographics.genderIdentity || ""}
                onChange={(e) => handleDemographicsChange("genderIdentity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select gender identity</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="LGBTQI+">LGBTQI+</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Auto-filled from sex (editable)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Educational Attainment *</label>
                <select
                  value={demographics.educationalAttainment || ""}
                  onChange={(e) => handleDemographicsChange("educationalAttainment", e.target.value)}
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
                  value={demographics.householdIncome || ""}
                  onChange={(e) => handleDemographicsChange("householdIncome", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select income range</option>
                  <option value="₱0 – No income">₱0 – No income</option>
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

            {/* Purok Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purok/Sitio
                <span className="text-xs text-gray-500 ml-2">(Optional)</span>
              </label>
              <input
                type="text"
                value={demographics.purok || ""}
                onChange={(e) => handleDemographicsChange("purok", e.target.value)}
                placeholder="Enter purok or sitio name (e.g., Purok 1, Sitio Riverside)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please specify the purok or sitio where the respondent resides
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Survey →
            </button>
          </div>
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
    </div>
  )
}