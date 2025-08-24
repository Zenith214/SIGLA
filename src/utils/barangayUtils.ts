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
  seal?: string;
  history?: {
    year: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    score: string;
  }[];
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

// Check if a barangay is an awardee (based on seal status from database)
export function isBarangayAwardee(barangay: ApiBarangayData): boolean {
  // Simply check if the barangay has a seal from the database
  return barangay.seal === 'yes';
}

// Get survey status for a barangay
export function getBarangaySurveyStatus(barangay: ApiBarangayData): string {
  return barangay.status;
}

// Get barangay history
export function getBarangayHistory(barangay: ApiBarangayData) {
  return barangay.history;
}
