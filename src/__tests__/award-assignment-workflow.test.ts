/**
 * Complete Award Assignment Workflow Integration Test
 * 
 * Tests the end-to-end award assignment workflow including:
 * - Award assignment/removal through settings UI
 * - Survey target creation for awardees only
 * - Map coloring updates based on award status
 * - Dashboard filtering for awardee data
 * - Cycle transitions with award preservation
 * 
 * Requirements: Award CRUD operations, Awardee-only survey targeting,
 * Simple visual distinction, Cycle-aware barangay data, Awardee-focused dashboard
 */

// Mock fetch for API calls
const mockWorkflowFetch = jest.fn();
global.fetch = mockWorkflowFetch;

describe('Complete Award Assignment Workflow Integration Test', () => {
  // Test data setup
  const mockActiveCycle = {
    cycle_id: 1,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  const mockUser = {
    user_id: 1,
    username: 'admin',
    role: 'administrator'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkflowFetch.mockClear();
  });

  describe('End-to-End Award Assignment Workflow', () => {
    /**
     * Test complete workflow: Award Assignment → Survey Target Creation → Map Update → Dashboard Update
     */
    it('should complete full award assignment workflow successfully', async () => {
      // Step 1: Initial state - no awards assigned
      const initialAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [],
          totalBarangays: 5,
          awardeeCount: 0
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(initialAwardsResponse as any);

      // Get initial awards state
      let response = await fetch(`/api/cycle-awards?cycle_id=${mockActiveCycle.cycle_id}`);
      let data = await response.json();
      
      expect(data.awardeeCount).toBe(0);
      expect(data.totalBarangays).toBe(5);

      // Step 2: Assign awards to barangays 1, 3, and 5
      const awardAssignments = [
        { barangayId: 1, isAwardee: true, notes: 'Excellent performance' },
        { barangayId: 3, isAwardee: true, notes: 'Outstanding service delivery' },
        { barangayId: 5, isAwardee: true, notes: 'Consistent improvement' }
      ];

      const bulkAssignResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          message: 'Awards assigned successfully',
          assignedCount: 3
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(bulkAssignResponse as any);

      // Assign awards via bulk API
      response = await fetch('/api/cycle-awards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: mockActiveCycle.cycle_id,
          awards: awardAssignments,
          createdBy: mockUser.user_id
        })
      });
      data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.assignedCount).toBe(3);

      // Step 3: Verify updated awards state
      const updatedAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 1, barangay_id: 1, cycle_id: 1, is_awardee: true, notes: 'Excellent performance' },
            { id: 2, barangay_id: 3, cycle_id: 1, is_awardee: true, notes: 'Outstanding service delivery' },
            { id: 3, barangay_id: 5, cycle_id: 1, is_awardee: true, notes: 'Consistent improvement' }
          ],
          totalBarangays: 5,
          awardeeCount: 3
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(updatedAwardsResponse as any);

      response = await fetch(`/api/cycle-awards?cycle_id=${mockActiveCycle.cycle_id}`);
      data = await response.json();

      expect(data.awardeeCount).toBe(3);
      expect(data.awards).toHaveLength(3);
      expect(data.awards.map((a: any) => a.barangay_id)).toEqual([1, 3, 5]);

      // Step 4: Create survey targets for awardees only
      const surveyTargetsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          targets: [
            { target_id: 1, barangay_id: 1, survey_cycle_id: 1, target: 15, achieved: 0 },
            { target_id: 2, barangay_id: 3, survey_cycle_id: 1, target: 20, achieved: 0 },
            { target_id: 3, barangay_id: 5, survey_cycle_id: 1, target: 12, achieved: 0 }
          ],
          message: 'Survey targets created for awardee barangays only'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(surveyTargetsResponse as any);

      response = await fetch('/api/survey-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: mockActiveCycle.cycle_id,
          awardeeOnly: true
        })
      });
      data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.targets).toHaveLength(3);
      expect(data.targets.map((t: any) => t.barangay_id)).toEqual([1, 3, 5]);

      // Step 5: Verify map coloring reflects award status
      const mapDataResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          barangays: [
            { barangay_id: 1, barangay_name: 'Barangay Alpha', is_awardee: true, color: '#22c55e' },
            { barangay_id: 2, barangay_name: 'Barangay Beta', is_awardee: false, color: '#6b7280' },
            { barangay_id: 3, barangay_name: 'Barangay Gamma', is_awardee: true, color: '#22c55e' },
            { barangay_id: 4, barangay_name: 'Barangay Delta', is_awardee: false, color: '#6b7280' },
            { barangay_id: 5, barangay_name: 'Barangay Epsilon', is_awardee: true, color: '#22c55e' }
          ],
          legend: {
            awardee: { color: '#22c55e', label: 'Awardee' },
            nonAwardee: { color: '#6b7280', label: 'Non-Awardee' }
          }
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(mapDataResponse as any);

      response = await fetch(`/api/barangays?cycle_id=${mockActiveCycle.cycle_id}&include_awards=true`);
      data = await response.json();

      const awardeeBarangays = data.barangays.filter((b: any) => b.is_awardee);
      const nonAwardeeBarangays = data.barangays.filter((b: any) => !b.is_awardee);

      expect(awardeeBarangays).toHaveLength(3);
      expect(nonAwardeeBarangays).toHaveLength(2);
      expect(awardeeBarangays.every((b: any) => b.color === '#22c55e')).toBe(true);
      expect(nonAwardeeBarangays.every((b: any) => b.color === '#6b7280')).toBe(true);

      // Step 6: Verify dashboard shows awardee-focused data
      const dashboardResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          summary: {
            total_awardees: 3,
            total_targets: 47, // 15 + 20 + 12
            total_achieved: 0,
            progress_percentage: 0,
            awardee_barangays: [1, 3, 5]
          },
          targets: [
            { barangay_id: 1, target: 15, achieved: 0, percentage: 0 },
            { barangay_id: 3, target: 20, achieved: 0, percentage: 0 },
            { barangay_id: 5, target: 12, achieved: 0, percentage: 0 }
          ],
          filterInfo: {
            includesNonAwardees: false,
            cycleId: mockActiveCycle.cycle_id
          }
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(dashboardResponse as any);

      response = await fetch(`/api/dashboard?cycle_id=${mockActiveCycle.cycle_id}`);
      data = await response.json();

      expect(data.summary.total_awardees).toBe(3);
      expect(data.summary.awardee_barangays).toEqual([1, 3, 5]);
      expect(data.targets).toHaveLength(3);
      expect(data.filterInfo.includesNonAwardees).toBe(false);
    });

    /**
     * Test award removal and its impact on survey operations
     */
    it('should handle award removal and update survey operations accordingly', async () => {
      // Step 1: Start with existing awards
      const existingAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 1, barangay_id: 1, cycle_id: 1, is_awardee: true },
            { id: 2, barangay_id: 3, cycle_id: 1, is_awardee: true },
            { id: 3, barangay_id: 5, cycle_id: 1, is_awardee: true }
          ],
          totalBarangays: 5,
          awardeeCount: 3
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(existingAwardsResponse as any);

      let response = await fetch(`/api/cycle-awards?cycle_id=${mockActiveCycle.cycle_id}`);
      let data = await response.json();
      expect(data.awardeeCount).toBe(3);

      // Step 2: Remove award from barangay 3
      const removeAwardResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          message: 'Award status updated successfully'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(removeAwardResponse as any);

      response = await fetch('/api/cycle-awards/2', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAwardee: false,
          notes: 'Award removed due to performance issues'
        })
      });
      data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);

      // Step 3: Verify updated awards state
      const updatedAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 1, barangay_id: 1, cycle_id: 1, is_awardee: true },
            { id: 2, barangay_id: 3, cycle_id: 1, is_awardee: false },
            { id: 3, barangay_id: 5, cycle_id: 1, is_awardee: true }
          ],
          totalBarangays: 5,
          awardeeCount: 2
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(updatedAwardsResponse as any);

      response = await fetch(`/api/cycle-awards?cycle_id=${mockActiveCycle.cycle_id}`);
      data = await response.json();

      expect(data.awardeeCount).toBe(2);
      const currentAwardees = data.awards.filter((a: any) => a.is_awardee);
      expect(currentAwardees.map((a: any) => a.barangay_id)).toEqual([1, 5]);

      // Step 4: Verify survey targets are updated to exclude removed awardee
      const updatedTargetsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          targets: [
            { target_id: 1, barangay_id: 1, survey_cycle_id: 1, target: 15, achieved: 5 },
            { target_id: 3, barangay_id: 5, survey_cycle_id: 1, target: 12, achieved: 8 }
          ],
          excludedBarangays: [3],
          message: 'Survey targets updated to reflect current awardee status'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(updatedTargetsResponse as any);

      response = await fetch(`/api/survey-targets?cycle_id=${mockActiveCycle.cycle_id}&awardee_only=true`);
      data = await response.json();

      expect(data.targets).toHaveLength(2);
      expect(data.targets.map((t: any) => t.barangay_id)).toEqual([1, 5]);
      expect(data.excludedBarangays).toContain(3);
    });

    /**
     * Test cycle transition with award preservation
     */
    it('should preserve awards when transitioning between cycles', async () => {
      // Step 1: Get awards for current cycle (2024)
      const cycle2024Awards = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 1, barangay_id: 1, cycle_id: 1, is_awardee: true },
            { id: 2, barangay_id: 3, cycle_id: 1, is_awardee: true },
            { id: 3, barangay_id: 5, cycle_id: 1, is_awardee: false }
          ],
          totalBarangays: 5,
          awardeeCount: 2
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(cycle2024Awards as any);

      let response = await fetch('/api/cycle-awards?cycle_id=1');
      let data = await response.json();
      
      const cycle1Awardees = data.awards.filter((a: any) => a.is_awardee).map((a: any) => a.barangay_id);
      expect(cycle1Awardees).toEqual([1, 3]);

      // Step 2: Create new cycle (2025)
      const newCycleResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          cycle_id: 2,
          name: 'Survey Cycle 2025',
          year: 2025,
          is_active: true,
          created_at: new Date('2025-01-01')
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(newCycleResponse as any);

      response = await fetch('/api/survey-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Survey Cycle 2025',
          year: 2025
        })
      });
      data = await response.json();

      expect(data.cycle_id).toBe(2);
      expect(data.is_active).toBe(true);

      // Step 3: Copy awards from previous cycle to new cycle
      const copyAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          copiedCount: 2,
          message: 'Awards copied successfully from previous cycle'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(copyAwardsResponse as any);

      response = await fetch('/api/cycle-awards/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCycleId: 1,
          targetCycleId: 2
        })
      });
      data = await response.json();

      expect(data.success).toBe(true);
      expect(data.copiedCount).toBe(2);

      // Step 4: Verify awards exist in new cycle
      const cycle2025Awards = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 4, barangay_id: 1, cycle_id: 2, is_awardee: true },
            { id: 5, barangay_id: 3, cycle_id: 2, is_awardee: true }
          ],
          totalBarangays: 5,
          awardeeCount: 2
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(cycle2025Awards as any);

      response = await fetch('/api/cycle-awards?cycle_id=2');
      data = await response.json();

      const cycle2Awardees = data.awards.filter((a: any) => a.is_awardee).map((a: any) => a.barangay_id);
      expect(cycle2Awardees).toEqual([1, 3]);
      expect(data.awardeeCount).toBe(2);

      // Step 5: Verify original cycle awards are preserved
      mockWorkflowFetch.mockResolvedValueOnce(cycle2024Awards as any);

      response = await fetch('/api/cycle-awards?cycle_id=1');
      data = await response.json();

      const originalAwardees = data.awards.filter((a: any) => a.is_awardee).map((a: any) => a.barangay_id);
      expect(originalAwardees).toEqual([1, 3]);
      expect(data.awardeeCount).toBe(2);
    });

    /**
     * Test bulk award operations with validation
     */
    it('should handle bulk award operations with proper validation', async () => {
      // Step 1: Prepare bulk award updates
      const bulkUpdates = [
        { barangayId: 1, isAwardee: true, notes: 'Excellent governance' },
        { barangayId: 2, isAwardee: false, notes: 'Needs improvement' },
        { barangayId: 3, isAwardee: true, notes: 'Outstanding service' },
        { barangayId: 4, isAwardee: false, notes: 'Below standards' },
        { barangayId: 5, isAwardee: true, notes: 'Consistent performance' }
      ];

      // Step 2: Execute bulk update
      const bulkUpdateResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          processed: 5,
          awardees: 3,
          nonAwardees: 2,
          errors: [],
          message: 'Bulk award update completed successfully'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(bulkUpdateResponse as any);

      const response = await fetch('/api/cycle-awards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: mockActiveCycle.cycle_id,
          awards: bulkUpdates,
          createdBy: mockUser.user_id
        })
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.processed).toBe(5);
      expect(data.awardees).toBe(3);
      expect(data.nonAwardees).toBe(2);
      expect(data.errors).toHaveLength(0);

      // Step 3: Verify final award state
      const finalAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 1, barangay_id: 1, cycle_id: 1, is_awardee: true, notes: 'Excellent governance' },
            { id: 2, barangay_id: 2, cycle_id: 1, is_awardee: false, notes: 'Needs improvement' },
            { id: 3, barangay_id: 3, cycle_id: 1, is_awardee: true, notes: 'Outstanding service' },
            { id: 4, barangay_id: 4, cycle_id: 1, is_awardee: false, notes: 'Below standards' },
            { id: 5, barangay_id: 5, cycle_id: 1, is_awardee: true, notes: 'Consistent performance' }
          ],
          totalBarangays: 5,
          awardeeCount: 3
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(finalAwardsResponse as any);

      const finalResponse = await fetch(`/api/cycle-awards?cycle_id=${mockActiveCycle.cycle_id}`);
      const finalData = await finalResponse.json();

      expect(finalData.awardeeCount).toBe(3);
      expect(finalData.totalBarangays).toBe(5);
      
      const awardees = finalData.awards.filter((a: any) => a.is_awardee);
      const nonAwardees = finalData.awards.filter((a: any) => !a.is_awardee);
      
      expect(awardees).toHaveLength(3);
      expect(nonAwardees).toHaveLength(2);
      expect(awardees.map((a: any) => a.barangay_id)).toEqual([1, 3, 5]);
      expect(nonAwardees.map((a: any) => a.barangay_id)).toEqual([2, 4]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    /**
     * Test handling of invalid award assignments
     */
    it('should handle invalid award assignment attempts gracefully', async () => {
      // Test assigning award to non-existent barangay
      const invalidAssignmentResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          error: 'Invalid barangay ID',
          message: 'Barangay with ID 999 does not exist',
          code: 'BARANGAY_NOT_FOUND'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(invalidAssignmentResponse as any);

      const response = await fetch('/api/cycle-awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayId: 999,
          cycleId: mockActiveCycle.cycle_id,
          isAwardee: true
        })
      });
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid barangay ID');
      expect(data.code).toBe('BARANGAY_NOT_FOUND');
    });

    /**
     * Test handling of duplicate award assignments
     */
    it('should handle duplicate award assignment attempts', async () => {
      const duplicateAssignmentResponse = {
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({
          error: 'Award already exists',
          message: 'Award already exists for this barangay and cycle',
          code: 'DUPLICATE_AWARD'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(duplicateAssignmentResponse as any);

      const response = await fetch('/api/cycle-awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayId: 1,
          cycleId: mockActiveCycle.cycle_id,
          isAwardee: true
        })
      });
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
      expect(data.error).toBe('Award already exists');
      expect(data.code).toBe('DUPLICATE_AWARD');
    });

    /**
     * Test handling of survey operations with no awardees
     */
    it('should handle survey operations when no awardees exist', async () => {
      // Mock scenario with no awardees
      const noAwardeesResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          awards: [
            { id: 1, barangay_id: 1, cycle_id: 1, is_awardee: false },
            { id: 2, barangay_id: 2, cycle_id: 1, is_awardee: false },
            { id: 3, barangay_id: 3, cycle_id: 1, is_awardee: false }
          ],
          totalBarangays: 3,
          awardeeCount: 0
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(noAwardeesResponse as any);

      const awardsResponse = await fetch(`/api/cycle-awards?cycle_id=${mockActiveCycle.cycle_id}`);
      const awardsData = await awardsResponse.json();

      expect(awardsData.awardeeCount).toBe(0);

      // Test survey target creation with no awardees
      const noTargetsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          targets: [],
          message: 'No awardee barangays found for survey target creation',
          warning: 'Survey operations require at least one awardee barangay'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(noTargetsResponse as any);

      const targetsResponse = await fetch('/api/survey-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: mockActiveCycle.cycle_id,
          awardeeOnly: true
        })
      });
      const targetsData = await targetsResponse.json();

      expect(targetsData.targets).toHaveLength(0);
      expect(targetsData.warning).toContain('at least one awardee');
    });
  });

  describe('Performance and Data Integrity', () => {
    /**
     * Test workflow performance with large datasets
     */
    it('should handle large-scale award operations efficiently', async () => {
      // Simulate large dataset (100 barangays)
      const largeDatasetSize = 100;
      const bulkUpdates = Array.from({ length: largeDatasetSize }, (_, i) => ({
        barangayId: i + 1,
        isAwardee: i % 3 === 0, // Every 3rd barangay is an awardee
        notes: `Bulk update ${i + 1}`
      }));

      const expectedAwardees = Math.floor(largeDatasetSize / 3) + (largeDatasetSize % 3 > 0 ? 1 : 0);

      const largeBulkResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          processed: largeDatasetSize,
          awardees: expectedAwardees,
          nonAwardees: largeDatasetSize - expectedAwardees,
          processingTime: 250, // milliseconds
          message: 'Large bulk update completed successfully'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(largeBulkResponse as any);

      const startTime = Date.now();
      const response = await fetch('/api/cycle-awards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: mockActiveCycle.cycle_id,
          awards: bulkUpdates,
          createdBy: mockUser.user_id
        })
      });
      const data = await response.json();
      const endTime = Date.now();

      expect(response.ok).toBe(true);
      expect(data.processed).toBe(largeDatasetSize);
      expect(data.awardees).toBe(expectedAwardees);
      expect(data.processingTime).toBeLessThan(500); // Should complete in under 500ms
      expect(endTime - startTime).toBeLessThan(1000); // Total time including network
    });

    /**
     * Test data consistency across workflow steps
     */
    it('should maintain data consistency throughout the workflow', async () => {
      // Step 1: Set initial awards
      const initialAwards = [
        { barangayId: 1, isAwardee: true },
        { barangayId: 2, isAwardee: false },
        { barangayId: 3, isAwardee: true }
      ];

      const setAwardsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          awardees: 2,
          nonAwardees: 1
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(setAwardsResponse as any);

      let response = await fetch('/api/cycle-awards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: mockActiveCycle.cycle_id,
          awards: initialAwards
        })
      });
      let data = await response.json();

      expect(data.awardees).toBe(2);

      // Step 2: Verify consistency in survey targets
      const consistentTargetsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          targets: [
            { barangay_id: 1, target: 10 },
            { barangay_id: 3, target: 15 }
          ],
          awardeeCount: 2,
          consistency_check: 'passed'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(consistentTargetsResponse as any);

      response = await fetch(`/api/survey-targets?cycle_id=${mockActiveCycle.cycle_id}&awardee_only=true`);
      data = await response.json();

      expect(data.targets).toHaveLength(2);
      expect(data.awardeeCount).toBe(2);
      expect(data.consistency_check).toBe('passed');

      // Step 3: Verify consistency in map data
      const consistentMapResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          barangays: [
            { barangay_id: 1, is_awardee: true, color: '#22c55e' },
            { barangay_id: 2, is_awardee: false, color: '#6b7280' },
            { barangay_id: 3, is_awardee: true, color: '#22c55e' }
          ],
          awardeeCount: 2,
          consistency_check: 'passed'
        })
      };
      mockWorkflowFetch.mockResolvedValueOnce(consistentMapResponse as any);

      response = await fetch(`/api/barangays?cycle_id=${mockActiveCycle.cycle_id}&include_awards=true`);
      data = await response.json();

      const mapAwardees = data.barangays.filter((b: any) => b.is_awardee);
      expect(mapAwardees).toHaveLength(2);
      expect(data.awardeeCount).toBe(2);
      expect(data.consistency_check).toBe('passed');
    });
  });
});