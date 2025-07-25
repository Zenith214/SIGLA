"use client"

import { useState } from "react"
import { Briefcase, ArrowLeft, ArrowRight } from "lucide-react"

interface BusinessFriendlinessProps {
  data: Record<string, any>
  onUpdate: (data: Record<string, any>) => void
  onNext: () => void
  onBack: () => void
}

export function BusinessFriendliness({ data, onUpdate, onNext, onBack }: BusinessFriendlinessProps) {
  const [formData, setFormData] = useState({
    permitProcessing: data.permitProcessing || "",
    businessSupport: data.businessSupport || [],
    marketFacilities: data.marketFacilities || "",
    entrepreneurship: data.entrepreneurship || "",
    investmentClimate: data.investmentClimate || "",
    regulatoryCompliance: data.regulatoryCompliance || "",
    businessIncentives: data.businessIncentives || [],
    additionalComments: data.additionalComments || "",
    ...data,
  })

  const businessSupportOptions = [
    "Business Registration Assistance",
    "Loan Facilitation Programs",
    "Skills Training for Entrepreneurs",
    "Market Linkage Programs",
    "Business Development Services",
    "Cooperative Formation Support",
  ]

  const businessIncentiveOptions = [
    "Tax Exemptions",
    "Reduced Permit Fees",
    "Priority Processing",
    "Infrastructure Support",
    "Marketing Assistance",
    "Training Subsidies",
  ]

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const handleCheckboxChange = (field: string, option: string, checked: boolean) => {
    type FormDataKeys = keyof typeof formData;
    const currentArray = (formData[field as FormDataKeys] as string[]) || []
    const newArray = checked ? [...currentArray, option] : currentArray.filter((item: string) => item !== option)

    handleInputChange(field, newArray)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Business Friendliness and Competitiveness</h2>
        </div>

        <div className="space-y-6">
          {/* Permit Processing */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate the efficiency of business permit processing in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Efficient", "Efficient", "Moderately Efficient", "Inefficient", "Very Inefficient"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="permitProcessing"
                      value={option}
                      checked={formData.permitProcessing === option}
                      onChange={(e) => handleInputChange("permitProcessing", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Business Support */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What business support services are available in your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {businessSupportOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.businessSupport?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("businessSupport", option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Market Facilities */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How adequate are the market facilities and commercial spaces in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Adequate", "Adequate", "Moderately Adequate", "Inadequate", "No Facilities Available"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketFacilities"
                      value={option}
                      checked={formData.marketFacilities === option}
                      onChange={(e) => handleInputChange("marketFacilities", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Entrepreneurship Programs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How effective are the entrepreneurship development programs in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Effective", "Effective", "Moderately Effective", "Ineffective", "No Programs Available"].map(
                (option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="entrepreneurship"
                      value={option}
                      checked={formData.entrepreneurship === option}
                      onChange={(e) => handleInputChange("entrepreneurship", e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Investment Climate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you describe the overall investment climate in your barangay?
            </label>
            <div className="space-y-2">
              {["Very Favorable", "Favorable", "Neutral", "Unfavorable", "Very Unfavorable"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="investmentClimate"
                    value={option}
                    checked={formData.investmentClimate === option}
                    onChange={(e) => handleInputChange("investmentClimate", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Regulatory Compliance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How clear and consistent are the business regulations and requirements?
            </label>
            <div className="space-y-2">
              {["Very Clear", "Clear", "Moderately Clear", "Unclear", "Very Unclear"].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="regulatoryCompliance"
                    value={option}
                    checked={formData.regulatoryCompliance === option}
                    onChange={(e) => handleInputChange("regulatoryCompliance", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Business Incentives */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What business incentives are offered by your barangay? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {businessIncentiveOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.businessIncentives?.includes(option) || false}
                    onChange={(e) => handleCheckboxChange("businessIncentives", option, e.target.checked)}
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
              Additional comments or suggestions regarding business friendliness and competitiveness:
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
