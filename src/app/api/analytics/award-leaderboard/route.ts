import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { apiCache } from '@/lib/cache';
import {
  createErrorResponse,
  withRetry,
  handleDatabaseError,
} from '@/lib/api-error-handler';
import {
  AwardLeaderboardQuerySchema,
  validateQueryParams,
} from '@/lib/api-validators';

const ENDPOINT = '/api/analytics/award-leaderboard';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const validation = validateQueryParams(AwardLeaderboardQuerySchema, searchParams);
    
    if (!validation.success) {
      throw validation.error;
    }

    const params = validation.data;

    // Check cache
    const cacheKey = apiCache.generateKey('award-leaderboard', params);
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`[AWARD LEADERBOARD] Cache hit for key: ${cacheKey}`);
      return NextResponse.json(cached);
    }

    // Build the base query for award statistics with retry logic
    const result = await withRetry(
      async () => {
        const response = await supabaseAdmin.rpc('get_award_leaderboard', {
          p_year_filter: params.year_filter || null,
          p_cycle_filter: params.cycle_filter || null,
        });
        return response;
      },
      {
        maxRetries: 2,
        retryDelay: 500,
        onRetry: (attempt, error) => {
          console.warn(`[AWARD LEADERBOARD] Retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const { data: leaderboardData, error: leaderboardError } = result as any;

    if (leaderboardError) {
      throw handleDatabaseError(leaderboardError, 'fetch award leaderboard');
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      return NextResponse.json({ 
        leaderboard: [],
        total: 0,
        params 
      });
    }

    // Map database column names (with _out suffix) to expected names
    const mappedData = leaderboardData.map((entry: any) => ({
      barangay_id: entry.barangay_id_out,
      name: entry.name_out,
      total_awards: entry.total_awards_out,
      consecutive_streak: entry.consecutive_streak_out,
      longest_streak: entry.longest_streak_out,
      win_rate: entry.win_rate_out,
      last_award_year: entry.last_award_year_out,
      years_since_last_award: entry.years_since_last_award_out,
      first_time_winner: entry.first_time_winner_out,
      award_history: entry.award_history_out,
    }));

    // Sort the data based on parameters
    const sortedData = [...mappedData].sort((a, b) => {
      let comparison = 0;
      
      switch (params.sort_by) {
        case 'total_awards':
          comparison = (b.total_awards || 0) - (a.total_awards || 0);
          break;
        case 'win_rate':
          comparison = (b.win_rate || 0) - (a.win_rate || 0);
          break;
        case 'consecutive_streak':
          comparison = (b.consecutive_streak || 0) - (a.consecutive_streak || 0);
          break;
        case 'last_award':
          comparison = (b.last_award_year || 0) - (a.last_award_year || 0);
          break;
      }
      
      return params.sort_order === 'asc' ? -comparison : comparison;
    });

    // Add rank to each entry
    const rankedData = sortedData.slice(0, params.limit).map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    const response = {
      leaderboard: rankedData,
      total: sortedData.length,
      params,
    };

    // Cache the response
    apiCache.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    return createErrorResponse(error, ENDPOINT, {
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
      limit: searchParams.get('limit'),
    });
  }
}
