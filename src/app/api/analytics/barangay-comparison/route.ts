import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { apiCache } from '@/lib/cache';
import {
  APIError,
  ErrorType,
  ErrorSeverity,
  createErrorResponse,
  withRetry,
  fetchWithTimeout,
  handleDatabaseError,
  createAuthError,
  createNotFoundError,
} from '@/lib/api-error-handler';
import {
  BarangayComparisonRequestSchema,
  validateRequest,
  validateBarangayIds,
  validateCycleId,
  validateServiceScores,
} from '@/lib/api-validators';

interface ServiceScores {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
}

interface ActionGridQuadrant {
  maintain: string[];
  fix_now: string[];
  monitor: string[];
  low_priority: string[];
}

const ENDPOINT = '/api/analytics/barangay-comparison';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * POST /api/analytics/barangay-comparison
 * Compare 2-5 barangays across service areas, satisfaction scores, and award history
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authError = requireAuth(request);
    if (authError) {
      throw createAuthError(authError.error);
    }

    // Parse and validate request body
    const body = await request.json().catch(() => {
      throw new APIError(
        'Invalid JSON in request body',
        ErrorType.VALIDATION,
        400,
        ErrorSeverity.LOW
      );
    });

    const validation = validateRequest(BarangayComparisonRequestSchema, body);
    if (!validation.success) {
      throw validation.error;
    }

    const { barangay_ids, cycle_id, metrics } = validation.data;

    console.log(`[BARANGAY COMPARISON] Comparing ${barangay_ids.length} barangays for cycle ${cycle_id}`);

    // Validate barangay IDs exist in database
    const barangayValidation = await validateBarangayIds(barangay_ids, supabaseAdmin);
    if (!barangayValidation.valid) {
      throw new APIError(
        barangayValidation.error || 'Invalid barangay IDs',
        ErrorType.VALIDATION,
        400,
        ErrorSeverity.LOW,
        { invalidIds: barangayValidation.invalidIds }
      );
    }

    // Validate cycle ID exists
    const cycleValidation = await validateCycleId(cycle_id, supabaseAdmin);
    if (!cycleValidation.valid) {
      throw createNotFoundError(`Cycle ${cycle_id}`);
    }

    // Check cache
    const cacheKey = apiCache.generateKey('barangay-comparison', {
      barangay_ids: [...barangay_ids].sort(),
      cycle_id,
      metrics: [...metrics].sort()
    });

    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`[BARANGAY COMPARISON] Cache hit for key: ${cacheKey}`);
      return NextResponse.json(cached);
    }

    // Fetch barangay basic info with retry logic
    const result = await withRetry(
      async () => {
        const response = await supabaseAdmin
          .from('barangay')
          .select('barangay_id, barangay_name')
          .in('barangay_id', barangay_ids);
        return response;
      },
      {
        maxRetries: 2,
        retryDelay: 500,
        onRetry: (attempt, error) => {
          console.warn(`[BARANGAY COMPARISON] Retry attempt ${attempt} for barangay fetch:`, error.message);
        },
      }
    );

    const { data: barangays, error: barangayError } = result as any;

    if (barangayError) {
      throw handleDatabaseError(barangayError, 'fetch barangays');
    }

    if (!barangays || barangays.length === 0) {
      throw createNotFoundError('Barangays');
    }

    // Build comparison data for each barangay
    const comparisonData = await Promise.all(
      barangays.map(async (barangay: any) => {
        const data: any = {
          barangay_id: barangay.barangay_id,
          name: barangay.barangay_name,
        };

        // Fetch service scores if requested
        if (metrics.includes('service_scores')) {
          const serviceScores = await fetchServiceScores(barangay.barangay_id, cycle_id);
          data.service_scores = serviceScores.scores;
          data.overall_satisfaction = serviceScores.overall;
          data.action_grid = serviceScores.actionGrid;
        }

        // Fetch award data if requested
        if (metrics.includes('awards')) {
          const awards = await fetchAwardData(barangay.barangay_id);
          data.awards = awards;
        }

        return data;
      })
    );

    console.log(`[BARANGAY COMPARISON] Successfully compared ${comparisonData.length} barangays`);

    const response = {
      success: true,
      cycle_id,
      barangays: comparisonData
    };

    // Cache the response
    apiCache.set(cacheKey, response);

    return NextResponse.json(response);

  } catch (error: any) {
    return createErrorResponse(error, ENDPOINT, {
      barangay_ids: error.context?.barangay_ids,
      cycle_id: error.context?.cycle_id,
    });
  }
}

/**
 * Fetch service scores from ML cache or calculate from survey responses
 */
