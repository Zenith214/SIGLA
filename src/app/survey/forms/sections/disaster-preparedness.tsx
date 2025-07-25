"use client"

import { useState } from "react"
import { Shield, ArrowLeft, ArrowRight } from "lucide-react"

interface DisasterPreparednessProps {
  data: Record<string, any>
  onUpdate: (data: Record<string, any>) => void
  onNext: () => void
  onBack: () => void
}

export function DisasterPreparedness({ data, onUpdate, onNext, onBack }: DisasterPreparednessProps) {
  const [formData, setFormData] = useState({
    emergencyPlan: data.emergencyPlan || "",
    evacuationCenters: data.evacuationCenters || [],
    warningSystem: data.warningSystem || "",
    communityTraining: data.communityTraining || "",
    equipmentAvailability: data.equipmentAvailability || "",
    coordinationLevel: data.coordinationLevel || "",
    riskAssessment: data.riskAssessment || "",
    additionalComments: data.additionalComments || "",
    ...data,
  })

  const evacuationOptions = [
    "School Buildings",
    "Community Centers",
    "Churches/Religious Centers",
    "Government Buildings",
    "Sports Facilities",
    "Private Buildings",
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
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Disaster Preparedness</h2>
        </div>

        <div className="space-y-6">
          {/* Emergency Plan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Does your barangay have a comprehensive disaster preparedness plan?
            </label>
            <div className="space-y-2">
              {[
                "Yes, comprehensive and updated",
                "Yes, but needs updating",
                "Basic plan exists",
                "No formal plan",
                "Not sure",
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="emergencyPlan"
                    value={option}
                    checked={formData.emergencyPlan === option}
                    onChange={(e) => handleInputChange("emergencyPlan", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Evacuation Centers */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What types of evacuation centers are available in your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evacuationOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.evacuationCenters?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("evacuationCenters", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Warning System */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective is the early warning system in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Warning System"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="warningSystem"
                      value={option}
                      checked={formData.warningSystem === option}
                      onChange={(e) => handleInputChange("warningSystem", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Community Training */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How often does the community receive disaster preparedness training?
            </label>
            <div className="space-y-2">
              {["Regularly (quarterly)", "Semi-annually", "Annually", "Rarely", "Never"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="communityTraining"
                    value={option}
                    checked={formData.communityTraining === option}
                    onChange={(e) => handleInputChange("communityTraining", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment Availability */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the availability of emergency equipment and supplies?
            </label>
            <div className="space-y-2">
              {["Fully Equipped", "Well Equipped", "Adequately Equipped", "Poorly Equipped", "No Equipment"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="equipmentAvailability"
                      value={option}
                      checked={formData.equipmentAvailability === option}
                      onChange={(e) => handleInputChange("equipmentAvailability", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Coordination Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How well does the barangay coordinate with higher government levels during disasters?
            </label>
            <div className="space-y-2">
              {[
                "Excellent coordination",
                "Good coordination",
                "Fair coordination",
                "Poor coordination",
                "No coordination",
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="coordinationLevel"
                    value={option}
                    checked={formData.coordinationLevel === option}
                    onChange={(e) => handleInputChange("coordinationLevel", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <label htmlFor="riskAssessment" className="block text-sm font-semibold text-gray-700 mb-2">
              What are the main disaster risks in your barangay?
            </label>
            <textarea
              id="riskAssessment"
              value={formData.riskAssessment}
              onChange={(e) => handleInputChange("riskAssessment", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Flooding, Typhoons, Earthquakes, Landslides..."
            />
          </div>

          {/* Additional Comments */}
          <div>
            <label htmlFor="additionalComments" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional comments or suggestions regarding disaster preparedness:
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
