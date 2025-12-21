import { supabaseAdmin } from '@/lib/supabase';

export type NotificationType = 
  | 'cpap_submitted' 
  | 'cpap_approved' 
  | 'cpap_revision_requested' 
  | 'cpap_updated' 
  | 'comment_added';

/**
 * Simple CPAP Notification Service
 * Creates notifications for CPAP-related events
 */
export class CPAPNotificationSimpleService {
  /**
   * Create a notification for a user
   */
  private static async createNotification(
    userId: number,
    cpapId: number,
    type: NotificationType,
    message: string,
    createdBy?: number
  ): Promise<void> {
    try {
      console.log('[Notification] Creating notification:', { userId, cpapId, type, message, createdBy });
      
      const { error } = await supabaseAdmin
        .from('cpap_notifications')
        .insert({
          user_id: userId,
          cpap_id: cpapId,
          notification_type: type,
          message,
          is_read: false,
          created_at: new Date().toISOString(),
          created_by: createdBy || null
        });

      if (error) {
        console.error('[Notification] Error creating notification:', error);
      } else {
        console.log('[Notification] Notification created successfully');
      }
    } catch (error) {
      console.error('[Notification] Error in createNotification:', error);
    }
  }

  /**
   * Notify all admins when an officer submits a CPAP
   */
  static async notifyCPAPSubmitted(cpapId: number, officerId: number): Promise<void> {
    try {
      // Get CPAP details
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select('barangay:barangay_id(barangay_name)')
        .eq('id', cpapId)
        .single();

      const barangay = Array.isArray(cpap?.barangay) ? cpap.barangay[0] : cpap?.barangay;
      const barangayName = barangay?.barangay_name || 'Unknown';

      // Get all admin users
      const { data: admins } = await supabaseAdmin
        .from('user')
        .select('id')
        .ilike('role', 'admin');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await this.createNotification(
            admin.id,
            cpapId,
            'cpap_submitted',
            `New CPAP submitted by ${barangayName} for review`,
            officerId
          );
        }
      }
    } catch (error) {
      console.error('Error in notifyCPAPSubmitted:', error);
    }
  }

  /**
   * Notify officer when admin approves their CPAP
   */
  static async notifyCPAPApproved(cpapId: number, adminId: number): Promise<void> {
    try {
      // Get CPAP and officer details
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select(`
          barangay_id,
          barangay:barangay_id(barangay_name)
        `)
        .eq('id', cpapId)
        .single();

      if (!cpap) return;

      const barangay = Array.isArray(cpap.barangay) ? cpap.barangay[0] : cpap.barangay;
      const barangayName = barangay?.barangay_name || 'Unknown';

      // Get all officers assigned to this barangay
      const { data: officers } = await supabaseAdmin
        .from('user')
        .select('id')
        .eq('barangayDesignation', cpap.barangay_id)
        .ilike('role', 'officer');

      if (officers && officers.length > 0) {
        for (const officer of officers) {
          await this.createNotification(
            officer.id,
            cpapId,
            'cpap_approved',
            `Your CPAP for ${barangayName} has been approved! You can now track implementation progress.`,
            adminId
          );
        }
      }
    } catch (error) {
      console.error('Error in notifyCPAPApproved:', error);
    }
  }

  /**
   * Notify officer when admin requests revision
   */
  static async notifyCPAPRevisionRequested(cpapId: number, adminId: number): Promise<void> {
    try {
      // Get CPAP and officer details
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select(`
          barangay_id,
          barangay:barangay_id(barangay_name)
        `)
        .eq('id', cpapId)
        .single();

      if (!cpap) return;

      const barangay = Array.isArray(cpap.barangay) ? cpap.barangay[0] : cpap.barangay;
      const barangayName = barangay?.barangay_name || 'Unknown';

      // Get all officers assigned to this barangay
      const { data: officers } = await supabaseAdmin
        .from('user')
        .select('id')
        .eq('barangayDesignation', cpap.barangay_id)
        .ilike('role', 'officer');

      if (officers && officers.length > 0) {
        for (const officer of officers) {
          await this.createNotification(
            officer.id,
            cpapId,
            'cpap_revision_requested',
            `Revision requested for your CPAP (${barangayName}). Please review the comments and resubmit.`,
            adminId
          );
        }
      }
    } catch (error) {
      console.error('Error in notifyCPAPRevisionRequested:', error);
    }
  }

  /**
   * Notify admins when officer updates an approved CPAP
   */
  static async notifyCPAPUpdated(cpapId: number, officerId: number): Promise<void> {
    try {
      // Get CPAP details
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select('barangay:barangay_id(barangay_name)')
        .eq('id', cpapId)
        .single();

      const barangay = Array.isArray(cpap?.barangay) ? cpap.barangay[0] : cpap?.barangay;
      const barangayName = barangay?.barangay_name || 'Unknown';

      // Get all admin users
      const { data: admins } = await supabaseAdmin
        .from('user')
        .select('id')
        .ilike('role', 'admin');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await this.createNotification(
            admin.id,
            cpapId,
            'cpap_updated',
            `${barangayName} updated their CPAP implementation progress`,
            officerId
          );
        }
      }
    } catch (error) {
      console.error('Error in notifyCPAPUpdated:', error);
    }
  }

  /**
   * Notify relevant users when a comment is added
   */
  static async notifyCommentAdded(
    cpapId: number,
    commenterId: number,
    commenterRole: string
  ): Promise<void> {
    try {
      console.log('[Notification] notifyCommentAdded called:', { cpapId, commenterId, commenterRole });
      
      // Get CPAP details
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select(`
          barangay_id,
          barangay:barangay_id(barangay_name)
        `)
        .eq('id', cpapId)
        .single();

      if (!cpap) {
        console.log('[Notification] CPAP not found:', cpapId);
        return;
      }

      console.log('[Notification] CPAP found:', cpap);
      const barangay = Array.isArray(cpap.barangay) ? cpap.barangay[0] : cpap.barangay;
      const barangayName = barangay?.barangay_name || 'Unknown';

      // If commenter is admin, notify the officer
      if (commenterRole.toLowerCase() === 'admin') {
        console.log('[Notification] Admin commented, finding officer for barangay:', cpap.barangay_id);
        
        const { data: officers, error: officerError } = await supabaseAdmin
          .from('user')
          .select('id')
          .eq('barangayDesignation', cpap.barangay_id)
          .ilike('role', 'officer');

        console.log('[Notification] Officer query result:', { officers, officerError });

        if (officers && officers.length > 0) {
          // Notify all officers assigned to this barangay
          for (const officer of officers) {
            if (officer.id !== commenterId) {
              console.log('[Notification] Creating notification for officer:', officer.id);
              await this.createNotification(
                officer.id,
                cpapId,
                'comment_added',
                `Admin commented on your CPAP (${barangayName})`,
                commenterId
              );
            }
          }
          console.log('[Notification] Notification(s) created successfully');
        } else {
          console.log('[Notification] No officers to notify or officers are commenter');
        }
      }
      // If commenter is officer, notify all admins
      else {
        console.log('[Notification] Officer commented, finding admins');
        
        const { data: admins, error: adminsError } = await supabaseAdmin
          .from('user')
          .select('id')
          .ilike('role', 'admin');

        console.log('[Notification] Admins query result:', { admins, adminsError });

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            if (admin.id !== commenterId) {
              console.log('[Notification] Creating notification for admin:', admin.id);
              await this.createNotification(
                admin.id,
                cpapId,
                'comment_added',
                `${barangayName} added a comment to their CPAP`,
                commenterId
              );
            }
          }
          console.log('[Notification] All admin notifications created');
        } else {
          console.log('[Notification] No admins found to notify');
        }
      }
    } catch (error) {
      console.error('Error in notifyCommentAdded:', error);
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('cpap_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('cpap_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  }
}
