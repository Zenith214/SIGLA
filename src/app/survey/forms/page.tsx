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
  getPreviousAssignedSection,
  getServiceAreaOrder,
  getSectionOrder,
  getNextSectionSafe,
  getPreviousSectionSafe,
  isValidSectionId,
  isSectionAccessible,
  getSectionNavigationErrorMessage
} from "./utils/sectionAssignment"
import { getQuestionsForSection } from "./utils/questions"
import { useSurveyRecord } from "@/hooks/useSurveyRecord"
import { migrateSurveyData } from "./utils/dataMigration"
import { fixSurveyDataInIndexedDB, fixCurrentSurveyData, listAllSurveys, diagnoseSurveyData, diagnoseCurrentSurvey, deleteSurveyFromIndexedDB, clearAllSurveyData } from "./utils/fixSurveyData"
import { getSurveyRecordByQuestionnaire } from "@/lib/indexedDB"
import { AutoSync } from "@/components/AutoSync"
import { OfflineIndicator } from "@/components/OfflineIndicator"
import type { Question } from "@/types/survey"
import { transformNFAFields, validateAllSections } from "./utils/nfaFieldTransform"
import { calculateDisplayId } from "@/utils/displayIdCalculator"

export interface GPSCoordinates {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

export interface SurveyData {
  surveyNumber: string
  assignedSections?: string[] // Tracks all 6 assigned sections in randomized order
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
  verificationLocation?: GPSCoordinates // GPS captured at household for quality control
  selectedMember: string
  respondentDemographics: {
    age: number
    birthdate: string
    sex: string
    genderIdentity: string
    educationalAttainment: string
    householdIncome: string
    purok: string
  }
  financialAdmin: Record<string, any>
  disasterPrep: Record<string, any>
  safetyPeace: Record<string, any>
  businessFriendly: Record<string, any>
  environmental: Record<string, any>
  socialProtection: Record<string, any>
  overallEvaluation: Record<string, any>
}

export interface SectionStatus {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
}

// Re-export Question type for backward compatibility
export type { Question }

// Helper function to extract numeric questionnaire number from survey number
function extractQuestionnaireNumber(surveyNumber: string): number {
  if (surveyNumber.includes('-')) {
    const parts = surveyNumber.split('-')
    if (parts.length === 3) {
      return parseInt(parts[2], 10)
    }
  }
  return parseInt(surveyNumber, 10)
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
      birthdate: "",
      sex: "",
      genderIdentity: "",
      educationalAttainment: "",
      householdIncome: "",
      purok: ""
    },
    financialAdmin: {},
    disasterPrep: {},
    safetyPeace: {},
    businessFriendly: {},
    environmental: {},
    socialProtection: {},
    overallEvaluation: {},
  })
  const [loadedFromIndexedDB, setLoadedFromIndexedDB] = useState(false)
  const [questionnaireIdFromUrl, setQuestionnaireIdFromUrl] = useState<string | null>(null)
  const [cycleIdFromUrl, setCycleIdFromUrl] = useState<number | null>(null)
  const [spotIdFromUrl, setSpotIdFromUrl] = useState<number | null>(null)
  const [displayIdForHeader, setDisplayIdForHeader] = useState<number | null>(null)

  // Initialize with base sections - assigned sections will be added dynamically
  const [sections, setSections] = useState<SectionStatus[]>([
    { id: "initialization", name: "Survey Initialization", status: "in-progress" },
    { id: "respondent-selection", name: "Respondent Selection", status: "pending" },
    { id: "respondent-demographics", name: "Respondent Demographics", status: "pending" },
    { id: "overall", name: "Overall Evaluation", status: "pending" },
    { id: "summary", name: "Summary & Review", status: "pending" },
  ])

  // Get authenticated user information and router
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const formattedUser = formatUserForHeader(user)

  // Read URL parameters
  const barangayIdParam = searchParams.get('barangayId')
  const questionnaireIdParam = searchParams.get('questionnaireId')
  const cycleIdParam = searchParams.get('cycleId')
  const spotIdParam = searchParams.get('spotId')

  // Expose fix function for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).fixSurveyData = fixSurveyDataInIndexedDB;
      (window as any).fixCurrentSurvey = fixCurrentSurveyData;
      (window as any).listSurveys = listAllSurveys;
      (window as any).diagnoseSurvey = diagnoseSurveyData;
      (window as any).diagnoseCurrentSurvey = diagnoseCurrentSurvey;
      (window as any).deleteSurvey = deleteSurveyFromIndexedDB;
      (window as any).clearAllSurveys = clearAllSurveyData;
      console.log('🔧 Survey data utilities available:');
      console.log('  - window.clearAllSurveys() - Clear ALL survey data (IndexedDB + localStorage)');
      console.log('  - window.listSurveys() - List all surveys in IndexedDB');
      console.log('  - window.deleteSurvey(questionnaireId, cycleId) - Delete specific survey');
    }
  }, []);

  // Load saved data on mount - check IndexedDB first, then localStorage
  useEffect(() => {
    const loadSurveyData = async () => {
      // If we have questionnaire ID in URL, try to load from IndexedDB
      if (questionnaireIdParam) {
        try {
          console.log(`🔍 Checking IndexedDB for questionnaire: ${questionnaireIdParam}`);
          const existingRecord = await getSurveyRecordByQuestionnaire(questionnaireIdParam);
          
          if (existingRecord) {
            console.log(`📖 Found existing record in IndexedDB:`, existingRecord);
            
            // Load survey data from IndexedDB record
            const loadedData: SurveyData = {
              surveyNumber: existingRecord.questionnaireId,
              barangayId: existingRecord.surveyData.barangayId,
              location: existingRecord.surveyData.location || { lat: 0, lng: 0, address: "" },
              verificationLocation: existingRecord.surveyData.verificationLocation,
              selectedMember: existingRecord.surveyData.selectedMember || "",
              respondentDemographics: existingRecord.surveyData.respondentDemographics || {
                age: 0,
                birthdate: "",
                gender: "",
                educationalAttainment: "",
                householdIncome: "",
                purok: ""
              },
              financialAdmin: existingRecord.surveyData.sections?.financial?.data || {},
              disasterPrep: existingRecord.surveyData.sections?.disaster?.data || {},
              safetyPeace: existingRecord.surveyData.sections?.safety?.data || {},
              businessFriendly: existingRecord.surveyData.sections?.business?.data || {},
              environmental: existingRecord.surveyData.sections?.environmental?.data || {},
              socialProtection: existingRecord.surveyData.sections?.social?.data || {},
              overallEvaluation: existingRecord.surveyData.sections?.overall?.data || {},
              assignedSections: existingRecord.surveyData.assignedSections,
            };
            
            // Apply data migration to fix any section mapping issues
            const migratedData = migrateSurveyData(loadedData);
            setSurveyData(migratedData);
            setLoadedFromIndexedDB(true);
            setQuestionnaireIdFromUrl(questionnaireIdParam);
            setCycleIdFromUrl(existingRecord.cycleId);
            setSpotIdFromUrl(existingRecord.spotId);
            
            // Determine current section based on record status
            if (existingRecord.status === 'In Progress') {
              // Resume from where they left off
              // You could store the last section in surveyData
              setCurrentSection(existingRecord.surveyData.currentSection || 'respondent-selection');
              
              // Note: Visit logging is now handled by the Survey Initialization section
              // No need to increment visit count here to avoid duplicates
              console.log(`📝 Resuming interview - visit will be logged in initialization section`);
            }
            
            console.log(`✅ Loaded survey data from IndexedDB for callback scenario`);
            return; // Don't load from localStorage
          } else {
            // No existing record - this is a new interview with pre-assigned questionnaire number
            console.log(`📝 New interview with pre-assigned questionnaire: ${questionnaireIdParam}`);
            
            // Set the questionnaire number from URL
            setSurveyData(prev => ({ 
              ...prev, 
              surveyNumber: questionnaireIdParam 
            }));
            setQuestionnaireIdFromUrl(questionnaireIdParam);
            
            // Set cycleId and spotId from URL if available
            if (cycleIdParam) {
              setCycleIdFromUrl(parseInt(cycleIdParam));
            }
            if (spotIdParam) {
              setSpotIdFromUrl(parseInt(spotIdParam));
            }
            
            console.log(`✅ Pre-assigned questionnaire number set: ${questionnaireIdParam}`);
            return; // Don't load from localStorage
          }
        } catch (error) {
          console.error('Error loading from IndexedDB:', error);
        }
      }
      
      // Fallback to localStorage for legacy surveys
      const saved = localStorage.getItem("barangay-survey-data");
      if (saved) {
        setSurveyData(JSON.parse(saved));
      }
      const savedSections = localStorage.getItem("barangay-survey-sections");
      if (savedSections) {
        setSections(JSON.parse(savedSections));
      }
    };

    loadSurveyData();
  }, [questionnaireIdParam])

  // Pre-populate barangayId from URL parameter
  useEffect(() => {
    if (barangayIdParam) {
      const barangayId = parseInt(barangayIdParam)
      if (!isNaN(barangayId) && surveyData.barangayId !== barangayId) {
        console.log(`📍 Pre-populating barangayId from URL: ${barangayId}`)
        setSurveyData(prev => ({ ...prev, barangayId }))
      }
    }
  }, [barangayIdParam])

  // Calculate display_id for header when questionnaire ID is available
  useEffect(() => {
    if (questionnaireIdFromUrl) {
      const displayId = calculateDisplayId(questionnaireIdFromUrl)
      setDisplayIdForHeader(displayId)
      if (displayId !== null) {
        console.log(`🔢 Calculated display_id for header: ${displayId} from ${questionnaireIdFromUrl}`)
      }
    } else if (surveyData.surveyNumber && surveyData.surveyNumber !== "PENDING") {
      const displayId = calculateDisplayId(surveyData.surveyNumber)
      setDisplayIdForHeader(displayId)
      if (displayId !== null) {
        console.log(`🔢 Calculated display_id for header: ${displayId} from ${surveyData.surveyNumber}`)
      }
    }
  }, [questionnaireIdFromUrl, surveyData.surveyNumber])

  // Update assigned sections based on questionnaire number (CSIS 6-section randomization)
  useEffect(() => {
    console.log(`🔄 Survey number or current section changed: ${surveyData.surveyNumber}, current: ${currentSection}`);

    if (surveyData.surveyNumber && surveyData.surveyNumber !== "PENDING") {
      // Calculate display_id from full_id for CSIS algorithms
      const displayId = calculateDisplayId(surveyData.surveyNumber);
      
      // Fallback: if display_id is null or out of range, use parsed questionnaire_number
      let questionnaireNumberForCSIS: number;
      if (displayId === null || displayId < 1 || displayId > 150) {
        const questionnaireNumber = extractQuestionnaireNumber(surveyData.surveyNumber);
        console.warn(`⚠️ Display ID is ${displayId === null ? 'null' : 'out of range'} for ${surveyData.surveyNumber}, using fallback questionnaire_number: ${questionnaireNumber}`);
        questionnaireNumberForCSIS = questionnaireNumber;
      } else {
        questionnaireNumberForCSIS = displayId;
        console.log(`✅ Using display_id ${displayId} for CSIS Section Order Randomization`);
      }
      
      // Get all 6 sections in randomized order using CSIS methodology
      const assignedSectionIds = getSectionOrder(questionnaireNumberForCSIS);
      
      // Map section IDs to full section objects
      const SECTION_MAP: Record<string, { id: string; name: string }> = {
        financial: { id: "financial", name: "Financial Administration" },
        safety: { id: "safety", name: "Safety & Peace Order" },
        environmental: { id: "environmental", name: "Environmental Management" },
        disaster: { id: "disaster", name: "Disaster Preparedness" },
        social: { id: "social", name: "Social Protection" },
        business: { id: "business", name: "Business Friendliness" },
      };

      const assignedSections = assignedSectionIds.map(id => SECTION_MAP[id]);
      
      console.log(`📋 Assigned sections for questionnaire ${surveyData.surveyNumber} (Q#${questionnaireNumberForCSIS}):`, assignedSectionIds);

      // Update survey data with assigned sections (no questionnaireType)
      if (JSON.stringify(surveyData.assignedSections) !== JSON.stringify(assignedSectionIds)) {
        console.log(`🔄 Updating survey data with all 6 assigned sections`);
        setSurveyData(prev => ({ 
          ...prev, 
          assignedSections: assignedSectionIds
        }));
      }

      // Build sections array with all 6 service sections + overall evaluation
      setSections(prevSections => {
        const existingSectionIds = prevSections.map(s => s.id);
        const expectedSectionIds = ["initialization", "respondent-selection", "respondent-demographics", ...assignedSectionIds, "overall", "summary"];

        if (prevSections.length === 0 || JSON.stringify(existingSectionIds) !== JSON.stringify(expectedSectionIds)) {
          console.log(`🏗️ Building sections array for questionnaire ${surveyData.surveyNumber} with 6 sections + overall`);
          const newSections: SectionStatus[] = [
            { id: "initialization", name: "Survey Initialization", status: "completed" },
            { id: "respondent-selection", name: "Respondent Selection", status: currentSection === "respondent-selection" ? "in-progress" : "pending" },
            { id: "respondent-demographics", name: "Respondent Demographics", status: currentSection === "respondent-demographics" ? "in-progress" : "pending" },
            ...assignedSections.map(section => ({
              ...section,
              status: currentSection === section.id ? "in-progress" as const : "pending" as const
            })),
            { id: "overall", name: "Overall Evaluation", status: currentSection === "overall" ? "in-progress" : "pending" },
            { id: "summary", name: "Summary & Review", status: currentSection === "summary" ? "in-progress" : "pending" },
          ];
          console.log(`📋 Sections (6 service sections + overall):`, newSections.map(s => `${s.id}: ${s.status}`));
          return newSections;
        } else {
          // Preserve existing statuses, only update current section to in-progress
          const updatedSections = prevSections.map(section => {
            if (section.id === currentSection && section.status === "pending") {
              console.log(`▶️ Setting ${section.id} to in-progress`);
              return { ...section, status: "in-progress" as const };
            }
            return section;
          });
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
    
    // Validate section ID
    if (!isValidSectionId(sectionId)) {
      console.error(`Invalid section ID in updateSectionStatus: ${sectionId}`);
      return;
    }

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

  // Safe section navigation handler
  const handleSectionChange = (targetSection: string) => {
    try {
      // Validate target section
      if (!isValidSectionId(targetSection)) {
        console.error(`Invalid target section: ${targetSection}`);
        alert('Invalid section. Returning to summary.');
        setCurrentSection('summary');
        return;
      }

      // Check if section is accessible
      const assignedSections = surveyData.assignedSections || [];
      if (!isSectionAccessible(targetSection, assignedSections)) {
        console.error(`Section ${targetSection} is not accessible`);
        alert('This section is not assigned for your questionnaire.');
        return;
      }

      console.log(`🚀 Navigating to section: ${targetSection}`);
      setCurrentSection(targetSection);
    } catch (error) {
      console.error('Error in handleSectionChange:', error);
      const errorMessage = getSectionNavigationErrorMessage(error as Error);
      alert(errorMessage);
      setCurrentSection('summary');
    }
  }

  const updateSurveyData = (section: keyof SurveyData, data: any) => {
    const dataKeys = Object.keys(data || {}).filter(k => !k.endsWith('_skipReason'));
    console.log(`💾 updateSurveyData: ${section} with ${dataKeys.length} questions (${Object.keys(data || {}).length} total keys)`);
    if (dataKeys.length > 20) {
      console.warn(`⚠️ WARNING: ${section} has ${dataKeys.length} questions - this seems too many!`);
      console.log(`   First 10 keys:`, dataKeys.slice(0, 10));
      console.log(`   Last 10 keys:`, dataKeys.slice(-10));
    }
    setSurveyData((prev) => ({ ...prev, [section]: data }))
  }

  // Save survey data to IndexedDB
  const saveToIndexedDB = async (completedSection?: string) => {
    if (!questionnaireIdFromUrl || !cycleIdFromUrl || !spotIdFromUrl) {
      console.log('⚠️ Missing questionnaire context, skipping IndexedDB save');
      return;
    }

    try {
      const { getSurveyRecord, createSurveyRecord, updateSurveyData: updateIndexedDBData } = await import('@/lib/indexedDB');
      
      // Check if record exists
      const existingRecord = await getSurveyRecord(questionnaireIdFromUrl, cycleIdFromUrl);
      
      // Prepare survey data for IndexedDB
      const indexedDBData = {
        barangayId: surveyData.barangayId,
        location: surveyData.location,
        verificationLocation: surveyData.verificationLocation,
        selectedMember: surveyData.selectedMember,
        respondentDemographics: surveyData.respondentDemographics,
        interviewerId: user?.id,
        assignedSections: surveyData.assignedSections,
        currentSection: completedSection || currentSection,
        sections: {
          financial: { data: surveyData.financialAdmin },
          disaster: { data: surveyData.disasterPrep },
          safety: { data: surveyData.safetyPeace },
          social: { data: surveyData.socialProtection },
          business: { data: surveyData.businessFriendly },
          environmental: { data: surveyData.environmental },
          overall: { data: surveyData.overallEvaluation },
        },
      };

      if (existingRecord) {
        // Update existing record
        await updateIndexedDBData(questionnaireIdFromUrl, cycleIdFromUrl, indexedDBData);
        console.log(`💾 Updated IndexedDB record for ${questionnaireIdFromUrl}`);
      } else {
        // Create new record
        await createSurveyRecord(questionnaireIdFromUrl, cycleIdFromUrl, spotIdFromUrl, indexedDBData);
        console.log(`✨ Created IndexedDB record for ${questionnaireIdFromUrl}`);
      }
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      throw error;
    }
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

  const handleSectionComplete = async (sectionId: string, nextSectionId?: string) => {
    console.log(`🎯 handleSectionComplete called for: ${sectionId}, nextSectionId: ${nextSectionId}`);

    try {
      // Validate current section
      if (!isValidSectionId(sectionId)) {
        console.error(`Invalid section ID: ${sectionId}`);
        alert('An error occurred. Returning to summary.');
        setCurrentSection('summary');
        return;
      }

      // Always mark the current section as completed when this function is called
      console.log(`🏁 Marking section ${sectionId} as completed`);
      updateSectionStatus(sectionId, "completed")

      // Save to IndexedDB if we have questionnaire context
      if (questionnaireIdFromUrl && cycleIdFromUrl && spotIdFromUrl) {
        try {
          await saveToIndexedDB(sectionId);
        } catch (error) {
          console.error('Error saving to IndexedDB:', error);
          // Continue even if IndexedDB save fails
        }
      }

      // Determine next section using safe navigation
      let actualNextSection = nextSectionId;
      
      if (!actualNextSection || actualNextSection === "") {
        // Use safe navigation function
        const assignedSections = surveyData.assignedSections || [];
        actualNextSection = getNextSectionSafe(sectionId, assignedSections);
        console.log(`🔍 Safe next section after ${sectionId}: ${actualNextSection}`);
      }

      // Validate next section
      if (!isValidSectionId(actualNextSection)) {
        console.error(`Invalid next section: ${actualNextSection}, navigating to summary`);
        actualNextSection = 'summary';
      }

      // Check if section is accessible
      const assignedSections = surveyData.assignedSections || [];
      if (!isSectionAccessible(actualNextSection, assignedSections)) {
        console.error(`Section ${actualNextSection} is not accessible, navigating to summary`);
        actualNextSection = 'summary';
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
    } catch (error) {
      console.error('Error in handleSectionComplete:', error);
      const errorMessage = getSectionNavigationErrorMessage(error as Error);
      alert(errorMessage);
      setCurrentSection('summary');
    }
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "initialization":
        return (
          <SurveyInitialization
            data={surveyData}
            onUpdate={updateSurveyData}
            onNext={async () => {
              // Create IndexedDB record if we have questionnaire context
              if (questionnaireIdFromUrl && cycleIdFromUrl && spotIdFromUrl && !loadedFromIndexedDB) {
                try {
                  const { createSurveyRecord } = await import('@/lib/indexedDB');
                  await createSurveyRecord(questionnaireIdFromUrl, cycleIdFromUrl, spotIdFromUrl, {
                    barangayId: surveyData.barangayId,
                    location: surveyData.location,
                    interviewerId: user?.id,
                  });
                  console.log(`✨ Created IndexedDB record on initialization for ${questionnaireIdFromUrl}`);
                } catch (error) {
                  console.error('Error creating IndexedDB record:', error);
                }
              }
              handleSectionComplete("initialization", "respondent-selection");
            }}
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
              // Get the first assigned section from the 6-section randomized order
              const firstAssignedSection = surveyData.assignedSections?.[0] || "summary";
              handleSectionComplete("respondent-demographics", firstAssignedSection);
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
        // All 6 sections should be assigned in the randomized order
        const assignedSectionIds = surveyData.assignedSections || [];
        
        if (!surveyData.surveyNumber || surveyData.surveyNumber === "PENDING" || !assignedSectionIds.includes(currentSection)) {
          return (
            <div className="p-6 text-center">
              <p className="text-gray-600">This section is not assigned for your questionnaire.</p>
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
              // Use safe navigation to get next section
              const nextSection = getNextSectionSafe(currentSection, assignedSectionIds);
              handleSectionComplete(currentSection, nextSection);
            }}
            onBack={() => {
              // Use safe navigation to get previous section
              const prevSection = getPreviousSectionSafe(currentSection, assignedSectionIds);
              handleSectionChange(prevSection);
            }}
            onResetSectionStatus={updateSectionStatus}
            assignedSections={assignedSectionIds}
          />
        )
      case "overall":
        // Overall evaluation section - always shown after all 6 service sections
        return (
          <QuestionFlow
            sectionId="overall"
            data={surveyData}
            onUpdate={updateSurveyData}
            onComplete={() => {
              handleSectionComplete("overall", "summary");
            }}
            onBack={() => {
              // Go back to the last assigned section (6th section)
              const assignedSectionIds = surveyData.assignedSections || [];
              const lastSection = assignedSectionIds[assignedSectionIds.length - 1] || "environmental";
              handleSectionChange(lastSection);
            }}
            onResetSectionStatus={updateSectionStatus}
            assignedSections={surveyData.assignedSections}
          />
        )
      case "summary":
        return (
          <TabbedSummary
            data={surveyData}
            sections={sections}
            onBack={() => {
              // Use safe navigation to get previous section
              const assignedSectionIds = surveyData.assignedSections || [];
              const prevSection = getPreviousSectionSafe('summary', assignedSectionIds);
              handleSectionChange(prevSection);
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

                // Use the survey number that was generated at the start
                const finalSurveyNumber = surveyData.surveyNumber;
                
                if (!finalSurveyNumber || finalSurveyNumber === "PENDING") {
                  throw new Error('Survey number not generated. Please restart the survey.');
                }

                console.log(`📝 Submitting survey with number: ${finalSurveyNumber}`);

                // Prepare survey data for submission with proper NULL handling and NFA field transformation
                const sections = (() => {
                  const assignedSectionIds = surveyData.assignedSections || [];
                  // Add overall section to the list
                  const allSectionIds = [...assignedSectionIds, 'overall'];
                  
                  return allSectionIds.reduce((acc, sectionId) => {
                    const sectionDataKey = getSectionDataKey(sectionId);
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

                    // Transform NFA field names to standardized format
                    // Requirements: 2.2, 2.3, 2.4, 3.1, 3.2
                    const transformedData = transformNFAFields(cleanedData);

                    acc[sectionId] = {
                      data: transformedData,
                      skipReasons: skipReasons,
                      completed: Object.keys(transformedData).filter(k => transformedData[k] !== null).length > 0
                    };

                    return acc;
                  }, {} as Record<string, any>);
                })();

                // Validate NFA fields before submission
                // Requirements: 2.2, 2.3, 2.4, 3.1, 3.2
                const validation = validateAllSections(sections);
                if (!validation.isValid) {
                  console.error('NFA field validation failed:', validation.errors);
                  setSubmissionModal({
                    isOpen: true,
                    type: 'error',
                    message: `Data validation failed: ${validation.errors.join('; ')}`
                  });
                  return;
                }

                const submissionData = {
                  surveyNumber: finalSurveyNumber,
                  location: surveyData.location,
                  verificationLocation: surveyData.verificationLocation,
                  selectedMember: surveyData.selectedMember,
                  respondentDemographics: surveyData.respondentDemographics,
                  interviewerId: user?.id,
                  barangayId: barangayId,
                  questionnaireId: questionnaireIdFromUrl, // Include for visit logging and status update
                  spotId: spotIdFromUrl, // Include for GPS verification
                  sections: sections
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
                  
                  // Mark as completed in IndexedDB if this is a questionnaire-based survey
                  let wasCallback = false;
                  if (questionnaireIdFromUrl && cycleIdFromUrl) {
                    try {
                      const { markCompletedPendingSync, getSurveyRecord } = await import('@/lib/indexedDB');
                      const record = await getSurveyRecord(questionnaireIdFromUrl, cycleIdFromUrl);
                      wasCallback = !!(record && record.visits && record.visits.length > 1);
                      await markCompletedPendingSync(questionnaireIdFromUrl, cycleIdFromUrl);
                      console.log(`✅ Marked ${questionnaireIdFromUrl} as completed (pending sync)`);
                    } catch (error) {
                      console.error('Error marking as completed in IndexedDB:', error);
                    }
                  }
                  
                  const successMessage = wasCallback 
                    ? `Interview completed successfully after ${loadedFromIndexedDB ? 'callback' : 'multiple'} visits! Response ID: ${result.responseId}`
                    : `Survey submitted successfully! Response ID: ${result.responseId}`;
                  
                  setSubmissionModal({
                    isOpen: true,
                    type: 'success',
                    message: successMessage
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
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Auto-sync on reconnection */}
      <AutoSync />
      
      <Header 
        user={formattedUser} 
        currentSection={getCurrentSectionName()} 
        questionnaireId={questionnaireIdFromUrl || surveyData.surveyNumber}
        displayId={displayIdForHeader}
      />
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
    overall: "overallEvaluation",
  }
  return keyMap[sectionId] || "financialAdmin";
}