async function fetchServiceScores(barangayId: number, cycleId: number) {
  try {
    // Try to fetch from ML funnel analysis API (which uses ml_cache) with timeout
    const mlResponse = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      REQUEST_TIMEOUT
    );

    if (mlResponse.ok) {
      const mlData = await mlResponse.json();
      
      // Extract and validate service scores from ML data
      const rawScores = {
        financial: mlData.service_scores?.financial?.satisfaction || 0,
        disaster: mlData.service_scores?.disaster?.satisfaction || 0,
        health: mlData.service_scores?.social?.satisfaction || 0, // Map social to health
        peace: mlData.service_scores?.safety?.satisfaction || 0, // Map safety to peace
        infrastructure: mlData.service_scores?.business?.satisfaction || 0, // Map business to infrastructure
        environmental: mlData.service_scores?.environmental?.satisfaction || 0,
      };
      
      const serviceScores = validateServiceScores(rawScores);

      // Calculate overall satisfaction
      const scores = Object.values(serviceScores).filter(s => s > 0);
      const overall = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

      // Calculate action grid quadrants
      const actionGrid = calculateActionGrid(mlData.service_scores || {});

      return {
        scores: serviceScores,
        overall,
        actionGrid
      };
    }

    // Fallback: return zeros if ML data not available
    console.warn(`[BARANGAY COMPARISON] ML data not available for barangay ${barangayId}, cycle ${cycleId}`);
    return {
      scores: {
        financial: 0,
        disaster: 0,
        health: 0,
        peace: 0,
        infrastructure: 0,
        environmental: 0,
      },
      overall: 0,
      actionGrid: {
        maintain: [],
        fix_now: [],
        monitor: [],
        low_priority: []
      }
    };

  } catch (error) {
    console.error(`[BARANGAY COMPARISON] Error fetching service scores for barangay ${barangayId}:`, error);
    return {
      scores: {
        financial: 0,
        disaster: 0,
        health: 0,
        peace: 0,
        infrastructure: 0,
        environmental: 0,
      },
      overall: 0,
      actionGrid: {
        maintain: [],
        fix_now: [],
        monitor: [],
        low_priority: []
      }
    };
  }
}

/**
 * Calculate action grid quadrants based on satisfaction and need-action scores
 * Quadrants:
 * - Maintain (High satisfaction, Low need-action): Green
 * - Fix Now (Low satisfaction, High need-action): Red
 * - Monitor (Low satisfaction, Low need-action): Yellow
 * - Low Priority (High satisfaction, High need-action): Gray
 */
function calculateActionGrid(serviceScores: any): ActionGridQuadrant {
  const actionGrid: ActionGridQuadrant = {
    maintain: [],
    fix_now: [],
    monitor: [],
    low_priority: []
  };

  const serviceMapping: { [key: string]: string } = {
    financial: 'Financial Assistance',
    disaster: 'Disaster Preparedness',
    social: 'Health Services',
    safety: 'Peace and Order',
    business: 'Infrastructure',
    environmental: 'Environmental Management'
  };

  Object.entries(serviceScores).forEach(([serviceKey, scores]: [string, any]) => {
    const serviceName = serviceMapping[serviceKey] || serviceKey;
    const satisfaction = scores.satisfaction || 0;
    const needAction = scores.need_action || 0;

    // Determine quadrant based on thresholds
    // High satisfaction: >= 70, Low satisfaction: < 70
    // High need-action: >= 50, Low need-action: < 50
    if (satisfaction >= 70 && needAction < 50) {
      actionGrid.maintain.push(serviceName);
    } else if (satisfaction < 70 && needAction >= 50) {
      actionGrid.fix_now.push(serviceName);
    } else if (satisfaction < 70 && needAction < 50) {
      actionGrid.monitor.push(serviceName);
    } else {
      actionGrid.low_priority.push(serviceName);
    }
  });

  return actionGrid;
}

/**
 * Fetch award data from cycle_awards table
 */
async function fetchAwardData(barangayId: number) {
  try {
    // Get total awards
    const { data: allAwards, error: awardsError } = await supabaseAdmin
      .from('cycle_awards')
      .select('id, cycle_id, is_awardee, awarded_date, survey_cycle!inner(year)')
      .eq('barangay_id', barangayId)
      .eq('is_awardee', true)
      .order('awarded_date', { ascending: false });

    if (awardsError) {
      console.error(`[BARANGAY COMPARISON] Error fetching awards for barangay ${barangayId}:`, awardsError);
      return {
        total: 0,
        consecutive: 0,
        win_rate: 0,
        history: []
      };
    }

    const totalAwards = allAwards?.length || 0;

    // Calculate consecutive awards (consecutive years)
    let consecutiveAwards = 0;
    if (allAwards && allAwards.length > 0) {
      const years = allAwards
        .map((a: any) => a.survey_cycle?.year)
        .filter((y: any) => y !== null && y !== undefined)
        .sort((a: number, b: number) => b - a); // Sort descending

      consecutiveAwards = 1;
      for (let i = 0; i < years.length - 1; i++) {
        if (years[i] - years[i + 1] === 1) {
          consecutiveAwards++;
        } else {
          break;
        }
      }
    }

    // Get total cycles participated
    const { count: totalCycles } = await supabaseAdmin
      .from('survey_response')
      .select('survey_cycle_id', { count: 'exact', head: true })
      .eq('barangay_id', barangayId)
      .not('survey_cycle_id', 'is', null);

    const winRate = totalCycles && totalCycles > 0 
      ? Math.round((totalAwards / totalCycles) * 100) 
      : 0;

    // Format award history
    const history = allAwards?.map((award: any) => ({
      year: award.survey_cycle?.year || 0,
      cycle_id: award.cycle_id,
      awarded_date: award.awarded_date
    })) || [];

    return {
      total: totalAwards,
      consecutive: consecutiveAwards,
      win_rate: winRate,
      history
    };

  } catch (error) {
    console.error(`[BARANGAY COMPARISON] Error fetching award data for barangay ${barangayId}:`, error);
    return {
      total: 0,
      consecutive: 0,
      win_rate: 0,
      history: []
    };
  }
}
