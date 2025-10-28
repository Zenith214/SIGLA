"use client";

/**
 * Analytics Context
 * 
 * Provides shared state for analytics dashboard components
 * Manages current cycle, barangays, and cycles data
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface Barangay {
  barangay_id: number;
  barangay_name: string;
  is_active: boolean;
}

export interface SurveyCycle {
  cycle_id: number;
  name: string;
  year: number;
  status: string;
  start_date: string;
  end_date: string;
}

interface AnalyticsContextType {
  currentCycleId: number | null;
  setCurrentCycleId: (id: number) => void;
  barangays: Barangay[];
  cycles: SurveyCycle[];
  loading: boolean;
  error: string | null;
  refreshBarangays: () => Promise<void>;
  refreshCycles: () => Promise<void>;
}

// ============================================================================
// Context Creation
// ============================================================================

const AnalyticsContext = createContext<AnalyticsContextType>({
  currentCycleId: null,
  setCurrentCycleId: () => {},
  barangays: [],
  cycles: [],
  loading: true,
  error: null,
  refreshBarangays: async () => {},
  refreshCycles: async () => {},
});

// ============================================================================
// Custom Hook
// ============================================================================

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

interface AnalyticsProviderProps {
  children: React.ReactNode;
  initialCycleId?: number;
}

export function AnalyticsProvider({ children, initialCycleId }: AnalyticsProviderProps) {
  const [currentCycleId, setCurrentCycleId] = useState<number | null>(initialCycleId || null);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [cycles, setCycles] = useState<SurveyCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all barangays
   */
  const refreshBarangays = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/tools/check-barangay-ids');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.barangays) {
          // Transform the data to match our Barangay interface
          const transformedBarangays: Barangay[] = data.barangays.map((b: any) => ({
            barangay_id: b.barangay_id,
            barangay_name: b.barangay_name,
            is_active: b.is_active,
          }));
          setBarangays(transformedBarangays);
        }
      } else if (response.status === 401) {
        // User not authenticated - clear state silently
        setBarangays([]);
        setError(null);
        return;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch barangays');
      }
    } catch (error) {
      // Only log errors if it's not a network/auth issue
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Failed to refresh barangays:', error);
        setError(error.message);
      }
      setBarangays([]);
    }
  }, []);

  /**
   * Fetch all survey cycles
   */
  const refreshCycles = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/survey-cycles');
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setCycles(data.data);
          
          // If no current cycle is set, use the most recent one
          if (!currentCycleId && data.data.length > 0) {
            // Find active cycle or use the most recent
            const activeCycle = data.data.find((c: SurveyCycle) => c.status === 'active');
            const mostRecentCycle = data.data[0]; // Assuming sorted by date desc
            setCurrentCycleId(activeCycle?.cycle_id || mostRecentCycle?.cycle_id || null);
          }
        }
      } else if (response.status === 401) {
        // User not authenticated - clear state silently
        setCycles([]);
        setError(null);
        return;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch cycles');
      }
    } catch (error) {
      // Only log errors if it's not a network/auth issue
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Failed to refresh cycles:', error);
        setError(error.message);
      }
      setCycles([]);
    }
  }, [currentCycleId]);

  /**
   * Initial data loading
   */
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load barangays and cycles in parallel
        await Promise.all([
          refreshBarangays(),
          refreshCycles()
        ]);
      } catch (error) {
        console.error('Failed to load initial analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [refreshBarangays, refreshCycles]);

  const value: AnalyticsContextType = {
    currentCycleId,
    setCurrentCycleId,
    barangays,
    cycles,
    loading,
    error,
    refreshBarangays,
    refreshCycles,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export default AnalyticsContext;
