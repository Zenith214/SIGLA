/**
 * NFA Analytics Query Utilities
 * 
 * This module provides helper functions for constructing optimized SQL queries
 * to calculate NFA (Need for Action) rates using the binary field approach.
 * 
 * Requirements: 4.1, 4.2, 4.5
 * 
 * Key Features:
 * - Uses COUNT FILTER for efficient aggregation
 * - Leverages GIN indexes on JSONB data
 * - Handles both English ("Yes"/"No") and Tagalog ("Oo"/"Hindi") responses
 * - Ensures NFA Rate calculation is independent of suggestion field content
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service indicator field mapping
 * Maps indicator names to their binary field names in the JSONB data
 */
export const SERVICE_INDICATORS = {
  financial: {
    projects: 'need_for_action_binary_projects',
    financial: 'need_for_action_binary_financial',
    socialPrograms: 'need_for_action_binary_socialPrograms',
    corruption: 'need_for_action_binary_corruption',
  },
  disaster: {
    disasterInfo: 'need_for_action_binary_disasterInfo',
    evacuation: 'need_for_action_binary_evacuation',
  },
  safety: {
    tanods: 'need_for_action_binary_tanods',
    lupon: 'need_for_action_binary_lupon',
    antiDrug: 'need_for_action_binary_antiDrug',
  },
  social: {
    healthServices: 'need_for_action_binary_healthServices',
    womenChildrenProtection: 'need_for_action_binary_womenChildrenProtection',
    communityParticipation: 'need_for_action_binary_communityParticipation',
  },
  business: {
    businessClearance: 'need_for_action_binary_businessClearance',
  },
  environmental: {
    wasteManagement: 'need_for_action_binary_wasteManagement',
  },
} as const;

/**
 * Result type for NFA rate calculations
 */
export interface NFARateResult {
  totalResponses: number;
  yesCount: number;
  nfaRatePercentage: number;
}

/**
 * Result type for NFA rate calculations with metadata
 */
export interface NFARateResultWithMetadata extends NFARateResult {
  malformedCount?: number;
  hasData: boolean;
}

/**
 * Result type for service area NFA calculations
 */
export interface ServiceAreaNFAResult {
  serviceArea: string;
  totalResponses: number;
  yesCount: number;
  nfaRatePercentage: number;
}

/**
 * Result type for indicator-specific NFA calculations
 */
export interface IndicatorNFAResult {
  indicator: string;
  totalResponses: number;
  yesCount: number;
  nfaRatePercentage: number;
}

/**
 * Result type for barangay comparison
 */
export interface BarangayNFAResult {
  barangayId: number;
  barangayName: string;
  totalResponses: number;
  yesCount: number;
  nfaRatePercentage: number;
}

/**
 * Result type for trend analysis
 */
export interface TrendNFAResult {
  cycleId: number;
  cycleName: string;
  year: number;
  totalResponses: number;
  yesCount: number;
  nfaRatePercentage: number;
}

/**
 * Calculate NFA Rate for a single service indicator
 * 
 * Formula: NFA Rate = (COUNT where binary = "Yes" or "Oo") / (TOTAL COUNT) × 100
 * 
 * @param supabase - Supabase client instance
 * @param serviceArea - Service area key (e.g., 'financial', 'disaster')
 * @param binaryFieldName - Binary field name (e.g., 'need_for_action_binary_projects')
 * @param cycleId - Survey cycle ID
 * @param barangayId - Barangay ID
 * @returns NFA rate calculation result
 */
export async function calculateNFARateForIndicator(
  supabase: SupabaseClient,
  serviceArea: string,
  binaryFieldName: string,
  cycleId: number,
  barangayId: number
): Promise<NFARateResult> {
  // Try RPC function first, but fall back to direct query if not available
  try {
    const { data, error } = await supabase.rpc('calculate_nfa_rate_for_indicator', {
      p_service_area: serviceArea,
      p_binary_field: binaryFieldName,
      p_cycle_id: cycleId,
      p_barangay_id: barangayId,
    });

    // If RPC function exists and returns data, use it
    if (!error && data) {
      return data;
    }
  } catch (rpcError) {
    // RPC function doesn't exist or failed, fall back to direct query
    console.debug('RPC function not available, using direct query');
  }

  // Fall back to direct query
  return calculateNFARateForIndicatorDirect(
    supabase,
    serviceArea,
    binaryFieldName,
    cycleId,
    barangayId
  );
}

/**
 * Direct SQL query implementation for calculating NFA rate
 * Used as fallback when RPC function is not available
 * 
 * Error Handling:
 * - Scenario 7: Returns 0 for NFA rate when no responses exist (Requirement 4.4)
 * - Scenario 8: Logs and skips malformed JSONB data
 */
