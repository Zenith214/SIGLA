import {
  CPAP,
  CPAPItem,
  CPAPItemInput,
  CPAPStatus,
  ValidationResult
} from '@/types/cpap';

/**
 * CPAP Validation Service
 * Provides validation methods for CPAP data integrity and business rules
 */
export class CPAPValidationService {
  /**
   * Validate CPAP can be submitted
   * Checks that all required fields are complete and at least one item exists
   * @param cpap - The CPAP to validate
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateForSubmission(cpap: CPAP): ValidationResult {
    const errors: string[] = [];

    // Check if CPAP has items
    if (!cpap.items || cpap.items.length === 0) {
      errors.push('CPAP must have at least one item before submission');
      return { valid: false, errors };
    }

    // Validate each item has all required fields
    cpap.items.forEach((item, index) => {
      const itemErrors = this.validateItemRequiredFields(item, index + 1);
      errors.push(...itemErrors);
    });

    // Check if CPAP is in a submittable status
    if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
      errors.push(`Cannot submit CPAP in ${cpap.status} status. Only Draft or Revision_Requested CPAPs can be submitted.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate status transition is allowed
   * Enforces valid state machine transitions
   * @param currentStatus - Current CPAP status
   * @param newStatus - Desired new status
   * @returns boolean - True if transition is valid
   */
  static validateStatusTransition(currentStatus: CPAPStatus, newStatus: CPAPStatus): boolean {
    // Define valid transitions
    const validTransitions: Record<CPAPStatus, CPAPStatus[]> = {
      'Draft': ['Submitted'],
      'Submitted': ['Approved', 'Revision_Requested'],
      'Approved': [], // Approved is terminal - no transitions allowed
      'Revision_Requested': ['Submitted']
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Validate individual CPAP item data integrity
   * Checks required fields, data types, and business rules
   * @param item - The CPAP item to validate
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateItem(item: CPAPItemInput): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!item.priority_area || item.priority_area.trim() === '') {
      errors.push('Priority area is required');
    } else if (item.priority_area.length > 255) {
      errors.push('Priority area must not exceed 255 characters');
    }

    if (!item.target_output || item.target_output.trim() === '') {
      errors.push('Target output is required');
    }

    if (!item.success_indicator || item.success_indicator.trim() === '') {
      errors.push('Success indicator is required');
    }

    if (!item.responsible_person || item.responsible_person.trim() === '') {
      errors.push('Responsible person is required');
    } else if (item.responsible_person.length > 255) {
      errors.push('Responsible person must not exceed 255 characters');
    }

    if (!item.timeline_start) {
      errors.push('Timeline start date is required');
    }

    if (!item.timeline_end) {
      errors.push('Timeline end date is required');
    }

    // Validate timeline logic
    if (item.timeline_start && item.timeline_end) {
      const startDate = new Date(item.timeline_start);
      const endDate = new Date(item.timeline_end);

      if (isNaN(startDate.getTime())) {
        errors.push('Timeline start date is invalid');
      }

      if (isNaN(endDate.getTime())) {
        errors.push('Timeline end date is invalid');
      }

      if (startDate.getTime() > endDate.getTime()) {
        errors.push('Timeline end date must be after start date');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user has permission to perform action on CPAP
   * Checks role-based permissions and barangay assignment
   * @param userRole - The user's role (Admin, Officer, FS, Interviewer)
   * @param userBarangayId - The user's assigned barangay ID (for Officer role)
   * @param cpap - The CPAP being accessed
   * @param action - The action being performed (view, edit, submit, approve, request_revision)
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateUserPermission(
    userRole: string,
    userBarangayId: number | null,
    cpap: CPAP,
    action: 'view' | 'edit' | 'submit' | 'approve' | 'request_revision' | 'update_progress'
  ): ValidationResult {
    const errors: string[] = [];
    const normalizedRole = userRole.toLowerCase();

    // FS and Interviewer users have no CPAP access
    if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
      errors.push('You do not have permission to access CPAP functionality');
      return { valid: false, errors };
    }

    // Admin users can perform all actions
    if (normalizedRole === 'admin') {
      return { valid: true, errors: [] };
    }

    // Officer users have limited permissions
    if (normalizedRole === 'officer') {
      // Officer must have an assigned barangay
      if (!userBarangayId) {
        errors.push('Officer user must have an assigned barangay');
        return { valid: false, errors };
      }

      // Officer can only access CPAPs for their assigned barangay
      if (cpap.barangay_id !== userBarangayId) {
        errors.push('You can only access CPAPs for your assigned barangay');
        return { valid: false, errors };
      }

      // Officer cannot approve or request revision
      if (action === 'approve' || action === 'request_revision') {
        errors.push('Only Admin users can approve or request revisions');
        return { valid: false, errors };
      }

      // Officer can only edit in Draft or Revision_Requested status
      if (action === 'edit') {
        if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
          errors.push(`Cannot edit CPAP in ${cpap.status} status`);
          return { valid: false, errors };
        }
      }

      // Officer can only submit in Draft or Revision_Requested status
      if (action === 'submit') {
        if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
          errors.push(`Cannot submit CPAP in ${cpap.status} status`);
          return { valid: false, errors };
        }
      }

      // Officer can only update progress in Approved status
      if (action === 'update_progress') {
        if (cpap.status !== 'Approved') {
          errors.push(`Cannot update progress for CPAP in ${cpap.status} status`);
          return { valid: false, errors };
        }
      }

      return { valid: true, errors: [] };
    }

    // Unknown role
    errors.push(`Unknown user role: ${userRole}`);
    return { valid: false, errors };
  }

