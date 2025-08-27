"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import { Header } from "./sections/header"
import { SectionCard } from "./sections/section-card"
import { FloatingProgressButton } from "./sections/floating-progress-button"
import { SurveyInitialization } from "./sections/survey-initialization"
import { KishGridSelection } from "./sections/kish-grid-selection"
import { QuestionFlow } from "./sections/question-flow"
import { TabbedSummary } from "./sections/tabbed-summary"
import { Skeleton, SkeletonForm, SkeletonCard } from "@/components/ui/skeleton"

export interface SurveyData {
  surveyNumber: string
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

  const [sections, setSections] = useState<SectionStatus[]>([
    { id: "initialization", name: "Survey Initialization", status: "in-progress" },
    { id: "kish-grid", name: "Respondent Selection", status: "pending" },
    { id: "financial", name: "Financial Administration", status: "pending" },
    { id: "disaster", name: "Disaster Preparedness", status: "pending" },
    { id: "safety", name: "Safety & Peace Order", status: "pending" },
    { id: "social", name: "Social Protection", status: "pending" },
    { id: "business", name: "Business Friendliness", status: "pending" },
    { id: "environmental", name: "Environmental Management", status: "pending" },
    { id: "summary", name: "Summary & Review", status: "pending" },
  ])

  // Get authenticated user information and router
  const { user } = useAuth()
  const router = useRouter()
  const formattedUser = formatUserForHeader(user)

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

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem("barangay-survey-data", JSON.stringify(surveyData))
  }, [surveyData])

  useEffect(() => {
    localStorage.setItem("barangay-survey-sections", JSON.stringify(sections))
  }, [sections])

  const updateSectionStatus = (sectionId: string, status: SectionStatus["status"]) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? { ...section, status } : section)))
  }

  const updateSurveyData = (section: keyof SurveyData, data: any) => {
    setSurveyData((prev) => ({ ...prev, [section]: data }))
  }

  const handleSectionComplete = (sectionId: string, nextSectionId: string) => {
    updateSectionStatus(sectionId, "completed")
    if (nextSectionId !== "summary") {
      updateSectionStatus(nextSectionId, "in-progress")
    } else {
      updateSectionStatus("summary", "in-progress")
    }
    setCurrentSection(nextSectionId)
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "initialization":
        return (
          <SurveyInitialization
            data={surveyData}
            onUpdate={updateSurveyData}
            onNext={() => handleSectionComplete("initialization", "kish-grid")}
          />
        )
      case "kish-grid":
        return (
          <KishGridSelection
            surveyNumber={surveyData.surveyNumber}
            selectedMember={surveyData.selectedMember}
            data={surveyData}
            onUpdate={updateSurveyData}
            onNext={() => handleSectionComplete("kish-grid", "financial")}
            onBack={() => setCurrentSection("initialization")}
          />
        )
      case "financial":
      case "disaster":
      case "safety":
      case "social":
      case "business":
      case "environmental":
        return (
          <QuestionFlow
            sectionId={currentSection}
            data={surveyData}
            onUpdate={updateSurveyData}
            onComplete={(nextSection) => {
              const nextSectionMap: Record<string, string> = {
                financial: "disaster",
                disaster: "safety",
                safety: "social",
                social: "business", // Ensure social leads to business
                business: "environmental",
                environmental: "summary",
              };
              handleSectionComplete(currentSection, nextSectionMap[currentSection] || "summary");
            }}
            onBack={() => {
              const sectionOrder = [
                "initialization",
                "kish-grid",
                "financial",
                "disaster",
                "safety",
                "social",
                "business",
                "environmental",
              ]
              const currentIndex = sectionOrder.indexOf(currentSection)
              if (currentIndex > 0) {
                setCurrentSection(sectionOrder[currentIndex - 1])
              }
            }}
            onResetSectionStatus={updateSectionStatus} // Pass the function down
          />
        )
      case "summary":
        return (
          <TabbedSummary
            data={surveyData}
            sections={sections}
            onBack={() => setCurrentSection("environmental")}
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
                
                // Prepare survey data for submission
                const submissionData = {
                  surveyNumber: surveyData.surveyNumber,
                  location: surveyData.location,
                  selectedMember: surveyData.selectedMember,
                  respondentDemographics: surveyData.respondentDemographics,
                  interviewerId: user?.id,
                  barangayId: barangayId,
                  financialAdmin: surveyData.financialAdmin,
                  disasterPrep: surveyData.disasterPrep,
                  safetyPeace: surveyData.safetyPeace,
                  businessFriendly: surveyData.businessFriendly,
                  environmental: surveyData.environmental,
                  socialProtection: surveyData.socialProtection
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
                  alert(`Survey submitted successfully! Response ID: ${result.responseId}`)
                  
                  // Clear local storage after successful submission
                  localStorage.removeItem("barangay-survey-data")
                  localStorage.removeItem("barangay-survey-sections")
                  
                  // Optionally redirect to survey dashboard
                  // router.push('/survey')
                } else {
                  const error = await response.json()
                  alert(`Failed to submit survey: ${error.error}`)
                }
              } catch (error) {
                console.error('Error submitting survey:', error)
                alert('Failed to submit survey. Please try again.')
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
        </div>
      </div>

      {/* Floating Progress Button - Mobile Only */}
      <FloatingProgressButton sections={sections} currentSection={currentSection} onSectionChange={setCurrentSection} />
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