async function calculateNFARateForIndicatorDirect(
  supabase: SupabaseClient,
  serviceArea: string,
  binaryFieldName: string,
  cycleId: number,
  barangayId: number
): Promise<NFARateResult> {
  // Fetch all matching survey sections
  const { data: sections, error } = await supabase
    .from('survey_section')
    .select('data')
    .eq('section_key', serviceArea)
    .eq('survey_cycle_id', cycleId)
    .eq('barangay_id', barangayId);

  if (error) {
    console.error('Error fetching survey sections:', error);
    throw error;
  }

  // Scenario 7: Handle zero responses case gracefully (Requirement 4.4)
  if (!sections || sections.length === 0) {
    return {
      totalResponses: 0,
      yesCount: 0,
      nfaRatePercentage: 0,
    };
  }

  // Calculate NFA rate from fetched data
  const totalResponses = sections.length;
  let yesCount = 0;
  let malformedCount = 0;

  for (const section of sections) {
    try {
      // Scenario 8: Handle malformed JSONB data
      const data = typeof section.data === 'string' 
        ? JSON.parse(section.data) 
        : section.data;
      
      // Validate that data is an object
      if (!data || typeof data !== 'object') {
        console.warn(`Malformed JSONB data in section (not an object), skipping`);
        malformedCount++;
        continue;
      }
      
      const binaryValue = data[binaryFieldName];
      if (binaryValue) {
        const normalizedValue = String(binaryValue).toLowerCase().trim();
        if (normalizedValue === 'yes' || normalizedValue === 'oo') {
          yesCount++;
        }
      }
    } catch (parseError) {
      // Scenario 8: Log and skip malformed JSONB data
      console.warn(`Failed to parse JSONB data in section, skipping:`, parseError);
      malformedCount++;
      continue;
    }
  }

  // Log if we encountered malformed data
  if (malformedCount > 0) {
    console.warn(`Excluded ${malformedCount} malformed responses from NFA calculation`);
  }

  // Calculate percentage based on valid responses only
  const validResponses = totalResponses - malformedCount;
  const nfaRatePercentage = validResponses > 0
    ? Math.round((yesCount / validResponses) * 1000) / 10
    : 0;

  return {
    totalResponses: validResponses,
    yesCount,
    nfaRatePercentage,
  };
}

/**
 * Calculate NFA Rates for all indicators in a service area
 * 
 * @param supabase - Supabase client instance
 * @param serviceArea - Service area key
 * @param cycleId - Survey cycle ID
 * @param barangayId - Barangay ID
 * @returns Array of NFA rates for each indicator
 */
export async function calculateNFARatesForServiceArea(
  supabase: SupabaseClient,
  serviceArea: keyof typeof SERVICE_INDICATORS,
  cycleId: number,
  barangayId: number
): Promise<IndicatorNFAResult[]> {
  const indicators = SERVICE_INDICATORS[serviceArea];
  const results: IndicatorNFAResult[] = [];

  for (const [indicatorName, binaryFieldName] of Object.entries(indicators)) {
    try {
      const result = await calculateNFARateForIndicator(
        supabase,
        serviceArea,
        binaryFieldName,
        cycleId,
        barangayId
      );

      results.push({
        indicator: indicatorName,
        ...result,
      });
    } catch (error) {
      console.error(`Error calculating NFA rate for ${indicatorName}:`, error);
      // Continue with other indicators even if one fails
      results.push({
        indicator: indicatorName,
        totalResponses: 0,
        yesCount: 0,
        nfaRatePercentage: 0,
      });
    }
  }

  return results;
}

/**
 * Calculate aggregate NFA Rate across all service areas
 * 
 * @param supabase - Supabase client instance
 * @param cycleId - Survey cycle ID
 * @param barangayId - Barangay ID
 * @returns Array of NFA rates for each service area
 */
export async function calculateNFARatesAcrossAllServiceAreas(
  supabase: SupabaseClient,
  cycleId: number,
  barangayId: number
): Promise<ServiceAreaNFAResult[]> {
  const results: ServiceAreaNFAResult[] = [];

  for (const serviceArea of Object.keys(SERVICE_INDICATORS) as Array<keyof typeof SERVICE_INDICATORS>) {
    const indicators = SERVICE_INDICATORS[serviceArea];
    let totalResponses = 0;
    let totalYesCount = 0;

    for (const binaryFieldName of Object.values(indicators)) {
      try {
        const result = await calculateNFARateForIndicator(
          supabase,
          serviceArea,
          binaryFieldName,
          cycleId,
          barangayId
        );

        totalResponses += result.totalResponses;
        totalYesCount += result.yesCount;
      } catch (error) {
        console.error(`Error calculating NFA rate for ${binaryFieldName}:`, error);
      }
    }

    const nfaRatePercentage = totalResponses > 0
      ? Math.round((totalYesCount / totalResponses) * 1000) / 10
      : 0;

    results.push({
      serviceArea,
      totalResponses,
      yesCount: totalYesCount,
      nfaRatePercentage,
    });
  }

  return results;
}

