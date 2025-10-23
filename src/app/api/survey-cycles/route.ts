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