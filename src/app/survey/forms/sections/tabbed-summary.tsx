"use client"

import { JSX, useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import type { SurveyData, SectionStatus } from "../page"

interface TabbedSummaryProps {
  data: SurveyData
  sections: SectionStatus[]
  onBack: () => void
  onSubmit: () => void
}

export function TabbedSummary({ data, sections, onBack, onSubmit }: TabbedSummaryProps) {
  const [activeTab, setActiveTab] = useState("demographics")

  const surveyTabs = [
    { id: "demographics", name: "Demographics", dataKey: "respondentDemographics" as keyof SurveyData },
    { id: "financial", name: "Financial Admin", dataKey: "financialAdmin" as keyof SurveyData },
    { id: "disaster", name: "Disaster Prep", dataKey: "disasterPrep" as keyof SurveyData },
    { id: "safety", name: "Peace & Order", dataKey: "safetyPeace" as keyof SurveyData },
    { id: "social", name: "Social Protection", dataKey: "socialProtection" as keyof SurveyData },
    { id: "business", name: "Business Friendly", dataKey: "businessFriendly" as keyof SurveyData },
    { id: "environmental", name: "Environmental", dataKey: "environmental" as keyof SurveyData },
  ]

  const formatValue = (value: any): string | JSX.Element => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "None selected"
    }
    if (typeof value === "object" && value !== null) {
      // Handle object case - render key-value pairs
      return (
        <div>
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <strong>{key}:</strong> {formatValue(val)}
            </div>
          ))}
        </div>
      )
    }
    return value || "Not answered"
  }

  const getSectionStatus = (sectionId: string) => {
    // Demographics is part of kish-grid section
    if (sectionId === "demographics") {
      return sections.find((s) => s.id === "kish-grid")?.status || "pending"
    }
    return sections.find((s) => s.id === sectionId)?.status || "pending"
  }

  const renderSectionContent = () => {
    const activeTabData = surveyTabs.find((tab) => tab.id === activeTab)
    if (!activeTabData) return null

    const sectionData = data[activeTabData.dataKey] as Record<string, any>
    const sectionStatus = getSectionStatus(activeTab)

    if (!sectionData || Object.keys(sectionData).length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">No data available for this section</p>
          <p className="text-sm text-gray-400 mt-1">Complete the survey section to see responses here</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {Object.entries(sectionData).map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
            <dt className="text-sm font-medium text-gray-600 mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
            </dt>
            <dd className="text-base text-gray-700">{formatValue(value)}</dd>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey Summary & Review</h2>
        <p className="text-gray-600">Review your responses before submitting the survey</p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {surveyTabs.map((tab) => {
          const status = getSectionStatus(tab.id)
          const isCompleted = status === "completed"

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-blue-700 border-blue-700 bg-blue-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
              } ${isCompleted ? "border-t-2 border-t-green-500" : ""}`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.name}</span>
                {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Content Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {surveyTabs.find((tab) => tab.id === activeTab)?.name} Responses
          </h3>
          {renderSectionContent()}
        </div>
      </div>

      {/* Survey Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Survey Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sections.filter((s) => s.id !== "initialization" && s.id !== "summary").length}
            </div>
            <div className="text-sm text-blue-800">Total Sections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sections.filter((s) => s.status === "completed" && s.id !== "initialization").length}
            </div>
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

      {/* Navigation */}
      <div className="flex justify-between">
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
  )
}

