"use client"

import { useState } from "react"
import { DollarSign, ArrowLeft, ArrowRight } from "lucide-react"

interface FinancialAdministrationProps {
  data: Record<string, any>
  onUpdate: (data: Record<string, any>) => void
  onNext: () => void
  onBack: () => void
}

export function FinancialAdministration({ data, onUpdate, onNext, onBack }: FinancialAdministrationProps) {
  const [formData, setFormData] = useState({
    budgetTransparency: data.budgetTransparency || "",
    revenueCollection: data.revenueCollection || [],
    financialReporting: data.financialReporting || "",
    auditCompliance: data.auditCompliance || "",
    publicParticipation: data.publicParticipation || "",
    additionalComments: data.additionalComments || "",
    ...data,
  })

  const revenueOptions = [
    "Property Tax",
    "Business Permits",
    "Market Fees",
    "Barangay Clearance",
    "Community Tax Certificate",
    "Other Local Fees",
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
          <DollarSign className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Financial Administration and Sustainability</h2>
        </div>

        <div className="space-y-6">
          {/* Budget Transparency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the transparency of the barangay's budget process?
            </label>
            <div className="space-y-2">
              {["Excellent", "Good", "Fair", "Poor", "Very Poor"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="budgetTransparency"
                    value={option}
                    checked={formData.budgetTransparency === option}
                    onChange={(e) => handleInputChange("budgetTransparency", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Revenue Collection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Which revenue collection methods does your barangay utilize? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {revenueOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.revenueCollection?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("revenueCollection", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Financial Reporting */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How often does the barangay provide financial reports to the community?
            </label>
            <div className="space-y-2">
              {["Monthly", "Quarterly", "Semi-annually", "Annually", "Never"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="financialReporting"
                    value={option}
                    checked={formData.financialReporting === option}
                    onChange={(e) => handleInputChange("financialReporting", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Audit Compliance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Is the barangay compliant with external audit requirements?
            </label>
            <div className="space-y-2">
              {["Always compliant", "Usually compliant", "Sometimes compliant", "Rarely compliant", "Not sure"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="auditCompliance"
                      value={option}
                      checked={formData.auditCompliance === option}
                      onChange={(e) => handleInputChange("auditCompliance", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Public Participation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you describe community participation in budget planning?
            </label>
            <div className="space-y-2">
              {["Very Active", "Active", "Moderate", "Limited", "No Participation"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publicParticipation"
                    value={option}
                    checked={formData.publicParticipation === option}
                    onChange={(e) => handleInputChange("publicParticipation", e.target.value)}
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
              Additional comments or suggestions regarding financial administration:
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
