import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPService } from '@/lib/services/cpap.service';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPFilters } from '@/types/cpap';

/**
 * GET /api/cpap
 * Lists all CPAPs with role-based filtering
 * - ADMIN: Returns all CPAPs
 * - OFFICER: Returns only CPAPs for their assigned barangay
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required'
      },
      { status: 401 }
    );
  }

  const { user } = authResult;
  const normalizedRole = user.role.toLowerCase();

  // Check if user role has CPAP access
  if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access CPAP functionality'
      },
      { status: 403 }
    );
  }

  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const filters: CPAPFilters = {
      status: searchParams.get('status') as any || undefined,
      cycle_id: searchParams.get('cycle_id') ? parseInt(searchParams.get('cycle_id')!) : undefined,
      barangay_id: searchParams.get('barangay_id') ? parseInt(searchParams.get('barangay_id')!) : undefined,
      search: searchParams.get('search') || undefined
    };

    // Get user's barangay for OFFICER role
    let userBarangayId: number | null = null;
    if (normalizedRole === 'officer') {
      userBarangayId = await CPAPPermissionService.getUserBarangay(user.id);
    }

    // List CPAPs with role-based filtering
    const cpaps = await CPAPService.listCPAPs(
      user.id,
      user.role,
      userBarangayId,
      filters
    );

    return NextResponse.json({
      success: true,
      cpaps
    });
  } catch (error) {
    console.error('Error in GET /api/cpap:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch CPAPs'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cpap
 * Creates a new CPAP for a barangay and cycle
 * - OFFICER: Can only create for their assigned barangay
 * - ADMIN: Cannot create CPAPs (they only review)
 * - FS/INTERVIEWER: 403 Forbidden
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required'
      },
      { status: 401 }
    );
  }

  const { user } = authResult;
  const normalizedRole = user.role.toLowerCase();

  // Check if user role has CPAP access
  if (normalizedRole === 'fs' || normalizedRole === 'interviewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access CPAP functionality'
      },
      { status: 403 }
    );
  }

  // Only OFFICER users can create CPAPs
  if (normalizedRole !== 'officer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Only Officer users can create CPAPs'
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { barangay_id, cycle_id } = body;

    // Validate required fields
    if (!barangay_id || !cycle_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'barangay_id and cycle_id are required'
        },
        { status: 400 }
      );
    }

    // Validate barangay_id and cycle_id are numbers
    if (typeof barangay_id !== 'number' || typeof cycle_id !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'barangay_id and cycle_id must be numbers'
        },
        { status: 400 }
      );
    }

    // Check if user can create CPAP for this barangay
    const canCreate = await CPAPPermissionService.canCreateCPAPForBarangay(
      user.id,
      user.role,
      barangay_id
    );

    if (!canCreate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only create CPAPs for your assigned barangay'
        },
        { status: 403 }
      );
    }

    // Get or create CPAP (will return existing if already exists)
    const cpap = await CPAPService.getOrCreateCPAP(barangay_id, cycle_id);

    return NextResponse.json({
      success: true,
      cpap
    }, { status: cpap.created_at === cpap.updated_at ? 201 : 200 });
  } catch (error) {
    console.error('Error in POST /api/cpap:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to create CPAP'
      },
      { status: 500 }
    );
  }
}
