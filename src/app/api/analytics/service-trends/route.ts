import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { apiCache } from '@/lib/cache';
import {
  createErrorResponse,
  createAuthError,
  withRetry,
  handleDatabaseError,
} from '@/lib/api-error-handler';
import {
  ServiceTrendsQuerySchema,
  validateQueryParams,
  validateScore,
} from '@/lib/api-validators';

const ENDPOINT = '/api/analytics/service-trends';

/**
 * GET /api/analytics/service-trends
 * Fetch historical satisfaction data across cycles for a service area
 */
export async function GET(request: NextRequest) {
  // Parse searchParams outside try block so it's available in catch
  const { searchParams } = new URL(request.url);
  
  try {
    // Authentication check
    const authError = requireAuth(request);
    if (authError) {
      throw createAuthError(authError.error);
    }

    // Validate query parameters
    const validation = validateQueryParams(ServiceTrendsQuerySchema, searchParams);
    
    if (!validation.success) {
      throw validation.error;
    }

    const { service_area: serviceArea, barangay_id: barangayId } = validation.data;

    console.log(`[SERVICE TRENDS] Fetching trends for ${serviceArea}${barangayId ? ` (barangay ${barangayId})` : ' (all barangays)'}`);

    // Check cache
    const cacheKey = apiCache.generateKey('service-trends', {
      service_area: serviceArea,
      barangay_id: barangayId
    });

    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`[SERVICE TRENDS] Cache hit for key: ${cacheKey}`);
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

    // Map service area to the keys used in the nested data structure
    const serviceKeyMap: Record<string, string> = {
      financial: 'financial',
      disaster: 'disaster',
      health: 'safety',
      peace: 'safety',
      infrastructure: 'business',
      environmental: 'environmental'
    };

    const columnPrefix = serviceColumnMap[serviceArea];
    const serviceKey = serviceKeyMap[serviceArea] || serviceArea;
    
    if (!columnPrefix) {
      return NextResponse.json(
        { error: 'Invalid service area mapping' },
        { status: 400 }
      );
    }

    // Build query with retry logic
    const result = await withRetry(
      async () => {
        let query = supabaseAdmin
          .from('ml_cache')
          .select('*')
          .not('cycle_id', 'is', null);

        // Add barangay filter if specified
        if (barangayId) {
          query = query.eq('barangay_id', barangayId);
        }

        return query;
      },
      {
        maxRetries: 2,
        retryDelay: 500,
        onRetry: (attempt, error) => {
          console.warn(`[SERVICE TRENDS] Retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const { data: trendsData, error: trendsError } = result as any;

    if (trendsError) {
      throw handleDatabaseError(trendsError, 'fetch service trends');
    }

    // Fetch cycle information separately
    const cycleIds = [...new Set(trendsData?.map((item: any) => item.cycle_id) || [])];
    const { data: cyclesData, error: cyclesError } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id, year')
      .in('cycle_id', cycleIds);

    if (cyclesError) {
      console.warn('[SERVICE TRENDS] Error fetching cycle data:', cyclesError);
    }

    // Create a map of cycle_id to year
    const cycleYearMap = new Map<number, number>();
    if (cyclesData) {
      cyclesData.forEach((cycle: any) => {
        cycleYearMap.set(cycle.cycle_id, cycle.year);
      });
    }

    if (!trendsData || trendsData.length === 0) {
      console.log('[SERVICE TRENDS] No trend data found');
      return NextResponse.json({
        success: true,
        service_area: serviceArea,
        barangay_id: barangayId,
        trends: []
      });
    }

    // If no barangay specified, aggregate across all barangays per cycle
    let trends;
    if (!barangayId) {
      // Group by cycle and calculate averages
      const cycleMap = new Map<number, {
        cycle_id: number;
        year: number;
        satisfaction: number[];
        need_action: number[];
        awareness: number[];
        availment: number[];
      }>();

      trendsData.forEach((item: any) => {
        const cycleId = item.cycle_id;
        const year = cycleYearMap.get(cycleId) || 0;

        if (!cycleMap.has(cycleId)) {
          cycleMap.set(cycleId, {
            cycle_id: cycleId,
            year,
            satisfaction: [],
            need_action: [],
            awareness: [],
            availment: []
          });
        }

        const cycleData = cycleMap.get(cycleId)!;
        
        // Extract metrics from different data structures
        let satisfaction = 0, needAction = 0, awareness = 0, availment = 0;
        
        if (item[`${columnPrefix}_satisfaction`]) {
          // Dedicated columns
          satisfaction = item[`${columnPrefix}_satisfaction`] || 0;
          needAction = item[`${columnPrefix}_need_action`] || 0;
          awareness = item[`${columnPrefix}_awareness`] || 0;
          availment = item[`${columnPrefix}_availment`] || 0;
        } else if (item.data?.[`${columnPrefix}_satisfaction`]) {
          // Flat JSONB structure
          satisfaction = item.data[`${columnPrefix}_satisfaction`] || 0;
          needAction = item.data[`${columnPrefix}_need_action`] || 0;
          awareness = item.data[`${columnPrefix}_awareness`] || 0;
          availment = item.data[`${columnPrefix}_availment`] || 0;
        } else if (item.data?.service_scores?.[serviceKey]) {
          // Nested service_scores structure
          const serviceData = item.data.service_scores[serviceKey];
          satisfaction = serviceData.satisfaction || 0;
          needAction = serviceData.need_action || 0;
          awareness = serviceData.awareness || 0;
          availment = serviceData.availment || 0;
        } else if (item.data?.action_grid?.[serviceKey]) {
          // Action grid structure
          const actionData = item.data.action_grid[serviceKey];
          satisfaction = actionData.satisfaction_score || 0;
          needAction = actionData.need_action_score || 0;
          // Note: action_grid doesn't have awareness/availment, use service_scores if available
          if (item.data?.service_scores?.[serviceKey]) {
            awareness = item.data.service_scores[serviceKey].awareness || 0;
            availment = item.data.service_scores[serviceKey].availment || 0;
          }
        }
        
        cycleData.satisfaction.push(satisfaction);
        cycleData.need_action.push(needAction);
        cycleData.awareness.push(awareness);
        cycleData.availment.push(availment);
      });

      // Calculate averages with data validation
      trends = Array.from(cycleMap.values()).map(cycle => ({
        cycle_id: cycle.cycle_id,
        year: cycle.year,
        satisfaction: validateScore(
          Math.round(cycle.satisfaction.reduce((sum, val) => sum + val, 0) / cycle.satisfaction.length)
        ),
        need_action: validateScore(
          Math.round(cycle.need_action.reduce((sum, val) => sum + val, 0) / cycle.need_action.length)
        ),
        awareness: validateScore(
          Math.round(cycle.awareness.reduce((sum, val) => sum + val, 0) / cycle.awareness.length)
        ),
        availment: validateScore(
          Math.round(cycle.availment.reduce((sum, val) => sum + val, 0) / cycle.availment.length)
        )
      }));

      // Sort by year
      trends.sort((a, b) => a.year - b.year);
    } else {
      // Single barangay - return direct data with validation
      trends = trendsData.map((item: any) => {
        let satisfaction = 0, needAction = 0, awareness = 0, availment = 0;
        
        // Extract metrics from different data structures
        if (item[`${columnPrefix}_satisfaction`]) {
          satisfaction = item[`${columnPrefix}_satisfaction`] || 0;
          needAction = item[`${columnPrefix}_need_action`] || 0;
          awareness = item[`${columnPrefix}_awareness`] || 0;
          availment = item[`${columnPrefix}_availment`] || 0;
        } else if (item.data?.[`${columnPrefix}_satisfaction`]) {
          satisfaction = item.data[`${columnPrefix}_satisfaction`] || 0;
          needAction = item.data[`${columnPrefix}_need_action`] || 0;
          awareness = item.data[`${columnPrefix}_awareness`] || 0;
          availment = item.data[`${columnPrefix}_availment`] || 0;
        } else if (item.data?.service_scores?.[serviceKey]) {
          const serviceData = item.data.service_scores[serviceKey];
          satisfaction = serviceData.satisfaction || 0;
          needAction = serviceData.need_action || 0;
          awareness = serviceData.awareness || 0;
          availment = serviceData.availment || 0;
        } else if (item.data?.action_grid?.[serviceKey]) {
          const actionData = item.data.action_grid[serviceKey];
          satisfaction = actionData.satisfaction_score || 0;
          needAction = actionData.need_action_score || 0;
          if (item.data?.service_scores?.[serviceKey]) {
            awareness = item.data.service_scores[serviceKey].awareness || 0;
            availment = item.data.service_scores[serviceKey].availment || 0;
          }
        }
        
        return {
          cycle_id: item.cycle_id,
          year: cycleYearMap.get(item.cycle_id) || 0,
          satisfaction: validateScore(satisfaction),
          need_action: validateScore(needAction),
          awareness: validateScore(awareness),
          availment: validateScore(availment)
        };
      });

      // Sort by year
      trends.sort((a: any, b: any) => a.year - b.year);
    }

    console.log(`[SERVICE TRENDS] Successfully fetched ${trends.length} trend data points`);

    const response = {
      success: true,
      service_area: serviceArea,
      barangay_id: barangayId,
      trends
    };

    // Cache the response
    apiCache.set(cacheKey, response);

    return NextResponse.json(response);

  } catch (error: any) {
    return createErrorResponse(error, ENDPOINT, {
      service_area: searchParams.get('service_area'),
      barangay_id: searchParams.get('barangay_id'),
    });
  }
}
