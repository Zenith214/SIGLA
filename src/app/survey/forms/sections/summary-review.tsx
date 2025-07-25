"use client"

import { CheckCircle, ArrowLeft, Send } from "lucide-react"
import type { SurveyData } from "../page"

interface SummaryReviewProps {
  data: SurveyData
  onBack: () => void
  onSubmit: () => void
}

export function SummaryReview({ data, onBack, onSubmit }: SummaryReviewProps) {
  const formatArrayData = (arr: string[]) => {
    return arr && arr.length > 0 ? arr.join(", ") : "None selected"
  }

  const sections = [
    {
      title: "Survey Information",
      data: [
        { label: "Survey Number", value: data.surveyNumber || "Not provided" },
        { label: "Location", value: data.location?.address || "Not captured" },
        { label: "Selected Household Member", value: data.selectedMember || "Not selected" },
      ],
    },
    {
      title: "Financial Administration",
      data: [
        { label: "Budget Transparency", value: data.financialAdmin?.budgetTransparency || "Not answered" },
        { label: "Revenue Collection Methods", value: formatArrayData(data.financialAdmin?.revenueCollection) },
        { label: "Financial Reporting Frequency", value: data.financialAdmin?.financialReporting || "Not answered" },
        { label: "Audit Compliance", value: data.financialAdmin?.auditCompliance || "Not answered" },
      ],
    },
    {
      title: "Disaster Preparedness",
      data: [
        { label: "Emergency Plan Status", value: data.disasterPrep?.emergencyPlan || "Not answered" },
        { label: "Evacuation Centers", value: formatArrayData(data.disasterPrep?.evacuationCenters) },
        { label: "Warning System Effectiveness", value: data.disasterPrep?.warningSystem || "Not answered" },
        { label: "Community Training Frequency", value: data.disasterPrep?.communityTraining || "Not answered" },
      ],
    },
    {
      title: "Safety, Peace and Order",
      data: [
        { label: "Crime Rate Assessment", value: data.safetyPeace?.crimeRate || "Not answered" },
        { label: "Police Presence Rating", value: data.safetyPeace?.policePresence || "Not answered" },
        { label: "Community Patrol Effectiveness", value: data.safetyPeace?.communityPatrol || "Not answered" },
        { label: "Youth Programs Available", value: formatArrayData(data.safetyPeace?.youthPrograms) },
      ],
    },
    {
      title: "Social Protection",
      data: [
        { label: "Health Services Accessibility", value: data.socialProtection?.healthServices || "Not answered" },
        { label: "Education Support Programs", value: formatArrayData(data.socialProtection?.educationSupport) },
        { label: "Senior Citizen Services", value: data.socialProtection?.seniorCitizen || "Not answered" },
        { label: "PWD Services Rating", value: data.socialProtection?.pwdServices || "Not answered" },
      ],
    },
    {
      title: "Business Friendliness",
      data: [
        { label: "Permit Processing Efficiency", value: data.businessFriendly?.permitProcessing || "Not answered" },
        { label: "Business Support Services", value: formatArrayData(data.businessFriendly?.businessSupport) },
        { label: "Market Facilities Adequacy", value: data.businessFriendly?.marketFacilities || "Not answered" },
        { label: "Investment Climate", value: data.businessFriendly?.investmentClimate || "Not answered" },
      ],
    },
    {
      title: "Environmental Management",
      data: [
        { label: "Waste Management Effectiveness", value: data.environmental?.wasteManagement || "Not answered" },
        { label: "Water Quality Rating", value: data.environmental?.waterQuality || "Not answered" },
        { label: "Air Quality Assessment", value: data.environmental?.airQuality || "Not answered" },
        { label: "Environmental Programs", value: formatArrayData(data.environmental?.environmentalPrograms) },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Survey Summary & Review</h2>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Please review all your responses before submitting the survey. You can go back to any section to make
            changes if needed.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.data.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-gray-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-600 mb-1">{item.label}</dt>
                    <dd className="text-sm text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Survey Statistics */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Survey Statistics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-blue-800">Total Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">7</div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{new Date().toLocaleDateString()}</div>
              <div className="text-sm text-orange-800">Survey Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.surveyNumber || "N/A"}</div>
              <div className="text-sm text-purple-800">Survey ID</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Edit</span>
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Submit Survey</span>
          </button>
        </div>
      </div>
    </div>
  )
}
