// Interface for barangay data from API (renamed to avoid conflict with data/barangayData.ts)
export interface ApiBarangayData {
  id: number;
  name: string;
  population: number;
  households: number;
  area?: number;
  progress: number;
  status: string;
  currentStatus?: string;
  description?: string;
  seal?: string; // Legacy seal field for backward compatibility
  seal_original?: string;
  seal_expiration_date?: string;
  logo_url?: string; // URL to the barangay logo image
  survey_count?: number;
  completion_rate?: number;
  year?: string;
  history?: {
    year: string;
    status: 'Completed' | 'In Progress' | 'Pending' | 'No data';
    score: string;
  }[];
  // Cycle-aware award information
  awardStatus?: {
    isAwardee: boolean;
    awardedDate?: string | null;
    notes?: string | null;
    awardId?: number | null;
    cycleId: number;
    createdAt?: string;
    updatedAt?: string;
  };
  cycleId?: number; // Current cycle context
  isAwardee?: boolean; // Direct awardee flag for convenience
}

// Transform API data to match the expected format for the dashboard
export function transformBarangayData(apiData: any[]): {
  [key: string]: ApiBarangayData;
} {
  const transformed: { [key: string]: ApiBarangayData } = {};

  apiData.forEach((barangay, index) => {
    const barangayKey = `barangay-${index + 1}`;

    // Calculate progress percentage from survey targets
    const progress = barangay.progress || 0;

    // Determine survey status based on progress
    let surveyStatus: "Completed" | "In Progress" | "Pending" = "Pending";
    if (progress === 100) {
      surveyStatus = "Completed";
    } else if (progress > 0) {
      surveyStatus = "In Progress";
    }

    transformed[barangayKey] = {
      id: barangay.id,
      name: barangay.name || barangay.barangay_name,
      population: barangay.population || 0,
      households: barangay.households || 0,
      area: barangay.area || 0,
      progress: progress,
      status: barangay.status || surveyStatus,
      currentStatus: barangay.currentStatus,
      description: barangay.description,
      seal: barangay.seal,
      logo_url: barangay.logo_url,
      history: [
        {
          year: "2024",
          status: surveyStatus,
          score: progress > 0 ? `${progress}%` : "N/A",
        },
        { year: "2023", status: "Completed", score: "75%" },
        { year: "2022", status: "Completed", score: "70%" },
        { year: "2021", status: "Completed", score: "65%" },
      ],
    };
  });

  return transformed;
}

// Check if a barangay is an awardee (cycle-aware with fallback to legacy seal)
export function isBarangayAwardee(barangay: ApiBarangayData, cycleId?: number): boolean {
  // Handle null/undefined barangay
  if (!barangay) {
    return false;
  }

  // Validate cycle ID (should be positive integer)
  if (cycleId !== undefined && (cycleId <= 0 || !Number.isInteger(cycleId))) {
    return false;
  }

  // If cycle-specific award status is available, use it
  if (barangay.awardStatus) {
    // If cycleId is specified, check if it matches the award's cycle
    if (cycleId && barangay.awardStatus.cycleId !== cycleId) {
      return false; // Award is for a different cycle
    }
    return barangay.awardStatus.isAwardee;
  }
  
  // If direct isAwardee flag is available (from cycle-aware APIs)
  if (barangay.isAwardee !== undefined) {
    return barangay.isAwardee;
  }
  
  // Fallback to legacy seal status for backward compatibility
  return barangay.seal === 'yes';
}

// Check if a barangay is an awardee for a specific cycle
export function isBarangayAwardeeForCycle(barangay: ApiBarangayData, cycleId: number): boolean {
  if (barangay.awardStatus && barangay.awardStatus.cycleId === cycleId) {
    return barangay.awardStatus.isAwardee;
  }
  
  // If no cycle-specific data, return false (not an awardee for this cycle)
  return false;
}

// Get award information for a barangay
export function getBarangayAwardInfo(barangay: ApiBarangayData) {
  return barangay.awardStatus || null;
}

// Check if barangay has cycle-aware award data
export function hasAwardData(barangay: ApiBarangayData): boolean {
  return barangay.awardStatus !== undefined || barangay.isAwardee !== undefined;
}

// Get survey status for a barangay
export function getBarangaySurveyStatus(barangay: ApiBarangayData): string {
  return barangay.status;
}

// Get barangay history
export function getBarangayHistory(barangay: ApiBarangayData) {
  return barangay.history;
}

// Helper function to get the appropriate color for map display based on award status
export function getBarangayMapColor(barangay: ApiBarangayData, cycleId?: number): string {
  // Handle null/undefined barangay
  if (!barangay) {
    return '#6b7280'; // Gray for no data
  }

  const isAwardee = isBarangayAwardee(barangay, cycleId);
  return isAwardee ? '#22c55e' : '#6b7280'; // Green for awardees, gray for non-awardees
}

// Helper function to get award status text for display
export function getAwardStatusText(barangay: ApiBarangayData, cycleId?: number): string {
  const isAwardee = isBarangayAwardee(barangay, cycleId);
  return isAwardee ? 'Awardee' : 'Non-Awardee';
}

// Get award information for a specific cycle
export function getAwardStatusForCycle(barangay: ApiBarangayData, cycleId: number): {
  isAwardee: boolean;
  awardedDate?: string | null;
  notes?: string | null;
  hasData: boolean;
} {
  if (barangay.awardStatus && barangay.awardStatus.cycleId === cycleId) {
    return {
      isAwardee: barangay.awardStatus.isAwardee,
      awardedDate: barangay.awardStatus.awardedDate,
      notes: barangay.awardStatus.notes,
      hasData: true
    };
  }
  
  return {
    isAwardee: false,
    hasData: false
  };
}

// Check if barangay has award data for a specific cycle
export function hasAwardDataForCycle(barangay: ApiBarangayData, cycleId: number): boolean {
  return barangay.awardStatus?.cycleId === cycleId;
}

// Get the cycle ID from barangay award data
export function getAwardCycleId(barangay: ApiBarangayData): number | null {
  return barangay.awardStatus?.cycleId || barangay.cycleId || null;
}
