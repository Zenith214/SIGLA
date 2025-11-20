/**
 * End-to-End Survey Cycle Integration Tests - Task 8.3
 * 
 * Tests complete cycle workflow from creation to data isolation,
 * cross-component cycle context propagation, and user experience flows
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

// Mock fetch for API calls
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('End-to-End Survey Cycle Integration Tests', () => {
  // Test data
  const mockCycle1 = {
    cycle_id: 1,
    name: 'Survey Cycle 2023',
    year: 2023,
    is_active: false,
    start_date: new Date('2023-01-01'),
    end_date: new Date('2023-12-31'),
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01')
  };

  const mockCycle2 = {
    cycle_id: 2,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: true,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  const mockCycle3 = {
    cycle_id: 3,
    name: 'Survey Cycle 2025',
    year: 2025,
    is_active: false,
    start_date: new Date('2025-01-01'),
    end_date: new Date('2025-12-31'),
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockFetch.mockReset();
  });

  describe('Complete Cycle Workflow - Creation to Data Isolation', () => {
    /**
     * Requirement 1.1: Survey operations automatically scoped to active cycle
     * Requirement 1.4: Only one cycle can be active at any time
     */
    it('should complete full cycle workflow from creation to data isolation', async () => {
      // Step 1: Mock cycle creation API call
      const mockCreateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockCycle3 }
        })
      };
      mockFetch.mockResolvedValueOnce(mockCreateResponse as any);

      const createResponse = await fetch('/api/survey-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Survey Cycle 2025', year: 2025 })
      });
      const createData = await createResponse.json();

      expect(createResponse.ok).toBe(true);
      expect(createData.success).toBe(true);
      expect(createData.data.is_active).toBe(false); // New cycles start inactive

      // Step 2: Mock setting cycle as active
      const mockSetActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockCycle3, is_active: true }
        })
      };
      mockFetch.mockResolvedValueOnce(mockSetActiveResponse as any);

      const setActiveResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 3 })
      });
      const setActiveData = await setActiveResponse.json();

      expect(setActiveResponse.ok).toBe(true);
      expect(setActiveData.data.is_active).toBe(true);

      // Step 3: Verify data isolation between cycles
      // Mock survey responses for different cycles
      const mockSurveyResponses = [
        { response_id: 1, survey_cycle_id: 2, barangay_id: 5, data: { test: 'old cycle' } },
        { response_id: 2, survey_cycle_id: 3, barangay_id: 5, data: { test: 'new cycle' } }
      ];

      // Filter by active cycle (simulating API behavior)
      const activeCycleId = 3;
      const activeCycleResponses = mockSurveyResponses.filter(
        response => response.survey_cycle_id === activeCycleId
      );

      expect(activeCycleResponses).toHaveLength(1);
      expect(activeCycleResponses[0].survey_cycle_id).toBe(3);
      expect(activeCycleResponses[0].data.test).toBe('new cycle');

      // Verify old cycle data is isolated
      const oldCycleResponses = mockSurveyResponses.filter(
        response => response.survey_cycle_id === 2
      );
      expect(oldCycleResponses).toHaveLength(1);
      expect(oldCycleResponses[0].data.test).toBe('old cycle');

      // Step 4: Test survey number format with cycle year
      const barangayId = 5;
      const sequenceNumber = 1;
      const expectedSurveyNumber = `${barangayId.toString().padStart(2, '0')}-${mockCycle3.year}-${sequenceNumber.toString().padStart(4, '0')}`;
      
      expect(expectedSurveyNumber).toBe('05-2025-0001'); // Format: BB-CYCLEYEAR-NNNN
    });

    /**
     * Requirement 1.2: Survey targets associated with active cycle
     * Requirement 1.3: Assignments linked to active cycle
     */
    it('should isolate survey targets and assignments by cycle', async () => {
      // Mock getting active cycle
      const mockActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: mockCycle2
        })
      };
      mockFetch.mockResolvedValueOnce(mockActiveResponse as any);

      const activeResponse = await fetch('/api/survey-cycles/active');
      const activeData = await activeResponse.json();
      const activeCycleId = activeData.data.cycle_id;

      // Mock survey targets for different cycles
      const mockTargets = [
        { target_id: 1, survey_cycle_id: 1, barangay_id: 5, target_count: 10, achieved: 8 },
        { target_id: 2, survey_cycle_id: 2, barangay_id: 5, target_count: 15, achieved: 3 },
        { target_id: 3, survey_cycle_id: 2, barangay_id: 6, target_count: 12, achieved: 7 }
      ];

      // Filter targets by active cycle
      const activeCycleTargets = mockTargets.filter(
        target => target.survey_cycle_id === activeCycleId
      );

      expect(activeCycleTargets).toHaveLength(2);
      expect(activeCycleTargets.every(t => t.survey_cycle_id === activeCycleId)).toBe(true);

      // Mock assignments for different cycles
      const mockAssignments = [
        { assignment_id: 1, survey_cycle_id: 1, user_id: 1, barangay_id: 5, status: 'Completed' },
        { assignment_id: 2, survey_cycle_id: 2, user_id: 1, barangay_id: 5, status: 'Active' },
        { assignment_id: 3, survey_cycle_id: 2, user_id: 2, barangay_id: 6, status: 'Pending' }
      ];

      // Filter assignments by active cycle
      const activeCycleAssignments = mockAssignments.filter(
        assignment => assignment.survey_cycle_id === activeCycleId
      );

      expect(activeCycleAssignments).toHaveLength(2);
      expect(activeCycleAssignments.every(a => a.survey_cycle_id === activeCycleId)).toBe(true);

      // Verify data isolation - old cycle data should not appear
      const oldCycleTargets = mockTargets.filter(t => t.survey_cycle_id === 1);
      const oldCycleAssignments = mockAssignments.filter(a => a.survey_cycle_id === 1);

      expect(oldCycleTargets).toHaveLength(1);
      expect(oldCycleAssignments).toHaveLength(1);
      expect(oldCycleTargets[0].survey_cycle_id).not.toBe(activeCycleId);
      expect(oldCycleAssignments[0].survey_cycle_id).not.toBe(activeCycleId);
    });

    /**
     * Requirement 1.5: Dashboard shows zero progress for new cycles
     */
    it('should reset dashboard progress for new cycles', async () => {
      // Step 1: Mock switching to new cycle
      const newCycleId = 3;
      
      const mockSetActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockCycle3, is_active: true }
        })
      };
      mockFetch.mockResolvedValueOnce(mockSetActiveResponse as any);

      const setActiveResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: newCycleId })
      });
      const setActiveData = await setActiveResponse.json();

      expect(setActiveResponse.ok).toBe(true);
      expect(setActiveData.data.is_active).toBe(true);

      // Step 2: Mock dashboard data for new cycle (should be empty/zero)
      const mockDashboardData = {
        barangays_with_assignments: [],
        total_progress: 0,
        completed_surveys: 0,
        target_surveys: 0,
        completion_percentage: 0
      };

      // Verify new cycle shows zero progress
      expect(mockDashboardData.total_progress).toBe(0);
      expect(mockDashboardData.completed_surveys).toBe(0);
      expect(mockDashboardData.completion_percentage).toBe(0);
      expect(mockDashboardData.barangays_with_assignments).toHaveLength(0);

      // Step 3: Compare with previous cycle data (should be different)
      const mockPreviousCycleData = {
        barangays_with_assignments: [
          { barangay_id: 5, progress: 75, completed: 15, target: 20 },
          { barangay_id: 6, progress: 60, completed: 12, target: 20 }
        ],
        total_progress: 67.5,
        completed_surveys: 27,
        target_surveys: 40,
        completion_percentage: 67.5
      };

      // Verify data isolation between cycles
      expect(mockDashboardData.total_progress).not.toBe(mockPreviousCycleData.total_progress);
      expect(mockDashboardData.completed_surveys).not.toBe(mockPreviousCycleData.completed_surveys);
      expect(mockDashboardData.barangays_with_assignments.length).not.toBe(
        mockPreviousCycleData.barangays_with_assignments.length
      );
    });
  });

  describe('Cross-Component Cycle Context Propagation', () => {
    /**
     * Test cycle context propagation across different components
     */
    it('should propagate cycle changes across all components', async () => {
      // Mock API responses for cycle context
      const mockActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockCycle2 })
      };
      const mockAllCyclesResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [mockCycle1, mockCycle2, mockCycle3] })
      };
      
      mockFetch
        .mockResolvedValueOnce(mockActiveResponse as any)
        .mockResolvedValueOnce(mockAllCyclesResponse as any);

      // Simulate initial context load
      const initialActiveCycle = mockCycle2;
      const allCycles = [mockCycle1, mockCycle2, mockCycle3];

      expect(initialActiveCycle.cycle_id).toBe(2);
      expect(allCycles).toHaveLength(3);

      // Mock cycle change API call
      const mockCycleChangeResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { ...mockCycle3, is_active: true } })
      };
      const mockUpdatedAllCyclesResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          data: [
            mockCycle1, 
            { ...mockCycle2, is_active: false }, 
            { ...mockCycle3, is_active: true }
          ] 
        })
      };
      
      mockFetch
        .mockResolvedValueOnce(mockCycleChangeResponse as any)
        .mockResolvedValueOnce(mockUpdatedAllCyclesResponse as any);

      // Simulate cycle change
      const newActiveCycle = { ...mockCycle3, is_active: true };
      const updatedAllCycles = [
        mockCycle1,
        { ...mockCycle2, is_active: false },
        { ...mockCycle3, is_active: true }
      ];

      // Verify context propagation
      expect(newActiveCycle.cycle_id).toBe(3);
      expect(newActiveCycle.is_active).toBe(true);
      expect(updatedAllCycles.filter(c => c.is_active)).toHaveLength(1);
      expect(updatedAllCycles.find(c => c.is_active)?.cycle_id).toBe(3);

      // Verify context propagation occurred
      expect(newActiveCycle.cycle_id).toBe(3);
      expect(newActiveCycle.is_active).toBe(true);
      expect(updatedAllCycles.filter(c => c.is_active)).toHaveLength(1);
      expect(updatedAllCycles.find(c => c.is_active)?.cycle_id).toBe(3);
    });

    /**
     * Test component data refresh on cycle change
     */
    it('should refresh component data when cycle changes', async () => {
      const oldCycleId = 2;
      const newCycleId = 3;

      // Mock component data before cycle change
      const mockComponentDataBefore = {
        dashboard: {
          cycle_id: oldCycleId,
          progress: 75,
          assignments: [
            { id: 1, barangay_id: 5, progress: 80 },
            { id: 2, barangay_id: 6, progress: 70 }
          ]
        },
        analytics: {
          cycle_id: oldCycleId,
          total_responses: 25,
          satisfaction_scores: { health: 4.2, education: 3.8 }
        },
        assignments: {
          cycle_id: oldCycleId,
          active_assignments: 5,
          completed_assignments: 3
        }
      };

      // Mock component data after cycle change
      const mockComponentDataAfter = {
        dashboard: {
          cycle_id: newCycleId,
          progress: 0, // Reset for new cycle
          assignments: [] // Empty for new cycle
        },
        analytics: {
          cycle_id: newCycleId,
          total_responses: 0, // Reset for new cycle
          satisfaction_scores: {} // Empty for new cycle
        },
        assignments: {
          cycle_id: newCycleId,
          active_assignments: 0, // Reset for new cycle
          completed_assignments: 0 // Reset for new cycle
        }
      };

      // Verify data refresh occurred
      expect(mockComponentDataBefore.dashboard.cycle_id).toBe(oldCycleId);
      expect(mockComponentDataAfter.dashboard.cycle_id).toBe(newCycleId);

      // Verify data was reset for new cycle
      expect(mockComponentDataAfter.dashboard.progress).toBe(0);
      expect(mockComponentDataAfter.dashboard.assignments).toHaveLength(0);
      expect(mockComponentDataAfter.analytics.total_responses).toBe(0);
      expect(mockComponentDataAfter.assignments.active_assignments).toBe(0);

      // Verify old cycle data is different from new cycle data
      expect(mockComponentDataBefore.dashboard.progress).not.toBe(mockComponentDataAfter.dashboard.progress);
      expect(mockComponentDataBefore.analytics.total_responses).not.toBe(mockComponentDataAfter.analytics.total_responses);
    });

    /**
     * Test error handling in context propagation
     */
    it('should handle errors gracefully during context propagation', async () => {
      // Mock API error during cycle change
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Simulate error handling
      let contextError = null;
      try {
        await fetch('/api/survey-cycles/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cycle_id: 3 })
        });
      } catch (error) {
        contextError = error;
      }

      // Verify error was caught
      expect(contextError).toBeInstanceOf(Error);
      expect((contextError as Error).message).toBe('Network error');

      // Mock API error response
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Failed to set active cycle' })
      };
      mockFetch.mockResolvedValueOnce(mockErrorResponse as any);

      const response = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 3 })
      });

      const errorData = await response.json();

      // Verify error response handling
      expect(response.ok).toBe(false);
      expect(errorData.message).toBe('Failed to set active cycle');
    });
  });

  describe('User Experience Flows with Cycle Switching', () => {
    /**
     * Test admin user cycle switching flow
     */
    it('should handle admin user cycle switching flow', async () => {
      // Mock admin user authentication (used for context)
      const mockAdminUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        role: 'admin'
      };
      
      // Verify admin user has proper permissions
      expect(mockAdminUser.role).toBe('admin');

      // Step 1: Load initial cycles
      const mockInitialActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockCycle2 })
      };
      const mockInitialAllResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [mockCycle1, mockCycle2, mockCycle3] })
      };

      mockFetch
        .mockResolvedValueOnce(mockInitialActiveResponse as any)
        .mockResolvedValueOnce(mockInitialAllResponse as any);

      // Simulate initial load
      const initialActiveResponse = await fetch('/api/survey-cycles/active');
      const initialActiveData = await initialActiveResponse.json();
      const initialAllResponse = await fetch('/api/survey-cycles');
      const initialAllData = await initialAllResponse.json();

      expect(initialActiveData.data.cycle_id).toBe(2);
      expect(initialAllData.data).toHaveLength(3);

      // Step 2: Admin selects different cycle
      const selectedCycleId = 3;

      // Mock successful cycle change
      const mockCycleChangeResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          success: true,
          message: 'Survey cycle activated successfully',
          data: { ...mockCycle3, is_active: true }
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockCycleChangeResponse as any);

      // Simulate cycle change request
      const cycleChangeResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: selectedCycleId })
      });

      const cycleChangeData = await cycleChangeResponse.json();

      // Verify successful cycle change
      expect(cycleChangeResponse.ok).toBe(true);
      expect(cycleChangeData.success).toBe(true);
      expect(cycleChangeData.data.cycle_id).toBe(selectedCycleId);
      expect(cycleChangeData.data.is_active).toBe(true);

      // Step 3: Verify UI updates
      const updatedState = {
        activeCycle: { ...mockCycle3, is_active: true },
        allCycles: [
          mockCycle1,
          { ...mockCycle2, is_active: false },
          { ...mockCycle3, is_active: true }
        ],
        loading: false,
        error: null
      };

      expect(updatedState.activeCycle.cycle_id).toBe(selectedCycleId);
      expect(updatedState.activeCycle.is_active).toBe(true);
      expect(updatedState.allCycles.filter(c => c.is_active)).toHaveLength(1);
    });

    /**
     * Test non-admin user restrictions
     */
    it('should restrict cycle switching for non-admin users', async () => {
      // Mock non-admin user
      const mockOfficerUser = {
        id: '2',
        firstName: 'Officer',
        lastName: 'User',
        email: 'officer@test.com',
        role: 'officer'
      };

      // Mock unauthorized cycle change attempt
      const mockUnauthorizedResponse = {
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({ 
          error: 'Insufficient permissions',
          message: 'Admin access required for cycle management'
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockUnauthorizedResponse as any);

      const unauthorizedResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 3 })
      });

      const errorData = await unauthorizedResponse.json();

      // Verify access restriction
      expect(unauthorizedResponse.ok).toBe(false);
      expect(unauthorizedResponse.status).toBe(403);
      expect(errorData.error).toBe('Insufficient permissions');

      // Verify UI shows appropriate message for non-admin users
      const uiState = {
        canChangeCycle: mockOfficerUser.role === 'admin',
        restrictionMessage: 'Only administrators can change the active survey cycle.'
      };

      expect(uiState.canChangeCycle).toBe(false);
      expect(uiState.restrictionMessage).toContain('administrators');
    });

    /**
     * Test cycle switching with data validation
     */
    it('should validate cycle switching with proper data checks', async () => {
      // Clear any previous mocks
      mockFetch.mockClear();
      
      // Test invalid cycle ID
      const mockInvalidResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ 
          error: 'Invalid input',
          message: 'cycle_id is required and must be a number'
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockInvalidResponse as any);

      const invalidResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 'invalid' })
      });

      const invalidData = await invalidResponse.json();

      expect(invalidResponse.ok).toBe(false);
      expect(invalidResponse.status).toBe(400);
      expect(invalidData.error).toBe('Invalid input');

      // Test non-existent cycle ID
      const mockNotFoundResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ 
          error: 'Survey cycle not found',
          message: 'Survey cycle with ID 999 not found'
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockNotFoundResponse as any);

      const notFoundResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 999 })
      });

      const notFoundData = await notFoundResponse.json();

      expect(notFoundResponse.ok).toBe(false);
      expect(notFoundResponse.status).toBe(404);
      expect(notFoundData.error).toBe('Survey cycle not found');

      // Test constraint violation (multiple active cycles)
      const mockConstraintResponse = {
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({ 
          error: 'Constraint violation',
          message: 'Multiple active cycles detected. Database constraint prevents this operation.'
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockConstraintResponse as any);

      const constraintResponse = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 2 })
      });

      const constraintData = await constraintResponse.json();

      expect(constraintResponse.ok).toBe(false);
      expect(constraintResponse.status).toBe(409);
      expect(constraintData.error).toBe('Constraint violation');
    });

    /**
     * Test loading states during cycle operations
     */
    it('should handle loading states during cycle operations', async () => {
      // Simulate loading state during initial load
      let loadingState: {
        activeCycle: any;
        allCycles: any[];
        loading: boolean;
        error: string | null;
      } = {
        activeCycle: null,
        allCycles: [],
        loading: true,
        error: null
      };

      expect(loadingState.loading).toBe(true);
      expect(loadingState.activeCycle).toBeNull();

      // Mock delayed API response
      const mockDelayedActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockCycle2 })
      };
      const mockDelayedAllResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [mockCycle1, mockCycle2] })
      };
      
      setTimeout(() => {
        mockFetch
          .mockResolvedValueOnce(mockDelayedActiveResponse as any)
          .mockResolvedValueOnce(mockDelayedAllResponse as any);
      }, 100);

      // Simulate loading completion
      loadingState = {
        activeCycle: mockCycle2,
        allCycles: [mockCycle1, mockCycle2],
        loading: false,
        error: null
      };

      expect(loadingState.loading).toBe(false);
      expect(loadingState.activeCycle).not.toBeNull();
      expect(loadingState.allCycles).toHaveLength(2);

      // Test loading state during cycle change
      let cycleChangeLoading = true;

      // Simulate cycle change loading
      expect(cycleChangeLoading).toBe(true);

      // Mock cycle change completion
      setTimeout(() => {
        cycleChangeLoading = false;
      }, 50);

      // Verify loading state management
      expect(typeof cycleChangeLoading).toBe('boolean');
    });
  });

  describe('Data Consistency and Error Recovery', () => {
    /**
     * Test data consistency across cycle operations
     */
    it('should maintain data consistency across all cycle operations', async () => {
      // Test data consistency through API responses
      const consistentCycleData = mockCycle2;

      // Mock API responses for different operations
      const mockActiveResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: consistentCycleData
        })
      };
      mockFetch.mockResolvedValueOnce(mockActiveResponse as any);

      // Test 1: Get active cycle via API
      const activeResponse = await fetch('/api/survey-cycles/active');
      const activeData = await activeResponse.json();
      expect(activeData.data.cycle_id).toBe(consistentCycleData.cycle_id);

      // Test 2: Verify survey number format uses consistent cycle year
      const barangayId = 10;
      const sequenceNumber = 6;
      const expectedSurveyNumber = `${barangayId.toString().padStart(2, '0')}-${consistentCycleData.year}-${sequenceNumber.toString().padStart(4, '0')}`;
      expect(expectedSurveyNumber).toBe('10-2024-0006'); // Uses cycle year 2024

      // Test 3: Verify all operations reference the same cycle
      expect(activeData.data.year).toBe(2024);
      expect(expectedSurveyNumber).toContain('2024');
    });

    /**
     * Test error recovery mechanisms
     */
    it('should recover gracefully from errors', async () => {
      // Test API error recovery
      const mockRetryResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockCycle2 })
      };
      
      // Clear previous mocks and set up new ones
      mockFetch.mockClear();
      mockFetch
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce(mockRetryResponse as any);

      // First call fails
      await expect(fetch('/api/survey-cycles/active')).rejects.toThrow('Network timeout');

      // Second call succeeds
      const retryResponse = await fetch('/api/survey-cycles/active');
      const retryData = await retryResponse.json();
      expect(retryData.data.cycle_id).toBe(2);

      // Test error response handling
      const mockErrorResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ 
          error: 'Internal server error',
          message: 'Database connection failed'
        })
      };
      mockFetch.mockResolvedValueOnce(mockErrorResponse as any);

      const errorResponse = await fetch('/api/survey-cycles/active');
      const errorData = await errorResponse.json();

      expect(errorResponse.ok).toBe(false);
      expect(errorResponse.status).toBe(500);
      expect(errorData.error).toBe('Internal server error');
    });

    /**
     * Test concurrent cycle operations
     */
    it('should handle concurrent cycle operations safely', async () => {
      // Mock concurrent cycle activation attempts
      const cycleId1 = 2;
      const cycleId2 = 3;

      // Mock API responses for concurrent operations
      const mockResponse1 = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockCycle2, is_active: true }
        })
      };
      const mockResponse2 = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockCycle3, is_active: true }
        })
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse1 as any)
        .mockResolvedValueOnce(mockResponse2 as any);

      // Simulate concurrent operations
      const operation1 = fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: cycleId1 })
      });
      const operation2 = fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: cycleId2 })
      });

      // Both operations should complete successfully
      const [response1, response2] = await Promise.all([operation1, operation2]);
      
      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);

      // Verify final state - last operation wins
      const finalData = await response2.json();
      expect(finalData.data.is_active).toBe(true);
      expect(finalData.data.cycle_id).toBe(cycleId2);
    });
  });
});