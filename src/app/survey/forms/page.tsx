"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import { Header } from "./sections/header"
import { SectionCard } from "./sections/section-card"
import { FloatingProgressButton } from "./sections/floating-progress-button"
import { SurveyInitialization } from "./sections/survey-initialization"
import { RespondentSelection } from "./sections/respondent-selection"
import { RespondentDemographics } from "./sections/respondent-demographics"
import { QuestionFlow } from "./sections/question-flow"
import { TabbedSummary } from "./sections/tabbed-summary"
import { SubmissionModal } from "./components/submission-modal"
import {
  getAssignedSections,
  isSectionAssigned,
  getNextAssignedSection,
  getPreviousAssignedSection
} from "./utils/sectionAssignment"
import { getQuestionsForSection } from "./utils/questions"

export interface SurveyData {
  surveyNumber: string
  assignedSections?: string[] // New field for tracking assigned sections
  barangayId?: number
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracy?: number;
    timestamp?: number;
    barangay?: string;
    municipality?: string;
    province?: string;
  }
  selectedMember: string
  respondentDemographics: {
    age: number
    birthdate: string
    gender: string
    educationalAttainment: string
    householdIncome: string
  }
  financialAdmin: Record<string, any>
  disasterPrep: Record<string, any>
  safetyPeace: Record<string, any>
  businessFriendly: Record<string, any>
  environmental: Record<string, any>
  socialProtection: Record<string, any>
}

export interface SectionStatus {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
}

export interface Question {
  id: string
  type: "radio" | "checkbox" | "text" | "textarea" | "grouped"
  question: string
  options?: string[]
  required?: boolean
  dependsOn?: string
  dependsOnValue?: string
  partHeader?: string; // New property for section part headers
  mainQuestion?: string
  mainOptions?: string[]
  followUpQuestions?: Question[]
  conditionalNext?: {
    value: string; // The value that triggers the jump
    skipToId: string; // The ID of the question to jump to
  }[];
}

// Helper function to format user data for the header
function formatUserForHeader(user: any) {
  if (!user) {
    return {
      name: "Unknown User",
      role: "Survey Enumerator",
      id: "ENU-2024-000",
      avatar: "/placeholder.svg?height=32&width=32&text=U",
    }
  }

  const name = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || "Unknown User"

  const initials = user.firstName && user.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : user.firstName?.charAt(0) || 'U'

  return {
    name,
    role: "Survey Enumerator",
    id: `ENU-${new Date().getFullYear()}-${String(user.id || 0).padStart(3, '0')}`,
    avatar: `/placeholder.svg?height=32&width=32&text=${initials}`,
  }
}

