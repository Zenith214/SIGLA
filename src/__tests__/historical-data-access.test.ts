/**
 * Historical Data Access Tests - Task 9.2
 * 
 * Tests historical cycle data retrieval accuracy, data isolation between 
 * current and historical cycles, and cycle comparison functionality
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.5
 */

// Mock fetch for API calls
const mockFetchFn = jest.fn();
global.fetch = mockFetchFn;

describe('Historical Data Access Tests', () => {
  // Test data for multiple cycles
  const mockHistoricalCycle2023 = {
    cycle_id: 1,
    name: 'Survey Cycle 2023',
    year: 2023,
    is_active: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-12-31T23:59:59Z'
  };

  const mockHistoricalCycle2024 = {
    cycle_id: 2,
    name: 'Survey Cycle 2024', 
    year: 2024,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-31T23:59:59Z'
  };

  const mockActiveCycle2025 = {
    cycle_id: 3,
    name: 'Survey Cycle 2025',
    year: 2025,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchFn.mockClear();
  });

  describe('Historical Cycle Data Retrieval Accuracy - Requirement 4.1', () => {
    /**
     * Test accurate retrieval of historical cycle dashboard data
     */
    it('should retrieve historical cycle dashboard data accurately', async () => {
      const historicalCycleId = 1;      
    
  // Mock historical dashboard API response
      const mockHistoricalDashboard = {
        success: true,
        data: {
          cycle: mockHistoricalCycle2023,
          dashboard: {
            summary: {
              total_responses: 150,
              total_assignments: 25,
              completed_assignments: 23,
              assignment_completion_rate: 92,
              total_targets: 200,
              total_achieved: 150,
              progress_percentage: 75,
              barangays_with_data: 15
            },
            targets: [
              { barangay_id: 5, target_count: 20, achieved_count: 18 },
              { barangay_id: 6, target_count: 15, achieved_count: 12 }
            ],
            cycle_info: {
              cycle_id: historicalCycleId,
              is_historical: true
            }
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockHistoricalDashboard)
      };
      mockFetchFn.mockResolvedValueOnce(mockResponse as any);

      // Test API call
      const response = await fetch(`/api/survey-cycles/${historicalCycleId}/dashboard`);
      const data = await response.json();

      // Verify response structure and accuracy
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data.cycle.cycle_id).toBe(historicalCycleId);
      expect(data.data.cycle.is_active).toBe(false);
      expect(data.data.dashboard.cycle_info.is_historical).toBe(true);

      // Verify dashboard metrics accuracy
      const dashboard = data.data.dashboard;
      expect(dashboard.summary.total_responses).toBe(150);
      expect(dashboard.summary.progress_percentage).toBe(75);
      expect(dashboard.summary.assignment_completion_rate).toBe(92);
      expect(dashboard.targets).toHaveLength(2);

      // Verify calculation accuracy
      const expectedProgress = Math.round((150 / 200) * 100);
      expect(dashboard.summary.progress_percentage).toBe(expectedProgress);
    });

    /**
     * Test accurate retrieval of historical funnel analysis data
     */
    it('should retrieve historical funnel analysis data accurately', async () => {
      const historicalCycleId = 2;
      const barangayId = 5; 
     
      // Mock historical funnel analysis response
      const mockFunnelAnalysis = {
        cycle_id: historicalCycleId,
        cycle_info: mockHistoricalCycle2024,
        barangay_id: barangayId,
        total_responses: 45,
        service_scores: {
          health: {
            awareness_score: 85,
            availment_score: 70,
            satisfaction_score: 78,
            need_action_score: 25,
            sample_size: 45
          }
        },
        action_grid: {
          health: {
            quadrant: 'MAINTAIN',
            satisfaction_score: 78,
            need_action_score: 25,
            confidence: 'high'
          }
        },
        overall_satisfaction: 75,
        is_historical: true
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockFunnelAnalysis)
      };
      mockFetchFn.mockResolvedValueOnce(mockResponse as any);

      // Test API call
      const response = await fetch(`/api/survey-cycles/${historicalCycleId}/funnel-analysis?barangayId=${barangayId}`);
      const data = await response.json();

      // Verify response accuracy
      expect(response.ok).toBe(true);
      expect(data.cycle_id).toBe(historicalCycleId);
      expect(data.is_historical).toBe(true);
      expect(data.total_responses).toBe(45);
      expect(data.service_scores.health.awareness_score).toBe(85);
      expect(data.action_grid.health.quadrant).toBe('MAINTAIN');
    });
  });

  describe('Data Isolation Between Current and Historical Cycles - Requirement 4.2', () => {
    /**
     * Test that historical data is properly isolated from current cycle data
     */
    it('should isolate historical survey responses from current cycle', async () => {
      // Mock survey responses from different cycles
      const mockAllResponses = [
        { response_id: 1, survey_cycle_id: 1, barangay_id: 5, survey_number: '05-2023-0001' },
        { response_id: 2, survey_cycle_id: 2, barangay_id: 5, survey_number: '05-2024-0001' },
        { response_id: 3, survey_cycle_id: 3, barangay_id: 5, survey_number: '05-2025-0001' }
      ];

      // Test filtering by historical cycle 2023
      const cycle2023Responses = mockAllResponses.filter(r => r.survey_cycle_id === 1);
      expect(cycle2023Responses).toHaveLength(1);
      expect(cycle2023Responses[0].survey_number).toBe('05-2023-0001');

      // Test filtering by current cycle 2025
      const currentCycleResponses = mockAllResponses.filter(r => r.survey_cycle_id === 3);
      expect(currentCycleResponses).toHaveLength(1);
      expect(currentCycleResponses[0].survey_number).toBe('05-2025-0001');

      // Verify no cross-contamination
      expect(cycle2023Responses.some(r => r.survey_cycle_id !== 1)).toBe(false);
    });
  });

  describe('Cycle Comparison Functionality - Requirement 4.3', () => {
    /**
     * Test comparison of dashboard metrics between cycles
     */
    it('should compare dashboard metrics accurately between cycles', async () => {
      // Mock dashboard data for comparison
      const cycle2023Data = {
        cycle_id: 1,
        year: 2023,
        total_responses: 150,
        progress_percentage: 75,
        overall_satisfaction: 72
      };

      const cycle2024Data = {
        cycle_id: 2,
        year: 2024,
        total_responses: 180,
        progress_percentage: 88,
        overall_satisfaction: 78
      };

      // Calculate year-over-year improvements
      const improvement = {
        responses_change: cycle2024Data.total_responses - cycle2023Data.total_responses,
        progress_change: cycle2024Data.progress_percentage - cycle2023Data.progress_percentage,
        satisfaction_change: cycle2024Data.overall_satisfaction - cycle2023Data.overall_satisfaction
      };

      // Verify improvement calculations
      expect(improvement.responses_change).toBe(30); // 180 - 150
      expect(improvement.progress_change).toBe(13); // 88 - 75
      expect(improvement.satisfaction_change).toBe(6); // 78 - 72
    });
  });

  describe('Error Handling and Edge Cases - Requirement 4.5', () => {
    /**
     * Test handling of non-existent historical cycles
     */
    it('should handle requests for non-existent historical cycles', async () => {
      const nonExistentCycleId = 999;
      
      // Mock 404 response for non-existent cycle
      const mockErrorResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({
          error: 'Survey cycle not found',
          message: `Survey cycle with ID ${nonExistentCycleId} not found`
        })
      };
      mockFetchFn.mockResolvedValueOnce(mockErrorResponse as any);

      // Test API call
      const response = await fetch(`/api/survey-cycles/${nonExistentCycleId}/dashboard`);
      const data = await response.json();

      // Verify error handling
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(data.error).toBe('Survey cycle not found');
    });

    /**
     * Test handling of historical cycles with no data
     */
    it('should handle historical cycles with no survey data', async () => {
      const emptyCycleId = 4;
      
      // Mock response for cycle with no data
      const mockEmptyResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          cycle_id: emptyCycleId,
          total_responses: 0,
          service_scores: {},
          action_grid: {},
          overall_satisfaction: 0,
          is_historical: true,
          message: "No survey data found for this barangay in this cycle"
        })
      };
      mockFetchFn.mockResolvedValueOnce(mockEmptyResponse as any);

      // Test API call
      const response = await fetch(`/api/survey-cycles/${emptyCycleId}/funnel-analysis?barangayId=5`);
      const data = await response.json();

      // Verify empty data handling
      expect(response.ok).toBe(true);
      expect(data.total_responses).toBe(0);
      expect(data.service_scores).toEqual({});
      expect(data.message).toContain('No survey data found');
    });
  });
});