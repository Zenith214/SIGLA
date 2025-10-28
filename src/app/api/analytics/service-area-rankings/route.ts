import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { apiCache } from '@/lib/cache';
import {
  createErrorResponse,
  createAuthError,
  createNotFoundError,
  withRetry,
  handleDatabaseError,
} from '@/lib/api-error-handler';
import {
  ServiceAreaRankingsQuerySchema,
  validateQueryParams,
  validateCycleId,
  validateScore,
} from '@/lib/api-validators';

const ENDPOINT = '/api/analytics/service-area-rankings';

/**
 * GET /api/analytics/service-area-rankings
 * Rank barangays by selected service area with satisfaction scores and trends
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authError = requireAuth(request);
    if (authError) {
      throw createAuthError(authError.error);
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = validateQueryParams(ServiceAreaRankingsQuerySchema, searchParams);
    
    if (!validation.success) {
      throw validation.error;
    }

    const { service_area: serviceArea, cycle_id: cycleId } = validation.data;

    console.log(`[SERVICE RANKINGS] Fetching rankings for ${serviceArea} in cycle ${cycleId}`);

    // Validate cycle ID exists
    const cycleValidation = await validateCycleId(cycleId, supabaseAdmin);
    if (!cycleValidation.valid) {
      throw createNotFoundError(`Cycle ${cycleId}`);
    }

    // Check cache
    const cacheKey = apiCache.generateKey('service-area-rankings', {
      service_area: serviceArea,
      cycle_id: cycleId
    });

    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`[SERVICE RANKINGS] Cache hit for key: ${cacheKey}`);
      return NextResponse.json(cached);
    }

    // Map service area types to ML cache column names
    const serviceColumnMap: Record<string, string> = {
      financial: 'financial_assistance',
      disaster: 'disaster_preparedness',
      health: 'health_services',
      peace: 'peace_and_order',
      infrastructure: 'infrastructure',
      environmental: 'environmental_management'
    };

    const columnPrefix = serviceColumnMap[serviceArea];

    // Fetch current cycle data from ml_cache with retry logic
    // Try to select all columns to see what's available
    const result = await withRetry(
      async () => {
        const response = await supabaseAdmin
          .from('ml_cache')
          .select('*')
          .eq('cycle_id', cycleId)
          .not('barangay_id', 'is', null);
        return response;
      },
      {
        maxRetries: 2,
        retryDelay: 500,
        onRetry: (attempt, error) => {
          console.warn(`[SERVICE RANKINGS] Retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const { data: rawData, error: currentError } = result as any;

    if (currentError) {
      throw handleDatabaseError(currentError, 'fetch service area rankings');
    }

    if (!rawData || rawData.length === 0) {
      console.log('[SERVICE RANKINGS] No data found for this cycle');
      return NextResponse.json({
        success: true,
        service_area: serviceArea,
        cycle_id: cycleId,
        rankings: []
      });
    }

    // Map service area to the keys used in the data structure
    const serviceKeyMap: Record<string, string> = {
      financial: 'financial',
      disaster: 'disaster',
      health: 'safety', // Note: health_services maps to 'safety' in service_scores
      peace: 'safety', // Note: peace_and_order maps to 'safety' in service_scores
      infrastructure: 'business', // Note: infrastructure might map to 'business'
      environmental: 'environmental'
    };

    const serviceKey = serviceKeyMap[serviceArea] || serviceArea;

    console.log('[SERVICE RANKINGS] Looking for service area:', serviceArea, '-> service key:', serviceKey);

    // Extract and sort data by satisfaction score
    // Support multiple data formats:
    // 1. Dedicated columns: item.financial_assistance_satisfaction
    // 2. Flat JSONB: item.data.financial_assistance_satisfaction
    // 3. Nested service_scores: item.data.service_scores.financial.satisfaction
    const currentData = rawData
      .map((item: any) => {
        let satisfaction = 0;
        let needAction = 0;
        
        // Try different data structures
        if (item[`${columnPrefix}_satisfaction`]) {
          // Dedicated columns
          satisfaction = item[`${columnPrefix}_satisfaction`];
          needAction = item[`${columnPrefix}_need_action`] || 0;
        } else if (item.data?.[`${columnPrefix}_satisfaction`]) {
          // Flat JSONB structure
          satisfaction = item.data[`${columnPrefix}_satisfaction`];
          needAction = item.data[`${columnPrefix}_need_action`] || 0;
        } else if (item.data?.service_scores?.[serviceKey]) {
          // Nested service_scores structure
          const serviceData = item.data.service_scores[serviceKey];
          satisfaction = serviceData.satisfaction || 0;
          needAction = serviceData.need_action || 0;
        } else if (item.data?.action_grid?.[serviceKey]) {
          // Action grid structure
          const actionData = item.data.action_grid[serviceKey];
          satisfaction = actionData.satisfaction_score || 0;
          needAction = actionData.need_action_score || 0;
        }
        
        return {
          barangay_id: item.barangay_id,
          satisfaction,
          need_action: needAction
        };
      })
      .sort((a: any, b: any) => b.satisfaction - a.satisfaction);

    // Fetch barangay names for all barangay IDs
    const barangayIds = currentData.map((item: any) => item.barangay_id);
    const { data: barangayData, error: barangayError } = await supabaseAdmin
      .from('barangay')
      .select('barangay_id, barangay_name')
      .in('barangay_id', barangayIds);

    if (barangayError) {
      console.warn('[SERVICE RANKINGS] Error fetching barangay names:', barangayError);
    }

    // Create a map of barangay_id to barangay_name
    const barangayMap = new Map<number, string>();
    if (barangayData) {
      barangayData.forEach((b: any) => {
        barangayMap.set(b.barangay_id, b.barangay_name);
      });
    }

    // Get previous cycle for trend calculation
    const { data: previousCycleData } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id, year')
      .lt('cycle_id', cycleId)
      .order('cycle_id', { ascending: false })
      .limit(1)
      .single();

    // Fetch previous cycle data if available
    let previousDataMap: Map<number, number> = new Map();
    if (previousCycleData) {
      const { data: prevData } = await supabaseAdmin
        .from('ml_cache')
        .select('*')
        .eq('cycle_id', previousCycleData.cycle_id);

      if (prevData) {
        prevData.forEach((item: any) => {
          let satisfaction = 0;
          
          // Try different data structures
          if (item[`${columnPrefix}_satisfaction`]) {
            satisfaction = item[`${columnPrefix}_satisfaction`];
          } else if (item.data?.[`${columnPrefix}_satisfaction`]) {
            satisfaction = item.data[`${columnPrefix}_satisfaction`];
          } else if (item.data?.service_scores?.[serviceKey]) {
            satisfaction = item.data.service_scores[serviceKey].satisfaction || 0;
          } else if (item.data?.action_grid?.[serviceKey]) {
            satisfaction = item.data.action_grid[serviceKey].satisfaction_score || 0;
          }
          
          previousDataMap.set(item.barangay_id, satisfaction);
        });
      }
    }

    // Build rankings with trend analysis and data validation
    const rankings = currentData.map((item: any, index: number) => {
      const satisfaction = validateScore(item.satisfaction);
      const needAction = validateScore(item.need_action);
      const barangayId = item.barangay_id;
      const previousSatisfaction = previousDataMap.get(barangayId);

      // Calculate trend and improvement rate
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      let improvementRate = 0;

      if (previousSatisfaction !== undefined && previousSatisfaction > 0) {
        const change = satisfaction - previousSatisfaction;
        improvementRate = Math.round((change / previousSatisfaction) * 100);

        if (change > 5) {
          trend = 'improving';
        } else if (change < -5) {
          trend = 'declining';
        }
      }

      return {
        rank: index + 1,
        barangay_id: barangayId,
        name: barangayMap.get(barangayId) || 'Unknown',
        satisfaction,
        need_action: needAction,
        trend,
        improvement_rate: improvementRate
      };
    });

    console.log(`[SERVICE RANKINGS] Successfully ranked ${rankings.length} barangays`);

    const response = {
      success: true,
      service_area: serviceArea,
      cycle_id: cycleId,
      rankings
    };

    // Cache the response
    apiCache.set(cacheKey, response);

    return NextResponse.json(response);

  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    return createErrorResponse(error, ENDPOINT, {
      service_area: searchParams.get('service_area'),
      cycle_id: searchParams.get('cycle_id'),
    });
  }
}
