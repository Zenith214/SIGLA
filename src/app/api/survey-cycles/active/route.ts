import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, createAuditLog, verifyAuth } from '@/lib/auth-middleware';
import { getActiveCycle, setActiveCycle, validateSingleActiveCycle } from '@/utils/surveyCycleHelpers';

/**
 * GET /api/survey-cycles/active
 * Retrieves the currently active survey cycle
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  try {
    const activeCycle = await getActiveCycle();
    
    if (!activeCycle) {
      return NextResponse.json(
        { 
          error: 'No active survey cycle found',
          message: 'Please contact an administrator to set up a survey cycle'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activeCycle
    });
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve active survey cycle',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/survey-cycles/active
 * Sets a survey cycle as active
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  try {
    const body = await request.json();
    const { cycle_id } = body;

    // Validate input
    if (!cycle_id || typeof cycle_id !== 'number') {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'cycle_id is required and must be a number'
        },
        { status: 400 }
      );
    }

    // Validate single active cycle constraint before making changes
    const isConstraintValid = await validateSingleActiveCycle();
    if (!isConstraintValid) {
      return NextResponse.json(
        { 
          error: 'Constraint violation',
          message: 'Multiple active cycles detected. Please contact system administrator.'
        },
        { status: 409 }
      );
    }

    // Set the cycle as active
    await setActiveCycle(cycle_id);

    // Get the updated active cycle for response
    const updatedActiveCycle = await getActiveCycle();

    // Create audit log
    try {
      const authResult = verifyAuth(request);
      if (authResult.success && authResult.user && updatedActiveCycle) {
        createAuditLog(authResult.user, 'SET_ACTIVE_CYCLE', {
          cycle_id,
          cycle_name: updatedActiveCycle.name,
          cycle_year: updatedActiveCycle.year
        });
      }
    } catch (auditError) {
      // Log audit error but don't fail the main operation
      console.warn('Failed to create audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Survey cycle activated successfully',
      data: updatedActiveCycle
    });

  } catch (error) {
    console.error('Error setting active cycle:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Survey cycle not found',
            message: error.message
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('constraint') || error.message.includes('unique')) {
        return NextResponse.json(
          { 
            error: 'Constraint violation',
            message: 'Multiple active cycles detected. Database constraint prevents this operation.'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to set active survey cycle',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}