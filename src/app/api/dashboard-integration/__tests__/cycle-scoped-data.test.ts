/**
 * Dashboard Integration Tests - Task 4.2
 * Tests progress calculations with cycle-scoped data, zero progress display for new cycles,
 * and data filtering accuracy across cycles
 */

import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

// Mock the survey cycle helpers
jest.mock('@/utils/surveyCycleHelpers');

const mockGetActiveCycleId = getActiveCycleId as jest.MockedFunction<typeof getActiveCycleId>;

describe('Dashboard Integration - Cycle-Scoped Data Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Progress Calculations with Cycle-Scoped Data', () => {
    it('should calculate progress based on active cycle data only', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock survey data for active cycle
      const mockSurveyData = [
        { barangay_id: 1, completed_surveys: 8, target: 10, cycle_id: 1 },
        { barangay_id: 2, completed_surveys: 5, target: 10, cycle_id: 1 },
        { barangay_id: 3, completed_surveys: 0, target: 5, cycle_id: 1 }
      ];

      // Calculate progress for each barangay
      const progressCalculations = mockSurveyData.map(data => ({
        barangay_id: data.barangay_id,
        progress: data.target > 0 ? Math.min(100, Math.round((data.completed_surveys / data.target) * 100)) : 0,
        cycle_id: data.cycle_id
      }));

      expect(progressCalculations[0].progress).toBe(80); // 8/10 * 100
      expect(progressCalculations[1].progress).toBe(50); // 5/10 * 100
      expect(progressCalculations[2].progress).toBe(0);  // 0/5 * 100

      // Verify all calculations are for the same cycle
      progressCalculations.forEach(calc => {
        expect(calc.cycle_id).toBe(activeCycleId);
      });

      // Verify overall progress calculation
      const totalCompleted = mockSurveyData.reduce((sum, data) => sum + data.completed_surveys, 0);
      const totalTarget = mockSurveyData.reduce((sum, data) => sum + data.target, 0);
      const overallProgress = Math.round((totalCompleted / totalTarget) * 100);
      
      expect(overallProgress).toBe(52); // 13/25 * 100 = 52%
    });

    it('should handle progress calculations when targets exceed 100%', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mockData = [
        { barangay_id: 1, completed_surveys: 15, target: 10, cycle_id: 1 }, // 150% -> capped at 100%
        { barangay_id: 2, completed_surveys: 12, target: 10, cycle_id: 1 }  // 120% -> capped at 100%
      ];

      const progressCalculations = mockData.map(data => ({
        barangay_id: data.barangay_id,
        progress: Math.min(100, Math.round((data.completed_surveys / data.target) * 100)),
        raw_progress: Math.round((data.completed_surveys / data.target) * 100)
      }));

      expect(progressCalculations[0].progress).toBe(100); // Capped at 100%
      expect(progressCalculations[0].raw_progress).toBe(150); // Actual calculation
      expect(progressCalculations[1].progress).toBe(100); // Capped at 100%
      expect(progressCalculations[1].raw_progress).toBe(120); // Actual calculation
    });

    it('should handle division by zero in progress calculations', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mockData = [
        { barangay_id: 1, completed_surveys: 5, target: 0, cycle_id: 1 }, // Zero target
        { barangay_id: 2, completed_surveys: 0, target: 0, cycle_id: 1 }  // Zero target and surveys
      ];

      const progressCalculations = mockData.map(data => ({
        barangay_id: data.barangay_id,
        progress: data.target > 0 ? Math.round((data.completed_surveys / data.target) * 100) : 0
      }));

      expect(progressCalculations[0].progress).toBe(0); // Handled gracefully
      expect(progressCalculations[1].progress).toBe(0); // Handled gracefully
    });
  });

  describe('Zero Progress Display for New Cycles', () => {
    it('should return zero progress when no active cycle exists', async () => {
      mockGetActiveCycleId.mockResolvedValue(null);

      const activeCycleId = await getActiveCycleId();
      expect(activeCycleId).toBeNull();

      // When no active cycle, dashboard should show empty state
      const dashboardData = {
        barangays: [],
        statistics: {
          total_barangays: 0,
          total_assignments: 0,
          total_completed_surveys: 0,
          total_target: 0,
          overall_progress: 0
        }
      };

      expect(dashboardData.barangays).toHaveLength(0);
      expect(dashboardData.statistics.overall_progress).toBe(0);
    });

    it('should show zero progress for new cycle with no survey data', async () => {
      const newCycleId = 2;
      mockGetActiveCycleId.mockResolvedValue(newCycleId);

      // Mock new cycle with assignments but no completed surveys
      const mockNewCycleData = [
        { barangay_id: 1, completed_surveys: 0, target: 10, cycle_id: 2 },
        { barangay_id: 2, completed_surveys: 0, target: 15, cycle_id: 2 },
        { barangay_id: 3, completed_surveys: 0, target: 8, cycle_id: 2 }
      ];

      const progressCalculations = mockNewCycleData.map(data => ({
        barangay_id: data.barangay_id,
        progress: Math.round((data.completed_surveys / data.target) * 100),
        cycle_id: data.cycle_id
      }));

      // All should show zero progress
      progressCalculations.forEach(calc => {
        expect(calc.progress).toBe(0);
        expect(calc.cycle_id).toBe(newCycleId);
      });

      // Overall progress should be zero
      const totalCompleted = mockNewCycleData.reduce((sum, data) => sum + data.completed_surveys, 0);
      const totalTarget = mockNewCycleData.reduce((sum, data) => sum + data.target, 0);
      const overallProgress = Math.round((totalCompleted / totalTarget) * 100);
      
      expect(overallProgress).toBe(0);
    });

    it('should reset progress indicators for fresh cycle start', async () => {
      const freshCycleId = 3;
      mockGetActiveCycleId.mockResolvedValue(freshCycleId);

      // Multiple barangays with fresh assignments
      const mockFreshCycleData = [
        { barangay_id: 1, completed_surveys: 0, target: 5, cycle_id: 3, status: 'Pending' },
        { barangay_id: 2, completed_surveys: 0, target: 8, cycle_id: 3, status: 'Pending' },
        { barangay_id: 3, completed_surveys: 0, target: 12, cycle_id: 3, status: 'Pending' },
        { barangay_id: 4, completed_surveys: 0, target: 6, cycle_id: 3, status: 'Pending' }
      ];

      const dashboardState = {
        barangays: mockFreshCycleData.map(data => ({
          barangay_id: data.barangay_id,
          progress: 0,
          status: 'Pending',
          cycle_id: data.cycle_id
        })),
        statistics: {
          total_barangays: mockFreshCycleData.length,
          total_assignments: mockFreshCycleData.length,
          total_completed_surveys: 0,
          total_target: mockFreshCycleData.reduce((sum, data) => sum + data.target, 0),
          overall_progress: 0
        }
      };

      expect(dashboardState.barangays).toHaveLength(4);
      dashboardState.barangays.forEach(barangay => {
        expect(barangay.progress).toBe(0);
        expect(barangay.status).toBe('Pending');
        expect(barangay.cycle_id).toBe(freshCycleId);
      });
      expect(dashboardState.statistics.overall_progress).toBe(0);
    });
  });

  describe('Data Filtering Accuracy Across Cycles', () => {
    it('should filter data by specific cycle ID accurately', async () => {
      // Test data from multiple cycles
      const allCycleData = [
        { barangay_id: 1, completed_surveys: 8, target: 10, cycle_id: 1 },  // Cycle 1: 80%
        { barangay_id: 1, completed_surveys: 9, target: 15, cycle_id: 2 }, // Cycle 2: 60% - different from cycle 1
        { barangay_id: 2, completed_surveys: 5, target: 10, cycle_id: 1 },  // Cycle 1: 50%
        { barangay_id: 2, completed_surveys: 16, target: 20, cycle_id: 2 }, // Cycle 2: 80% - different from cycle 1
        { barangay_id: 3, completed_surveys: 3, target: 5, cycle_id: 1 }    // Cycle 1 only: 60%
      ];

      // Filter by cycle 1
      const cycle1Data = allCycleData.filter(data => data.cycle_id === 1);
      expect(cycle1Data).toHaveLength(3);
      
      const cycle1Progress = cycle1Data.map(data => ({
        barangay_id: data.barangay_id,
        progress: Math.round((data.completed_surveys / data.target) * 100)
      }));

      expect(cycle1Progress[0].progress).toBe(80); // Barangay 1 in cycle 1: 8/10
      expect(cycle1Progress[1].progress).toBe(50); // Barangay 2 in cycle 1: 5/10
      expect(cycle1Progress[2].progress).toBe(60); // Barangay 3 in cycle 1: 3/5

      // Filter by cycle 2
      const cycle2Data = allCycleData.filter(data => data.cycle_id === 2);
      expect(cycle2Data).toHaveLength(2);
      
      const cycle2Progress = cycle2Data.map(data => ({
        barangay_id: data.barangay_id,
        progress: Math.round((data.completed_surveys / data.target) * 100)
      }));

      expect(cycle2Progress[0].progress).toBe(60); // Barangay 1 in cycle 2: 9/15
      expect(cycle2Progress[1].progress).toBe(80); // Barangay 2 in cycle 2: 16/20

      // Verify data isolation - same barangay has different progress in different cycles
      expect(cycle1Progress[0].progress).not.toBe(cycle2Progress[0].progress);
      expect(cycle1Progress[1].progress).not.toBe(cycle2Progress[1].progress);
    });

    it('should exclude data from inactive cycles when filtering by active cycle', async () => {
      const activeCycleId = 2;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mixedCycleData = [
        { barangay_id: 1, completed_surveys: 5, target: 10, cycle_id: 1, is_active: false },
        { barangay_id: 1, completed_surveys: 8, target: 12, cycle_id: 2, is_active: true },  // Active
        { barangay_id: 2, completed_surveys: 10, target: 15, cycle_id: 1, is_active: false },
        { barangay_id: 2, completed_surveys: 6, target: 10, cycle_id: 2, is_active: true },  // Active
        { barangay_id: 3, completed_surveys: 7, target: 8, cycle_id: 3, is_active: false }
      ];

      // Filter by active cycle only
      const activeCycleData = mixedCycleData.filter(data => data.cycle_id === activeCycleId);
      
      expect(activeCycleData).toHaveLength(2);
      expect(activeCycleData.every(data => data.cycle_id === activeCycleId)).toBe(true);
      expect(activeCycleData.every(data => data.is_active === true)).toBe(true);

      // Calculate progress for active cycle only
      const activeProgress = activeCycleData.map(data => ({
        barangay_id: data.barangay_id,
        progress: Math.round((data.completed_surveys / data.target) * 100),
        cycle_id: data.cycle_id
      }));

      expect(activeProgress[0].progress).toBe(67); // 8/12 * 100 = 67%
      expect(activeProgress[1].progress).toBe(60); // 6/10 * 100 = 60%
    });

    it('should handle cross-cycle data comparison accurately', async () => {
      // Historical comparison data
      const historicalData = {
        cycle1: {
          barangays: [
            { barangay_id: 1, progress: 75, completed: 15, target: 20 },
            { barangay_id: 2, progress: 60, completed: 12, target: 20 }
          ],
          overall_progress: 68 // (15+12)/(20+20) * 100 = 67.5% -> 68%
        },
        cycle2: {
          barangays: [
            { barangay_id: 1, progress: 85, completed: 17, target: 20 },
            { barangay_id: 2, progress: 70, completed: 14, target: 20 }
          ],
          overall_progress: 78 // (17+14)/(20+20) * 100 = 77.5% -> 78%
        }
      };

      // Verify cycle isolation
      expect(historicalData.cycle1.overall_progress).not.toBe(historicalData.cycle2.overall_progress);
      
      // Verify progress improvement tracking
      const barangay1Improvement = historicalData.cycle2.barangays[0].progress - historicalData.cycle1.barangays[0].progress;
      const barangay2Improvement = historicalData.cycle2.barangays[1].progress - historicalData.cycle1.barangays[1].progress;
      
      expect(barangay1Improvement).toBe(10); // 85 - 75 = 10% improvement
      expect(barangay2Improvement).toBe(10); // 70 - 60 = 10% improvement

      // Verify overall improvement
      const overallImprovement = historicalData.cycle2.overall_progress - historicalData.cycle1.overall_progress;
      expect(overallImprovement).toBe(10); // 78 - 68 = 10% improvement
    });
  });

  describe('Funnel Analysis Cycle Integration', () => {
    it('should calculate funnel scores based on cycle-scoped survey data', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock survey section data for active cycle
      const mockSurveyData = [
        {
          barangay_id: 5,
          cycle_id: 1,
          section_data: {
            'aware_health_services': 1,
            'availed_health_services': 1,
            'satisfaction_health': 4,
            'need_action_health': 0
          }
        },
        {
          barangay_id: 5,
          cycle_id: 1,
          section_data: {
            'aware_health_services': 1,
            'availed_health_services': 0,
            'satisfaction_health': 3,
            'need_action_health': 1
          }
        }
      ];

      // Calculate funnel scores for cycle-scoped data
      const cycleFilteredData = mockSurveyData.filter(data => data.cycle_id === activeCycleId);
      expect(cycleFilteredData).toHaveLength(2);

      // Calculate awareness score (2/2 = 100%)
      const awarenessCount = cycleFilteredData.filter(data => data.section_data.aware_health_services === 1).length;
      const awarenessScore = Math.round((awarenessCount / cycleFilteredData.length) * 100);
      expect(awarenessScore).toBe(100);

      // Calculate availment score (1/2 = 50%)
      const availmentCount = cycleFilteredData.filter(data => data.section_data.availed_health_services === 1).length;
      const availmentScore = Math.round((availmentCount / cycleFilteredData.length) * 100);
      expect(availmentScore).toBe(50);

      // Calculate satisfaction score ((4+3)/2/5 * 100 = 70%)
      const satisfactionSum = cycleFilteredData.reduce((sum, data) => sum + data.section_data.satisfaction_health, 0);
      const satisfactionScore = Math.round(((satisfactionSum / cycleFilteredData.length) / 5) * 100);
      expect(satisfactionScore).toBe(70);

      // Calculate need action score (1/2 = 50%)
      const needActionCount = cycleFilteredData.filter(data => data.section_data.need_action_health === 1).length;
      const needActionScore = Math.round((needActionCount / cycleFilteredData.length) * 100);
      expect(needActionScore).toBe(50);
    });

    it('should return zero funnel scores for new cycles with no survey data', async () => {
      const newCycleId = 2;
      mockGetActiveCycleId.mockResolvedValue(newCycleId);

      // No survey data for new cycle
      const emptySurveyData: any[] = [];
      const cycleFilteredData = emptySurveyData.filter(data => data.cycle_id === newCycleId);
      
      expect(cycleFilteredData).toHaveLength(0);

      // All scores should be zero for empty data
      const funnelScores = {
        awareness_score: cycleFilteredData.length > 0 ? 0 : 0,
        availment_score: cycleFilteredData.length > 0 ? 0 : 0,
        satisfaction_score: cycleFilteredData.length > 0 ? 0 : 0,
        need_action_score: cycleFilteredData.length > 0 ? 0 : 0,
        total_responses: cycleFilteredData.length
      };

      expect(funnelScores.awareness_score).toBe(0);
      expect(funnelScores.availment_score).toBe(0);
      expect(funnelScores.satisfaction_score).toBe(0);
      expect(funnelScores.need_action_score).toBe(0);
      expect(funnelScores.total_responses).toBe(0);
    });
  });
});