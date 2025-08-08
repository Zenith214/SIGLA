"use client"

import { useState, useEffect } from "react"
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

// Hook to get user information
function useUserInfo() {
  const [user, setUser] = useState({
    name: "Loading...",
    role: "Survey Enumerator",
    id: "Loading...",
    avatar: "/placeholder.svg?height=32&width=32&text=U",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.firstName && data.lastName) {
          setUser({
            name: `${data.firstName} ${data.lastName}`,
            role: "Survey Enumerator",
            id: `ENU-${new Date().getFullYear()}-${String(data.id).padStart(3, '0')}`,
            avatar: `/placeholder.svg?height=32&width=32&text=${data.firstName.charAt(0)}${data.lastName.charAt(0)}`,
          })
        } else if (data && data.firstName) {
          setUser({
            name: data.firstName,
            role: "Survey Enumerator", 
            id: `ENU-${new Date().getFullYear()}-${String(data.id).padStart(3, '0')}`,
            avatar: `/placeholder.svg?height=32&width=32&text=${data.firstName.charAt(0)}`,
          })
        } else {
          setUser({
            name: "Unknown User",
            role: "Survey Enumerator",
            id: "ENU-2024-000",
            avatar: "/placeholder.svg?height=32&width=32&text=U",
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setUser({
          name: "Unknown User",
          role: "Survey Enumerator", 
          id: "ENU-2024-000",
          avatar: "/placeholder.svg?height=32&width=32&text=U",
        })
        setLoading(false)
      })
  }, [])

  return { user, loading }
}

export default function SurveyApp() {
  const [currentSection, setCurrentSection] = useState("initialization")
  const [surveyData, setSurveyData] = useState<SurveyData>({
    surveyNumber: "",
    location: { lat: 0, lng: 0, address: "" },
    selectedMember: "",
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

  // Get real user information
  const { user, loading } = useUserInfo()

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
            onSubmit={() => {
              updateSectionStatus("summary", "completed")
              alert("Survey submitted successfully!")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        <div className="p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar skeleton */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>

              {/* Main content skeleton */}
              <div className="lg:col-span-3 col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] p-6">
                  <SkeletonForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} currentSection={getCurrentSectionName()} />
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