import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPNotificationSimpleService } from '@/lib/services/cpap-notification-simple.service';

/**
 * GET /api/cpap/notifications
 * Get unread notification count for current user
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/cpap/notifications called');
    const authResult = verifyAuth(request);
    
    console.log('[API] Auth result:', { success: authResult.success, userId: authResult.user?.id, role: authResult.user?.role });
    
    if (!authResult.success || !authResult.user) {
      console.log('[API] Auth failed, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] Fetching unread count for user:', authResult.user.id);
    const count = await CPAPNotificationSimpleService.getUnreadCount(authResult.user.id);
    console.log('[API] Unread count:', count);

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error('[API] Error in GET /api/cpap/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cpap/notifications/mark-read
 * Mark all notifications as read for current user
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await CPAPNotificationSimpleService.markAllAsRead(authResult.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/cpap/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
