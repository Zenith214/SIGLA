import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

// Mock dependencies
jest.mock('@/utils/surveyCycleHelpers');

// Mock the PostgreSQL pool
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn();

jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockRelease = jest.fn();
  const mockConnect = jest.fn().mockResolvedValue({
    query: mockQuery,
    release: mockRelease,
  });

  return {
    Pool: jest.fn().mockImplementation(() => ({
      connect: mockConnect,
    })),
  };
});

const mockGetActiveCycleId = getActiveCycleId as jest.MockedFunction<typeof getActiveCycleId>;

describe('/api/barangays-with-assignments - Dashboard Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock environment variable
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    
    // Get the mocked functions from the Pool mock
    const { Pool } = require('pg');
    const poolInstance = new Pool();
    const client = await poolInstance.connect();
    
    // Reset the mocks
    client.query.mockReset();
    client.release.mockReset();
  });

  describe('Progress Calculations with Cycle-Scoped Data', () => {
    it('should calculate progress based on active cycle survey responses only', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock barangay with assignment and survey data for active cycle
      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 1,
          assignment_status: 'Active',
          assignment_progress: 50,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-15'),
          interviewer_first_name: 'John',
          interviewer_last_name: 'Doe',
          interviewer_email: 'john@test.com',
          survey_target: 10,
          completed_surveys: 7,
          calculated_progress: 70
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const request = new NextRequest('http://localhost:3000/api/barangays-with-assignments');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      
      const barangay = data[0];
      expect(barangay.progress).toBe(70); // Calculated from completed_surveys/target
      expect(barangay.status).toBe('In Progress');
      
      // Verify query filters by active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('a.survey_cycle_id = $1'),
        [activeCycleId]
      );
      
      // Verify survey responses are filtered by active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status IN (\'completed\', \'submitted\') AND survey_cycle_id = $1'),
        [activeCycleId]
      );
    });

    it('should calculate 100% progress when target is met or exceeded', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 1,
          assignment_status: 'Active',
          assignment_progress: 100,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-15'),
          interviewer_first_name: 'John',
          interviewer_last_name: 'Doe',
          interviewer_email: 'john@test.com',
          survey_target: 10,
          completed_surveys: 12, // Exceeds target
          calculated_progress: 100 // Should be capped at 100
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      const barangay = data[0];
      expect(barangay.progress).toBe(100);
      expect(barangay.status).toBe('Completed');
    });

    it('should handle zero progress when no surveys completed', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 1,
          assignment_status: 'Active',
          assignment_progress: 0,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-15'),
          interviewer_first_name: 'John',
          interviewer_last_name: 'Doe',
          interviewer_email: 'john@test.com',
          survey_target: 10,
          completed_surveys: 0,
          calculated_progress: 0
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      const barangay = data[0];
      expect(barangay.progress).toBe(0);
      expect(barangay.status).toBe('Pending');
    });
  });

  describe('Zero Progress Display for New Cycles', () => {
    it('should return empty array when no active cycle exists', async () => {
      mockGetActiveCycleId.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
      
      // Should not query database when no active cycle
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should show zero progress for new cycle with no survey data', async () => {
      const newCycleId = 2;
      mockGetActiveCycleId.mockResolvedValue(newCycleId);

      // Mock barangay with assignment but no completed surveys in new cycle
      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 2,
          assignment_status: 'Active',
          assignment_progress: 0,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-01'),
          interviewer_first_name: 'John',
          interviewer_last_name: 'Doe',
          interviewer_email: 'john@test.com',
          survey_target: 10,
          completed_surveys: 0, // No surveys in new cycle
          calculated_progress: 0
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      const barangay = data[0];
      expect(barangay.progress).toBe(0);
      expect(barangay.status).toBe('Pending');
      
      // Verify query uses new cycle ID
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('a.survey_cycle_id = $1'),
        [newCycleId]
      );
    });

    it('should reset progress indicators for fresh cycle start', async () => {
      const newCycleId = 3;
      mockGetActiveCycleId.mockResolvedValue(newCycleId);

      // Multiple barangays with assignments but no survey progress in new cycle
      const mockBarangayData = [
        {
          barangay_id: 1,
          barangay_name: 'Barangay A',
          population: 500,
          households: 125,
          captain: 'Captain A',
          description: 'Description A',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 1,
          assignment_status: 'Active',
          assignment_progress: 0,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-01'),
          interviewer_first_name: 'Jane',
          interviewer_last_name: 'Smith',
          interviewer_email: 'jane@test.com',
          survey_target: 5,
          completed_surveys: 0,
          calculated_progress: 0
        },
        {
          barangay_id: 2,
          barangay_name: 'Barangay B',
          population: 800,
          households: 200,
          captain: 'Captain B',
          description: 'Description B',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 2,
          assignment_status: 'Active',
          assignment_progress: 0,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-01'),
          interviewer_first_name: 'Bob',
          interviewer_last_name: 'Johnson',
          interviewer_email: 'bob@test.com',
          survey_target: 8,
          completed_surveys: 0,
          calculated_progress: 0
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      
      // All barangays should show zero progress
      data.forEach((barangay: any) => {
        expect(barangay.progress).toBe(0);
        expect(barangay.status).toBe('Pending');
      });
    });
  });

  describe('Data Filtering Accuracy Across Cycles', () => {
    it('should only include assignments from active cycle', async () => {
      const activeCycleId = 2;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 5, // Assignment from cycle 2
          assignment_status: 'Active',
          assignment_progress: 30,
          assignment_created: new Date('2024-06-01'),
          assignment_updated: new Date('2024-06-15'),
          interviewer_first_name: 'Alice',
          interviewer_last_name: 'Wilson',
          interviewer_email: 'alice@test.com',
          survey_target: 15,
          completed_surveys: 4,
          calculated_progress: 27
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify the query filters assignments by active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INNER JOIN assignment a ON b.barangay_id = a.barangay_id AND a.survey_cycle_id = $1'),
        [activeCycleId]
      );
      
      // Verify survey targets are filtered by active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN survey_target st ON b.barangay_id = st.barangay_id AND st.survey_cycle_id = $1'),
        [activeCycleId]
      );
      
      // Verify survey responses are filtered by active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status IN (\'completed\', \'submitted\') AND survey_cycle_id = $1'),
        [activeCycleId]
      );
    });

    it('should exclude barangays without assignments in active cycle', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock empty result - no barangays have assignments in active cycle
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
      
      // Query should still be executed with proper cycle filtering
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('a.survey_cycle_id = $1'),
        [activeCycleId]
      );
    });

    it('should handle multiple assignments per barangay correctly', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock barangay with multiple assignments (should keep most recent)
      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 1,
          assignment_status: 'Active',
          assignment_progress: 50,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-15'),
          interviewer_first_name: 'John',
          interviewer_last_name: 'Doe',
          interviewer_email: 'john@test.com',
          survey_target: 10,
          completed_surveys: 5,
          calculated_progress: 50
        },
        {
          barangay_id: 5, // Same barangay
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 2, // Different assignment
          assignment_status: 'Active',
          assignment_progress: 75,
          assignment_created: new Date('2024-01-15'), // More recent
          assignment_updated: new Date('2024-01-20'),
          interviewer_first_name: 'Jane',
          interviewer_last_name: 'Smith',
          interviewer_email: 'jane@test.com',
          survey_target: 10,
          completed_surveys: 7,
          calculated_progress: 70
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1); // Should consolidate to one barangay
      
      const barangay = data[0];
      expect(barangay.assignment.assignment_id).toBe(2); // Should keep more recent assignment
      expect(barangay.assignment.interviewer.firstName).toBe('Jane');
      expect(barangay.progress).toBe(70);
    });

    it('should properly isolate survey target data by cycle', async () => {
      const activeCycleId = 2;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      const mockBarangayData = [
        {
          barangay_id: 5,
          barangay_name: 'Test Barangay',
          population: 1000,
          households: 250,
          captain: 'Test Captain',
          description: 'Test Description',
          currentStatus: 'Active',
          seal: null,
          assignment_id: 3,
          assignment_status: 'Active',
          assignment_progress: 40,
          assignment_created: new Date('2024-01-01'),
          assignment_updated: new Date('2024-01-15'),
          interviewer_first_name: 'John',
          interviewer_last_name: 'Doe',
          interviewer_email: 'john@test.com',
          survey_target: 20, // Target for cycle 2
          completed_surveys: 8, // Responses for cycle 2
          calculated_progress: 40
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockBarangayData });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      
      const barangay = data[0];
      expect(barangay.progress).toBe(40); // 8/20 = 40%
      
      // Verify all data sources are filtered by the same cycle
      const queryCall = mockQuery.mock.calls[0];
      const query = queryCall[0];
      const params = queryCall[1];
      
      // Should have 3 references to the cycle parameter
      const cycleParamCount = (query.match(/\$1/g) || []).length;
      expect(cycleParamCount).toBeGreaterThanOrEqual(3);
      expect(params[0]).toBe(activeCycleId);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const activeCycleId = 1;
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to fetch barangays with assignments');
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle survey cycle helper errors', async () => {
      mockGetActiveCycleId.mockRejectedValue(new Error('Failed to get active cycle'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to fetch barangays with assignments');
    });
  });
});