"use client"

import { CheckCircle, Clock, Circle } from "lucide-react"
import type { SectionStatus } from "../page"

interface SectionCardProps {
  sections: SectionStatus[]
  currentSection: string
  onSectionChange: (sectionId: string) => void
}

export function SectionCard({ sections, currentSection, onSectionChange }: SectionCardProps) {
  // Filter out the 'summary' section from progress calculation
  const filterableSections = sections.filter(s => s.id !== 'summary');

  const getStatusIcon = (status: SectionStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Circle className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusBadge = (status: SectionStatus["status"]) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
      case "in-progress":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>
        )
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Pending</span>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
              currentSection === section.id
                ? "bg-blue-50 border-blue-200 border-l-4 border-l-blue-700"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                  {index + 1}
                </span>
                {getStatusIcon(section.status)}
              </div>
              {getStatusBadge(section.status)}
            </div>
            <h3 className={`text-sm font-medium ${currentSection === section.id ? "text-blue-700" : "text-gray-700"}`}>
              {section.name}
            </h3>
          </button>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span>Progress</span>
            <span className="font-medium">
              {filterableSections.filter((s) => s.status === "completed").length} / {filterableSections.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(filterableSections.filter((s) => s.status === "completed").length / filterableSections.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}