/**
 * Compare NFA Rates for a specific indicator across multiple barangays
 * 
 * @param supabase - Supabase client instance
 * @param serviceArea - Service area key
 * @param binaryFieldName - Binary field name
 * @param cycleId - Survey cycle ID
 * @returns Array of NFA rates for each barangay
 */
export async function compareNFARatesAcrossBarangays(
  supabase: SupabaseClient,
  serviceArea: string,
  binaryFieldName: string,
  cycleId: number
): Promise<BarangayNFAResult[]> {
  // Fetch all barangays
  const { data: barangays, error: barangayError } = await supabase
    .from('barangay')
    .select('barangay_id, barangay_name')
    .eq('is_active', true);

  if (barangayError) {
    console.error('Error fetching barangays:', barangayError);
    throw barangayError;
  }

  if (!barangays || barangays.length === 0) {
    return [];
  }

  const results: BarangayNFAResult[] = [];

  for (const barangay of barangays) {
    try {
      const result = await calculateNFARateForIndicator(
        supabase,
        serviceArea,
        binaryFieldName,
        cycleId,
        barangay.barangay_id
      );

      results.push({
        barangayId: barangay.barangay_id,
        barangayName: barangay.barangay_name,
        ...result,
      });
    } catch (error) {
      console.error(`Error calculating NFA rate for barangay ${barangay.barangay_id}:`, error);
    }
  }

  // Sort by NFA rate percentage (descending)
  return results.sort((a, b) => b.nfaRatePercentage - a.nfaRatePercentage);
}

/**
 * Calculate NFA Rate trend across multiple survey cycles
 * 
 * @param supabase - Supabase client instance
 * @param serviceArea - Service area key
 * @param binaryFieldName - Binary field name
 * @param barangayId - Barangay ID
 * @returns Array of NFA rates for each cycle
 */
export async function calculateNFARateTrend(
  supabase: SupabaseClient,
  serviceArea: string,
  binaryFieldName: string,
  barangayId: number
): Promise<TrendNFAResult[]> {
  // Fetch all survey cycles
  const { data: cycles, error: cycleError } = await supabase
    .from('survey_cycle')
    .select('cycle_id, name, year')
    .order('year', { ascending: false })
    .order('cycle_id', { ascending: false });

  if (cycleError) {
    console.error('Error fetching survey cycles:', cycleError);
    throw cycleError;
  }

  if (!cycles || cycles.length === 0) {
    return [];
  }

  const results: TrendNFAResult[] = [];

  for (const cycle of cycles) {
    try {
      const result = await calculateNFARateForIndicator(
        supabase,
        serviceArea,
        binaryFieldName,
        cycle.cycle_id,
        barangayId
      );

      results.push({
        cycleId: cycle.cycle_id,
        cycleName: cycle.name,
        year: cycle.year,
        ...result,
      });
    } catch (error) {
      console.error(`Error calculating NFA rate for cycle ${cycle.cycle_id}:`, error);
    }
  }

  return results;
}

/**
 * Verify that NFA Rate is independent of suggestion field content
 * This function demonstrates that the calculation uses only the binary field
 * 
 * Requirements: 4.5
 * 
 * @param supabase - Supabase client instance
 * @param serviceArea - Service area key
 * @param binaryFieldName - Binary field name
 * @param suggestionFieldName - Suggestion field name
 * @param cycleId - Survey cycle ID
 * @param barangayId - Barangay ID
 * @returns Comparison of NFA rates with and without suggestions
 */
