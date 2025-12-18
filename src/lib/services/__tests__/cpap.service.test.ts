import { CPAPService } from '../cpap.service';
import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';
import { CPAPNotificationService } from '../cpap-notification.service';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

jest.mock('@/utils/surveyCycleHelpers', () => ({
  getActiveCycleId: jest.fn()
}));

jest.mock('../cpap-notification.service', () => ({
  CPAPNotificationService: {
    notifyCPAPSubmitted: jest.fn(),
    notifyCPAPApproved: jest.fn(),
    notifyCPAPRevisionRequested: jest.fn()
  }
}));

describe('CPAPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateCPAP', () => {
    it('should return existing CPAP if found', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 },
        items: []
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockCPAP, error: null });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        eq: mockEq,
        single: mockSingle
      });

      const result = await CPAPService.getOrCreateCPAP(123, 1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.barangay_id).toBe(123);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('cpaps');
    });

    it('should create new CPAP if not found', async () => {
      const mockNewCPAP = {
        id: 2,
        barangay_id: 456,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        barangay: { barangay_id: 456, barangay_name: 'New Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 },
        items: []
      };

      // Mock select query returning no results
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };

      // Mock insert query
      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockNewCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ insert: jest.fn().mockReturnValue(mockInsertChain) });

      const result = await CPAPService.getOrCreateCPAP(456, 1);

      expect(result).toBeDefined();
      expect(result.barangay_id).toBe(456);
      expect(result.status).toBe('Draft');
    });

    it('should use active cycle if no cycle specified', async () => {
      (getActiveCycleId as jest.Mock).mockResolvedValue(5);

      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 5,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 5, name: 'Q1 2024', year: 2024 },
        items: []
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await CPAPService.getOrCreateCPAP(123);

      expect(getActiveCycleId).toHaveBeenCalled();
    });

    it('should throw error if no cycle specified and no active cycle found', async () => {
      (getActiveCycleId as jest.Mock).mockResolvedValue(null);

      await expect(CPAPService.getOrCreateCPAP(123)).rejects.toThrow(
        'Failed to get or create CPAP'
      );
    });
  });

  describe('submitCPAP', () => {
    it('should successfully submit CPAP with valid items', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft',
        items: [
          {
            id: 1,
            priority_area: 'Test',
            target_output: 'Test',
            success_indicator: 'Test',
            responsible_person: 'Test',
            timeline_start: '2024-01-01',
            timeline_end: '2024-12-31'
          }
        ]
      };

      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ update: jest.fn().mockReturnValue(mockUpdateChain) });

      await CPAPService.submitCPAP(1);

      expect(CPAPNotificationService.notifyCPAPSubmitted).toHaveBeenCalledWith(1);
    });

    it('should throw error if CPAP has no items', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft',
        items: []
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.submitCPAP(1)).rejects.toThrow(
        'CPAP must have at least one item before submission'
      );
    });

    it('should throw error if CPAP is in Approved status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Approved',
        items: [{ id: 1 }]
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.submitCPAP(1)).rejects.toThrow(
        'Cannot submit CPAP in Approved status'
      );
    });

    it('should throw error if items have incomplete fields', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft',
        items: [
          {
            id: 1,
            priority_area: '',
            target_output: 'Test',
            success_indicator: 'Test',
            responsible_person: 'Test',
            timeline_start: '2024-01-01',
            timeline_end: '2024-12-31'
          }
        ]
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.submitCPAP(1)).rejects.toThrow(
        'All CPAP items must have complete required fields'
      );
    });
  });

  describe('approveCPAP', () => {
    it('should successfully approve CPAP in Submitted status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Submitted'
      };

      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ update: jest.fn().mockReturnValue(mockUpdateChain) });

      await CPAPService.approveCPAP(1, 'Looks good!');

      expect(CPAPNotificationService.notifyCPAPApproved).toHaveBeenCalledWith(1);
    });

    it('should throw error if CPAP is not in Submitted status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft'
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.approveCPAP(1)).rejects.toThrow(
        'Cannot approve CPAP in Draft status'
      );
    });
  });

  describe('requestRevision', () => {
    it('should successfully request revision with comments', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Submitted'
      };

      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ update: jest.fn().mockReturnValue(mockUpdateChain) });

      await CPAPService.requestRevision(1, 'Please revise item 1');

      expect(CPAPNotificationService.notifyCPAPRevisionRequested).toHaveBeenCalledWith(
        1,
        'Please revise item 1'
      );
    });

    it('should throw error if comments are empty', async () => {
      await expect(CPAPService.requestRevision(1, '')).rejects.toThrow(
        'Comments are required when requesting revision'
      );
    });

    it('should throw error if CPAP is not in Submitted status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft'
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.requestRevision(1, 'Test')).rejects.toThrow(
        'Cannot request revision for CPAP in Draft status'
      );
    });
  });

  describe('updateProgress', () => {
    it('should successfully update progress for Approved CPAP', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Approved'
      };

      const mockUpdatedCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        status: 'Approved',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        submitted_at: '2024-01-01',
        approved_at: '2024-01-01',
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test' },
        cycle: { cycle_id: 1, name: 'Q1', year: 2024 },
        items: []
      };

      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      // Create a proper chain for update().eq().eq()
      const mockEqChain2 = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      const mockEqChain1 = {
        eq: jest.fn().mockReturnValue(mockEqChain2)
      };
      const mockUpdateChain = {
        eq: jest.fn().mockReturnValue(mockEqChain1)
      };

      const mockUpdateChain2 = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      const mockFinalSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ update: jest.fn().mockReturnValue(mockUpdateChain) })
        .mockReturnValueOnce({ update: jest.fn().mockReturnValue(mockUpdateChain2) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockFinalSelectChain) });

      const progressUpdates = [
        { id: 1, actual_output: 'Completed task' }
      ];

      const result = await CPAPService.updateProgress(1, progressUpdates);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw error if CPAP is not in Approved status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft'
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.updateProgress(1, [])).rejects.toThrow();
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for CPAP with no items', async () => {
      const mockChain = {
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPService.calculateProgress(1);

      expect(result).toBe(0);
    });

    it('should calculate correct percentage for items with progress', async () => {
      const mockItems = [
        { id: 1, actual_output: 'Done', accomplishment_status: 'Complete' },
        { id: 2, actual_output: 'Done', accomplishment_status: 'Complete' },
        { id: 3, actual_output: null, accomplishment_status: null },
        { id: 4, actual_output: null, accomplishment_status: null }
      ];

      const mockChain = {
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPService.calculateProgress(1);

      expect(result).toBe(50); // 2 out of 4 items have progress
    });

    it('should return 100 for all items with progress', async () => {
      const mockItems = [
        { id: 1, actual_output: 'Done', accomplishment_status: 'Complete' },
        { id: 2, actual_output: 'Done', accomplishment_status: 'Complete' }
      ];

      const mockChain = {
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPService.calculateProgress(1);

      expect(result).toBe(100);
    });
  });

  describe('updateCPAPItems', () => {
    it('should throw error if CPAP is in Submitted status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Submitted'
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.updateCPAPItems(1, [])).rejects.toThrow();
    });

    it('should allow editing CPAP in Draft status', async () => {
      const mockCPAP = {
        id: 1,
        status: 'Draft'
      };

      const mockUpdatedCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test' },
        cycle: { cycle_id: 1, name: 'Q1', year: 2024 },
        items: []
      };

      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      const mockFinalSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ update: jest.fn().mockReturnValue(mockUpdateChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockFinalSelectChain) });

      const result = await CPAPService.updateCPAPItems(1, []);

      expect(result).toBeDefined();
    });
  });

  describe('listCPAPs', () => {
    it('should return all CPAPs for Admin users', async () => {
      const mockCPAPs = [
        {
          id: 1,
          barangay_id: 123,
          cycle_id: 1,
          status: 'Draft',
          created_at: '2024-01-01',
          submitted_at: null,
          approved_at: null,
          barangay: { barangay_id: 123, barangay_name: 'Test 1' },
          cycle: { cycle_id: 1, name: 'Q1', year: 2024 },
          items: []
        },
        {
          id: 2,
          barangay_id: 456,
          cycle_id: 1,
          status: 'Submitted',
          created_at: '2024-01-02',
          submitted_at: '2024-01-02',
          approved_at: null,
          barangay: { barangay_id: 456, barangay_name: 'Test 2' },
          cycle: { cycle_id: 1, name: 'Q1', year: 2024 },
          items: []
        }
      ];

      const mockChain = {
        order: jest.fn().mockResolvedValue({ data: mockCPAPs, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPService.listCPAPs(1, 'Admin', null);

      expect(result).toHaveLength(2);
      expect(result[0].barangay_name).toBe('Test 1');
      expect(result[1].barangay_name).toBe('Test 2');
    });

    it('should filter CPAPs by barangay for Officer users', async () => {
      const mockCPAPs = [
        {
          id: 1,
          barangay_id: 123,
          cycle_id: 1,
          status: 'Draft',
          created_at: '2024-01-01',
          submitted_at: null,
          approved_at: null,
          barangay: { barangay_id: 123, barangay_name: 'Test 1' },
          cycle: { cycle_id: 1, name: 'Q1', year: 2024 },
          items: []
        }
      ];

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCPAPs, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPService.listCPAPs(1, 'Officer', 123);

      expect(result).toHaveLength(1);
      expect(result[0].barangay_id).toBe(123);
    });

    it('should throw error if Officer has no assigned barangay', async () => {
      await expect(CPAPService.listCPAPs(1, 'Officer', null)).rejects.toThrow();
    });
  });

  describe('getCPAPById', () => {
    it('should return CPAP with all details', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test' },
        cycle: { cycle_id: 1, name: 'Q1', year: 2024 },
        items: []
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPService.getCPAPById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.barangay?.barangay_name).toBe('Test');
    });

    it('should throw error if CPAP not found', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      await expect(CPAPService.getCPAPById(999)).rejects.toThrow('Failed to get CPAP');
    });
  });
});
