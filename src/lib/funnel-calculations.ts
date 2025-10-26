/**
 * Funnel Calculations Utility Module
 * 
 * Implements cascading funnel calculations for service delivery metrics:
 * 1. Awareness: calculated from all respondents
 * 2. Availment: calculated only from aware respondents
 * 3. Satisfaction: calculated only from respondents who availed services
 * 
 * This ensures each stage uses the appropriate population as its denominator,
 * reflecting the true progression through the service delivery journey.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Metrics for a single funnel stage
 */
export interface FunnelStageMetrics {
  count: number;              // Numerator (e.g., number aware)
  total: number;              // Denominator (e.g., total respondents)
  percentage: number | null;  // Calculated percentage or null if total is 0
}

/**
 * Complete funnel metrics for a service area
 */
export interface ServiceFunnelMetrics {
  awareness: FunnelStageMetrics;
  availment: FunnelStageMetrics;
  satisfaction: FunnelStageMetrics;
}

/**
 * Survey response structure
 */
export interface SurveyResponse {
  response_id: number;
  respondent_id?: number;
  survey_section: SurveySection | SurveySection[];
}

/**
 * Survey section structure
 */
export interface SurveySection {
  section_key: string;
  data: string | Record<string, any>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Finds awareness questions for a service area by pattern matching
 */
export function findAwarenessQuestions(data: Record<string, any>): string[] {
  return Object.keys(data).filter(key => {
    const keyLower = key.toLowerCase();
    return keyLower.includes('aware') || keyLower.includes('know about');
  });
}

/**
 * Finds availment questions for a service area by pattern matching
 */
export function findAvailmentQuestions(data: Record<string, any>): string[] {
  const availmentKeywords = [
    'avail', 'experience', 'benefited', 'participated', 
    'used', 'accessed', 'utilized', 'received'
  ];
  
  return Object.keys(data).filter(key => {
    const keyLower = key.toLowerCase();
    return availmentKeywords.some(keyword => keyLower.includes(keyword));
  });
}

/**
 * Finds satisfaction questions for a service area by pattern matching
 */
export function findSatisfactionQuestions(data: Record<string, any>): string[] {
  return Object.keys(data).filter(key => {
    const keyLower = key.toLowerCase();
    return keyLower.includes('satisf') || keyLower.includes('rate') || keyLower.includes('quality');
  });
}

/**
 * Determines if an answer represents "Yes"
 */
export function isYesAnswer(answer: any): boolean {
  if (answer === 1 || answer === true || answer === '1') {
    return true;
  }
  
  const stringValue = String(answer).toLowerCase().trim();
  return stringValue === 'yes' || stringValue === 'oo' || stringValue === 'true';
}

/**
 * Parses a satisfaction rating from an answer
 * Returns a number between 1-5, or null if invalid
 */
export function parseRating(answer: any): number | null {
  const numValue = typeof answer === 'string' ? parseInt(answer) : answer;
  
  if (typeof numValue === 'number' && numValue >= 1 && numValue <= 5) {
    return numValue;
  }
  
  return null;
}

/**
 * Parses survey section data (handles both string and object formats)
 */
function parseSectionData(data: string | Record<string, any>): Record<string, any> {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse section data:', e);
      return {};
    }
  }
  return data;
}

/**
 * Validates funnel integrity: availed ⊆ aware ⊆ all
 */
function validateFunnelIntegrity(
  awareIds: Set<number>,
  availedIds: Set<number>,
  allRespondentIds: Set<number>
): void {
  // Check: availedIds ⊆ awareIds
  for (const id of availedIds) {
    if (!awareIds.has(id)) {
      console.warn(`Funnel integrity violation: Respondent ${id} availed but is not aware`);
    }
  }
  
  // Check: awareIds ⊆ allRespondentIds
  for (const id of awareIds) {
    if (!allRespondentIds.has(id)) {
      console.warn(`Funnel integrity violation: Respondent ${id} is aware but not in total respondents`);
    }
  }
}

// ============================================================================
// Core Funnel Calculation Functions
// ============================================================================

/**
 * Identifies respondents who answered 'Yes' to any awareness question
 * for the given service area.
 * 
 * @param responses - Array of survey responses
 * @param serviceArea - Service area key (e.g., 'financial', 'disaster')
 * @returns Set of respondent IDs who are aware
 */
export function identifyAwareRespondents(
  responses: SurveyResponse[],
  serviceArea: string
): Set<number> {
  const awareIds = new Set<number>();
  
  responses.forEach(response => {
    const sections = Array.isArray(response.survey_section) 
      ? response.survey_section 
      : [response.survey_section];
    
    sections.forEach(section => {
      if (section.section_key !== serviceArea) return;
      
      const data = parseSectionData(section.data);
      const awarenessQuestions = findAwarenessQuestions(data);
      
      // If respondent answered 'Yes' to any awareness question, they are aware
      for (const questionKey of awarenessQuestions) {
        if (isYesAnswer(data[questionKey])) {
          const respondentId = response.respondent_id || response.response_id;
          awareIds.add(respondentId);
          break; // No need to check other questions for this respondent
        }
      }
    });
  });
  
  return awareIds;
}

/**
 * Identifies respondents who answered 'Yes' to any availment question,
 * filtered to only include aware respondents.
 * 
 * @param responses - Array of survey responses
 * @param serviceArea - Service area key
 * @param awareIds - Set of respondent IDs who are aware
 * @returns Set of respondent IDs who availed (subset of awareIds)
 */
