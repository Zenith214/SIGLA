import { supabaseAdmin } from '@/lib/supabase';
import { CPAPStatus } from '@/types/cpap';

/**
 * CPAP Permission Service
 * Handles authorization checks for CPAP operations
 */
export class CPAPPermissionService {
  /**
   * Get user's assigned barangay ID
   * Officers are assigned to barangays through the Assignment table
   * @param userId - The user ID
   * @returns Promise<number | null> - The barangay ID or null if not assigned
   */
  static async getUserBarangay(userId: number): Promise<number | null> {
    try {
      console.log('[CPAPPermissionService.getUserBarangay] Querying for user:', userId);
      
      // First, get the user's role to determine where to look for barangay assignment
      const { data: user, error: userError } = await supabaseAdmin
        .from('user')
        .select('role, barangayDesignation')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[CPAPPermissionService.getUserBarangay] Error fetching user:', userError);
        return null;
      }

      if (!user) {
        console.log('[CPAPPermissionService.getUserBarangay] User not found:', userId);
        return null;
      }

      const userRole = user.role?.toLowerCase();
      console.log('[CPAPPermissionService.getUserBarangay] User role:', userRole);

      // For OFFICER users, check barangayDesignation field
      if (userRole === 'officer') {
        const barangayId = user.barangayDesignation;
        console.log('[CPAPPermissionService.getUserBarangay] Officer barangayDesignation:', barangayId);
        return barangayId || null;
      }

      // For INTERVIEWER users, check Assignment table
      if (userRole === 'interviewer' || userRole === 'fs') {
        const { data: assignment, error: assignmentError } = await supabaseAdmin
          .from('assignment')
          .select('barangay_id')
          .eq('user_id', userId)
          .eq('status', 'Active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assignmentError) {
          console.log('[CPAPPermissionService.getUserBarangay] Assignment query error:', assignmentError.code, assignmentError.message);
          // If no assignment found, return null (not an error condition)
          if (assignmentError.code === 'PGRST116') {
            console.log('[CPAPPermissionService.getUserBarangay] No active assignment found for interviewer:', userId);
            return null;
          }
          throw assignmentError;
        }

        console.log('[CPAPPermissionService.getUserBarangay] Assignment found:', assignment);
        return assignment?.barangay_id || null;
      }

      // For other roles (admin, developer, etc.), return null
      console.log('[CPAPPermissionService.getUserBarangay] Role does not have barangay assignment:', userRole);
      return null;
    } catch (error) {
      console.error('[CPAPPermissionService.getUserBarangay] Error:', error);
      return null;
    }
  }

  /**
   * Check if user can access a specific CPAP
   * - ADMIN users can access any CPAP
   * - OFFICER users can only access CPAPs for their assigned barangay
   * - FS and INTERVIEWER users cannot access any CPAP
   * @param userId - The user ID
   * @param userRole - The user's role
   * @param cpapId - The CPAP ID
   * @returns Promise<boolean> - True if user can access the CPAP
   */
  static async canAccessCPAP(
    userId: number,
    userRole: string,
    cpapId: number
  ): Promise<boolean> {
    try {
      const normalizedRole = userRole.toLowerCase();

      // FS and INTERVIEWER users cannot access any CPAP
      if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
        return false;
      }

      // ADMIN users can access any CPAP
      if (normalizedRole === 'admin') {
        return true;
      }

      // OFFICER users can only access CPAPs for their assigned barangay
      if (normalizedRole === 'officer') {
        // Get the CPAP's barangay
        const { data: cpap, error: cpapError } = await supabaseAdmin
          .from('cpaps')
          .select('barangay_id')
          .eq('id', cpapId)
          .single();

        if (cpapError || !cpap) {
          return false;
        }

        // Get user's assigned barangay
        const userBarangayId = await this.getUserBarangay(userId);

        if (!userBarangayId) {
          return false;
        }

        // Check if the CPAP belongs to the user's barangay
        return cpap.barangay_id === userBarangayId;
      }

      // Unknown role - deny access
      return false;
    } catch (error) {
      console.error('Error in canAccessCPAP:', error);
      return false;
    }
  }

  /**
   * Check if user can edit a specific CPAP
   * - Only OFFICER users can edit CPAPs
   * - Can only edit CPAPs for their assigned barangay
   * - Can only edit when status is Draft or Revision_Requested
   * @param userId - The user ID
   * @param userRole - The user's role
   * @param cpapId - The CPAP ID
   * @returns Promise<boolean> - True if user can edit the CPAP
   */
  static async canEditCPAP(
    userId: number,
    userRole: string,
    cpapId: number
  ): Promise<boolean> {
    try {
      const normalizedRole = userRole.toLowerCase();

      // Only OFFICER users can edit CPAPs
      if (normalizedRole !== 'officer') {
        return false;
      }

      // Get the CPAP details
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select('barangay_id, status')
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        return false;
      }

      // Check if status allows editing
      if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
        return false;
      }

      // Get user's assigned barangay
      const userBarangayId = await this.getUserBarangay(userId);

      if (!userBarangayId) {
        return false;
      }

      // Check if the CPAP belongs to the user's barangay
      return cpap.barangay_id === userBarangayId;
    } catch (error) {
      console.error('Error in canEditCPAP:', error);
      return false;
    }
  }

  /**
   * Check if user can submit a specific CPAP
   * - Only OFFICER users can submit CPAPs
   * - Can only submit CPAPs for their assigned barangay
   * - Can only submit when status is Draft or Revision_Requested
   * @param userId - The user ID
   * @param userRole - The user's role
   * @param cpapId - The CPAP ID
   * @returns Promise<boolean> - True if user can submit the CPAP
   */
  static async canSubmitCPAP(
    userId: number,
    userRole: string,
    cpapId: number
  ): Promise<boolean> {
    try {
      const normalizedRole = userRole.toLowerCase();

      // Only OFFICER users can submit CPAPs
      if (normalizedRole !== 'officer') {
        return false;
      }

      // Get the CPAP details
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select('barangay_id, status')
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        return false;
      }

      // Check if status allows submission
      if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
        return false;
      }

      // Get user's assigned barangay
      const userBarangayId = await this.getUserBarangay(userId);

      if (!userBarangayId) {
        return false;
      }

      // Check if the CPAP belongs to the user's barangay
      return cpap.barangay_id === userBarangayId;
    } catch (error) {
      console.error('Error in canSubmitCPAP:', error);
      return false;
    }
  }

  /**
   * Check if user can review CPAPs (approve or request revision)
   * - Only ADMIN users can review CPAPs
   * @param userId - The user ID
   * @param userRole - The user's role
   * @returns Promise<boolean> - True if user can review CPAPs
   */
  static async canReviewCPAP(userId: number, userRole: string): Promise<boolean> {
    try {
      const normalizedRole = userRole.toLowerCase();

      // Only ADMIN users can review CPAPs
      return normalizedRole === 'admin';
    } catch (error) {
      console.error('Error in canReviewCPAP:', error);
      return false;
    }
  }

  /**
   * Check if user can update progress on a specific CPAP
   * - Only OFFICER users can update progress
   * - Can only update progress for their assigned barangay
   * - Can only update progress when status is Approved
   * @param userId - The user ID
   * @param userRole - The user's role
   * @param cpapId - The CPAP ID
   * @returns Promise<boolean> - True if user can update progress
   */
  static async canUpdateProgress(
    userId: number,
    userRole: string,
    cpapId: number
  ): Promise<boolean> {
    try {
      const normalizedRole = userRole.toLowerCase();

      // Only OFFICER users can update progress
      if (normalizedRole !== 'officer') {
        return false;
      }

      // Get the CPAP details
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select('barangay_id, status')
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        return false;
      }

      // Check if status allows progress updates
      if (cpap.status !== 'Approved') {
        return false;
      }

      // Get user's assigned barangay
      const userBarangayId = await this.getUserBarangay(userId);

      if (!userBarangayId) {
        return false;
      }

      // Check if the CPAP belongs to the user's barangay
      return cpap.barangay_id === userBarangayId;
    } catch (error) {
      console.error('Error in canUpdateProgress:', error);
      return false;
    }
  }

  /**
   * Verify user has permission to create a CPAP for a specific barangay
   * - Only OFFICER users can create CPAPs
   * - Can only create CPAPs for their assigned barangay
   * @param userId - The user ID
   * @param userRole - The user's role
   * @param barangayId - The barangay ID
   * @returns Promise<boolean> - True if user can create CPAP for the barangay
   */
  static async canCreateCPAPForBarangay(
    userId: number,
    userRole: string,
    barangayId: number
  ): Promise<boolean> {
    try {
      const normalizedRole = userRole.toLowerCase();

      // Only OFFICER users can create CPAPs
      if (normalizedRole !== 'officer') {
        return false;
      }

      // Get user's assigned barangay
      const userBarangayId = await this.getUserBarangay(userId);

      if (!userBarangayId) {
        return false;
      }

      // Check if the barangay matches the user's assignment
      return barangayId === userBarangayId;
    } catch (error) {
      console.error('Error in canCreateCPAPForBarangay:', error);
      return false;
    }
  }
}

export default CPAPPermissionService;
