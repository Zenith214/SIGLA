import { useState, useCallback, useRef } from 'react';

interface ServiceScores {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
}

interface ActionGrid {
  maintain: string[];
  fix_now: string[];
  monitor: string[];
  low_priority: string[];
}

interface AwardData {
  total: number;
  consecutive: number;
  win_rate: number;
  history: {
    year: number;
    cycle_id: number;
    awarded_date: string | null;
  }[];
}

export interface BarangayComparisonData {
  barangay_id: number;
  name: string;
  service_scores: ServiceScores;
  overall_satisfaction: number;
  action_grid: ActionGrid;
  awards: AwardData;
}

interface UseBarangayComparisonOptions {
  cycleId: number;
  onError?: (error: string) => void;
}

interface UseBarangayComparisonReturn {
  data: BarangayComparisonData[] | null;
  loading: boolean;
  error: string | null;
  fetchComparison: (barangayIds: number[]) => Promise<void>;
  refetch: () => Promise<void>;
  clearData: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for fetching barangay comparison data
 * Handles data fetching, loading states, error handling, and caching
 */
export function useBarangayComparison(
  options: UseBarangayComparisonOptions
): UseBarangayComparisonReturn {
  const { cycleId, onError } = options;
  
  const [data, setData] = useState<BarangayComparisonData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store last request params for refetch
  const lastRequestRef = useRef<number[] | null>(null);

  const fetchComparison = useCallback(
    async (barangayIds: number[]) => {
      // Validation: 2-5 barangays
      if (barangayIds.length < 2) {
        const errorMsg = 'Please select at least 2 barangays to compare';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (barangayIds.length > 5) {
        const errorMsg = 'Maximum 5 barangays can be compared at once';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      // Check cache
      const cacheKey = `comparison-${cycleId}-${barangayIds.sort().join(',')}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('[useBarangayComparison] Using cached data');
        setData(cached.data);
        setError(null);
        lastRequestRef.current = barangayIds;
        return;
      }

      setLoading(true);
      setError(null);
      lastRequestRef.current = barangayIds;

      try {
        const response = await fetch('/api/analytics/barangay-comparison', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            barangay_ids: barangayIds,
            cycle_id: cycleId,
            metrics: ['service_scores', 'awards']
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.barangays) {
          setData(result.barangays);
          
          // Cache the result
          cache.set(cacheKey, {
            data: result.barangays,
            timestamp: Date.now()
          });
          
          console.log('[useBarangayComparison] Successfully fetched comparison data');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch comparison data';
        console.error('[useBarangayComparison] Error:', errorMsg);
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [cycleId, onError]
  );

  const refetch = useCallback(async () => {
    if (lastRequestRef.current) {
      // Clear cache for this request
      const cacheKey = `comparison-${cycleId}-${lastRequestRef.current.sort().join(',')}`;
      cache.delete(cacheKey);
      
      await fetchComparison(lastRequestRef.current);
    }
  }, [cycleId, fetchComparison]);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    lastRequestRef.current = null;
  }, []);

  return {
    data,
    loading,
    error,
    fetchComparison,
    refetch,
    clearData
  };
}