export function identifyAvailedRespondents(
  responses: SurveyResponse[],
  serviceArea: string,
  awareIds: Set<number>
): Set<number> {
  const availedIds = new Set<number>();
  
  responses.forEach(response => {
    const respondentId = response.respondent_id || response.response_id;
    
    // Only consider respondents who are aware
    if (!awareIds.has(respondentId)) return;
    
    const sections = Array.isArray(response.survey_section) 
      ? response.survey_section 
      : [response.survey_section];
    
    sections.forEach(section => {
      if (section.section_key !== serviceArea) return;
      
      const data = parseSectionData(section.data);
      const availmentQuestions = findAvailmentQuestions(data);
      
      // If respondent answered 'Yes' to any availment question, they availed
      for (const questionKey of availmentQuestions) {
        if (isYesAnswer(data[questionKey])) {
          availedIds.add(respondentId);
          break; // No need to check other questions for this respondent
        }
      }
    });
  });
  
  return availedIds;
}

/**
 * Calculates satisfaction metrics only from respondents who availed services.
 * 
 * @param responses - Array of survey responses
 * @param serviceArea - Service area key
 * @param availedIds - Set of respondent IDs who availed
 * @returns Satisfaction metrics with count, total, and percentage
 */
export function calculateSatisfactionFromAvailed(
  responses: SurveyResponse[],
  serviceArea: string,
  availedIds: Set<number>
): FunnelStageMetrics {
  // Track highest satisfaction rating per respondent
  const respondentRatings = new Map<number, number>();
  
  responses.forEach(response => {
    const respondentId = response.respondent_id || response.response_id;
    
    // Only consider respondents who availed
    if (!availedIds.has(respondentId)) return;
    
    const sections = Array.isArray(response.survey_section) 
      ? response.survey_section 
      : [response.survey_section];
    
    sections.forEach(section => {
      if (section.section_key !== serviceArea) return;
      
      const data = parseSectionData(section.data);
      const satisfactionQuestions = findSatisfactionQuestions(data);
      
      // Collect highest satisfaction rating from this respondent
      for (const questionKey of satisfactionQuestions) {
        const rating = parseRating(data[questionKey]);
        if (rating !== null) {
          const currentRating = respondentRatings.get(respondentId);
          if (currentRating === undefined || rating > currentRating) {
            respondentRatings.set(respondentId, rating);
          }
        }
      }
    });
  });
  
  if (respondentRatings.size === 0) {
    return {
      count: 0,
      total: 0,
      percentage: null
    };
  }
  
  // Get all ratings (one per respondent)
  const satisfactionScores = Array.from(respondentRatings.values());
  
  // Calculate average satisfaction rating and convert to percentage
  const avgRating = satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length;
  const percentage = Math.round((avgRating / 5) * 1000) / 10;
  
  // Count satisfied respondents (rating >= 4 as "satisfied")
  const satisfiedCount = satisfactionScores.filter(rating => rating >= 4).length;
  
  // Total is the number of availed respondents who answered satisfaction questions
  const total = respondentRatings.size;
  
  return {
    count: satisfiedCount,
    total,
    percentage
  };
}

/**
 * Orchestrates three-stage funnel calculation for a service area.
 * This is the main entry point for funnel calculations.
 * 
 * @param responses - Array of survey responses
 * @param serviceArea - Service area key
 * @returns Complete funnel metrics with awareness, availment, and satisfaction
 */
export function calculateServiceFunnelMetrics(
  responses: SurveyResponse[],
  serviceArea: string
): ServiceFunnelMetrics {
  // Get all unique respondent IDs
  const allRespondentIds = new Set<number>();
  responses.forEach(response => {
    const respondentId = response.respondent_id || response.response_id;
    allRespondentIds.add(respondentId);
  });
  
  const totalRespondents = allRespondentIds.size;
  
  // Stage 1: Identify aware respondents
  const awareIds = identifyAwareRespondents(responses, serviceArea);
  const awarenessCount = awareIds.size;
  
  // Handle edge case: no awareness questions or no aware respondents
  if (awarenessCount === 0) {
    return {
      awareness: {
        count: 0,
        total: totalRespondents,
        percentage: totalRespondents > 0 ? 0 : null
      },
      availment: {
        count: 0,
        total: 0,
        percentage: null
      },
      satisfaction: {
        count: 0,
        total: 0,
        percentage: null
      }
    };
  }
  
  // Stage 2: Identify availed respondents (from aware respondents only)
  const availedIds = identifyAvailedRespondents(responses, serviceArea, awareIds);
  const availmentCount = availedIds.size;
  
  // Validate funnel integrity
  validateFunnelIntegrity(awareIds, availedIds, allRespondentIds);
  
  // Handle edge case: no availment or no availed respondents
  if (availmentCount === 0) {
    return {
      awareness: {
        count: awarenessCount,
        total: totalRespondents,
        percentage: Math.round((awarenessCount / totalRespondents) * 1000) / 10
      },
      availment: {
        count: 0,
        total: awarenessCount,
        percentage: 0.0
      },
      satisfaction: {
        count: 0,
        total: 0,
        percentage: null
      }
    };
  }
  
  // Stage 3: Calculate satisfaction from availed respondents only
  const satisfactionMetrics = calculateSatisfactionFromAvailed(responses, serviceArea, availedIds);
  
  return {
    awareness: {
      count: awarenessCount,
      total: totalRespondents,
      percentage: Math.round((awarenessCount / totalRespondents) * 1000) / 10
    },
    availment: {
      count: availmentCount,
      total: awarenessCount,
      percentage: Math.round((availmentCount / awarenessCount) * 1000) / 10
    },
    satisfaction: satisfactionMetrics
  };
}
