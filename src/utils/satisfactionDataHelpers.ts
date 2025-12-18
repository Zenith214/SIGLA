/**
 * Satisfaction Data Helpers
 * Utilities for fetching and transforming satisfaction data for barangays across cycles
 */

import { satisfactionCache } from './satisfactionCache';

/**
 * Interface for satisfaction data returned by the helper functions
 */
export interface SatisfactionData {
  barangayId: number;
  cycleId: number;
  cycleName: string;
  cycleYear: number;
  overallSatisfaction: number | null;
  overallNeedForAction: number | null;
  surveyStatus: 'completed' | 'in_progress' | 'not_started';
  serviceScores: ServiceScores;
  responseCount: number;
  hasData: boolean;
  surveyIncomplete?: boolean;
  progress?: number;
  message?: string;
}

/**
 * Interface for service area scores
 */
export interface ServiceScores {
  financial: number | null;
  disaster: number | null;
  safety: number | null;
  social: number | null;
  business: number | null;
  environmental: number | null;
}

/**
 * Interface for service area need for action scores
 */
export interface NeedForActionScores {
  financial: number | null;
  disaster: number | null;
  safety: number | null;
  social: number | null;
  business: number | null;
  environmental: number | null;
}

/**
 * Fetch satisfaction data for a specific barangay and cycle
 * 
 * @param barangayId - The ID of the barangay
 * @param cycleId - The ID of the survey cycle (null = use active cycle)
 * @returns Promise<SatisfactionData> - The satisfaction data
 * @throws Error if the fetch fails
 */
