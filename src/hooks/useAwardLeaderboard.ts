import { useState, useEffect, useCallback, useRef } from 'react';

export interface AwardLeaderboardEntry {
  rank: number;
  barangay_id: number;
  name: string;
  total_awards: number;
  consecutive_streak: number;
  longest_streak: number;
  win_rate: number;
  last_award_year: number | null;
  years_since_last_award: number | null;
  first_time_winner: boolean;
  award_history: {
    year: number;
    cycle_id: number;
    award_type: string;
  }[];
}

export interface AwardLeaderboardParams {
  sort_by?: 'total_awards' | 'win_rate' | 'consecutive_streak' | 'last_award';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  year_filter?: number;
  cycle_filter?: number;
}

export interface AwardLeaderboardResponse {
  leaderboard: AwardLeaderboardEntry[];
  total: number;
  params: AwardLeaderboardParams;
}

interface UseAwardLeaderboardReturn {
  data: AwardLeaderboardEntry[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: AwardLeaderboardResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (params: AwardLeaderboardParams): string => {
  return JSON.stringify(params);
};

const getCachedData = (key: string): AwardLeaderboardResponse | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedData = (key: string, data: AwardLeaderboardResponse) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export function useAwardLeaderboard(
  params: AwardLeaderboardParams = {}
): UseAwardLeaderboardReturn {
  const [data, setData] = useState<AwardLeaderboardEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cacheKey = getCacheKey(params);
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      if (isMountedRef.current) {
        setData(cached.leaderboard);
        setTotal(cached.total);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.year_filter) queryParams.append('year_filter', params.year_filter.toString());
      if (params.cycle_filter) queryParams.append('cycle_filter', params.cycle_filter.toString());

      const response = await fetch(`/api/analytics/award-leaderboard?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: AwardLeaderboardResponse = await response.json();

      // Cache the result
      setCachedData(cacheKey, result);

      if (isMountedRef.current) {
        setData(result.leaderboard);
        setTotal(result.total);
      }
    } catch (err) {
      console.error('Error fetching award leaderboard:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch award leaderboard');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [params.sort_by, params.sort_order, params.limit, params.year_filter, params.cycle_filter]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    total,
    loading,
    error,
    refetch: fetchData,
  };
}
