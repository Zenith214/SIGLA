import { useSurveyCycle as useContext } from '@/contexts/SurveyCycleContext';

// Re-export the context hook for convenience
export const useSurveyCycle = useContext;

// Additional hook for checking if there's an active cycle
export function useActiveCycle() {
  const { activeCycle, loading, error } = useContext();
  
  return {
    activeCycle,
    hasActiveCycle: !!activeCycle,
    loading,
    error,
    cycleId: activeCycle?.cycle_id || null,
    cycleName: activeCycle?.name || null,
    cycleYear: activeCycle?.year || null,
  };
}

// Hook for admin cycle management
export function useCycleManagement() {
  const context = useContext();
  
  return {
    ...context,
    // Helper method to check if a cycle can be activated
    canActivateCycle: (cycleId: number) => {
      const cycle = context.allCycles.find(c => c.cycle_id === cycleId);
      return cycle && !cycle.is_active;
    },
    // Helper to get cycle by ID
    getCycleById: (cycleId: number) => {
      return context.allCycles.find(c => c.cycle_id === cycleId) || null;
    },
  };
}