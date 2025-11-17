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
  const [touchStartY, setTouchStartY] = useState(0)

  // Filter out the 'summary' section from progress calculation
  const filterableSections = sections.filter(s => s.id !== 'summary');

  // Check if the first 3 sections (initialization, respondent-selection, respondent-demographics) are completed
  const isInitialSectionsComplete = () => {
    const initialSections = ['initialization', 'respondent-selection', 'respondent-demographics'];
    return initialSections.every(sectionId => {
      const section = sections.find(s => s.id === sectionId);
      return section && section.status === 'completed';
    });
  };

  // Check if a section can be clicked
  const canClickSection = (section: SectionStatus) => {
    // Always allow clicking on the first 3 sections and summary
    if (['initialization', 'respondent-selection', 'respondent-demographics', 'summary'].includes(section.id)) {
      return true;
    }
    
    // For survey sections (4+), only allow if initial sections are complete
    return isInitialSectionsComplete();
  };
  const completedSections = filterableSections.filter((section) => section.status === "completed").length
  const totalSections = filterableSections.length
  const progressPercentage = (totalSections > 0) ? (completedSections / totalSections) * 100 : 0;

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
    const section = sections.find(s => s.id === sectionId);
    if (section && canClickSection(section)) {
      onSectionChange(sectionId)
      setIsDrawerOpen(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY
    setTouchStartY(touchY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchY = e.changedTouches[0].clientY
    const deltaY = touchY - touchStartY
    
    // If swipe down more than 50px, close drawer
    if (deltaY > 50) {
      setIsDrawerOpen(false)
    }
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
          className="fixed inset-0 bg-black/50 z-40 block lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 block lg:hidden ${
          isDrawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-5 pb-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Survey Sections</h2>
              <p className="text-sm text-gray-600">
                {completedSections} of {totalSections} completed
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Section List - Optimized for 6+ sections on mobile */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 -mr-2">
            {sections.map((section, index) => {
              const clickable = canClickSection(section);
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section.id)}
                  disabled={!clickable}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 touch-manipulation ${
                    currentSection === section.id
                      ? "bg-blue-50 border-blue-200 border-l-4 border-l-blue-700"
                      : clickable
                        ? "bg-white border-gray-200 active:bg-gray-50"
                        : "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 bg-gray-100 rounded-full flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className={`text-base ${getStatusColor(section.status)}`}>{getStatusIcon(section.status)}</span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                        section.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : section.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {section.status === "completed"
                        ? "Done"
                        : section.status === "in-progress"
                          ? "Active"
                          : "Pending"}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-medium leading-tight ${
                      currentSection === section.id 
                        ? "text-blue-700" 
                        : clickable 
                          ? "text-gray-700" 
                          : "text-gray-400"
                    }`}
                  >
                    {section.name}
                  </h3>
                  {!clickable && !['initialization', 'respondent-selection', 'respondent-demographics', 'summary'].includes(section.id) && (
                    <p className="text-xs text-gray-400 mt-1">Complete initial sections first</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">Tap a section to navigate • Swipe down to close</div>
          </div>
        </div>
      </div>
    </>
  )
}