export async function fetchSatisfactionData(
  barangayId: number,
  cycleId: number | null = null
): Promise<SatisfactionData> {
  try {
    // cycleId is required - it should be passed from the component
    // The component should use useActiveCycle hook to get the active cycle
    if (!cycleId) {
      throw new Error('Cycle ID is required. Please ensure an active cycle is selected.');
    }
    
    const effectiveCycleId = cycleId;

    // Check cache first
    const cachedData = satisfactionCache.get(barangayId, effectiveCycleId);
    if (cachedData) {
      console.log(`Cache hit for barangay ${barangayId}, cycle ${effectiveCycleId}`);
      return cachedData;
    }

    console.log(`Cache miss for barangay ${barangayId}, cycle ${effectiveCycleId} - fetching from API`);

    // Fetch data from the ML funnel analysis endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (ML analysis can be slow)

    try {
      const response = await fetch(
        `/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${effectiveCycleId}`,
        { 
          signal: controller.signal,
          // Disable Next.js caching for this request to always get fresh data
          cache: 'no-store'
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific HTTP error codes
        if (response.status === 404) {
          throw new Error('No data available for this barangay and cycle');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('You do not have permission to view this data');
        } else {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Check if survey is incomplete
      if (data.surveyIncomplete) {
        return {
          barangayId,
          cycleId: effectiveCycleId,
          cycleName: `Cycle ${effectiveCycleId}`,
          cycleYear: new Date().getFullYear(),
          overallSatisfaction: null,
          overallNeedForAction: null,
          surveyStatus: data.progress > 0 ? 'in_progress' : 'not_started',
          serviceScores: {
            financial: null,
            disaster: null,
            safety: null,
            social: null,
            business: null,
            environmental: null,
          },
          responseCount: 0,
          hasData: false,
          surveyIncomplete: true,
          progress: data.progress,
          message: data.message
        };
      }

      // Transform the API response to match our SatisfactionData interface
      const satisfactionData = transformMLFunnelToSatisfactionData(data, barangayId, effectiveCycleId);

      // Store in cache
      satisfactionCache.set(barangayId, effectiveCycleId, satisfactionData);

      return satisfactionData;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Analysis is taking longer than expected. The data is being computed in the background. Please try again in a moment.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching satisfaction data:', error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      // Re-throw with the existing message if it's already user-friendly
      if (error.message.includes('timed out') || 
          error.message.includes('No data available') ||
          error.message.includes('Server error') ||
          error.message.includes('permission')) {
        throw error;
      }
      
      // Handle network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
    }
    
    // Generic error fallback
    throw new Error('Unable to load satisfaction data. Please try again.');
  }
}

/**
 * Transform ML funnel analysis response to SatisfactionData format
 * 
 * @param mlData - The raw ML funnel analysis response
 * @param barangayId - The barangay ID
 * @param cycleId - The cycle ID
 * @returns SatisfactionData - Transformed satisfaction data
 */
function transformMLFunnelToSatisfactionData(
  mlData: any,
  barangayId: number,
  cycleId: number
): SatisfactionData {
  // Check if we have data
  const hasData = mlData.total_responses > 0 && mlData.overall_satisfaction !== null;

  // Extract service scores and need for action scores
  const serviceScores: ServiceScores = {
    financial: extractServiceScore(mlData.service_scores?.financial),
    disaster: extractServiceScore(mlData.service_scores?.disaster),
    safety: extractServiceScore(mlData.service_scores?.safety),
    social: extractServiceScore(mlData.service_scores?.social),
    business: extractServiceScore(mlData.service_scores?.business),
    environmental: extractServiceScore(mlData.service_scores?.environmental),
  };

  // Extract need for action scores
  const needForActionScores: number[] = [];
  const extractNeedForAction = (serviceScore: any): number | null => {
    if (!serviceScore) return null;
    return serviceScore.need_action || null;
  };

  const needForActionValues = [
    extractNeedForAction(mlData.service_scores?.financial),
    extractNeedForAction(mlData.service_scores?.disaster),
    extractNeedForAction(mlData.service_scores?.safety),
    extractNeedForAction(mlData.service_scores?.social),
    extractNeedForAction(mlData.service_scores?.business),
    extractNeedForAction(mlData.service_scores?.environmental),
  ].filter((score): score is number => score !== null);

  // Calculate overall need for action as average of service areas
  const overallNeedForAction = needForActionValues.length > 0
    ? Math.round(needForActionValues.reduce((sum, score) => sum + score, 0) / needForActionValues.length)
    : null;

  // Determine survey status based on response count and data availability
  let surveyStatus: 'completed' | 'in_progress' | 'not_started' = 'not_started';
  if (mlData.total_responses > 0) {
    // If we have responses, consider it at least in progress
    surveyStatus = hasData ? 'completed' : 'in_progress';
  }

  return {
    barangayId,
    cycleId,
    cycleName: mlData.cycle_name || `Cycle ${cycleId}`,
    cycleYear: mlData.cycle_year || new Date().getFullYear(),
    overallSatisfaction: mlData.overall_satisfaction || null,
    overallNeedForAction,
    surveyStatus,
    serviceScores,
    responseCount: mlData.total_responses || 0,
    hasData,
  };
}

/**
 * Extract satisfaction score from service score object
 * Handles both structured format (with percentage field) and old format
 * 
 * @param serviceScore - The service score object from ML API
 * @returns number | null - The satisfaction percentage or null
 */
function extractServiceScore(serviceScore: any): number | null {
  if (!serviceScore) {
    return null;
  }

  // Handle structured format (with percentage field)
  if (typeof serviceScore.satisfaction === 'object' && 'percentage' in serviceScore.satisfaction) {
    return serviceScore.satisfaction.percentage || null;
  }

  // Handle old format (direct satisfaction score)
  if (typeof serviceScore.satisfaction === 'number') {
    return serviceScore.satisfaction;
  }

  return null;
}

/**
 * Fetch satisfaction data for multiple barangays in a single cycle
 * Useful for batch operations
 * 
 * @param barangayIds - Array of barangay IDs
 * @param cycleId - The cycle ID (null = use active cycle)
 * @returns Promise<Map<number, SatisfactionData>> - Map of barangay ID to satisfaction data
 */
export async function fetchMultipleSatisfactionData(
  barangayIds: number[],
  cycleId: number | null = null
): Promise<Map<number, SatisfactionData>> {
  const results = new Map<number, SatisfactionData>();

  // Fetch all data in parallel
  const promises = barangayIds.map(async (barangayId) => {
    try {
      const data = await fetchSatisfactionData(barangayId, cycleId);
      results.set(barangayId, data);
    } catch (error) {
      console.error(`Failed to fetch data for barangay ${barangayId}:`, error);
      // Don't add to results if fetch fails
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * Get color class for satisfaction score
 * Used for UI color coding
 * 
 * @param score - The satisfaction score (0-100)
 * @returns string - Tailwind CSS color class
 */
export function getSatisfactionColorClass(score: number | null): string {
  if (score === null) {
    return 'bg-gray-100 text-gray-600';
  }

  if (score >= 70) {
    return 'bg-green-100 text-green-800';
  } else if (score >= 50) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-red-100 text-red-800';
  }
}

/**
 * Get satisfaction level label
 * 
 * @param score - The satisfaction score (0-100)
 * @returns string - Human-readable label
 */
export function getSatisfactionLabel(score: number | null): string {
  if (score === null) {
    return 'No Data';
  }

  if (score >= 70) {
    return 'Good';
  } else if (score >= 50) {
    return 'Needs Improvement';
  } else {
    return 'Critical';
  }
}

/**
 * Get color class for need for action score
 * Used for UI color coding (higher score = more urgent)
 * 
 * @param score - The need for action score (0-100)
 * @returns string - Tailwind CSS color class
 */
export function getNeedForActionColorClass(score: number | null): string {
  if (score === null) {
    return 'bg-gray-100 text-gray-600';
  }

  if (score >= 70) {
    return 'bg-red-100 text-red-800';
  } else if (score >= 50) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
}

/**
 * Get need for action level label
 * 
 * @param score - The need for action score (0-100)
 * @returns string - Human-readable label
 */
export function getNeedForActionLabel(score: number | null): string {
  if (score === null) {
    return 'No Data';
  }

  if (score >= 70) {
    return 'Urgent';
  } else if (score >= 50) {
    return 'Moderate';
  } else {
    return 'Low';
  }
}
