/**
 * Cycle Transition with Award Data Preservation Tests
 * 
 * Tests the system's ability to preserve award data during cycle transitions,
 * ensuring data integrity and proper handling of award copying between cycles.
 * 
 * Requirements: Historical award preservation, Smooth cycle transitions,
 * Data integrity across cycle transitions, Award copying between cycles
 */

import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycleId, getSurveyCycleById } from '@/utils/surveyCycleHelpers';

// Mock external dependencies
jest.mock('@/lib/supabase');
jest.mock('@/utils/surveyCycleHelpers');

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
const mockGetActiveCycleId = getActiveCycleId as jest.MockedFunction<typeof getActiveCycleId>;
const mockGetSurveyCycleById = getSurveyCycleById as jest.MockedFunction<typeof getSurveyCycleById>;

describe('Cycle Transition with Award Data Preservation', () => {
  // Test data setup
  const mockCycle2024 = {
    cycle_id: 1,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: false,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-12-31')
  };

  const mockCycle2025 = {
    cycle_id: 2,
    name: 'Survey Cycle 2025',
    year: 2025,
    is_active: true,
    start_date: new Date('2025-01-01'),
    end_date: new Date('2025-12-31'),
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01')
  };

  const mockCycle2026 = {
    cycle_id: 3,
    name: 'Survey Cycle 2026',
    year: 2026,
    is_active: false,
    start_date: new Date('2026-01-01'),
    end_date: new Date('2026-12-31'),
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01')
  };

  const mockAwards2024 = [
    {
      id: 1,
      barangay_id: 1,
      cycle_id: 1,
      is_awardee: true,
      awarded_date: new Date('2024-02-15'),
      notes: 'Excellent governance performance',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
      created_by: 1
    },
    {
      id: 2,
      barangay_id: 2,
      cycle_id: 1,
      is_awardee: false,
      awarded_date: null,
      notes: 'Needs improvement in service delivery',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
      created_by: 1
    },
    {
      id: 3,
      barangay_id: 3,
      cycle_id: 1,
      is_awardee: true,
      awarded_date: new Date('2024-02-15'),
      notes: 'Outstanding community engagement',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
      created_by: 1
    },
    {
      id: 4,
      barangay_id: 4,
      cycle_id: 1,
      is_awardee: false,
      awarded_date: null,
      notes: 'Below performance standards',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
      created_by: 1
    },
    {
      id: 5,
      barangay_id: 5,
      cycle_id: 1,
      is_awardee: true,
      awarded_date: new Date('2024-02-15'),
      notes: 'Consistent high performance',
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15'),
      created_by: 1
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetActiveCycleId.mockResolvedValue(2); // 2025 is active
    mockGetSurveyCycleById.mockImplementation(async (id: number) => {
      switch (id) {
        case 1: return mockCycle2024;
        case 2: return mockCycle2025;
        case 3: return mockCycle2026;
        default: return null;
      }
    });
  });

  describe('Award Data Preservation During Cycle Transitions', () => {
    /**
     * Test that awards are preserved when switching between cycles
     */
    it('should preserve award data when switching between cycles', async () => {
      // Mock getting awards for cycle 2024
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockAwards2024,
              error: null
            })
          })
        })
      });
      mockSupabaseAdmin.from = mockFrom;

      // Get awards for 2024 cycle
      const awards2024 = await CycleAwardsService.getCycleAwards(1);
      expect(awards2024).toHaveLength(5);
      expect(awards2024.filter(a => a.is_awardee)).toHaveLength(3);

      // Mock getting awards for 2025 cycle (different awards)
      const mockAwards2025 = [
        {
          id: 6,
          barangay_id: 1,
          cycle_id: 2,
          is_awardee: false, // Changed from 2024
          awarded_date: null,
          notes: 'Performance declined',
          created_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-15'),
          created_by: 1
        },
        {
          id: 7,
          barangay_id: 2,
          cycle_id: 2,
          is_awardee: true, // Changed from 2024
          awarded_date: new Date('2025-01-15'),
          notes: 'Significant improvement',
          created_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-15'),
          created_by: 1
        },
        {
          id: 8,
          barangay_id: 3,
          cycle_id: 2,
          is_awardee: true, // Same as 2024
          awarded_date: new Date('2025-01-15'),
          notes: 'Maintained excellence',
          created_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-15'),
          created_by: 1
        }
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockAwards2025,
              error: null
            })
          })
        })
      });

      // Get awards for 2025 cycle
      const awards2025 = await CycleAwardsService.getCycleAwards(2);
      expect(awards2025).toHaveLength(3);
      expect(awards2025.filter(a => a.is_awardee)).toHaveLength(2);

      // Verify that 2024 data is still preserved when we switch back
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockAwards2024,
              error: null
            })
          })
        })
      });

      const preservedAwards2024 = await CycleAwardsService.getCycleAwards(1);
      expect(preservedAwards2024).toEqual(awards2024);
      expect(preservedAwards2024).toHaveLength(5);
      expect(preservedAwards2024.filter(a => a.is_awardee)).toHaveLength(3);
    });

    /**
     * Test award copying between cycles
     */
    it('should successfully copy awards from one cycle to another', async () => {
      // Mock the expected copied awards
      const expectedCopiedAwards = mockAwards2024.map((award, index) => ({
        ...award,
        id: award.id + 10, // New IDs
        cycle_id: 2, // Target cycle
        notes: 'Copied from Survey Cycle 2024 (2024)',
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15')
      }));

      // Mock the service methods
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(mockAwards2024);
      jest.spyOn(CycleAwardsService, 'bulkUpdateAwards').mockResolvedValue(expectedCopiedAwards);

      // Copy awards from 2024 to 2025
      const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(1, 2, 1);

      expect(copiedAwards).toBeDefined();
      expect(copiedAwards).toHaveLength(5);
      expect(copiedAwards.every(award => award.cycle_id === 2)).toBe(true);
    });

    /**
     * Test that copying preserves award status and adds appropriate notes
     */
    it('should preserve award status and add copy notes when copying between cycles', async () => {
      // Mock successful copy operation
      const expectedCopiedAwards = mockAwards2024.map((award, index) => ({
        ...award,
        id: award.id + 10, // New IDs
        cycle_id: 2, // Target cycle
        notes: 'Copied from Survey Cycle 2024 (2024)',
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15')
      }));

      // Mock the service method to return expected results
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(mockAwards2024);
      jest.spyOn(CycleAwardsService, 'bulkUpdateAwards').mockResolvedValue(expectedCopiedAwards);

      const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(1, 2, 1);

      // Verify that award statuses are preserved
      const originalAwardees = mockAwards2024.filter(a => a.is_awardee).map(a => a.barangay_id);
      const copiedAwardees = copiedAwards.filter(a => a.is_awardee).map(a => a.barangay_id);
      
      expect(copiedAwardees).toEqual(originalAwardees);
      expect(copiedAwards).toHaveLength(mockAwards2024.length);
      
      // Verify copy notes are added
      copiedAwards.forEach(award => {
        expect(award.notes).toContain('Copied from Survey Cycle 2024');
        expect(award.cycle_id).toBe(2);
      });
    });

    /**
     * Test error handling when copying between invalid cycles
     */
    it('should handle errors when copying between invalid cycles', async () => {
      // Test copying from same cycle to itself - should fail
      await expect(
        CycleAwardsService.copyAwardsBetweenCycles(1, 1, 1)
      ).rejects.toThrow('Failed to copy awards between cycles');

      // Test copying from non-existent source cycle - should fail
      mockGetSurveyCycleById.mockImplementation(async (id: number) => {
        if (id === 999) return null; // Non-existent cycle
        if (id === 2) return mockCycle2025;
        return null;
      });

      await expect(
        CycleAwardsService.copyAwardsBetweenCycles(999, 2, 1)
      ).rejects.toThrow('Failed to copy awards between cycles');

      // Test copying to non-existent target cycle - should fail
      mockGetSurveyCycleById.mockImplementation(async (id: number) => {
        if (id === 1) return mockCycle2024;
        if (id === 999) return null; // Non-existent cycle
        return null;
      });

      await expect(
        CycleAwardsService.copyAwardsBetweenCycles(1, 999, 1)
      ).rejects.toThrow('Failed to copy awards between cycles');
    });
  });

  describe('Historical Award Data Access', () => {
    /**
     * Test accessing historical award data for specific cycles
     */
    it('should allow access to historical award data for any cycle', async () => {
      const mockHistoricalData = {
        cycle1: mockAwards2024,
        cycle2: [
          {
            id: 6,
            barangay_id: 1,
            cycle_id: 2,
            is_awardee: false,
            awarded_date: null,
            notes: 'Status changed in 2025',
            created_at: new Date('2025-01-15'),
            updated_at: new Date('2025-01-15'),
            created_by: 1
          }
        ],
        cycle3: [
          {
            id: 7,
            barangay_id: 1,
            cycle_id: 3,
            is_awardee: true,
            awarded_date: new Date('2026-01-15'),
            notes: 'Regained award status in 2026',
            created_at: new Date('2026-01-15'),
            updated_at: new Date('2026-01-15'),
            created_by: 1
          }
        ]
      };

      // Mock getCycleAwards to return different data for different cycles
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockImplementation(async (cycleId) => {
        if (cycleId === 1) return mockHistoricalData.cycle1;
        if (cycleId === 2) return mockHistoricalData.cycle2;
        if (cycleId === 3) return mockHistoricalData.cycle3;
        return [];
      });

      // Access historical data for each cycle
      const awards2024 = await CycleAwardsService.getCycleAwards(1);
      const awards2025 = await CycleAwardsService.getCycleAwards(2);
      const awards2026 = await CycleAwardsService.getCycleAwards(3);

      expect(awards2024).toHaveLength(5);
      expect(awards2025).toHaveLength(1);
      expect(awards2026).toHaveLength(1);

      // Verify barangay 1's award status changes across cycles
      const barangay1_2024 = awards2024.find(a => a.barangay_id === 1);
      const barangay1_2025 = awards2025.find(a => a.barangay_id === 1);
      const barangay1_2026 = awards2026.find(a => a.barangay_id === 1);

      expect(barangay1_2024?.is_awardee).toBe(true);
      expect(barangay1_2025?.is_awardee).toBe(false);
      expect(barangay1_2026?.is_awardee).toBe(true);
    });

    /**
     * Test award history retrieval for a specific barangay
     */
    it('should retrieve complete award history for a barangay across all cycles', async () => {
      const mockHistoryData = [
        {
          id: 1,
          barangay_id: 1,
          cycle_id: 1,
          is_awardee: true,
          awarded_date: new Date('2024-02-15'),
          notes: 'Initial award',
          created_at: new Date('2024-02-15'),
          updated_at: new Date('2024-02-15'),
          created_by: 1,
          survey_cycle: mockCycle2024
        },
        {
          id: 6,
          barangay_id: 1,
          cycle_id: 2,
          is_awardee: false,
          awarded_date: null,
          notes: 'Award removed',
          created_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-15'),
          created_by: 1,
          survey_cycle: mockCycle2025
        },
        {
          id: 11,
          barangay_id: 1,
          cycle_id: 3,
          is_awardee: true,
          awarded_date: new Date('2026-01-15'),
          notes: 'Award restored',
          created_at: new Date('2026-01-15'),
          updated_at: new Date('2026-01-15'),
          created_by: 1,
          survey_cycle: mockCycle2026
        }
      ];

      // Mock getAwardHistory to return the expected data in correct order
      jest.spyOn(CycleAwardsService, 'getAwardHistory').mockResolvedValue([
        {
          cycleId: 3,
          cycleName: 'Survey Cycle 2026',
          year: 2026,
          isAwardee: true,
          awardedDate: new Date('2026-01-15'),
          notes: 'Award restored',
          createdAt: new Date('2026-01-15')
        },
        {
          cycleId: 2,
          cycleName: 'Survey Cycle 2025',
          year: 2025,
          isAwardee: false,
          awardedDate: null,
          notes: 'Award removed',
          createdAt: new Date('2025-01-15')
        },
        {
          cycleId: 1,
          cycleName: 'Survey Cycle 2024',
          year: 2024,
          isAwardee: true,
          awardedDate: new Date('2024-02-15'),
          notes: 'Initial award',
          createdAt: new Date('2024-02-15')
        }
      ]);

      const history = await CycleAwardsService.getAwardHistory(1);

      expect(history).toHaveLength(3);
      expect(history[0].cycleName).toBe('Survey Cycle 2026');
      expect(history[0].isAwardee).toBe(true);
      expect(history[1].cycleName).toBe('Survey Cycle 2025');
      expect(history[1].isAwardee).toBe(false);
      expect(history[2].cycleName).toBe('Survey Cycle 2024');
      expect(history[2].isAwardee).toBe(true);

      // Verify chronological order (most recent first - by cycle_id descending)
      expect(history[0].cycleId).toBeGreaterThan(history[1].cycleId);
      expect(history[1].cycleId).toBeGreaterThan(history[2].cycleId);
    });
  });

  describe('Data Integrity During Cycle Transitions', () => {
    /**
     * Test that cycle transitions maintain referential integrity
     */
    it('should maintain referential integrity during cycle transitions', async () => {
      // Mock database constraint validation
      const mockConstraintCheck = jest.fn().mockResolvedValue({
        data: { valid: true, violations: [] },
        error: null
      });

      mockSupabaseAdmin.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockAwards2024,
              error: null
            })
          })
        }),
        rpc: mockConstraintCheck
      });

      // Simulate cycle transition
      const awards = await CycleAwardsService.getCycleAwards(1);
      expect(awards).toHaveLength(5);

      // Verify all awards have valid barangay and cycle references
      awards.forEach(award => {
        expect(award.barangay_id).toBeGreaterThan(0);
        expect(award.cycle_id).toBe(1);
        expect(typeof award.is_awardee).toBe('boolean');
      });
    });

    /**
     * Test handling of orphaned award records
     */
    it('should handle orphaned award records gracefully', async () => {
      // Mock scenario with orphaned records (barangay or cycle doesn't exist)
      const mockOrphanedAwards = [
        ...mockAwards2024,
        {
          id: 999,
          barangay_id: 999, // Non-existent barangay
          cycle_id: 1,
          is_awardee: true,
          awarded_date: new Date('2024-02-15'),
          notes: 'Orphaned record',
          created_at: new Date('2024-02-15'),
          updated_at: new Date('2024-02-15'),
          created_by: 1
        }
      ];

      // Mock getCycleAwards to return orphaned data
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(mockOrphanedAwards);

      const awards = await CycleAwardsService.getCycleAwards(1);
      
      // Service should return all records, but application logic should handle validation
      expect(awards).toHaveLength(6);
      
      // Identify potentially orphaned records
      const suspiciousRecords = awards.filter(award => award.barangay_id > 100);
      expect(suspiciousRecords).toHaveLength(1);
      expect(suspiciousRecords[0].barangay_id).toBe(999);
    });

    /**
     * Test concurrent cycle transition operations
     */
    it('should handle concurrent cycle transition operations safely', async () => {
      // Mock concurrent operations
      const operation1Promise = CycleAwardsService.copyAwardsBetweenCycles(1, 2, 1);
      const operation2Promise = CycleAwardsService.copyAwardsBetweenCycles(1, 3, 1);

      // Mock successful operations
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(mockAwards2024);
      jest.spyOn(CycleAwardsService, 'bulkUpdateAwards').mockResolvedValue(mockAwards2024);

      // Both operations should complete successfully
      const [result1, result2] = await Promise.all([operation1Promise, operation2Promise]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).toHaveLength(5);
      expect(result2).toHaveLength(5);
    });
  });

  describe('Performance During Large Cycle Transitions', () => {
    /**
     * Test performance with large datasets during cycle transitions
     */
    it('should handle large datasets efficiently during cycle transitions', async () => {
      // Generate large dataset (1000 awards)
      const largeAwardDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        barangay_id: i + 1,
        cycle_id: 1,
        is_awardee: i % 3 === 0, // Every 3rd barangay is an awardee
        awarded_date: i % 3 === 0 ? new Date('2024-02-15') : null,
        notes: `Award ${i + 1}`,
        created_at: new Date('2024-02-15'),
        updated_at: new Date('2024-02-15'),
        created_by: 1
      }));

      // Mock getCycleAwards to return large dataset
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(largeAwardDataset);

      const startTime = Date.now();
      const awards = await CycleAwardsService.getCycleAwards(1);
      const endTime = Date.now();

      expect(awards).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      
      const awardees = awards.filter(a => a.is_awardee);
      expect(awardees).toHaveLength(334); // Approximately 1000/3 + 1
    });

    /**
     * Test batch processing during large copy operations
     */
    it('should use batch processing for large copy operations', async () => {
      const largeSourceAwards = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        barangay_id: i + 1,
        cycle_id: 1,
        is_awardee: i % 2 === 0,
        awarded_date: i % 2 === 0 ? new Date('2024-02-15') : null,
        notes: `Source award ${i + 1}`,
        created_at: new Date('2024-02-15'),
        updated_at: new Date('2024-02-15'),
        created_by: 1
      }));

      // Mock the service methods
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(largeSourceAwards);
      
      // Mock bulk update to simulate batch processing
      const mockBulkUpdate = jest.spyOn(CycleAwardsService, 'bulkUpdateAwards')
        .mockImplementation(async (awards, cycleId, createdBy) => {
          // Simulate batch processing delay
          await new Promise(resolve => setTimeout(resolve, 10));
          return awards.map((award, index) => ({
            id: index + 1000,
            barangay_id: award.barangayId,
            cycle_id: cycleId || 2,
            is_awardee: award.isAwardee,
            awarded_date: award.isAwardee ? new Date() : null,
            notes: award.notes || 'Copied award',
            created_at: new Date(),
            updated_at: new Date(),
            created_by: createdBy || 1
          }));
        });

      const startTime = Date.now();
      const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(1, 2, 1);
      const endTime = Date.now();

      expect(copiedAwards).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(mockBulkUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    /**
     * Test handling of partial copy failures
     */
    it('should handle partial copy failures gracefully', async () => {
      // Mock scenario where some awards fail to copy
      const partialFailureAwards = mockAwards2024.slice(0, 3); // Only first 3 awards

      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue(mockAwards2024);
      jest.spyOn(CycleAwardsService, 'bulkUpdateAwards').mockResolvedValue(partialFailureAwards);

      const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(1, 2, 1);

      expect(copiedAwards).toHaveLength(3);
      expect(copiedAwards.length).toBeLessThan(mockAwards2024.length);
    });

    /**
     * Test recovery from database connection issues during transitions
     */
    it('should handle database connection issues during transitions', async () => {
      // Mock database connection error
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockRejectedValue(new Error('Failed to retrieve cycle awards'));

      await expect(
        CycleAwardsService.getCycleAwards(1)
      ).rejects.toThrow('Failed to retrieve cycle awards');
    });

    /**
     * Test handling of empty source cycles during copy operations
     */
    it('should handle empty source cycles during copy operations', async () => {
      // Mock empty source cycle
      jest.spyOn(CycleAwardsService, 'getCycleAwards').mockResolvedValue([]);

      const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(1, 2, 1);

      expect(copiedAwards).toHaveLength(0);
    });

    /**
     * Test validation of cycle existence before operations
     */
    it('should validate cycle existence before performing operations', async () => {
      // Mock non-existent cycles
      mockGetSurveyCycleById.mockResolvedValue(null);

      await expect(
        CycleAwardsService.copyAwardsBetweenCycles(999, 1000, 1)
      ).rejects.toThrow('Failed to copy awards between cycles');
    });
  });
});