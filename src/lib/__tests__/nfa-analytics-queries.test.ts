/**
 * Unit tests for NFA Analytics Query Utilities
 * Tests the SQL query helper functions for calculating NFA rates
 * 
 * Requirements: 4.1, 4.2, 4.5
 */

import {
  SERVICE_INDICATORS,
  calculateNFARateForIndicator,
  calculateNFARatesForServiceArea,
  calculateNFARatesAcrossAllServiceAreas,
  compareNFARatesAcrossBarangays,
  calculateNFARateTrend,
  verifyNFARateIndependence,
  type NFARateResult,
  type IndicatorNFAResult,
  type ServiceAreaNFAResult,
  type BarangayNFAResult,
  type TrendNFAResult,
} from '../nfa-analytics-queries';

// Mock Supabase client
const createMockSupabaseClient = (mockData: any) => {
  const createChainablePromise = () => {
    const promise = Promise.resolve({ data: mockData, error: null });
    return Object.assign(promise, {
      eq: () => createChainablePromise(),
      order: () => createChainablePromise(),
    });
  };

  return {
    from: (table: string) => ({
      select: (columns: string) => createChainablePromise(),
    }),
    rpc: (functionName: string, params: any) => 
      Promise.resolve({ data: null, error: { message: 'RPC not available' } }),
  } as any;
};

