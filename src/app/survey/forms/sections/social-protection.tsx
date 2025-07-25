"use client"

import { useState } from "react"
import { Heart, ArrowLeft, ArrowRight } from "lucide-react"

interface SocialProtectionProps {
  data: Record<string, any>
  onUpdate: (data: Record<string, any>) => void
  onNext: () => void
  onBack: () => void
}

export function SocialProtection({ data, onUpdate, onNext, onBack }: SocialProtectionProps) {
  const [formData, setFormData] = useState({
    healthServices: data.healthServices || "",
    educationSupport: data.educationSupport || [],
    seniorCitizen: data.seniorCitizen || "",
    pwdServices: data.pwdServices || "",
    socialWelfare: data.socialWelfare || [],
    nutritionPrograms: data.nutritionPrograms || "",
    housingAssistance: data.housingAssistance || "",
    additionalComments: data.additionalComments || "",
    ...data,
  })

  const educationSupportOptions = [
    "Scholarship Programs",
    "School Supplies Distribution",
    "Feeding Programs",
    "Tutorial Services",
    "Educational Facilities",
    "Transportation Assistance",
  ]

  const socialWelfareOptions = [
    "Cash Transfer Programs",
    "Livelihood Training",
    "Medical Assistance",
    "Emergency Relief",
    "Family Counseling",
    "Legal Aid Services",
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
          <Heart className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Social Protection and Security</h2>
        </div>

        <div className="space-y-6">
          {/* Health Services */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the accessibility of health services in your barangay?
            </label>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Poor", "Very Poor"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="healthServices"
                    value={option}
                    checked={formData.healthServices === option}
                    onChange={(e) => handleInputChange("healthServices", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Education Support */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What educational support programs are available in your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {educationSupportOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.educationSupport?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("educationSupport", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Senior Citizen Services */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How adequate are the services for senior citizens in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Adequate", "Adequate", "Moderately Adequate", "Inadequate", "No Services Available"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="seniorCitizen"
                      value={option}
                      checked={formData.seniorCitizen === option}
                      onChange={(e) => handleInputChange("seniorCitizen", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* PWD Services */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the services for Persons with Disabilities (PWD)?
            </label>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Poor", "No Services Available"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pwdServices"
                    value={option}
                    checked={formData.pwdServices === option}
                    onChange={(e) => handleInputChange("pwdServices", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Social Welfare Programs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What social welfare programs are implemented in your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {socialWelfareOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.socialWelfare?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("socialWelfare", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nutrition Programs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective are the nutrition programs for children and pregnant women?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Programs Available"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="nutritionPrograms"
                      value={option}
                      checked={formData.nutritionPrograms === option}
                      onChange={(e) => handleInputChange("nutritionPrograms", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Housing Assistance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How available is housing assistance for low-income families?
            </label>
            <div className="space-y-2">
              {[
                "Readily Available",
                "Available with Requirements",
                "Limited Availability",
                "Rarely Available",
                "Not Available",
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="housingAssistance"
                    value={option}
                    checked={formData.housingAssistance === option}
                    onChange={(e) => handleInputChange("housingAssistance", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Comments */}
          <div>
            <label htmlFor="additionalComments" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional comments or suggestions regarding social protection and security:
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
