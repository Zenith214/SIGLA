import { NextRequest } from 'next/server';
import { getActiveCycle, generateSurveyNumber, getNextSurveySequence } from '@/utils/surveyCycleHelpers';

// Mock the survey cycle helpers
jest.mock('@/utils/surveyCycleHelpers', () => ({
  getActiveCycle: jest.fn(),
  generateSurveyNumber: jest.fn(),
  getNextSurveySequence: jest.fn(),
}));

// Mock the PostgreSQL pool
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
  })),
}));

describe('Survey Response API Integration Tests', () => {
  const mockActiveCycle = {
    cycle_id: 1,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: true,
  };

  const mockActiveCycle2025 = {
    cycle_id: 2,
    name: 'Survey Cycle 2025',
    year: 2025,
    is_active: true,
  };

  const validSurveyData = {
    location: {
      lat: '14.5995',
      lng: '120.9842',
      address: 'Test Address',
      barangay: 'Test Barangay',
      municipality: 'Test Municipality',
      province: 'Test Province',
    },
    selectedMember: 'John Doe',
    interviewerId: 1,
    barangayId: 5,
    respondentDemographics: {
      age: 30,
      gender: 'Male',
      educationalAttainment: 'College Graduate',
      householdIncome: '50000-75000',
    },
    sections: {
      financial: {
        data: { question1: 'answer1' }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variable
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    
    // Setup database client mock
    mockConnect.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
    });
    
    // Setup default mocks
    (getActiveCycle as jest.Mock).mockResolvedValue(mockActiveCycle);
    (getNextSurveySequence as jest.Mock).mockResolvedValue(1);
    (generateSurveyNumber as jest.Mock).mockResolvedValue('05-2024-0001');
    
    mockQuery.mockResolvedValue({ rows: [{ response_id: 123 }] });
  });

  describe('Survey Creation with Active Cycle Linkage', () => {
    it('should create survey response linked to active cycle', async () => {
      // Import the POST function after mocks are set up
      const { POST } = await import('../route');
      
      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.cycleId).toBe(1);
      expect(responseData.cycleName).toBe('Survey Cycle 2024');
      
      // Verify that the survey response was inserted with the correct cycle_id
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO survey_response'),
        expect.arrayContaining([
          expect.any(String), // survey_number
          5, // barangay_id
          1, // interviewer_id
          1, // survey_cycle_id (active cycle)
          expect.any(String), // respondent_name
          expect.any(Number), // age
          expect.any(String), // gender
          expect.any(String), // educational_attainment
          expect.any(String), // household_income
          expect.any(Number), // lat
          expect.any(Number), // lng
          expect.any(String), // address
          expect.any(Object), // accuracy
          expect.any(Object), // timestamp
          expect.any(String), // barangay
          expect.any(String), // municipality
          expect.any(String), // province
          'completed', // status
          100 // progress
        ])
      );
    });

    it('should fail when no active cycle exists', async () => {
      (getActiveCycle as jest.Mock).mockResolvedValue(null);
      
      const { POST } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('No active survey cycle found. Please set an active cycle before creating survey responses.');
    });

    it('should generate survey number using active cycle year', async () => {
      const { POST } = await import('../route');
      
      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      await POST(request);

      expect(getNextSurveySequence).toHaveBeenCalledWith(5);
      expect(generateSurveyNumber).toHaveBeenCalledWith(5, 1);
    });
  });

  describe('Survey Number Format with Cycle Year', () => {
    it('should generate survey number with correct cycle year format', async () => {
      // Test with 2024 cycle
      (generateSurveyNumber as jest.Mock).mockResolvedValue('05-2024-0001');
      
      const { POST } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData.surveyNumber).toBe('05-2024-0001');
      expect(responseData.surveyNumber).toMatch(/^\d{2}-2024-\d{4}$/);
    });

    it('should generate survey number with different cycle year when cycle changes', async () => {
      // Test with 2025 cycle
      (getActiveCycle as jest.Mock).mockResolvedValue(mockActiveCycle2025);
      (generateSurveyNumber as jest.Mock).mockResolvedValue('05-2025-0001');
      
      const { POST } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData.surveyNumber).toBe('05-2025-0001');
      expect(responseData.surveyNumber).toMatch(/^\d{2}-2025-\d{4}$/);
      expect(responseData.cycleId).toBe(2);
    });
  });

  describe('Data Isolation Between Cycles', () => {
    it('should filter survey responses by active cycle by default', async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            response_id: 1,
            survey_number: '05-2024-0001',
            respondent_name: 'John Doe',
            survey_section: []
          }
        ]
      });
      
      const { GET } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses?barangayId=5');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseData)).toBe(true);
      
      // Verify query includes active cycle filter
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('sr.survey_cycle_id = $1'),
        expect.arrayContaining([1]) // active cycle ID
      );
    });

    it('should filter survey responses by specific cycle when cycleId provided', async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            response_id: 2,
            survey_number: '05-2023-0001',
            respondent_name: 'Jane Doe',
            survey_section: []
          }
        ]
      });
      
      const { GET } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses?barangayId=5&cycleId=3');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      
      // Verify query uses specific cycle ID instead of active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('sr.survey_cycle_id = $1'),
        expect.arrayContaining([3]) // specific cycle ID
      );
    });

    it('should fail when no active cycle exists and no cycleId provided', async () => {
      (getActiveCycle as jest.Mock).mockResolvedValue(null);
      
      const { GET } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses?barangayId=5');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('No active survey cycle found');
    });
  });

  describe('Cycle-Scoped Deletion', () => {
    it('should delete all responses for barangay in active cycle only', async () => {
      mockQuery.mockResolvedValue({ rowCount: 3 });
      
      const { DELETE } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses?deleteAll=true&barangayId=5&confirmWord=DELETE');

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.deletedCount).toBe(3);
      
      // Verify deletion is scoped to active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('barangay_id = $1 AND survey_cycle_id = $2'),
        [5, 1] // barangay_id and active cycle_id
      );
    });

    it('should fail deletion when no active cycle exists', async () => {
      (getActiveCycle as jest.Mock).mockResolvedValue(null);
      
      const { DELETE } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses?deleteAll=true&barangayId=5&confirmWord=DELETE');

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('No active survey cycle found');
    });
  });

  describe('Data Isolation Verification', () => {
    it('should ensure surveys from different cycles are isolated', async () => {
      const { POST } = await import('../route');
      
      // Create survey in cycle 1
      (getActiveCycle as jest.Mock).mockResolvedValue(mockActiveCycle);
      (generateSurveyNumber as jest.Mock).mockResolvedValue('05-2024-0001');
      
      const request1 = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      const response1 = await POST(request1);
      const responseData1 = await response1.json();

      expect(responseData1.cycleId).toBe(1);
      expect(responseData1.surveyNumber).toBe('05-2024-0001');

      // Switch to cycle 2
      (getActiveCycle as jest.Mock).mockResolvedValue(mockActiveCycle2025);
      (generateSurveyNumber as jest.Mock).mockResolvedValue('05-2025-0001');

      const request2 = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      const response2 = await POST(request2);
      const responseData2 = await response2.json();

      expect(responseData2.cycleId).toBe(2);
      expect(responseData2.surveyNumber).toBe('05-2025-0001');

      // Verify different cycles produce different survey numbers and cycle IDs
      expect(responseData1.cycleId).not.toBe(responseData2.cycleId);
      expect(responseData1.surveyNumber).not.toBe(responseData2.surveyNumber);
    });

    it('should update survey targets only for active cycle', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ response_id: 123 }] }) // INSERT survey_response
        .mockResolvedValueOnce({ rows: [] }) // INSERT survey_section
        .mockResolvedValueOnce({ rows: [{ target_id: 1, achieved: 5, target: 10 }] }) // SELECT survey_target
        .mockResolvedValueOnce({ rows: [] }); // UPDATE survey_target
      
      const { POST } = await import('../route');

      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(validSurveyData),
      });

      await POST(request);

      // Verify survey target query is scoped to active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM survey_target WHERE barangay_id = $1 AND survey_cycle_id = $2 LIMIT 1',
        [5, 1] // barangay_id and active cycle_id
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const { POST } = await import('../route');
      
      const invalidData = {
        location: null,
        interviewerId: null,
        barangayId: null,
      };

      const request = new NextRequest('http://localhost/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Missing required fields');
    });
  });
});