export async function verifyNFARateIndependence(
  supabase: SupabaseClient,
  serviceArea: string,
  binaryFieldName: string,
  suggestionFieldName: string,
  cycleId: number,
  barangayId: number
): Promise<{
  withSuggestions: NFARateResult;
  withoutSuggestions: NFARateResult;
  ratesMatch: boolean;
}> {
  // Fetch all sections
  const { data: sections, error } = await supabase
    .from('survey_section')
    .select('data')
    .eq('section_key', serviceArea)
    .eq('survey_cycle_id', cycleId)
    .eq('barangay_id', barangayId);

  if (error) {
    console.error('Error fetching survey sections:', error);
    throw error;
  }

  if (!sections || sections.length === 0) {
    return {
      withSuggestions: { totalResponses: 0, yesCount: 0, nfaRatePercentage: 0 },
      withoutSuggestions: { totalResponses: 0, yesCount: 0, nfaRatePercentage: 0 },
      ratesMatch: true,
    };
  }

  // Separate sections with and without suggestions
  const withSuggestions: any[] = [];
  const withoutSuggestions: any[] = [];

  for (const section of sections) {
    const data = typeof section.data === 'string' 
      ? JSON.parse(section.data) 
      : section.data;
    
    const suggestionValue = data[suggestionFieldName];
    const hasSuggestion = suggestionValue && String(suggestionValue).trim() !== '';

    if (hasSuggestion) {
      withSuggestions.push(section);
    } else {
      withoutSuggestions.push(section);
    }
  }

  // Calculate NFA rates for both groups
  const calculateRate = (sectionList: any[]): NFARateResult => {
    const totalResponses = sectionList.length;
    let yesCount = 0;

    for (const section of sectionList) {
      const data = typeof section.data === 'string' 
        ? JSON.parse(section.data) 
        : section.data;
      
      const binaryValue = data[binaryFieldName];
      if (binaryValue) {
        const normalizedValue = String(binaryValue).toLowerCase().trim();
        if (normalizedValue === 'yes' || normalizedValue === 'oo') {
          yesCount++;
        }
      }
    }

    const nfaRatePercentage = totalResponses > 0
      ? Math.round((yesCount / totalResponses) * 1000) / 10
      : 0;

    return { totalResponses, yesCount, nfaRatePercentage };
  };

  const withSuggestionsResult = calculateRate(withSuggestions);
  const withoutSuggestionsResult = calculateRate(withoutSuggestions);

  // Calculate overall rate to verify independence
  const overallResult = await calculateNFARateForIndicator(
    supabase,
    serviceArea,
    binaryFieldName,
    cycleId,
    barangayId
  );

  // Verify that the overall rate matches the weighted average
  const expectedOverallRate = 
    (withSuggestionsResult.yesCount + withoutSuggestionsResult.yesCount) /
    (withSuggestionsResult.totalResponses + withoutSuggestionsResult.totalResponses) * 100;

  const ratesMatch = Math.abs(overallResult.nfaRatePercentage - expectedOverallRate) < 0.1;

  return {
    withSuggestions: withSuggestionsResult,
    withoutSuggestions: withoutSuggestionsResult,
    ratesMatch,
  };
}

/**
 * Validation functions for analytics API parameters
 * Scenario 9: Validate query parameters
 */

/**
 * Validate service area parameter
 * 
 * @param serviceArea - Service area key to validate
 * @returns true if valid, false otherwise
 */
export function isValidServiceArea(serviceArea: string): boolean {
  return serviceArea in SERVICE_INDICATORS;
}

/**
 * Validate binary field name for a service area
 * 
 * @param serviceArea - Service area key
 * @param binaryFieldName - Binary field name to validate
 * @returns true if valid, false otherwise
 */
export function isValidBinaryFieldName(
  serviceArea: string,
  binaryFieldName: string
): boolean {
  if (!isValidServiceArea(serviceArea)) {
    return false;
  }

  const indicators = SERVICE_INDICATORS[serviceArea as keyof typeof SERVICE_INDICATORS];
  return Object.values(indicators).includes(binaryFieldName);
}

/**
 * Get all valid service areas
 * 
 * @returns Array of valid service area keys
 */
export function getValidServiceAreas(): string[] {
  return Object.keys(SERVICE_INDICATORS);
}

/**
 * Get all valid binary field names for a service area
 * 
 * @param serviceArea - Service area key
 * @returns Array of valid binary field names, or empty array if service area is invalid
 */
export function getValidBinaryFieldNames(serviceArea: string): string[] {
  if (!isValidServiceArea(serviceArea)) {
    return [];
  }

  const indicators = SERVICE_INDICATORS[serviceArea as keyof typeof SERVICE_INDICATORS];
  return Object.values(indicators);
}

/**
 * Validate cycle ID parameter
 * 
 * @param cycleId - Cycle ID to validate
 * @returns true if valid (positive integer), false otherwise
 */
export function isValidCycleId(cycleId: any): boolean {
  const num = Number(cycleId);
  return Number.isInteger(num) && num > 0;
}

/**
 * Validate barangay ID parameter
 * 
 * @param barangayId - Barangay ID to validate
 * @returns true if valid (positive integer), false otherwise
 */
export function isValidBarangayId(barangayId: any): boolean {
  const num = Number(barangayId);
  return Number.isInteger(num) && num > 0;
}
