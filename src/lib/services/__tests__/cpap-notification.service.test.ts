import { CPAPNotificationService } from '../cpap-notification.service';
import { supabaseAdmin } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('CPAPNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output during tests
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('notifyCPAPSubmitted', () => {
    it('should notify all ADMIN users when CPAP is submitted', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        submitted_at: '2024-01-01',
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockAdminUsers = [
        { id: 1, email: 'admin1@test.com', firstName: 'Admin', lastName: 'One' },
        { id: 2, email: 'admin2@test.com', firstName: 'Admin', lastName: 'Two' }
      ];

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockUsersChain = {
        ilike: jest.fn().mockResolvedValue({ data: mockAdminUsers, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockUsersChain) });

      await CPAPNotificationService.notifyCPAPSubmitted(1);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('cpaps');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('user');
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle case when no ADMIN users found', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        submitted_at: '2024-01-01',
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockUsersChain = {
        ilike: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockUsersChain) });

      await CPAPNotificationService.notifyCPAPSubmitted(1);

      expect(console.warn).toHaveBeenCalledWith('No ADMIN users found to notify');
    });

    it('should handle CPAP not found error gracefully', async () => {
      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      // Should not throw error
      await expect(CPAPNotificationService.notifyCPAPSubmitted(1)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      // Should not throw error
      await expect(CPAPNotificationService.notifyCPAPSubmitted(1)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('notifyCPAPApproved', () => {
    it('should notify OFFICER users when CPAP is approved', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        approved_at: '2024-01-01',
        admin_comments: 'Looks good',
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockAssignments = [
        {
          user_id: 1,
          user: { id: 1, email: 'officer@test.com', firstName: 'Officer', lastName: 'One', role: 'Officer' }
        }
      ];

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockResolvedValue({ data: mockAssignments, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      await CPAPNotificationService.notifyCPAPApproved(1);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('cpaps');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('assignment');
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle case when no OFFICER users found for barangay', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        approved_at: '2024-01-01',
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      await CPAPNotificationService.notifyCPAPApproved(1);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('No OFFICER users found'));
    });

    it('should filter out non-Officer users from assignments', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        approved_at: '2024-01-01',
        admin_comments: null,
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockAssignments = [
        {
          user_id: 1,
          user: { id: 1, email: 'officer@test.com', firstName: 'Officer', lastName: 'One', role: 'Officer' }
        },
        {
          user_id: 2,
          user: { id: 2, email: 'fs@test.com', firstName: 'FS', lastName: 'User', role: 'FS' }
        }
      ];

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockResolvedValue({ data: mockAssignments, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      await CPAPNotificationService.notifyCPAPApproved(1);

      // Should only notify 1 Officer user, not the FS user
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Notifying 1 OFFICER users'));
    });

    it('should handle errors gracefully', async () => {
      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      // Should not throw error
      await expect(CPAPNotificationService.notifyCPAPApproved(1)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('notifyCPAPRevisionRequested', () => {
    it('should notify OFFICER users when revision is requested', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        updated_at: '2024-01-01',
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockAssignments = [
        {
          user_id: 1,
          user: { id: 1, email: 'officer@test.com', firstName: 'Officer', lastName: 'One', role: 'Officer' }
        }
      ];

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockResolvedValue({ data: mockAssignments, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      await CPAPNotificationService.notifyCPAPRevisionRequested(1, 'Please revise item 1');

      expect(supabaseAdmin.from).toHaveBeenCalledWith('cpaps');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('assignment');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Admin Comments: Please revise item 1'));
    });

    it('should handle case when no OFFICER users found for barangay', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        updated_at: '2024-01-01',
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      await CPAPNotificationService.notifyCPAPRevisionRequested(1, 'Please revise');

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('No OFFICER users found'));
    });

    it('should include admin comments in notification', async () => {
      const mockCPAP = {
        id: 1,
        barangay_id: 123,
        cycle_id: 1,
        updated_at: '2024-01-01',
        barangay: { barangay_id: 123, barangay_name: 'Test Barangay' },
        cycle: { cycle_id: 1, name: 'Q1 2024', year: 2024 }
      };

      const mockAssignments = [
        {
          user_id: 1,
          user: { id: 1, email: 'officer@test.com', firstName: 'Officer', lastName: 'One', role: 'Officer' }
        }
      ];

      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCPAP, error: null })
      };

      const mockAssignmentChain = {
        eq: jest.fn().mockResolvedValue({ data: mockAssignments, error: null })
      };

      (supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockCPAPChain) })
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockAssignmentChain) });

      const comments = 'Please add more details to item 2 and fix timeline for item 3';
      await CPAPNotificationService.notifyCPAPRevisionRequested(1, comments);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(comments));
    });

    it('should handle errors gracefully', async () => {
      const mockCPAPChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockCPAPChain)
      });

      // Should not throw error
      await expect(
        CPAPNotificationService.notifyCPAPRevisionRequested(1, 'Test')
      ).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
