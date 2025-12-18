import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, createAuditLog } from '@/lib/auth-middleware';
import { createSurveyCycle } from '@/utils/surveyCycleHelpers';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';

/**
 * POST /api/survey-cycles/create-with-awards
 * Creates a new survey cycle with optional award copying from previous cycle
 * Body parameters:
 * - name (required): The name of the survey cycle
 * - year (required): The year of the survey cycle
 * - start_date (optional): Start date of the cycle
 * - end_date (optional): End date of the cycle
 * - copy_awards_from (optional): Cycle ID to copy awards from
 * - copy_awards_mode (optional): 'all' | 'awardees_only' | 'none' (default: 'none')
 * 
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
    const { 
      name, 
      year, 
      start_date, 
      end_date, 
      copy_awards_from, 
      copy_awards_mode = 'none' 
    } = body;

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

    // Validate copy awards mode
    const validModes = ['all', 'awardees_only', 'none'];
    if (!validModes.includes(copy_awards_mode)) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'copy_awards_mode must be one of: all, awardees_only, none'
        },
        { status: 400 }
      );
    }

    // Validate copy_awards_from if provided
    if (copy_awards_from !== undefined && (typeof copy_awards_from !== 'number' || copy_awards_from <= 0)) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'copy_awards_from must be a positive integer'
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

    let awardsCopied = 0;
    let awardsMessage = '';

    // Handle award copying if requested
    if (copy_awards_mode !== 'none' && copy_awards_from) {
      try {
        // Get user info for audit logging
        const authResult = requireAuth(request);
        const userId = authResult?.success ? undefined : authResult?.user?.id;

        if (copy_awards_mode === 'all') {
          // Copy all awards from source cycle
          const copiedAwards = await CycleAwardsService.copyAwardsBetweenCycles(
            copy_awards_from,
            newCycle.cycle_id,
            userId
          );
          awardsCopied = copiedAwards.length;
          awardsMessage = `Copied ${awardsCopied} awards from previous cycle`;
        } else if (copy_awards_mode === 'awardees_only') {
          // Copy only awardee status (set all as awardees)
          const sourceAwards = await CycleAwardsService.getCycleAwards(copy_awards_from);
          const awardeeAwards = sourceAwards.filter(award => award.is_awardee);
          
          if (awardeeAwards.length > 0) {
            const bulkUpdates = awardeeAwards.map(award => ({
              barangayId: award.barangay_id,
              isAwardee: true,
              notes: `Copied awardee status from previous cycle`
            }));

            const copiedAwards = await CycleAwardsService.bulkUpdateAwards(
              bulkUpdates,
              newCycle.cycle_id,
              userId
            );
            awardsCopied = copiedAwards.length;
            awardsMessage = `Copied ${awardsCopied} awardee statuses from previous cycle`;
          }
        }
      } catch (awardError) {
        console.error('Error copying awards during cycle creation:', awardError);
        // Don't fail the cycle creation, just log the award copying error
        awardsMessage = 'Cycle created successfully, but award copying failed';
      }
    }

    // Create audit log
    const authResult = requireAuth(request);
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'CREATE_SURVEY_CYCLE_WITH_AWARDS', {
        cycle_id: newCycle.cycle_id,
        name,
        year,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        copy_awards_from,
        copy_awards_mode,
        awards_copied: awardsCopied
      });
    }

    return NextResponse.json({
      success: true,
      message: `Survey cycle created successfully${awardsMessage ? '. ' + awardsMessage : ''}`,
      data: {
        cycle: newCycle,
        awards_copied: awardsCopied,
        awards_message: awardsMessage
      }
    });

  } catch (error) {
    console.error("Error creating survey cycle with awards:", error);
    
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
        error: "Failed to create survey cycle with awards",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}