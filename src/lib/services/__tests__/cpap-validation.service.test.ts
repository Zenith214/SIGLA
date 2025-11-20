import { CPAPValidationService } from '../cpap-validation.service';
import { CPAP, CPAPItem, CPAPItemInput, CPAPStatus } from '@/types/cpap';

describe('CPAPValidationService', () => {
  describe('validateForSubmission', () => {
    it('should pass validation for valid CPAP with complete items', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        items: [
          {
            id: 1,
            cpap_id: 1,
            priority_area: 'Financial Administration',
            target_output: 'Improve budget transparency',
            success_indicator: 'All budget documents published online',
            responsible_person: 'Budget Officer',
            timeline_start: '2024-01-01',
            timeline_end: '2024-12-31',
            actual_output: null,
            accomplishment_status: null,
            remarks: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        ]
      };

      const result = CPAPValidationService.validateForSubmission(cpap);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when CPAP has no items', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForSubmission(cpap);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('CPAP must have at least one item before submission');
    });

    it('should fail validation when item has missing required fields', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        items: [
          {
            id: 1,
            cpap_id: 1,
            priority_area: '',
            target_output: '',
            success_indicator: 'Test',
            responsible_person: 'Test',
            timeline_start: '2024-01-01',
            timeline_end: '2024-12-31',
            actual_output: null,
            accomplishment_status: null,
            remarks: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        ]
      };

      const result = CPAPValidationService.validateForSubmission(cpap);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when CPAP is in Approved status', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Approved',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: '2024-01-03',
        admin_comments: null,
        items: [
          {
            id: 1,
            cpap_id: 1,
            priority_area: 'Test',
            target_output: 'Test',
            success_indicator: 'Test',
            responsible_person: 'Test',
            timeline_start: '2024-01-01',
            timeline_end: '2024-12-31',
            actual_output: null,
            accomplishment_status: null,
            remarks: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        ]
      };

      const result = CPAPValidationService.validateForSubmission(cpap);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot submit CPAP in Approved status. Only Draft or Revision_Requested CPAPs can be submitted.');
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow Draft to Submitted transition', () => {
      const result = CPAPValidationService.validateStatusTransition('Draft', 'Submitted');
      expect(result).toBe(true);
    });

    it('should allow Submitted to Approved transition', () => {
      const result = CPAPValidationService.validateStatusTransition('Submitted', 'Approved');
      expect(result).toBe(true);
    });

    it('should allow Submitted to Revision_Requested transition', () => {
      const result = CPAPValidationService.validateStatusTransition('Submitted', 'Revision_Requested');
      expect(result).toBe(true);
    });

    it('should allow Revision_Requested to Submitted transition', () => {
      const result = CPAPValidationService.validateStatusTransition('Revision_Requested', 'Submitted');
      expect(result).toBe(true);
    });

    it('should not allow Draft to Approved transition', () => {
      const result = CPAPValidationService.validateStatusTransition('Draft', 'Approved');
      expect(result).toBe(false);
    });

    it('should not allow Approved to any transition', () => {
      const result = CPAPValidationService.validateStatusTransition('Approved', 'Draft');
      expect(result).toBe(false);
    });
  });

  describe('validateItem', () => {
    it('should pass validation for valid item', () => {
      const item: CPAPItemInput = {
        priority_area: 'Financial Administration',
        target_output: 'Improve budget transparency',
        success_indicator: 'All budget documents published online',
        responsible_person: 'Budget Officer',
        timeline_start: '2024-01-01',
        timeline_end: '2024-12-31'
      };

      const result = CPAPValidationService.validateItem(item);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when priority_area is empty', () => {
      const item: CPAPItemInput = {
        priority_area: '',
        target_output: 'Test',
        success_indicator: 'Test',
        responsible_person: 'Test',
        timeline_start: '2024-01-01',
        timeline_end: '2024-12-31'
      };

      const result = CPAPValidationService.validateItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Priority area is required');
    });

    it('should fail validation when timeline end is before start', () => {
      const item: CPAPItemInput = {
        priority_area: 'Test',
        target_output: 'Test',
        success_indicator: 'Test',
        responsible_person: 'Test',
        timeline_start: '2024-12-31',
        timeline_end: '2024-01-01'
      };

      const result = CPAPValidationService.validateItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Timeline end date must be after start date');
    });

    it('should fail validation when priority_area exceeds 255 characters', () => {
      const item: CPAPItemInput = {
        priority_area: 'a'.repeat(256),
        target_output: 'Test',
        success_indicator: 'Test',
        responsible_person: 'Test',
        timeline_start: '2024-01-01',
        timeline_end: '2024-12-31'
      };

      const result = CPAPValidationService.validateItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Priority area must not exceed 255 characters');
    });
  });

  describe('validateUserPermission', () => {
    const mockCPAP: CPAP = {
      id: 1,
      barangay_id: 123,
      cycle_id: 1,
      status: 'Draft',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      submitted_at: null,
      approved_at: null,
      admin_comments: null,
      items: []
    };

    it('should allow Admin to perform any action', () => {
      const result = CPAPValidationService.validateUserPermission(
        'Admin',
        null,
        mockCPAP,
        'approve'
      );
      expect(result.valid).toBe(true);
    });

    it('should allow Officer to view their barangay CPAP', () => {
      const result = CPAPValidationService.validateUserPermission(
        'Officer',
        123,
        mockCPAP,
        'view'
      );
      expect(result.valid).toBe(true);
    });

    it('should not allow Officer to access different barangay CPAP', () => {
      const result = CPAPValidationService.validateUserPermission(
        'Officer',
        456,
        mockCPAP,
        'view'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('You can only access CPAPs for your assigned barangay');
    });

    it('should not allow Officer to approve CPAP', () => {
      const result = CPAPValidationService.validateUserPermission(
        'Officer',
        123,
        mockCPAP,
        'approve'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only Admin users can approve or request revisions');
    });

    it('should not allow FS to access CPAP', () => {
      const result = CPAPValidationService.validateUserPermission(
        'FS',
        null,
        mockCPAP,
        'view'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('You do not have permission to access CPAP functionality');
    });

    it('should not allow Interviewer to access CPAP', () => {
      const result = CPAPValidationService.validateUserPermission(
        'Interviewer',
        null,
        mockCPAP,
        'view'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('You do not have permission to access CPAP functionality');
    });

    it('should not allow Officer to edit Approved CPAP', () => {
      const approvedCPAP = { ...mockCPAP, status: 'Approved' as CPAPStatus };
      const result = CPAPValidationService.validateUserPermission(
        'Officer',
        123,
        approvedCPAP,
        'edit'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot edit CPAP in Approved status');
    });
  });

  describe('validateForApproval', () => {
    it('should pass validation for Submitted CPAP', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Submitted',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForApproval(cpap);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for Draft CPAP', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForApproval(cpap);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateForRevisionRequest', () => {
    it('should pass validation for Submitted CPAP with comments', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Submitted',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForRevisionRequest(cpap, 'Please revise item 1');
      expect(result.valid).toBe(true);
    });

    it('should fail validation when comments are empty', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Submitted',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForRevisionRequest(cpap, '');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Comments are required when requesting revision');
    });
  });

  describe('validateProgressUpdate', () => {
    it('should pass validation for Approved CPAP with valid updates', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Approved',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: '2024-01-03',
        admin_comments: null,
        items: []
      };

      const updates = [
        { id: 1, actual_output: 'Completed task' }
      ];

      const result = CPAPValidationService.validateProgressUpdate(cpap, updates);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for non-Approved CPAP', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const updates = [
        { id: 1, actual_output: 'Completed task' }
      ];

      const result = CPAPValidationService.validateProgressUpdate(cpap, updates);
      expect(result.valid).toBe(false);
    });

    it('should fail validation when update has no fields', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Approved',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: '2024-01-03',
        admin_comments: null,
        items: []
      };

      const updates = [
        { id: 1 }
      ];

      const result = CPAPValidationService.validateProgressUpdate(cpap, updates);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Update 1: At least one progress field must be provided');
    });
  });

  describe('validateForEdit', () => {
    it('should pass validation for Draft CPAP', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: null,
        approved_at: null,
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForEdit(cpap);
      expect(result.valid).toBe(true);
    });

    it('should pass validation for Revision_Requested CPAP', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Revision_Requested',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: null,
        admin_comments: 'Please revise',
        items: []
      };

      const result = CPAPValidationService.validateForEdit(cpap);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for Approved CPAP', () => {
      const cpap: CPAP = {
        id: 1,
        barangay_id: 1,
        cycle_id: 1,
        status: 'Approved',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        submitted_at: '2024-01-02',
        approved_at: '2024-01-03',
        admin_comments: null,
        items: []
      };

      const result = CPAPValidationService.validateForEdit(cpap);
      expect(result.valid).toBe(false);
    });
  });
});
