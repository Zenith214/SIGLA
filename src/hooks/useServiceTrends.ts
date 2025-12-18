import { useState, useEffect, useCallback } from 'react';
import { ServiceAreaType, ServiceTrendData } from '@/types/analytics';

interface UseServiceTrendsOptions {
  serviceArea: ServiceAreaType;
  barangayId?: number;
  enabled?: boolean;
}

interface UseServiceTrendsResult {
  trends: ServiceTrendData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: ServiceTrendData[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useServiceTrends({
  serviceArea,
  barangayId,
  enabled = true
}: UseServiceTrendsOptions): UseServiceTrendsResult {
  const [trends, setTrends] = useState<ServiceTrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    if (!enabled || !serviceArea) {
      return;
    }

    const cacheKey = `trends-${serviceArea}-${barangayId || 'all'}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[useServiceTrends] Using cached data');
      setTrends(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/analytics/service-trends', window.location.origin);
      url.searchParams.set('service_area', serviceArea);
      if (barangayId) {
        url.searchParams.set('barangay_id', barangayId.toString());
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trends');
      }

      const data = await response.json();
      
      if (data.success && data.trends) {
        setTrends(data.trends);
        
        // Update cache
        cache.set(cacheKey, {
          data: data.trends,
          timestamp: Date.now()
        });
      } else {
        setTrends([]);
      }
    } catch (err) {
      console.error('[useServiceTrends] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }, [serviceArea, barangayId, enabled]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    trends,
    loading,
    error,
    refetch: fetchTrends
  };
}
