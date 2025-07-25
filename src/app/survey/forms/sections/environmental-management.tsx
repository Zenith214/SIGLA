"use client"

import { useState } from "react"
import { Leaf, ArrowLeft, ArrowRight } from "lucide-react"

interface EnvironmentalManagementProps {
  data: Record<string, any>
  onUpdate: (data: Record<string, any>) => void
  onNext: () => void
  onBack: () => void
}

export function EnvironmentalManagement({ data, onUpdate, onNext, onBack }: EnvironmentalManagementProps) {
  const [formData, setFormData] = useState({
    wasteManagement: data.wasteManagement || "",
    waterQuality: data.waterQuality || "",
    airQuality: data.airQuality || "",
    greenSpaces: data.greenSpaces || "",
    environmentalPrograms: data.environmentalPrograms || [],
    climateAdaptation: data.climateAdaptation || "",
    pollutionControl: data.pollutionControl || "",
    additionalComments: data.additionalComments || "",
    ...data,
  })

  const environmentalProgramOptions = [
    "Tree Planting Programs",
    "Waste Segregation Campaigns",
    "Clean-up Drives",
    "Environmental Education",
    "Recycling Programs",
    "Urban Gardening Projects",
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
          <Leaf className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Environmental Management</h2>
        </div>

        <div className="space-y-6">
          {/* Waste Management */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective is the waste management system in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No System in Place"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wasteManagement"
                      value={option}
                      checked={formData.wasteManagement === option}
                      onChange={(e) => handleInputChange("wasteManagement", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Water Quality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the water quality in your barangay?
            </label>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Poor", "Very Poor"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="waterQuality"
                    value={option}
                    checked={formData.waterQuality === option}
                    onChange={(e) => handleInputChange("waterQuality", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Air Quality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you describe the air quality in your barangay?
            </label>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Poor", "Very Poor"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="airQuality"
                    value={option}
                    checked={formData.airQuality === option}
                    onChange={(e) => handleInputChange("airQuality", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Green Spaces */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How adequate are the green spaces and parks in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Adequate", "Adequate", "Moderately Adequate", "Inadequate", "No Green Spaces"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="greenSpaces"
                    value={option}
                    checked={formData.greenSpaces === option}
                    onChange={(e) => handleInputChange("greenSpaces", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Environmental Programs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What environmental programs are implemented in your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {environmentalProgramOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.environmentalPrograms?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("environmentalPrograms", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Climate Adaptation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How prepared is your barangay for climate change adaptation?
            </label>
            <div className="space-y-2">
              {["Very Prepared", "Prepared", "Moderately Prepared", "Unprepared", "Not Aware of Need"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="climateAdaptation"
                    value={option}
                    checked={formData.climateAdaptation === option}
                    onChange={(e) => handleInputChange("climateAdaptation", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pollution Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective are the pollution control measures in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Measures in Place"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pollutionControl"
                      value={option}
                      checked={formData.pollutionControl === option}
                      onChange={(e) => handleInputChange("pollutionControl", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Additional Comments */}
          <div>
            <label htmlFor="additionalComments" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional comments or suggestions regarding environmental management:
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
            <span>Review & Submit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
