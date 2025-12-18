import { supabaseAdmin } from '@/lib/supabase';

/**
 * CPAP Notification Service
 * Handles notifications for CPAP status changes and workflow events
 * 
 * This service provides notification methods for:
 * - Alerting ADMIN users when CPAPs are submitted
 * - Notifying OFFICER users when CPAPs are approved
 * - Notifying OFFICER users when revisions are requested
 */
export class CPAPNotificationService {
  /**
   * Notify all ADMIN users of a new CPAP submission
   * @param cpapId - The CPAP ID that was submitted
   * @returns Promise<void>
   */
  static async notifyCPAPSubmitted(cpapId: number): Promise<void> {
    try {
      // Fetch CPAP details
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          id,
          barangay_id,
          cycle_id,
          submitted_at,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          )
        `)
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        throw new Error('CPAP not found');
      }

      // Fetch all ADMIN users
      const { data: adminUsers, error: usersError } = await supabaseAdmin
        .from('user')
        .select('id, email, firstName, lastName')
        .ilike('role', 'admin');

      if (usersError) {
        throw usersError;
      }

      if (!adminUsers || adminUsers.length === 0) {
        console.warn('No ADMIN users found to notify');
        return;
      }

      // Log notification for each admin user
      // In a production system, this would send actual emails/notifications
      const barangay = Array.isArray(cpap.barangay) ? cpap.barangay[0] : cpap.barangay;
      const cycle = Array.isArray(cpap.cycle) ? cpap.cycle[0] : cpap.cycle;
      const barangayName = barangay?.barangay_name || 'Unknown';
      const cycleName = cycle?.name || 'Unknown';
      
      console.log(`[CPAP Notification] CPAP #${cpapId} submitted for review`);
      console.log(`  Barangay: ${barangayName}`);
      console.log(`  Cycle: ${cycleName}`);
      console.log(`  Notifying ${adminUsers.length} ADMIN users:`);
      
      for (const admin of adminUsers) {
        console.log(`    - ${admin.firstName} ${admin.lastName} (${admin.email})`);
        
        // TODO: Implement actual notification mechanism
        // This could be:
        // - Email via SendGrid/AWS SES
        // - In-app notification
        // - SMS via Twilio
        // - Push notification
        
        // Example email notification (pseudo-code):
        // await sendEmail({
        //   to: admin.email,
        //   subject: `New CPAP Submission - ${barangayName}`,
        //   body: `A new CPAP has been submitted for ${barangayName} (${cycleName}) and requires your review.`
        // });
      }

      // Store notification record in database (optional)
      // This allows tracking of sent notifications
      await this.logNotification({
        type: 'cpap_submitted',
        cpap_id: cpapId,
        recipient_count: adminUsers.length,
        recipient_role: 'admin',
        message: `CPAP submitted for ${barangayName} - ${cycleName}`
      });

    } catch (error) {
      console.error('Error in notifyCPAPSubmitted:', error);
      // Don't throw - notification failures shouldn't break the workflow
      // Just log the error and continue
    }
  }

  /**
   * Notify OFFICER user that their CPAP has been approved
   * @param cpapId - The CPAP ID that was approved
   * @returns Promise<void>
   */
  static async notifyCPAPApproved(cpapId: number): Promise<void> {
    try {
      // Fetch CPAP details with barangay assignment
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          id,
          barangay_id,
          cycle_id,
          approved_at,
          admin_comments,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          )
        `)
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        throw new Error('CPAP not found');
      }

      // Find OFFICER user assigned to this barangay
      const { data: assignments, error: assignmentError } = await supabaseAdmin
        .from('assignment')
        .select(`
          user_id,
          user:user_id (
            id,
            email,
            firstName,
            lastName,
            role
          )
        `)
        .eq('barangay_id', cpap.barangay_id);

      if (assignmentError) {
        throw assignmentError;
      }

      // Filter for OFFICER users
      const officerUsers = assignments
        ?.filter((a: any) => a.user?.role?.toLowerCase() === 'officer')
        .map((a: any) => a.user) || [];

      if (officerUsers.length === 0) {
        console.warn(`No OFFICER users found for barangay ${cpap.barangay_id}`);
        return;
      }

      // Log notification for each officer user
      const barangay = Array.isArray(cpap.barangay) ? cpap.barangay[0] : cpap.barangay;
      const cycle = Array.isArray(cpap.cycle) ? cpap.cycle[0] : cpap.cycle;
      const barangayName = barangay?.barangay_name || 'Unknown';
      const cycleName = cycle?.name || 'Unknown';
      
      console.log(`[CPAP Notification] CPAP #${cpapId} approved`);
      console.log(`  Barangay: ${barangayName}`);
      console.log(`  Cycle: ${cycleName}`);
      console.log(`  Notifying ${officerUsers.length} OFFICER users:`);
      
      for (const officer of officerUsers) {
        console.log(`    - ${officer.firstName} ${officer.lastName} (${officer.email})`);
        
        // TODO: Implement actual notification mechanism
        // Example email notification (pseudo-code):
        // await sendEmail({
        //   to: officer.email,
        //   subject: `CPAP Approved - ${barangayName}`,
        //   body: `Your CPAP for ${barangayName} (${cycleName}) has been approved. You can now track implementation progress.`
        // });
      }

      // Store notification record
      await this.logNotification({
        type: 'cpap_approved',
        cpap_id: cpapId,
        recipient_count: officerUsers.length,
        recipient_role: 'officer',
        message: `CPAP approved for ${barangayName} - ${cycleName}`
      });

    } catch (error) {
      console.error('Error in notifyCPAPApproved:', error);
      // Don't throw - notification failures shouldn't break the workflow
    }
  }

  /**
   * Notify OFFICER user that revisions are requested for their CPAP
   * @param cpapId - The CPAP ID that needs revision
   * @param comments - Admin comments explaining what needs to be revised
   * @returns Promise<void>
   */
  static async notifyCPAPRevisionRequested(cpapId: number, comments: string): Promise<void> {
    try {
      // Fetch CPAP details with barangay assignment
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          id,
          barangay_id,
          cycle_id,
          updated_at,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          )
        `)
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        throw new Error('CPAP not found');
      }

      // Find OFFICER user assigned to this barangay
      const { data: assignments, error: assignmentError } = await supabaseAdmin
        .from('assignment')
        .select(`
          user_id,
          user:user_id (
            id,
            email,
            firstName,
            lastName,
            role
          )
        `)
        .eq('barangay_id', cpap.barangay_id);

      if (assignmentError) {
        throw assignmentError;
      }

      // Filter for OFFICER users
      const officerUsers = assignments
        ?.filter((a: any) => a.user?.role?.toLowerCase() === 'officer')
        .map((a: any) => a.user) || [];

      if (officerUsers.length === 0) {
        console.warn(`No OFFICER users found for barangay ${cpap.barangay_id}`);
        return;
      }

      // Log notification for each officer user
      const barangay = Array.isArray(cpap.barangay) ? cpap.barangay[0] : cpap.barangay;
      const cycle = Array.isArray(cpap.cycle) ? cpap.cycle[0] : cpap.cycle;
      const barangayName = barangay?.barangay_name || 'Unknown';
      const cycleName = cycle?.name || 'Unknown';
      
      console.log(`[CPAP Notification] CPAP #${cpapId} revision requested`);
      console.log(`  Barangay: ${barangayName}`);
      console.log(`  Cycle: ${cycleName}`);
      console.log(`  Admin Comments: ${comments}`);
      console.log(`  Notifying ${officerUsers.length} OFFICER users:`);
      
      for (const officer of officerUsers) {
        console.log(`    - ${officer.firstName} ${officer.lastName} (${officer.email})`);
        
        // TODO: Implement actual notification mechanism
        // Example email notification (pseudo-code):
        // await sendEmail({
        //   to: officer.email,
        //   subject: `CPAP Revision Requested - ${barangayName}`,
        //   body: `Your CPAP for ${barangayName} (${cycleName}) requires revisions.\n\nAdmin Comments:\n${comments}`
        // });
      }

      // Store notification record
      await this.logNotification({
        type: 'cpap_revision_requested',
        cpap_id: cpapId,
        recipient_count: officerUsers.length,
        recipient_role: 'officer',
        message: `CPAP revision requested for ${barangayName} - ${cycleName}`,
        additional_data: { comments }
      });

    } catch (error) {
      console.error('Error in notifyCPAPRevisionRequested:', error);
      // Don't throw - notification failures shouldn't break the workflow
    }
  }

  /**
   * Log notification to console and optionally to database
   * This provides an audit trail of all notifications sent
   * @param notification - Notification details to log
   * @returns Promise<void>
   */
  private static async logNotification(notification: {
    type: string;
    cpap_id: number;
    recipient_count: number;
    recipient_role: string;
    message: string;
    additional_data?: any;
  }): Promise<void> {
    try {
      // Log to console
      console.log(`[CPAP Notification Log] ${notification.type}`, {
        cpap_id: notification.cpap_id,
        recipients: notification.recipient_count,
        role: notification.recipient_role,
        message: notification.message,
        timestamp: new Date().toISOString()
      });

      // TODO: Optionally store in database for audit trail
      // This would require creating a notifications table:
      // await supabaseAdmin.from('notifications').insert({
      //   type: notification.type,
      //   cpap_id: notification.cpap_id,
      //   recipient_count: notification.recipient_count,
      //   recipient_role: notification.recipient_role,
      //   message: notification.message,
      //   additional_data: notification.additional_data,
      //   created_at: new Date().toISOString()
      // });

    } catch (error) {
      console.error('Error logging notification:', error);
      // Don't throw - logging failures shouldn't break anything
    }
  }
}

export default CPAPNotificationService;
