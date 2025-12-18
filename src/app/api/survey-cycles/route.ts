import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, createAuditLog } from '@/lib/auth-middleware';
import { getSurveyCycles, createSurveyCycle, updateSurveyCycle, deleteSurveyCycle } from '@/utils/surveyCycleHelpers';

/**
 * GET /api/survey-cycles
 * Lists all survey cycles
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
    const cycles = await getSurveyCycles();
    
    return NextResponse.json({
      success: true,
      data: cycles
    });
  } catch (error) {
    console.error("Error fetching survey cycles:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch survey cycles",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/survey-cycles
 * Creates a new survey cycle
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
    const { name, year, start_date, end_date } = body;

    // Validate required fields
    if (!name || !year) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'name and year are required fields'
        },
        { status: 400 }
      );
    }

    // Validate year is a number
    if (typeof year !== 'number' || year < 2000 || year > 2100) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'year must be a valid number between 2000 and 2100'
        },
        { status: 400 }
      );
    }

    // Parse dates if provided
    const startDate = start_date ? new Date(start_date) : undefined;
    const endDate = end_date ? new Date(end_date) : undefined;

    // Validate dates if provided
    if (startDate && isNaN(startDate.getTime())) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'start_date must be a valid date'
        },
        { status: 400 }
      );
    }

    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'end_date must be a valid date'
        },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate >= endDate) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'start_date must be before end_date'
        },
        { status: 400 }
      );
    }

    // Create the survey cycle
    const newCycle = await createSurveyCycle(name, year, startDate, endDate);

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'CREATE_SURVEY_CYCLE', {
        cycle_id: newCycle.cycle_id,
        name,
        year,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Survey cycle created successfully',
      data: newCycle
    });

  } catch (error) {
    console.error("Error creating survey cycle:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { 
            error: 'Duplicate survey cycle',
            message: 'A survey cycle with this name or year may already exist'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: "Failed to create survey cycle",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/survey-cycles
 * Updates an existing survey cycle
 * Requires admin authentication
 */
export async function PUT(request: NextRequest) {
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
    const { cycle_id, name, year, start_date, end_date, is_active } = body;

    // Validate required fields
    if (!cycle_id) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'cycle_id is required'
        },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (year !== undefined) updates.year = year;
    if (start_date !== undefined) updates.start_date = start_date ? new Date(start_date) : null;
    if (end_date !== undefined) updates.end_date = end_date ? new Date(end_date) : null;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update the survey cycle
    const updatedCycle = await updateSurveyCycle(cycle_id, updates);

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'UPDATE_SURVEY_CYCLE', {
        cycle_id,
        updates
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Survey cycle updated successfully',
      data: updatedCycle
    });

  } catch (error) {
    console.error("Error updating survey cycle:", error);
    return NextResponse.json(
      { 
        error: "Failed to update survey cycle",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/survey-cycles
 * Deletes a survey cycle
 * Requires admin authentication
 * Prevents deletion if cycle has associated data unless force=true
 */
export async function DELETE(request: NextRequest) {
  console.log('🗑️ DELETE /api/survey-cycles - Request received');
  
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    console.log('❌ DELETE /api/survey-cycles - Auth failed:', authError.error);
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  console.log('✅ DELETE /api/survey-cycles - Auth successful');

  try {
    const body = await request.json();
    console.log('📦 DELETE /api/survey-cycles - Request body:', JSON.stringify(body, null, 2));
    
    const { cycle_id, force } = body;

    // Validate required fields
    if (!cycle_id) {
      console.log('❌ DELETE /api/survey-cycles - Missing cycle_id');
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'cycle_id is required'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 DELETE /api/survey-cycles - Attempting to delete cycle ${cycle_id} (force: ${force})`);

    // Attempt to delete the cycle
    const result = await deleteSurveyCycle(cycle_id, force === true);

    console.log('📊 DELETE /api/survey-cycles - Delete result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.log('⚠️ DELETE /api/survey-cycles - Delete prevented:', result.message);
      return NextResponse.json(
        { 
          error: 'Cannot delete survey cycle',
          message: result.message,
          data: result.deletedData
        },
        { status: 409 } // Conflict
      );
    }

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      console.log('📝 DELETE /api/survey-cycles - Creating audit log for user:', authResult.user.email);
      createAuditLog(authResult.user, 'DELETE_SURVEY_CYCLE', {
        cycle_id,
        force,
        deletedData: result.deletedData
      });
    }

    console.log('✅ DELETE /api/survey-cycles - Cycle deleted successfully');
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.deletedData
    });

  } catch (error) {
    console.error("❌ DELETE /api/survey-cycles - Error:", error);
    console.error("❌ DELETE /api/survey-cycles - Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: "Failed to delete survey cycle",
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}