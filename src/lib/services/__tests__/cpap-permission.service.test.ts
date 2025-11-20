import { CPAPPermissionService } from '../cpap-permission.service';
import { supabaseAdmin } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

describe('CPAPPermissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBarangay', () => {
    it('should return barangay ID for user with active assignment', async () => {
      const mockAssignment = {
        barangay_id: 123
      };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPPermissionService.getUserBarangay(1);

      expect(result).toBe(123);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('assignment');
    });

    it('should return null if user has no active assignment', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPPermissionService.getUserBarangay(1);

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'ERROR', message: 'DB Error' } })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPPermissionService.getUserBarangay(1);

      expect(result).toBeNull();
    });
  });

  describe('canAccessCPAP', () => {
    it('should allow Admin to access any CPAP', async () => {
      const result = await CPAPPermissionService.canAccessCPAP(1, 'Admin', 1);

      expect(result).toBe(true);
    });

    it('should deny FS users access to CPAP', async () => {
      const result = await CPAPPermissionService.canAccessCPAP(1, 'FS', 1);

      expect(result).toBe(false);
    });

    it('should deny Interviewer users access to CPAP', async () => {
      const result = await CPAPPermissionService.canAccessCPAP(1, 'Interviewer', 1);

      expect(result).toBe(false);
    });

    it('should allow Officer to access CPAP from their barangay', async () => {
      const mockCPAP = { barangay_id: 123 };
      const mockAssignment = { barangay_id: 123 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canAccessCPAP(1, 'Officer', 1);

      expect(result).toBe(true);
    });

    it('should deny Officer access to CPAP from different barangay', async () => {
      const mockCPAP = { barangay_id: 123 };
      const mockAssignment = { barangay_id: 456 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canAccessCPAP(1, 'Officer', 1);

      expect(result).toBe(false);
    });

    it('should deny Officer without barangay assignment', async () => {
      const mockCPAP = { barangay_id: 123 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canAccessCPAP(1, 'Officer', 1);

      expect(result).toBe(false);
    });

    it('should deny access for unknown roles', async () => {
      const result = await CPAPPermissionService.canAccessCPAP(1, 'UnknownRole', 1);

      expect(result).toBe(false);
    });
  });

  describe('canEditCPAP', () => {
    it('should deny non-Officer users from editing', async () => {
      const result = await CPAPPermissionService.canEditCPAP(1, 'Admin', 1);

      expect(result).toBe(false);
    });

    it('should allow Officer to edit Draft CPAP from their barangay', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Draft' };
      const mockAssignment = { barangay_id: 123 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canEditCPAP(1, 'Officer', 1);

      expect(result).toBe(true);
    });

    it('should allow Officer to edit Revision_Requested CPAP', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Revision_Requested' };
      const mockAssignment = { barangay_id: 123 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canEditCPAP(1, 'Officer', 1);

      expect(result).toBe(true);
    });

    it('should deny Officer from editing Submitted CPAP', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Submitted' };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      const result = await CPAPPermissionService.canEditCPAP(1, 'Officer', 1);

      expect(result).toBe(false);
    });

    it('should deny Officer from editing Approved CPAP', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Approved' };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      const result = await CPAPPermissionService.canEditCPAP(1, 'Officer', 1);

      expect(result).toBe(false);
    });

    it('should deny Officer from editing CPAP from different barangay', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Draft' };
      const mockAssignment = { barangay_id: 456 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canEditCPAP(1, 'Officer', 1);

      expect(result).toBe(false);
    });
  });

  describe('canSubmitCPAP', () => {
    it('should deny non-Officer users from submitting', async () => {
      const result = await CPAPPermissionService.canSubmitCPAP(1, 'Admin', 1);

      expect(result).toBe(false);
    });

    it('should allow Officer to submit Draft CPAP from their barangay', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Draft' };
      const mockAssignment = { barangay_id: 123 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canSubmitCPAP(1, 'Officer', 1);

      expect(result).toBe(true);
    });

    it('should deny Officer from submitting Approved CPAP', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Approved' };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      const result = await CPAPPermissionService.canSubmitCPAP(1, 'Officer', 1);

      expect(result).toBe(false);
    });
  });

  describe('canReviewCPAP', () => {
    it('should allow Admin to review CPAPs', async () => {
      const result = await CPAPPermissionService.canReviewCPAP(1, 'Admin');

      expect(result).toBe(true);
    });

    it('should deny Officer from reviewing CPAPs', async () => {
      const result = await CPAPPermissionService.canReviewCPAP(1, 'Officer');

      expect(result).toBe(false);
    });

    it('should deny FS from reviewing CPAPs', async () => {
      const result = await CPAPPermissionService.canReviewCPAP(1, 'FS');

      expect(result).toBe(false);
    });

    it('should deny Interviewer from reviewing CPAPs', async () => {
      const result = await CPAPPermissionService.canReviewCPAP(1, 'Interviewer');

      expect(result).toBe(false);
    });
  });

  describe('canUpdateProgress', () => {
    it('should deny non-Officer users from updating progress', async () => {
      const result = await CPAPPermissionService.canUpdateProgress(1, 'Admin', 1);

      expect(result).toBe(false);
    });

    it('should allow Officer to update progress on Approved CPAP from their barangay', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Approved' };
      const mockAssignment = { barangay_id: 123 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canUpdateProgress(1, 'Officer', 1);

      expect(result).toBe(true);
    });

    it('should deny Officer from updating progress on Draft CPAP', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Draft' };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      const result = await CPAPPermissionService.canUpdateProgress(1, 'Officer', 1);

      expect(result).toBe(false);
    });

    it('should deny Officer from updating progress on CPAP from different barangay', async () => {
      const mockCPAP = { barangay_id: 123, status: 'Approved' };
      const mockAssignment = { barangay_id: 456 };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const result = await CPAPPermissionService.canUpdateProgress(1, 'Officer', 1);

      expect(result).toBe(false);
    });
  });

  describe('canCreateCPAPForBarangay', () => {
    it('should deny non-Officer users from creating CPAP', async () => {
      const result = await CPAPPermissionService.canCreateCPAPForBarangay(1, 'Admin', 123);

      expect(result).toBe(false);
    });

    it('should allow Officer to create CPAP for their assigned barangay', async () => {
      const mockAssignment = { barangay_id: 123 };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPPermissionService.canCreateCPAPForBarangay(1, 'Officer', 123);

      expect(result).toBe(true);
    });

    it('should deny Officer from creating CPAP for different barangay', async () => {
      const mockAssignment = { barangay_id: 123 };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAssignment, error: null })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPPermissionService.canCreateCPAPForBarangay(1, 'Officer', 456);

      expect(result).toBe(false);
    });

    it('should deny Officer without barangay assignment', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain)
      });

      const result = await CPAPPermissionService.canCreateCPAPForBarangay(1, 'Officer', 123);

      expect(result).toBe(false);
    });
  });
});
