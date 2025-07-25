"use client"

import { CheckCircle, Clock, Circle, X } from "lucide-react"
import type { SectionStatus } from "../page"

interface SidebarProps {
  sections: SectionStatus[]
  currentSection: string
  onSectionChange: (sectionId: string) => void
  isVisible: boolean
  onClose: () => void
}

export function Sidebar({ sections, currentSection, onSectionChange, isVisible, onClose }: SidebarProps) {
  const getStatusIcon = (status: SectionStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Circle className="w-5 h-5 text-blue-600" />
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
    <>
      {/* Mobile overlay */}
      {isVisible && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      <aside
        id="survey-sidebar"
        className={`fixed left-0 top-16 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto z-50 transform transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Survey Sections</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-3">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id)
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    onClose()
                  }
                }}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  currentSection === section.id
                    ? "bg-blue-50 border-blue-200 border-r-4 border-r-blue-700"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                      {index + 1}
                    </span>
                    {getStatusIcon(section.status)}
                  </div>
                  {getStatusBadge(section.status)}
                </div>
                <h3 className={`font-medium ${currentSection === section.id ? "text-blue-700" : "text-gray-700"}`}>
                  {section.name}
                </h3>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
