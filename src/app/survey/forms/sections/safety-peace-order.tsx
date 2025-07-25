"use client"

import { useState } from "react"
import { ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react"

interface SafetyPeaceOrderProps {
  data: Record<string, any>
  onUpdate: (data: Record<string, any>) => void
  onNext: () => void
  onBack: () => void
}

export function SafetyPeaceOrder({ data, onUpdate, onNext, onBack }: SafetyPeaceOrderProps) {
  const [formData, setFormData] = useState({
    crimeRate: data.crimeRate || "",
    policePresence: data.policePresence || "",
    communityPatrol: data.communityPatrol || "",
    streetLighting: data.streetLighting || "",
    conflictResolution: data.conflictResolution || "",
    youthPrograms: data.youthPrograms || [],
    safetyMeasures: data.safetyMeasures || [],
    additionalComments: data.additionalComments || "",
    ...data,
  })

  const youthProgramOptions = [
    "Sports Programs",
    "Skills Training",
    "Educational Support",
    "Livelihood Programs",
    "Cultural Activities",
    "Leadership Development",
  ]

  const safetyMeasureOptions = [
    "CCTV Installation",
    "Barangay Tanod Patrols",
    "Community Watch Groups",
    "Emergency Hotlines",
    "Safety Seminars",
    "Drug Prevention Programs",
  ]

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

const handleCheckboxChange = (field: string, option: string, checked: boolean) => {
    type FormDataKeys = keyof typeof formData;
    const currentArray = formData[field as FormDataKeys] || []
    const newArray = checked ? [...currentArray, option] : currentArray.filter((item: string) => item !== option)
    handleInputChange(field, newArray)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Safety, Peace and Order</h2>
        </div>

        <div className="space-y-6">
          {/* Crime Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you describe the crime rate in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Low", "Low", "Moderate", "High", "Very High"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="crimeRate"
                    value={option}
                    checked={formData.crimeRate === option}
                    onChange={(e) => handleInputChange("crimeRate", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Police Presence */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the police presence in your barangay?
            </label>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Poor", "Very Poor"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="policePresence"
                    value={option}
                    checked={formData.policePresence === option}
                    onChange={(e) => handleInputChange("policePresence", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Community Patrol */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective are the barangay tanod and community patrol services?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Community Patrol"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="communityPatrol"
                      value={option}
                      checked={formData.communityPatrol === option}
                      onChange={(e) => handleInputChange("communityPatrol", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Street Lighting */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How adequate is the street lighting in your barangay?
            </label>
            <div className="space-y-2">
              {["Excellent coverage", "Good coverage", "Fair coverage", "Poor coverage", "No street lighting"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="streetLighting"
                      value={option}
                      checked={formData.streetLighting === option}
                      onChange={(e) => handleInputChange("streetLighting", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Conflict Resolution */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective is the barangay's conflict resolution and mediation system?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No System in Place"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="conflictResolution"
                      value={option}
                      checked={formData.conflictResolution === option}
                      onChange={(e) => handleInputChange("conflictResolution", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Youth Programs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What youth programs are available to prevent juvenile delinquency? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {youthProgramOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.youthPrograms?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("youthPrograms", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Safety Measures */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What safety measures are implemented in your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safetyMeasureOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.safetyMeasures?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("safetyMeasures", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Comments */}
          <div>
            <label htmlFor="additionalComments" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional comments or suggestions regarding safety, peace and order:
            </label>
            <textarea
              id="additionalComments"
              value={formData.additionalComments}
              onChange={(e) => handleInputChange("additionalComments", e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Please share any additional thoughts..."
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={onNext}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>Next Section</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
