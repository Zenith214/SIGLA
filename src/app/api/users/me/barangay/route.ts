import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';

/**
 * GET /api/users/me/barangay
 * Returns the currently authenticated user's assigned barangay
 * Used by CPAP and other barangay-specific features
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      console.error('[/api/users/me/barangay] Auth failed:', authResult.error);
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: authResult.error || 'You must be logged in' 
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const userRole = authResult.user.role;
    
    console.log('[/api/users/me/barangay] User authenticated:', { userId, userRole, email: authResult.user.email });

    // Get user's assigned barangay using the CPAP permission service
    const barangayId = await CPAPPermissionService.getUserBarangay(userId);
    
    console.log('[/api/users/me/barangay] Barangay lookup result:', { userId, barangayId });

    if (!barangayId) {
      console.warn('[/api/users/me/barangay] No barangay assignment found for user:', userId);
      return NextResponse.json(
        { 
          error: 'No Assignment', 
          message: 'You are not assigned to any barangay. Please contact your administrator.' 
        },
        { status: 404 }
      );
    }

    console.log('[/api/users/me/barangay] Success:', { userId, barangayId });
    return NextResponse.json({
      success: true,
      barangay_id: barangayId,
      user_id: userId
    });

  } catch (error) {
    console.error('Error in GET /api/users/me/barangay:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch user barangay'
      },
      { status: 500 }
    );
  }
}