describe('NFA Analytics Query Utilities', () => {
  describe('SERVICE_INDICATORS constant', () => {
    it('should have all 6 service areas defined', () => {
      expect(Object.keys(SERVICE_INDICATORS)).toHaveLength(6);
      expect(SERVICE_INDICATORS).toHaveProperty('financial');
      expect(SERVICE_INDICATORS).toHaveProperty('disaster');
      expect(SERVICE_INDICATORS).toHaveProperty('safety');
      expect(SERVICE_INDICATORS).toHaveProperty('social');
      expect(SERVICE_INDICATORS).toHaveProperty('business');
      expect(SERVICE_INDICATORS).toHaveProperty('environmental');
    });

    it('should have correct field naming convention for all indicators', () => {
      // Financial indicators
      expect(SERVICE_INDICATORS.financial.projects).toBe('need_for_action_binary_projects');
      expect(SERVICE_INDICATORS.financial.financial).toBe('need_for_action_binary_financial');
      
      // Disaster indicators
      expect(SERVICE_INDICATORS.disaster.disasterInfo).toBe('need_for_action_binary_disasterInfo');
      
      // Safety indicators
      expect(SERVICE_INDICATORS.safety.tanods).toBe('need_for_action_binary_tanods');
      
      // Social indicators
      expect(SERVICE_INDICATORS.social.healthServices).toBe('need_for_action_binary_healthServices');
      
      // Business indicators
      expect(SERVICE_INDICATORS.business.businessClearance).toBe('need_for_action_binary_businessClearance');
      
      // Environmental indicators
      expect(SERVICE_INDICATORS.environmental.wasteManagement).toBe('need_for_action_binary_wasteManagement');
    });

    it('should have all 14 service indicators across all areas', () => {
      const totalIndicators = Object.values(SERVICE_INDICATORS).reduce(
        (sum, area) => sum + Object.keys(area).length,
        0
      );
      // Financial: 4, Disaster: 2, Safety: 3, Social: 3, Business: 1, Environmental: 1 = 14 total
      expect(totalIndicators).toBe(14);
    });
  });

  describe('calculateNFARateForIndicator', () => {
    it('should calculate NFA rate correctly with English responses', async () => {
      const mockSections = [
        { data: { need_for_action_binary_projects: 'Yes' } },
        { data: { need_for_action_binary_projects: 'No' } },
        { data: { need_for_action_binary_projects: 'Yes' } },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(3);
      expect(result.yesCount).toBe(2);
      expect(result.nfaRatePercentage).toBe(66.7);
    });

    it('should calculate NFA rate correctly with Tagalog responses', async () => {
      const mockSections = [
        { data: { need_for_action_binary_projects: 'Oo' } },
        { data: { need_for_action_binary_projects: 'Hindi' } },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(2);
      expect(result.yesCount).toBe(1);
      expect(result.nfaRatePercentage).toBe(50);
    });

    it('should handle mixed English and Tagalog responses', async () => {
      const mockSections = [
        { data: { need_for_action_binary_projects: 'Yes' } },
        { data: { need_for_action_binary_projects: 'Oo' } },
        { data: { need_for_action_binary_projects: 'No' } },
        { data: { need_for_action_binary_projects: 'Hindi' } },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(4);
      expect(result.yesCount).toBe(2);
      expect(result.nfaRatePercentage).toBe(50);
    });

    it('should return 0 percentage when no responses exist', async () => {
      const supabase = createMockSupabaseClient([]);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(0);
      expect(result.yesCount).toBe(0);
      expect(result.nfaRatePercentage).toBe(0);
    });

    it('should handle all "Yes" responses', async () => {
      const mockSections = [
        { data: { need_for_action_binary_projects: 'Yes' } },
        { data: { need_for_action_binary_projects: 'Yes' } },
        { data: { need_for_action_binary_projects: 'Yes' } },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(3);
      expect(result.yesCount).toBe(3);
      expect(result.nfaRatePercentage).toBe(100);
    });

    it('should handle all "No" responses', async () => {
      const mockSections = [
        { data: { need_for_action_binary_projects: 'No' } },
        { data: { need_for_action_binary_projects: 'No' } },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(2);
      expect(result.yesCount).toBe(0);
      expect(result.nfaRatePercentage).toBe(0);
    });

    it('should handle JSONB data as string', async () => {
      const mockSections = [
        { data: JSON.stringify({ need_for_action_binary_projects: 'Yes' }) },
        { data: JSON.stringify({ need_for_action_binary_projects: 'No' }) },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(2);
      expect(result.yesCount).toBe(1);
      expect(result.nfaRatePercentage).toBe(50);
    });

    it('should handle case-insensitive binary values', async () => {
      const mockSections = [
        { data: { need_for_action_binary_projects: 'YES' } },
        { data: { need_for_action_binary_projects: 'yes' } },
        { data: { need_for_action_binary_projects: 'OO' } },
        { data: { need_for_action_binary_projects: 'oo' } },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await calculateNFARateForIndicator(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        1,
        1
      );

      expect(result.totalResponses).toBe(4);
      expect(result.yesCount).toBe(4);
      expect(result.nfaRatePercentage).toBe(100);
    });
  });

  describe('verifyNFARateIndependence', () => {
    it('should verify that NFA rate is independent of suggestion content', async () => {
      const mockSections = [
        { 
          data: { 
            need_for_action_binary_projects: 'Yes',
            need_for_action_suggestion_projects: 'Some suggestion'
          } 
        },
        { 
          data: { 
            need_for_action_binary_projects: 'Yes',
            need_for_action_suggestion_projects: ''
          } 
        },
        { 
          data: { 
            need_for_action_binary_projects: 'No',
            need_for_action_suggestion_projects: 'Another suggestion'
          } 
        },
        { 
          data: { 
            need_for_action_binary_projects: 'No',
            need_for_action_suggestion_projects: ''
          } 
        },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await verifyNFARateIndependence(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        'need_for_action_suggestion_projects',
        1,
        1
      );

      // Both groups should have the same proportion of Yes/No
      expect(result.withSuggestions.totalResponses).toBe(2);
      expect(result.withoutSuggestions.totalResponses).toBe(2);
      
      // Overall rate should match weighted average
      expect(result.ratesMatch).toBe(true);
    });

    it('should handle case where all responses have suggestions', async () => {
      const mockSections = [
        { 
          data: { 
            need_for_action_binary_projects: 'Yes',
            need_for_action_suggestion_projects: 'Suggestion 1'
          } 
        },
        { 
          data: { 
            need_for_action_binary_projects: 'No',
            need_for_action_suggestion_projects: 'Suggestion 2'
          } 
        },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await verifyNFARateIndependence(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        'need_for_action_suggestion_projects',
        1,
        1
      );

      expect(result.withSuggestions.totalResponses).toBe(2);
      expect(result.withoutSuggestions.totalResponses).toBe(0);
      expect(result.withSuggestions.nfaRatePercentage).toBe(50);
    });

    it('should handle case where no responses have suggestions', async () => {
      const mockSections = [
        { 
          data: { 
            need_for_action_binary_projects: 'Yes',
            need_for_action_suggestion_projects: ''
          } 
        },
        { 
          data: { 
            need_for_action_binary_projects: 'No',
            need_for_action_suggestion_projects: ''
          } 
        },
      ];

      const supabase = createMockSupabaseClient(mockSections);
      
      const result = await verifyNFARateIndependence(
        supabase,
        'financial',
        'need_for_action_binary_projects',
        'need_for_action_suggestion_projects',
        1,
        1
      );

      expect(result.withSuggestions.totalResponses).toBe(0);
      expect(result.withoutSuggestions.totalResponses).toBe(2);
      expect(result.withoutSuggestions.nfaRatePercentage).toBe(50);
    });
  });

  describe('Type definitions', () => {
    it('should have correct NFARateResult type structure', () => {
      const result: NFARateResult = {
        totalResponses: 10,
        yesCount: 5,
        nfaRatePercentage: 50,
      };

      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('yesCount');
      expect(result).toHaveProperty('nfaRatePercentage');
    });

    it('should have correct IndicatorNFAResult type structure', () => {
      const result: IndicatorNFAResult = {
        indicator: 'projects',
        totalResponses: 10,
        yesCount: 5,
        nfaRatePercentage: 50,
      };

      expect(result).toHaveProperty('indicator');
      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('yesCount');
      expect(result).toHaveProperty('nfaRatePercentage');
    });

    it('should have correct ServiceAreaNFAResult type structure', () => {
      const result: ServiceAreaNFAResult = {
        serviceArea: 'financial',
        totalResponses: 10,
        yesCount: 5,
        nfaRatePercentage: 50,
      };

      expect(result).toHaveProperty('serviceArea');
      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('yesCount');
      expect(result).toHaveProperty('nfaRatePercentage');
    });

    it('should have correct BarangayNFAResult type structure', () => {
      const result: BarangayNFAResult = {
        barangayId: 1,
        barangayName: 'Test Barangay',
        totalResponses: 10,
        yesCount: 5,
        nfaRatePercentage: 50,
      };

      expect(result).toHaveProperty('barangayId');
      expect(result).toHaveProperty('barangayName');
      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('yesCount');
      expect(result).toHaveProperty('nfaRatePercentage');
    });

    it('should have correct TrendNFAResult type structure', () => {
      const result: TrendNFAResult = {
        cycleId: 1,
        cycleName: 'Cycle 1',
        year: 2024,
        totalResponses: 10,
        yesCount: 5,
        nfaRatePercentage: 50,
      };

      expect(result).toHaveProperty('cycleId');
      expect(result).toHaveProperty('cycleName');
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('totalResponses');
      expect(result).toHaveProperty('yesCount');
      expect(result).toHaveProperty('nfaRatePercentage');
    });
  });
});
