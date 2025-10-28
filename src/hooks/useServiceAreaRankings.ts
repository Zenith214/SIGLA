import { useState, useEffect, useCallback } from 'react';
import { ServiceAreaType, ServiceAreaRanking } from '@/types/analytics';

interface UseServiceAreaRankingsOptions {
  serviceArea: ServiceAreaType;
  cycleId: number;
  enabled?: boolean;
}

interface UseServiceAreaRankingsResult {
  rankings: ServiceAreaRanking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: ServiceAreaRanking[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useServiceAreaRankings({
  serviceArea,
  cycleId,
  enabled = true
}: UseServiceAreaRankingsOptions): UseServiceAreaRankingsResult {
  const [rankings, setRankings] = useState<ServiceAreaRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    if (!enabled || !serviceArea || !cycleId) {
      return;
    }

    const cacheKey = `rankings-${serviceArea}-${cycleId}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[useServiceAreaRankings] Using cached data');
      setRankings(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics/service-area-rankings?service_area=${serviceArea}&cycle_id=${cycleId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rankings');
      }

      const data = await response.json();
      
      if (data.success && data.rankings) {
        setRankings(data.rankings);
        
        // Update cache
        cache.set(cacheKey, {
          data: data.rankings,
          timestamp: Date.now()
        });
      } else {
        setRankings([]);
      }
    } catch (err) {
      console.error('[useServiceAreaRankings] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rankings');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [serviceArea, cycleId, enabled]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return {
    rankings,
    loading,
    error,
    refetch: fetchRankings
  };
}
