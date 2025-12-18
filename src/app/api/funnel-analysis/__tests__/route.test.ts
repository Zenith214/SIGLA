import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

// Mock dependencies
jest.mock('@/utils/surveyCycleHelpers');

// Mock the PostgreSQL pool
const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
    }),
  })),
}));

// Mock fetch for ML API calls
global.fetch = jest.fn();

const mockGetActiveCycleId = getActiveCycleId as jest.MockedFunction<typeof getActiveCycleId>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('/api/funnel-analysis - Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variable
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    
    // Reset mocks
    mockQuery.mockReset();
    mockRelease.mockReset();
  });

  describe('Cycle-Scoped Funnel Analysis', () => {
    it('should filter survey data by active cycle only', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock survey data from active cycle
      const mockSurveyData = [
        {
          response_id: 1,
          survey_number: '05-2024-0001',
          section_name: 'Financial Services',
          section_key: 'financial',
          section_data: JSON.stringify({
            'aware_financial_services': 1,
            'availed_financial_services': 1,
            'satisfaction_financial': 4,
            'need_action_financial': 0
          })
        },
        {
          response_id: 2,
          survey_number: '05-2024-0002',
          section_name: 'Financial Services',
          section_key: 'financial',
          section_data: JSON.stringify({
            'aware_financial_services': 1,
            'availed_financial_services': 0,
            'satisfaction_financial': 3,
            'need_action_financial': 1
          })
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockSurveyData });

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.barangay_id).toBe(5);
      expect(data.total_responses).toBe(2);
      expect(data.ml_enhanced).toBe(false);
      
      // Verify query filters by active cycle
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sr.barangay_id = $1 AND sr.survey_cycle_id = $2'),
        [5, activeCycleId]
      );
      
      // Verify service scores are calculated
      expect(data.service_scores).toBeDefined();
      expect(data.service_scores.financial).toBeDefined();
      expect(data.action_grid).toBeDefined();
    });

    it('should return zero data when no active cycle exists', async () => {
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.barangay_id).toBe(5);
      expect(data.total_responses).toBe(0);
      expect(data.service_scores).toEqual({});
      expect(data.action_grid).toEqual({});
      expect(data.overall_satisfaction).toBe(0);
      expect(data.message).toBe('No active survey cycle found');
      
      // Should not query database when no active cycle
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should return zero data for new cycle with no survey responses', async () => {
      const activeCycleId = 2; // New cycle
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);
      mockQuery.mockResolvedValue({ rows: [] }); // No survey data in new cycle

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.barangay_id).toBe(5);
      expect(data.total_responses).toBe(0);
      expect(data.service_scores).toEqual({});
      expect(data.action_grid).toEqual({});
      expect(data.overall_satisfaction).toBe(0);
      expect(data.message).toBe('No survey data found for this barangay');
      
      // Verify query was made with new cycle ID
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('sr.survey_cycle_id = $2'),
        [5, activeCycleId]
      );
    });

    it('should calculate correct funnel scores from cycle-scoped data', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock comprehensive survey data for score calculation
      const mockSurveyData = [
        {
          response_id: 1,
          survey_number: '05-2024-0001',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: JSON.stringify({
            'aware_health_services': 1, // Aware
            'availed_health_services': 1, // Availed
            'satisfaction_health': 5, // Highly satisfied
            'need_action_health': 0 // No action needed
          })
        },
        {
          response_id: 2,
          survey_number: '05-2024-0002',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: JSON.stringify({
            'aware_health_services': 1, // Aware
            'availed_health_services': 0, // Not availed
            'satisfaction_health': 2, // Low satisfaction
            'need_action_health': 1 // Action needed
          })
        },
        {
          response_id: 3,
          survey_number: '05-2024-0003',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: JSON.stringify({
            'aware_health_services': 0, // Not aware
            'availed_health_services': 0, // Not availed
            'satisfaction_health': 3, // Neutral
            'need_action_health': 1 // Action needed
          })
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockSurveyData });

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total_responses).toBe(3);
      
      // Verify calculated scores
      const healthScores = data.service_scores.health;
      expect(healthScores).toBeDefined();
      expect(healthScores.awareness_score).toBe(67); // 2/3 * 100 = 67%
      expect(healthScores.availment_score).toBe(33); // 1/3 * 100 = 33%
      expect(healthScores.satisfaction_score).toBe(67); // ((5+2+3)/3)/5 * 100 = 67%
      expect(healthScores.need_action_score).toBe(67); // 2/3 * 100 = 67%
      
      // Verify action grid classification
      const healthAction = data.action_grid.health;
      expect(healthAction).toBeDefined();
      expect(healthAction.quadrant).toBe('MONITOR'); // Low satisfaction, low need for action
      expect(healthAction.satisfaction_score).toBe(67);
      expect(healthAction.need_action_score).toBe(67);
    });
  });

  describe('ML-Enhanced Analysis with Cycle Context', () => {
    it('should pass cycle ID to ML API when ML is requested', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock successful ML API response
      const mockMLResponse = {
        barangay_id: 5,
        total_responses: 10,
        service_scores: { health: { awareness_score: 80 } },
        action_grid: { health: { quadrant: 'MAINTAIN' } },
        overall_satisfaction: 85,
        ml_enhanced: true
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockMLResponse
      } as Response);

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}&useML=true`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ml_enhanced).toBe(true);
      expect(data.barangay_id).toBe(5);
      
      // Verify ML API was called with correct cycle ID
      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${activeCycleId}`
      );
    });

    it('should fallback to basic analysis when ML fails', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock ML API failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      } as Response);

      // Mock basic survey data for fallback
      const mockSurveyData = [
        {
          response_id: 1,
          survey_number: '05-2024-0001',
          section_name: 'Education Services',
          section_key: 'education',
          section_data: JSON.stringify({
            'aware_education_services': 1,
            'satisfaction_education': 4
          })
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockSurveyData });

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}&useML=true`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ml_enhanced).toBe(false);
      expect(data.barangay_id).toBe(5);
      
      // Should still filter by active cycle in fallback
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('sr.survey_cycle_id = $2'),
        [5, activeCycleId]
      );
    });
  });

  describe('Data Quality Metrics with Cycle Context', () => {
    it('should provide accurate data quality metrics for cycle-scoped data', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock survey data with multiple sections per respondent
      const mockSurveyData = [
        {
          response_id: 1,
          survey_number: '05-2024-0001',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: JSON.stringify({ 'aware_health': 1 })
        },
        {
          response_id: 1, // Same respondent
          survey_number: '05-2024-0001',
          section_name: 'Education Services',
          section_key: 'education',
          section_data: JSON.stringify({ 'aware_education': 1 })
        },
        {
          response_id: 2,
          survey_number: '05-2024-0002',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: JSON.stringify({ 'aware_health': 0 })
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockSurveyData });

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total_responses).toBe(2); // Unique respondents
      expect(data.total_section_responses).toBe(3); // Total section records
      expect(data.data_quality).toBeDefined();
      expect(data.data_quality.total_responses).toBe(2);
      expect(data.data_quality.total_section_responses).toBe(3);
      expect(data.data_quality.services_with_data).toBe(2); // health and education
      expect(data.data_quality.average_sections_per_respondent).toBe(2); // 3/2 rounded
    });

    it('should handle empty data quality metrics for new cycles', async () => {
      const activeCycleId = 2;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);
      mockQuery.mockResolvedValue({ rows: [] });

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total_responses).toBe(0);
      expect(data.service_scores).toEqual({});
      expect(data.action_grid).toEqual({});
      expect(data.overall_satisfaction).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should return 400 when barangayId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/funnel-analysis');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('barangayId parameter is required');
    });

    it('should handle database connection errors', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to calculate funnel analysis');
    });

    it('should handle survey cycle helper errors', async () => {
      const barangayId = '5';
      
      mockGetActiveCycleId.mockRejectedValue(new Error('Failed to get active cycle'));

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to calculate funnel analysis');
    });

    it('should handle malformed survey section data gracefully', async () => {
      const activeCycleId = 1;
      const barangayId = '5';
      
      mockGetActiveCycleId.mockResolvedValue(activeCycleId);

      // Mock survey data with malformed JSON
      const mockSurveyData = [
        {
          response_id: 1,
          survey_number: '05-2024-0001',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: 'invalid json'
        },
        {
          response_id: 2,
          survey_number: '05-2024-0002',
          section_name: 'Health Services',
          section_key: 'health',
          section_data: JSON.stringify({ 'aware_health': 1 })
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockSurveyData });

      const request = new NextRequest(`http://localhost:3000/api/funnel-analysis?barangayId=${barangayId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should still process valid data and skip malformed entries
      expect(data.total_responses).toBe(2);
      expect(data.service_scores.health).toBeDefined();
    });
  });
});