// Section assignment logic based on survey number (odd/even)

export interface AssignedSection {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
}

// Define all available sections
export const ALL_SECTIONS = [
  { id: "financial", name: "Financial Administration" },
  { id: "disaster", name: "Disaster Preparedness" },
  { id: "safety", name: "Safety & Peace Order" },
  { id: "social", name: "Social Protection" },
  { id: "business", name: "Business Friendliness" },
  { id: "environmental", name: "Environmental Management" },
];

// Section assignments based on odd/even survey numbers
export const ODD_SECTIONS = ["financial", "safety", "environmental"];
export const EVEN_SECTIONS = ["disaster", "social", "business"];

/**
 * Get assigned sections based on survey number
 * Supports both old format (numbers) and new format (BB-YYYY-NNNN)
 */
export function getAssignedSections(surveyNumber: string | number): AssignedSection[] {
  let num: number;
  
  if (typeof surveyNumber === 'string') {
    // Handle new format BB-YYYY-NNNN (extract questionnaire number)
    if (surveyNumber.includes('-')) {
      const parts = surveyNumber.split('-');
      if (parts.length === 3) {
        num = parseInt(parts[2]); // Extract NNNN part
      } else {
        num = parseInt(surveyNumber);
      }
    } else {
      num = parseInt(surveyNumber);
    }
  } else {
    num = surveyNumber;
  }
  
  if (isNaN(num) || num < 1) {
    return [];
  }

  const isOdd = num % 2 === 1;
  const assignedSectionIds = isOdd ? ODD_SECTIONS : EVEN_SECTIONS;
  
  return assignedSectionIds.map(id => {
    const section = ALL_SECTIONS.find(s => s.id === id);
    return {
      id,
      name: section?.name || id,
      status: "pending" as const
    };
  });
}

/**
 * Get section assignment type (odd/even)
 * Supports both old format (numbers) and new format (BB-YYYY-NNNN)
 */
export function getAssignmentType(surveyNumber: string | number): 'odd' | 'even' | null {
  let num: number;
  
  if (typeof surveyNumber === 'string') {
    // Handle new format BB-YYYY-NNNN (extract questionnaire number)
    if (surveyNumber.includes('-')) {
      const parts = surveyNumber.split('-');
      if (parts.length === 3) {
        num = parseInt(parts[2]); // Extract NNNN part
      } else {
        num = parseInt(surveyNumber);
      }
    } else {
      num = parseInt(surveyNumber);
    }
  } else {
    num = surveyNumber;
  }
  
  if (isNaN(num) || num < 1) {
    return null;
  }

  return num % 2 === 1 ? 'odd' : 'even';
}

/**
 * Get section assignment description
 */
export function getAssignmentDescription(surveyNumber: string | number): string {
  const assignedSections = getAssignedSections(surveyNumber);
  
  if (assignedSections.length === 0) {
    return '';
  }

  const sectionNames = assignedSections.map(s => s.name).join(', ');
  return `Survey #${surveyNumber} - You will complete: ${sectionNames}`;
}

/**
 * Check if a section is assigned for given survey number
 */
export function isSectionAssigned(surveyNumber: string | number, sectionId: string): boolean {
  const assignedSections = getAssignedSections(surveyNumber);
  return assignedSections.some(section => section.id === sectionId);
}

/**
 * Get next assigned section after current section
 */
export function getNextAssignedSection(surveyNumber: string | number, currentSectionId: string): string | null {
  const assignedSections = getAssignedSections(surveyNumber);
  const currentIndex = assignedSections.findIndex(s => s.id === currentSectionId);
  
  if (currentIndex === -1 || currentIndex === assignedSections.length - 1) {
    return "summary"; // Last section goes to summary
  }
  
  return assignedSections[currentIndex + 1].id;
}

/**
 * Get previous assigned section before current section
 */
export function getPreviousAssignedSection(surveyNumber: string | number, currentSectionId: string): string | null {
  const assignedSections = getAssignedSections(surveyNumber);
  const currentIndex = assignedSections.findIndex(s => s.id === currentSectionId);
  
  if (currentIndex <= 0) {
    return "kish-grid"; // First section goes back to Kish Grid
  }
  
  return assignedSections[currentIndex - 1].id;
}

/**
 * Calculate progress percentage for assigned sections
 */
export function calculateAssignedProgress(surveyNumber: string | number, completedSections: string[]): number {
  const assignedSections = getAssignedSections(surveyNumber);
  
  if (assignedSections.length === 0) {
    return 0;
  }
  
  const completedAssignedSections = completedSections.filter(sectionId => 
    assignedSections.some(assigned => assigned.id === sectionId)
  );
  
  return Math.round((completedAssignedSections.length / assignedSections.length) * 100);
}