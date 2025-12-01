/**
 * Tests for NFA Rates Analytics API Error Handling
 * 
 * This test suite validates error handling scenarios for the NFA analytics API:
 * - Scenario 7: Handle zero responses case gracefully (Requirement 4.4)
 * - Scenario 8: Log and skip malformed JSONB data
 * - Scenario 9: Validate query parameters
 */

// Mock the dependencies BEFORE imports
jest.mock('@/lib/supabase');
jest.mock('@/lib/nfa-analytics-queries');

import { GET } from '../route';
import { NextRequest } from 'next/server';
import * as nfaQueries from '@/lib/nfa-analytics-queries';

// Setup mock implementations
beforeAll(() => {
  (nfaQueries.isValidServiceArea as jest.Mock).mockImplementation(
    (area: string) => ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'].includes(area)
  );
  
  (nfaQueries.isValidBinaryFieldName as jest.Mock).mockImplementation(
    (area: string, field: string) => 
      field === 'need_for_action_binary_projects' || field === 'need_for_action_binary_financial'
  );
  
  (nfaQueries.isValidCycleId as jest.Mock).mockImplementation(
    (id: any) => !isNaN(id) && Number(id) > 0 && Number.isInteger(Number(id))
  );
  
  (nfaQueries.isValidBarangayId as jest.Mock).mockImplementation(
    (id: any) => !isNaN(id) && Number(id) > 0 && Number.isInteger(Number(id))
  );
  
  (nfaQueries.getValidServiceAreas as jest.Mock).mockReturnValue(
    ['financial', 'disaster', 'safety', 'social', 'business', 'environmental']
  );
  
  (nfaQueries.getValidBinaryFieldNames as jest.Mock).mockReturnValue(
    ['need_for_action_binary_projects', 'need_for_action_binary_financial']
  );
});

describe('NFA Rates Analytics API - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scenario 9: Query Parameter Validation', () => {
    it('should return 400 for invalid mode', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=invalid&cycleId=1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid mode parameter');
    });

    it('should return 400 for missing cycleId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required parameter');
      expect(data.details).toContain('cycleId is required');
    });

    it('should return 400 for invalid cycleId (not a number)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=abc'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid cycleId parameter');
    });

    it('should return 400 for invalid cycleId (negative number)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=-1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid cycleId parameter');
    });

    it('should return 400 for invalid cycleId (zero)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=0'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid cycleId parameter');
    });

    it('should return 400 for missing serviceArea in indicator mode', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required parameter');
      expect(data.details).toContain('serviceArea is required');
    });

    it('should return 400 for invalid serviceArea', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=invalid'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid serviceArea parameter');
    });

    it('should return 400 for missing binaryFieldName in indicator mode', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required parameter');
      expect(data.details).toContain('binaryFieldName is required');
    });

    it('should return 400 for invalid binaryFieldName', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial&binaryFieldName=invalid'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid binaryFieldName parameter');
    });

    it('should return 400 for missing barangayId in indicator mode', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required parameter');
      expect(data.details).toContain('barangayId is required');
    });

    it('should return 400 for invalid barangayId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects&barangayId=abc'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid barangayId parameter');
    });
  });

  describe('Scenario 7: Zero Responses Case (Requirement 4.4)', () => {
    it('should return 0 for NFA rate when no responses exist', async () => {
      (nfaQueries.calculateNFARateForIndicator as jest.Mock).mockResolvedValue({
        totalResponses: 0,
        yesCount: 0,
        nfaRatePercentage: 0,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects&barangayId=1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.totalResponses).toBe(0);
      expect(data.result.yesCount).toBe(0);
      expect(data.result.nfaRatePercentage).toBe(0);
      expect(data.hasData).toBe(false);
      expect(data.message).toContain('No responses available');
    });

    it('should return empty array for service area with no responses', async () => {
      (nfaQueries.calculateNFARatesForServiceArea as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=service-area&cycleId=1&serviceArea=financial&barangayId=1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.hasData).toBe(false);
      expect(data.message).toContain('No responses available');
    });

    it('should return empty array for barangay comparison with no data', async () => {
      (nfaQueries.compareNFARatesAcrossBarangays as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=barangay-comparison&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(data.hasData).toBe(false);
      expect(data.message).toContain('No barangays with responses');
    });
  });

  describe('Valid Requests', () => {
    it('should successfully calculate NFA rate for valid indicator request', async () => {
      (nfaQueries.calculateNFARateForIndicator as jest.Mock).mockResolvedValue({
        totalResponses: 100,
        yesCount: 45,
        nfaRatePercentage: 45.0,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects&barangayId=1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.totalResponses).toBe(100);
      expect(data.result.yesCount).toBe(45);
      expect(data.result.nfaRatePercentage).toBe(45.0);
      expect(data.hasData).toBe(true);
      expect(data.message).toBeUndefined();
    });

    it('should successfully calculate NFA rates for service area', async () => {
      (nfaQueries.calculateNFARatesForServiceArea as jest.Mock).mockResolvedValue([
        {
          indicator: 'projects',
          totalResponses: 50,
          yesCount: 20,
          nfaRatePercentage: 40.0,
        },
        {
          indicator: 'financial',
          totalResponses: 50,
          yesCount: 25,
          nfaRatePercentage: 50.0,
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/nfa-rates?mode=service-area&cycleId=1&serviceArea=financial&barangayId=1'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toHaveLength(2);
      expect(data.hasData).toBe(true);
    });
  });
});