function SurveyAppContent() {
  const [currentSection, setCurrentSection] = useState("initialization")
  const [submissionModal, setSubmissionModal] = useState<{
    isOpen: boolean
    type: 'success' | 'duplicate' | 'error'
    message: string
  }>({
    isOpen: false,
    type: 'success',
    message: ''
  })
  const [surveyData, setSurveyData] = useState<SurveyData>({
    surveyNumber: "",
    barangayId: undefined,
    location: { lat: 0, lng: 0, address: "" },
    selectedMember: "",
    respondentDemographics: {
      age: 0,
      gender: "",
      educationalAttainment: "",
      householdIncome: ""
    },
    financialAdmin: {},
    disasterPrep: {},
    safetyPeace: {},
    businessFriendly: {},
    environmental: {},
    socialProtection: {}, // Added missing property
  })

  // Initialize with base sections - assigned sections will be added dynamically
  const [sections, setSections] = useState<SectionStatus[]>([
    { id: "initialization", name: "Survey Initialization", status: "in-progress" },
    { id: "respondent-selection", name: "Respondent Selection", status: "pending" },
    { id: "respondent-demographics", name: "Respondent Demographics", status: "pending" },
    { id: "summary", name: "Summary & Review", status: "pending" },
  ])

  // Get authenticated user information and router
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const formattedUser = formatUserForHeader(user)

  // Read URL parameters
  const barangayIdParam = searchParams.get('barangayId')

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("barangay-survey-data")
    if (saved) {
      setSurveyData(JSON.parse(saved))
    }
    const savedSections = localStorage.getItem("barangay-survey-sections")
    if (savedSections) {
      setSections(JSON.parse(savedSections))
    }
  }, [])

  // Pre-populate barangayId from URL parameter
  useEffect(() => {
    if (barangayIdParam && !surveyData.barangayId) {
      const barangayId = parseInt(barangayIdParam)
      if (!isNaN(barangayId)) {
        console.log(`📍 Pre-populating barangayId from URL: ${barangayId}`)
        setSurveyData(prev => ({ ...prev, barangayId }))
      }
    }
  }, [barangayIdParam, surveyData.barangayId])

  // Update assigned sections when survey number changes
  useEffect(() => {
    console.log(`🔄 Survey number or current section changed: ${surveyData.surveyNumber}, current: ${currentSection}`);

    if (surveyData.surveyNumber && surveyData.surveyNumber.trim()) {
      const assignedSections = getAssignedSections(surveyData.surveyNumber);
      const assignedSectionIds = assignedSections.map(s => s.id);
      console.log(`📋 Assigned sections for survey ${surveyData.surveyNumber}:`, assignedSectionIds);

      // Update survey data with assigned sections
      if (JSON.stringify(surveyData.assignedSections) !== JSON.stringify(assignedSectionIds)) {
        console.log(`🔄 Updating survey data with assigned sections`);
        setSurveyData(prev => ({ ...prev, assignedSections: assignedSectionIds }));
      }

      // Only rebuild sections if they don't exist yet, otherwise preserve existing statuses
      setSections(prevSections => {
        // If sections array is empty or doesn't have the right sections, rebuild it
        const existingSectionIds = prevSections.map(s => s.id);
        const expectedSectionIds = ["initialization", "respondent-selection", "respondent-demographics", ...assignedSectionIds, "summary"];

        if (prevSections.length === 0 || JSON.stringify(existingSectionIds) !== JSON.stringify(expectedSectionIds)) {
          console.log(`🏗️ Building initial sections array`);
          const newSections: SectionStatus[] = [
            { id: "initialization", name: "Survey Initialization", status: "completed" },
            { id: "respondent-selection", name: "Respondent Selection", status: currentSection === "respondent-selection" ? "in-progress" : "pending" },
            { id: "respondent-demographics", name: "Respondent Demographics", status: currentSection === "respondent-demographics" ? "in-progress" : "pending" },
            ...assignedSections.map(section => ({
              ...section,
              status: currentSection === section.id ? "in-progress" as const : "pending" as const
            })),
            { id: "summary", name: "Summary & Review", status: currentSection === "summary" ? "in-progress" : "pending" },
          ];
          console.log(`📋 Initial sections:`, newSections.map(s => `${s.id}: ${s.status}`));
          return newSections;
        } else {
          // Preserve existing statuses, only update current section to in-progress
          console.log(`🔄 Preserving existing statuses, updating current section`);
          const updatedSections = prevSections.map(section => {
            if (section.id === currentSection && section.status === "pending") {
              console.log(`▶️ Setting ${section.id} to in-progress (was ${section.status})`);
              return { ...section, status: "in-progress" as const };
            }
            return section;
          });
          console.log(`📋 Preserved sections:`, updatedSections.map(s => `${s.id}: ${s.status}`));
          return updatedSections;
        }
      });
    }
  }, [surveyData.surveyNumber, currentSection]);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem("barangay-survey-data", JSON.stringify(surveyData))
  }, [surveyData])

  useEffect(() => {
    localStorage.setItem("barangay-survey-sections", JSON.stringify(sections))
  }, [sections])

  const updateSectionStatus = (sectionId: string, status: SectionStatus["status"]) => {
    console.log(`🔄 updateSectionStatus called: ${sectionId} -> ${status}`);
    setSections((prev) => {
      const updated = prev.map((section) => {
        if (section.id === sectionId) {
          console.log(`✅ Updated section ${sectionId}: ${section.status} -> ${status}`);
          return { ...section, status };
        }
        return section;
      });
      console.log('📋 All sections after update:', updated.map(s => `${s.id}: ${s.status}`));
      return updated;
    });
  }

  const updateSurveyData = (section: keyof SurveyData, data: any) => {
    setSurveyData((prev) => ({ ...prev, [section]: data }))
  }

  const handleModalClose = () => {
    setSubmissionModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleModalRetry = () => {
    setSubmissionModal(prev => ({ ...prev, isOpen: false }))
    // The submission will be retried when user clicks submit again
  }

  const handleModalRedirect = () => {
    // Clear local storage after successful submission
    localStorage.removeItem("barangay-survey-data")
    localStorage.removeItem("barangay-survey-sections")

    // Close modal and redirect
    setSubmissionModal(prev => ({ ...prev, isOpen: false }))

    // Redirect back to barangay detail page if barangayId was provided
    if (barangayIdParam) {
      router.push(`/survey/barangay/${barangayIdParam}`)
    } else {
      // Fallback to survey dashboard
      router.push('/survey')
    }
  }

  // Helper function to check if a section is complete (including skipped questions)
  const isSectionComplete = (sectionId: string, sectionData: any): boolean => {
    if (!sectionData || typeof sectionData !== 'object') {
      return false;
    }

    // Get all questions for this section
    const questions = getQuestionsForSection(sectionId);
    if (questions.length === 0) {
      return true; // No questions means complete
    }

    // Check if all questions are either answered or properly skipped
    return questions.every(question => {
      const answer = sectionData[question.id];
      const skipReason = sectionData[`${question.id}_skipReason`];

      // Question is complete if:
      // 1. It has a real answer (not null/undefined/empty)
      // 2. It's null but has a skip reason (was skipped due to conditional logic)
      return (answer !== undefined && answer !== null && answer !== '') ||
        (answer === null && skipReason);
    });
  }

  const handleSectionComplete = (sectionId: string, nextSectionId?: string) => {
    console.log(`🎯 handleSectionComplete called for: ${sectionId}, nextSectionId: ${nextSectionId}`);

    // Always mark the current section as completed when this function is called
    console.log(`🏁 Marking section ${sectionId} as completed`);
    updateSectionStatus(sectionId, "completed")

    // Determine next section based on assignment logic
    let actualNextSection = nextSectionId;
    if ((!actualNextSection || actualNextSection === "") && surveyData.surveyNumber) {
      const nextSection = getNextAssignedSection(surveyData.surveyNumber, sectionId);
      actualNextSection = nextSection || undefined;
      console.log(`🔍 Next assigned section for survey ${surveyData.surveyNumber} after ${sectionId}: ${actualNextSection}`);
    }

    if (actualNextSection && actualNextSection !== "summary") {
      console.log(`▶️ Setting next section ${actualNextSection} to in-progress`);
      updateSectionStatus(actualNextSection, "in-progress")
    } else if (actualNextSection === "summary") {
      console.log(`📝 Setting summary to in-progress`);
      updateSectionStatus("summary", "in-progress")
    }

    if (actualNextSection) {
      console.log(`🚀 Navigating to section: ${actualNextSection}`);
      setCurrentSection(actualNextSection)
    }
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "initialization":
        return (
          <SurveyInitialization
            data={surveyData}
            onUpdate={updateSurveyData}
            onNext={() => handleSectionComplete("initialization", "respondent-selection")}
            preselectedBarangayId={barangayIdParam ? parseInt(barangayIdParam) : undefined}
          />
        )
      case "respondent-selection":
        return (
          <RespondentSelection
            surveyNumber={surveyData.surveyNumber}
            onUpdate={updateSurveyData}
            onNext={() => handleSectionComplete("respondent-selection", "respondent-demographics")}
            onBack={() => setCurrentSection("initialization")}
          />
        )
      case "respondent-demographics":
        return (
          <RespondentDemographics
            data={surveyData}
            onUpdate={updateSurveyData}
            onNext={() => {
              // Get the first assigned section for this survey number
              if (surveyData.surveyNumber) {
                const assignedSections = getAssignedSections(surveyData.surveyNumber);
                const firstAssignedSection = assignedSections.length > 0 ? assignedSections[0].id : "summary";
                handleSectionComplete("respondent-demographics", firstAssignedSection);
              } else {
                handleSectionComplete("respondent-demographics", "summary");
              }
            }}
            onBack={() => setCurrentSection("respondent-selection")}
          />
        )
      case "financial":
      case "disaster":
      case "safety":
      case "social":
      case "business":
      case "environmental":
        // Only render if section is assigned
        if (!surveyData.surveyNumber || !isSectionAssigned(surveyData.surveyNumber, currentSection)) {
          return (
            <div className="p-6 text-center">
              <p className="text-gray-600">This section is not assigned for your survey number.</p>
              <button
                onClick={() => setCurrentSection("summary")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Go to Summary
              </button>
            </div>
          );
        }

        return (
          <QuestionFlow
            sectionId={currentSection}
            data={surveyData}
            onUpdate={updateSurveyData}
            onComplete={() => {
              handleSectionComplete(currentSection);
            }}
            onBack={() => {
              if (surveyData.surveyNumber) {
                const prevSection = getPreviousAssignedSection(surveyData.surveyNumber, currentSection);
                if (prevSection) {
                  setCurrentSection(prevSection);
                }
              }
            }}
            onResetSectionStatus={updateSectionStatus}
          />
        )
      case "summary":
        return (
          <TabbedSummary
            data={surveyData}
            sections={sections}
            onBack={() => {
              if (surveyData.surveyNumber) {
                // Go back to the last assigned section
                const assignedSections = getAssignedSections(surveyData.surveyNumber);
                const lastSection = assignedSections[assignedSections.length - 1];
                if (lastSection) {
                  setCurrentSection(lastSection.id);
                } else {
                  // If no assigned sections, go back to respondent demographics
                  setCurrentSection("respondent-demographics");
                }
              } else {
                setCurrentSection("respondent-demographics");
              }
            }}
            onSubmit={async () => {
              try {
                updateSectionStatus("summary", "completed")

                let barangayId = surveyData.barangayId

                // If no barangayId is set, try to get it from location data
                if (!barangayId && surveyData.location.barangay) {
                  try {
                    const barangayResponse = await fetch(`/api/barangays/by-name?name=${encodeURIComponent(surveyData.location.barangay)}`)
                    if (barangayResponse.ok) {
                      const barangayData = await barangayResponse.json()
                      barangayId = barangayData.barangay_id
                    }
                  } catch (error) {
                    console.warn('Could not find barangay ID from location data:', error)
                  }
                }

                // Default to first available barangay if still no ID
                if (!barangayId) {
                  barangayId = 26 // Default to Katipunan
                }

                // Prepare survey data for submission with proper NULL handling
                const submissionData = {
                  surveyNumber: surveyData.surveyNumber,
                  location: surveyData.location,
                  selectedMember: surveyData.selectedMember,
                  respondentDemographics: surveyData.respondentDemographics,
                  interviewerId: user?.id,
                  barangayId: barangayId,
                  // Only include sections that were assigned to this survey number
                  sections: getAssignedSections(surveyData.surveyNumber).reduce((acc, section) => {
                    const sectionDataKey = getSectionDataKey(section.id);
                    const sectionData = surveyData[sectionDataKey];

                    // Clean the section data - only include answered questions
                    const cleanedData: Record<string, any> = {};
                    const skipReasons: Record<string, string> = {};

                    if (sectionData && typeof sectionData === 'object') {
                      Object.entries(sectionData).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                          cleanedData[key] = value;
                        } else {
                          // Mark as skipped with reason
                          cleanedData[key] = null;
                          skipReasons[key] = 'not_applicable'; // Could be more specific
                        }
                      });
                    }

                    acc[section.id] = {
                      data: cleanedData,
                      skipReasons: skipReasons,
                      completed: Object.keys(cleanedData).filter(k => cleanedData[k] !== null).length > 0
                    };

                    return acc;
                  }, {} as Record<string, any>)
                }

                // Submit to database
                const response = await fetch('/api/survey-responses', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(submissionData)
                })

                if (response.ok) {
                  const result = await response.json()
                  setSubmissionModal({
                    isOpen: true,
                    type: 'success',
                    message: `Survey submitted successfully! Response ID: ${result.responseId}`
                  })
                } else {
                  const error = await response.json()
                  const errorMessage = error.error || 'Unknown error occurred'

                  // Check if it's a duplicate survey number error
                  if (errorMessage.toLowerCase().includes('duplicate') ||
                      errorMessage.toLowerCase().includes('already exists') ||
                      errorMessage.toLowerCase().includes('unique constraint')) {
                    setSubmissionModal({
                      isOpen: true,
                      type: 'duplicate',
                      message: 'This survey number has already been used. Please use a different survey number.'
                    })
                  } else {
                    setSubmissionModal({
                      isOpen: true,
                      type: 'error',
                      message: `Failed to submit survey: ${errorMessage}`
                    })
                  }
                }
              } catch (error) {
                console.error('Error submitting survey:', error)
                setSubmissionModal({
                  isOpen: true,
                  type: 'error',
                  message: 'Failed to submit survey. Please check your connection and try again.'
                })
              }
            }}
          />
        )
      default:
        return null
    }
  }

  // Get current section name for display
  const getCurrentSectionName = () => {
    const currentSectionData = sections.find(s => s.id === currentSection)
    return currentSectionData ? currentSectionData.name : "Survey Forms"
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
      <Header user={formattedUser} currentSection={getCurrentSectionName()} />
      <div className="p-6 pt-32"> {/* Adjusted pt- from pt-24 to pt-32 */}
        <div className="max-w-7xl mx-auto">
          {/* Show sidebar only after initialization when sections are assigned */}
          {surveyData.surveyNumber && currentSection !== "initialization" ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Desktop Sections Card - Hidden on Mobile */}
              <div className="lg:col-span-1 hidden lg:block">
                <SectionCard sections={sections} currentSection={currentSection} onSectionChange={setCurrentSection} />
              </div>

              {/* Main Content Card */}
              <div className="lg:col-span-3 col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
                  {renderCurrentSection()}
                </div>
              </div>
            </div>
          ) : (
            /* Full width during initialization */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
                {renderCurrentSection()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Progress Button - Mobile Only - Show only after initialization */}
      {surveyData.surveyNumber && currentSection !== "initialization" && (
        <FloatingProgressButton sections={sections} currentSection={currentSection} onSectionChange={setCurrentSection} />
      )}

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={submissionModal.isOpen}
        type={submissionModal.type}
        message={submissionModal.message}
        onClose={handleModalClose}
        onRetry={handleModalRetry}
        onRedirect={handleModalRedirect}
      />
    </div>
  )
}

export default function SurveyApp() {
  return (
    <ProtectedRoute>
      <SurveyAppContent />
    </ProtectedRoute>
  )
}

function getSectionDataKey(sectionId: string): keyof SurveyData {
  const keyMap: Record<string, keyof SurveyData> = {
    financial: "financialAdmin",
    disaster: "disasterPrep",
    safety: "safetyPeace",
    social: "socialProtection",
    business: "businessFriendly",
    environmental: "environmental",
  }
  return keyMap[sectionId] || "financialAdmin";
}