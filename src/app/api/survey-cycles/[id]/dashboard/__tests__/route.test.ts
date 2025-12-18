import { NextRequest } from 'next/server';
import { GET } from '../route';
import { requireAuth } from '@/lib/auth-middleware';

// Mock dependencies
jest.mock('@/lib/auth-middleware');
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('/api/survey-cycles/[id]/dashboard - Dashboard Integration Tests', () => {
  const { supabaseAdmin } = require('@/lib/supabase');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful authentication by default
    mockRequireAuth.mockReturnValue(null);
  });

  describe('Cycle-Scoped Dashboard Data', () => {
    it('should return dashboard data filtered by specific cycle ID', async () => {
      const cycleId = 1;
      
      // Mock cycle verification
      const mockCycleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { 
            cycle_id: 1, 
            name: 'Survey Cycle 2023', 
            year: 2023, 
            is_active: false 
          },
          error: null
        })
      };

      // Mock dashboard data queries
      const mockResponsesQuery = {
        select: jest.fn().mockResolvedValue({ count: 25, error: null })
      };

      const mockAssignmentsQuery = {
        select: jest.fn().mockResolvedValue({ count: 5, error: null })
      };

      const mockCompletedQuery = {
        select: jest.fn().mockResolvedValue({ count: 4, error: null })
      };

      const mockTargetsQuery = {
        select: jest.fn().mockResolvedValue({ 
          data: [
            { target_count: 10, achieved_count: 8, barangay: { barangay_id: 1, barangay_name: 'Barangay A' } },
            { target_count: 15, achieved_count: 12, barangay: { barangay_id: 2, barangay_name: 'Barangay B' } }
          ], 
          error: null 
        })
      };

      const mockBarangaysQuery = {
        select: jest.fn().mockResolvedValue({ 
          data: [{ barangay_id: 1 }, { barangay_id: 2 }], 
          error: null 
        })
      };

      // Setup supabaseAdmin.from to return different mocks for different tables
      supabaseAdmin.from
        .mockReturnValueOnce(mockCycleQuery)
        .mockReturnValueOnce(mockResponsesQuery)
        .mockReturnValueOnce(mockAssignmentsQuery)
        .mockReturnValueOnce(mockCompletedQuery)
        .mockReturnValueOnce(mockTargetsQuery)
        .mockReturnValueOnce(mockBarangaysQuery);

      const request = new NextRequest(`http://localhost:3000/api/survey-cycles/${cycleId}/dashboard`);
      const response = await GET(request, { params: { id: cycleId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify cycle data is returned
      expect(data.data.cycle.cycle_id).toBe(1);
      expect(data.data.cycle.name).toBe('Survey Cycle 2023');
      
      // Verify dashboard metrics are calculated correctly
      expect(data.data.dashboard.summary.total_responses).toBe(25);
      expect(data.data.dashboard.summary.total_assignments).toBe(5);
      expect(data.data.dashboard.summary.completed_assignments).toBe(4);
      expect(data.data.dashboard.summary.assignment_completion_rate).toBe(80); // 4/5 * 100
      expect(data.data.dashboard.summary.total_targets).toBe(25); // 10 + 15
      expect(data.data.dashboard.summary.total_achieved).toBe(20); // 8 + 12
      expect(data.data.dashboard.summary.progress_percentage).toBe(80); // 20/25 * 100
      expect(data.data.dashboard.summary.barangays_with_data).toBe(2);
      
      // Verify all queries are scoped to the specific cycle
      expect(supabaseAdmin.from).toHaveBeenCalledWith('survey_cycle');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('survey_response');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('assignment');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('survey_target');
    });

    it('should return zero progress for cycle with no data', async () => {
      const cycleId = 2;
      
      // Mock cycle exists but no data
      const mockCycleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { 
            cycle_id: 2, 
            name: 'Empty Cycle 2022', 
            year: 2022, 
            is_active: false 
          },
          error: null
        })
      };

      // Mock empty data responses
      const mockEmptyQuery = {
        select: jest.fn().mockResolvedValue({ count: 0, error: null })
      };

      const mockEmptyTargetsQuery = {
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      const mockEmptyBarangaysQuery = {
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      supabaseAdmin.from
        .mockReturnValueOnce(mockCycleQuery)
        .mockReturnValueOnce(mockEmptyQuery) // responses
        .mockReturnValueOnce(mockEmptyQuery) // assignments
        .mockReturnValueOnce(mockEmptyQuery) // completed assignments
        .mockReturnValueOnce(mockEmptyTargetsQuery) // targets
        .mockReturnValueOnce(mockEmptyBarangaysQuery); // barangays

      const request = new NextRequest(`http://localhost:3000/api/survey-cycles/${cycleId}/dashboard`);
      const response = await GET(request, { params: { id: cycleId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify zero progress for empty cycle
      expect(data.data.dashboard.summary.total_responses).toBe(0);
      expect(data.data.dashboard.summary.total_assignments).toBe(0);
      expect(data.data.dashboard.summary.completed_assignments).toBe(0);
      expect(data.data.dashboard.summary.assignment_completion_rate).toBe(0);
      expect(data.data.dashboard.summary.total_targets).toBe(0);
      expect(data.data.dashboard.summary.total_achieved).toBe(0);
      expect(data.data.dashboard.summary.progress_percentage).toBe(0);
      expect(data.data.dashboard.summary.barangays_with_data).toBe(0);
    });

    it('should return 404 for non-existent cycle', async () => {
      const nonExistentCycleId = 999;
      
      // Mock cycle not found
      const mockCycleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows returned' }
        })
      };

      supabaseAdmin.from.mockReturnValueOnce(mockCycleQuery);

      const request = new NextRequest(`http://localhost:3000/api/survey-cycles/${nonExistentCycleId}/dashboard`);
      const response = await GET(request, { params: { id: nonExistentCycleId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Survey cycle not found');
    });
  });

  describe('Data Isolation Between Cycles', () => {
    it('should isolate data between different cycles', async () => {
      // Test cycle 1
      const cycle1Id = 1;
      
      const mockCycle1Query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { cycle_id: 1, name: 'Cycle 2023', year: 2023, is_active: false },
          error: null
        })
      };

      const mockCycle1Data = {
        select: jest.fn().mockResolvedValue({ count: 10, error: null })
      };

      const mockCycle1Targets = {
        select: jest.fn().mockResolvedValue({ 
          data: [{ target_count: 5, achieved_count: 3 }], 
          error: null 
        })
      };

      const mockCycle1Barangays = {
        select: jest.fn().mockResolvedValue({ 
          data: [{ barangay_id: 1 }], 
          error: null 
        })
      };

      supabaseAdmin.from
        .mockReturnValueOnce(mockCycle1Query)
        .mockReturnValueOnce(mockCycle1Data) // responses
        .mockReturnValueOnce(mockCycle1Data) // assignments
        .mockReturnValueOnce(mockCycle1Data) // completed
        .mockReturnValueOnce(mockCycle1Targets)
        .mockReturnValueOnce(mockCycle1Barangays);

      const request1 = new NextRequest(`http://localhost:3000/api/survey-cycles/${cycle1Id}/dashboard`);
      const response1 = await GET(request1, { params: { id: cycle1Id.toString() } });
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.data.dashboard.summary.progress_percentage).toBe(60); // 3/5 * 100

      // Reset mocks for cycle 2
      jest.clearAllMocks();
      mockRequireAuth.mockReturnValue(null);

      // Test cycle 2 with different data
      const cycle2Id = 2;
      
      const mockCycle2Query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { cycle_id: 2, name: 'Cycle 2024', year: 2024, is_active: true },
          error: null
        })
      };

      const mockCycle2Data = {
        select: jest.fn().mockResolvedValue({ count: 20, error: null })
      };

      const mockCycle2Targets = {
        select: jest.fn().mockResolvedValue({ 
          data: [{ target_count: 10, achieved_count: 8 }], 
          error: null 
        })
      };

      const mockCycle2Barangays = {
        select: jest.fn().mockResolvedValue({ 
          data: [{ barangay_id: 1 }, { barangay_id: 2 }], 
          error: null 
        })
      };

      supabaseAdmin.from
        .mockReturnValueOnce(mockCycle2Query)
        .mockReturnValueOnce(mockCycle2Data) // responses
        .mockReturnValueOnce(mockCycle2Data) // assignments
        .mockReturnValueOnce(mockCycle2Data) // completed
        .mockReturnValueOnce(mockCycle2Targets)
        .mockReturnValueOnce(mockCycle2Barangays);

      const request2 = new NextRequest(`http://localhost:3000/api/survey-cycles/${cycle2Id}/dashboard`);
      const response2 = await GET(request2, { params: { id: cycle2Id.toString() } });
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.data.dashboard.summary.progress_percentage).toBe(80); // 8/10 * 100

      // Verify different cycles return different data
      expect(data1.data.dashboard.summary.progress_percentage).not.toBe(
        data2.data.dashboard.summary.progress_percentage
      );
      expect(data1.data.cycle.cycle_id).not.toBe(data2.data.cycle.cycle_id);
    });
  });

  describe('Authentication and Error Handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockRequireAuth.mockReturnValue({ success: false, error: 'No authentication token provided' });

      const request = new NextRequest('http://localhost:3000/api/survey-cycles/1/dashboard');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No authentication token provided');
    });

    it('should return 400 for invalid cycle ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/survey-cycles/invalid/dashboard');
      const response = await GET(request, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid cycle ID');
    });

    it('should handle database errors gracefully', async () => {
      const cycleId = 1;
      
      const mockErrorQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      supabaseAdmin.from.mockReturnValueOnce(mockErrorQuery);

      const request = new NextRequest(`http://localhost:3000/api/survey-cycles/${cycleId}/dashboard`);
      const response = await GET(request, { params: { id: cycleId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch cycle dashboard data');
      expect(data.message).toBe('Database connection failed');
    });
  });
});