  /**
   * Validate required fields for a CPAP item
   * Helper method for validateForSubmission
   * @param item - The CPAP item to validate
   * @param itemNumber - The item number for error messages
   * @returns string[] - Array of error messages
   */
  private static validateItemRequiredFields(item: CPAPItem, itemNumber: number): string[] {
    const errors: string[] = [];

    if (!item.priority_area || item.priority_area.trim() === '') {
      errors.push(`Item ${itemNumber}: Priority area is required`);
    }

    if (!item.target_output || item.target_output.trim() === '') {
      errors.push(`Item ${itemNumber}: Target output is required`);
    }

    if (!item.success_indicator || item.success_indicator.trim() === '') {
      errors.push(`Item ${itemNumber}: Success indicator is required`);
    }

    if (!item.responsible_person || item.responsible_person.trim() === '') {
      errors.push(`Item ${itemNumber}: Responsible person is required`);
    }

    if (!item.timeline_start) {
      errors.push(`Item ${itemNumber}: Timeline start date is required`);
    }

    if (!item.timeline_end) {
      errors.push(`Item ${itemNumber}: Timeline end date is required`);
    }

    return errors;
  }

  /**
   * Validate CPAP can be approved
   * Checks that CPAP is in Submitted status
   * @param cpap - The CPAP to validate
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateForApproval(cpap: CPAP): ValidationResult {
    const errors: string[] = [];

    if (cpap.status !== 'Submitted') {
      errors.push(`Cannot approve CPAP in ${cpap.status} status. Only Submitted CPAPs can be approved.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate CPAP can have revision requested
   * Checks that CPAP is in Submitted status and comments are provided
   * @param cpap - The CPAP to validate
   * @param comments - Admin comments for revision request
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateForRevisionRequest(cpap: CPAP, comments: string): ValidationResult {
    const errors: string[] = [];

    if (cpap.status !== 'Submitted') {
      errors.push(`Cannot request revision for CPAP in ${cpap.status} status. Only Submitted CPAPs can have revisions requested.`);
    }

    if (!comments || comments.trim() === '') {
      errors.push('Comments are required when requesting revision');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate progress update data
   * Checks that CPAP is in Approved status and at least one field is being updated
   * @param cpap - The CPAP to validate
   * @param updates - Array of progress updates
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateProgressUpdate(cpap: CPAP, updates: any[]): ValidationResult {
    const errors: string[] = [];

    if (cpap.status !== 'Approved') {
      errors.push(`Cannot update progress for CPAP in ${cpap.status} status. Only Approved CPAPs can have progress updated.`);
    }

    if (!updates || updates.length === 0) {
      errors.push('At least one item must be updated');
    }

    // Validate each update has an ID and at least one field to update
    updates.forEach((update, index) => {
      if (!update.id) {
        errors.push(`Update ${index + 1}: Item ID is required`);
      }

      const hasUpdate = update.actual_output !== undefined ||
                       update.accomplishment_status !== undefined ||
                       update.remarks !== undefined;

      if (!hasUpdate) {
        errors.push(`Update ${index + 1}: At least one progress field must be provided`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate CPAP can be edited
   * Checks that CPAP is in Draft or Revision_Requested status
   * @param cpap - The CPAP to validate
   * @returns ValidationResult - Validation result with errors if any
   */
  static validateForEdit(cpap: CPAP): ValidationResult {
    const errors: string[] = [];

    if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
      errors.push(`Cannot edit CPAP in ${cpap.status} status. Only Draft or Revision_Requested CPAPs can be edited.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default CPAPValidationService;
