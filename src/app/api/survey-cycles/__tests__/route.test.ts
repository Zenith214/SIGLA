import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { requireAuth, requireAdmin, createAuditLog } from '@/lib/auth-middleware';
import { getSurveyCycles, createSurveyCycle } from '@/utils/surveyCycleHelpers';

// Mock dependencies
jest.mock('@/lib/auth-middleware');
jest.mock('@/utils/surveyCycleHelpers');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockCreateAuditLog = createAuditLog as jest.MockedFunction<typeof createAuditLog>;
const mockGetSurveyCycles = getSurveyCycles as jest.MockedFunction<typeof getSurveyCycles>;
const mockCreateSurveyCycle = createSurveyCycle as jest.MockedFunction<typeof createSurveyCycle>;

// Mock survey cycle data
const mockSurveyCycles = [
  {
    cycle_id: 1,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: true,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    cycle_id: 2,
    name: 'Survey Cycle 2023',
    year: 2023,
    is_active: false,
    start_date: new Date('2023-01-01'),
    end_date: new Date('2023-12-31'),
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01')
  }
];

const mockUser = {
  id: 1,
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@test.com',
  role: 'admin'
};

describe('/api/survey-cycles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/survey-cycles', () => {
    it('should return all survey cycles for authenticated user', async () => {
      // Mock successful authentication (returns null when successful)
      mockRequireAuth.mockReturnValue(null);
      mockGetSurveyCycles.mockResolvedValue(mockSurveyCycles);

      const request = new NextRequest('http://localhost:3000/api/survey-cycles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].cycle_id).toBe(1);
      expect(data.data[0].name).toBe('Survey Cycle 2024');
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
      expect(mockGetSurveyCycles).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock authentication failure
      mockRequireAuth.mockReturnValue({ success: false, error: 'No authentication token provided' });

      const request = new NextRequest('http://localhost:3000/api/survey-cycles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'No authentication token provided'
      });
      expect(mockGetSurveyCycles).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      // Mock successful authentication but database error
      mockRequireAuth.mockReturnValue(null);
      mockGetSurveyCycles.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/survey-cycles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch survey cycles',
        message: 'Database connection failed'
      });
    });

    it('should handle unknown errors gracefully', async () => {
      // Mock successful authentication but unknown error
      mockRequireAuth.mockReturnValue(null);
      mockGetSurveyCycles.mockRejectedValue('Unknown error');

      const request = new NextRequest('http://localhost:3000/api/survey-cycles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch survey cycles',
        message: 'Unknown error occurred'
      });
    });
  });

  describe('POST /api/survey-cycles', () => {
    const validCycleData = {
      name: 'Survey Cycle 2025',
      year: 2025,
      start_date: '2025-01-01',
      end_date: '2025-12-31'
    };

    const mockCreatedCycle = {
      cycle_id: 3,
      name: 'Survey Cycle 2025',
      year: 2025,
      is_active: false,
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-12-31'),
      created_at: new Date('2025-10-21T12:29:41.944Z'),
      updated_at: null
    };

    it('should create survey cycle for admin user', async () => {
      // Mock successful admin authentication (returns null when successful)
      mockRequireAdmin.mockReturnValue(null);
      mockRequireAuth.mockReturnValue({ success: true, user: mockUser });
      mockCreateSurveyCycle.mockResolvedValue(mockCreatedCycle);

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(validCycleData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Survey cycle created successfully');
      expect(data.data.cycle_id).toBe(3);
      expect(data.data.name).toBe('Survey Cycle 2025');
      expect(mockRequireAdmin).toHaveBeenCalledWith(request);
      expect(mockCreateSurveyCycle).toHaveBeenCalledWith(
        'Survey Cycle 2025',
        2025,
        new Date('2025-01-01'),
        new Date('2025-12-31')
      );
      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        mockUser,
        'CREATE_SURVEY_CYCLE',
        {
          cycle_id: 3,
          name: 'Survey Cycle 2025',
          year: 2025,
          start_date: '2025-01-01T00:00:00.000Z',
          end_date: '2025-12-31T00:00:00.000Z'
        }
      );
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock authentication failure
      mockRequireAdmin.mockReturnValue({ success: false, error: 'No authentication token provided' });

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(validCycleData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'No authentication token provided'
      });
      expect(mockCreateSurveyCycle).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin user', async () => {
      // Mock authorization failure
      mockRequireAdmin.mockReturnValue({ success: false, error: 'Insufficient permissions' });

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(validCycleData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: 'Insufficient permissions'
      });
      expect(mockCreateSurveyCycle).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      mockRequireAdmin.mockReturnValue(null);

      const invalidData = { name: 'Test Cycle' }; // Missing year

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid input',
        message: 'name and year are required fields'
      });
      expect(mockCreateSurveyCycle).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid year', async () => {
      mockRequireAdmin.mockReturnValue(null);

      const invalidData = { name: 'Test Cycle', year: 'invalid' };

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid input',
        message: 'year must be a valid number between 2000 and 2100'
      });
    });

    it('should return 400 for year out of range', async () => {
      mockRequireAdmin.mockReturnValue(null);

      const invalidData = { name: 'Test Cycle', year: 1999 };

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid input',
        message: 'year must be a valid number between 2000 and 2100'
      });
    });

    it('should return 400 for invalid start_date', async () => {
      mockRequireAdmin.mockReturnValue(null);

      const invalidData = { 
        name: 'Test Cycle', 
        year: 2025, 
        start_date: 'invalid-date' 
      };

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid input',
        message: 'start_date must be a valid date'
      });
    });

    it('should return 400 for invalid end_date', async () => {
      mockRequireAdmin.mockReturnValue(null);

      const invalidData = { 
        name: 'Test Cycle', 
        year: 2025, 
        end_date: 'invalid-date' 
      };

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid input',
        message: 'end_date must be a valid date'
      });
    });

    it('should return 400 when start_date is after end_date', async () => {
      mockRequireAdmin.mockReturnValue(null);

      const invalidData = { 
        name: 'Test Cycle', 
        year: 2025, 
        start_date: '2025-12-31',
        end_date: '2025-01-01'
      };

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid input',
        message: 'start_date must be before end_date'
      });
    });

    it('should create cycle without dates when not provided', async () => {
      mockRequireAdmin.mockReturnValue(null);
      mockRequireAuth.mockReturnValue({ success: true, user: mockUser });
      mockCreateSurveyCycle.mockResolvedValue(mockCreatedCycle);

      const minimalData = { name: 'Test Cycle', year: 2025 };

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(minimalData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockCreateSurveyCycle).toHaveBeenCalledWith(
        'Test Cycle',
        2025,
        undefined,
        undefined
      );
    });

    it('should return 409 for duplicate survey cycle', async () => {
      mockRequireAdmin.mockReturnValue(null);
      mockCreateSurveyCycle.mockRejectedValue(new Error('duplicate key value violates unique constraint'));

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(validCycleData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({
        error: 'Duplicate survey cycle',
        message: 'A survey cycle with this name or year may already exist'
      });
    });

    it('should return 500 for database errors', async () => {
      mockRequireAdmin.mockReturnValue(null);
      mockCreateSurveyCycle.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(validCycleData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create survey cycle',
        message: 'Database connection failed'
      });
    });

    it('should handle unknown errors gracefully', async () => {
      mockRequireAdmin.mockReturnValue(null);
      mockCreateSurveyCycle.mockRejectedValue('Unknown error');

      const request = new NextRequest('http://localhost:3000/api/survey-cycles', {
        method: 'POST',
        body: JSON.stringify(validCycleData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create survey cycle',
        message: 'Unknown error occurred'
      });
    });
  });
});