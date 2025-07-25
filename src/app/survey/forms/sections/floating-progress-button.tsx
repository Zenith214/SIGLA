"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { SectionStatus } from "../page"

interface FloatingProgressButtonProps {
  sections: SectionStatus[]
  currentSection: string
  onSectionChange: (sectionId: string) => void
}

export function FloatingProgressButton({ sections, currentSection, onSectionChange }: FloatingProgressButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const completedSections = sections.filter((section) => section.status === "completed").length
  const totalSections = sections.length
  const progressPercentage = (completedSections / totalSections) * 100

  const getStatusIcon = (status: SectionStatus["status"]) => {
    switch (status) {
      case "completed":
        return "✓"
      case "in-progress":
        return "●"
      default:
        return "○"
    }
  }

  const getStatusColor = (status: SectionStatus["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in-progress":
        return "text-yellow-600"
      default:
        return "text-gray-400"
    }
  }

  const handleSectionSelect = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsDrawerOpen(false)
  }

  return (
    <>
      {/* Floating Progress Button - Mobile Only */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-200 hover:scale-105 block lg:hidden"
        style={{
          background:
            "conic-gradient(#3b82f6 0deg, #3b82f6 " +
            progressPercentage * 3.6 +
            "deg, #e5e7eb " +
            progressPercentage * 3.6 +
            "deg, #e5e7eb 360deg)",
        }}
      >
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center m-2 shadow-inner">
          <span className="text-white text-xs font-bold">
            {completedSections}/{totalSections}
          </span>
        </div>
      </button>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 block lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 block lg:hidden ${
          isDrawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh" }}
      >
        <div className="p-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Survey Sections</h2>
              <p className="text-sm text-gray-600">
                {completedSections} of {totalSections} completed
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Section List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleSectionSelect(section.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  currentSection === section.id
                    ? "bg-blue-50 border-blue-200 border-l-4 border-l-blue-700"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                      {index + 1}
                    </span>
                    <span className={`text-lg ${getStatusColor(section.status)}`}>{getStatusIcon(section.status)}</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      section.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : section.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {section.status === "completed"
                      ? "Completed"
                      : section.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                  </span>
                </div>
                <h3
                  className={`text-sm font-medium ${currentSection === section.id ? "text-blue-700" : "text-gray-700"}`}
                >
                  {section.name}
                </h3>
              </button>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">Tap a section to navigate • Swipe down to close</div>
          </div>
        </div>
      </div>
    </>
  )
}
