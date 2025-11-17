import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * GET /api/fs/monitoring
 * Get real-time monitoring data for all Field Interviewers in the active cycle
 * 
 * Query Parameters:
 * - cycleId: Survey cycle ID (required)
 * 
 * Returns:
 * - spots: Array of all spots with their status and location
 * - fieldInterviewers: Array of FI performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get cycleId from query parameters
    const { searchParams } = new URL(request.url);
    const cycleIdParam = searchParams.get("cycleId");

    if (!cycleIdParam) {
      throw createValidationError("cycleId query parameter is required");
    }

    const cycleId = parseInt(cycleIdParam);
    if (isNaN(cycleId) || cycleId <= 0) {
      throw createValidationError("cycleId must be a positive integer", 'cycleId', cycleIdParam);
    }

    // Verify cycle exists
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id, name, year')
      .eq('cycle_id', cycleId)
      .single();

    if (cycleError) {
      if (cycleError.code === 'PGRST116') {
        throw createNotFoundError('Survey cycle');
      }
      throw handleDatabaseError(cycleError, 'fetch survey cycle');
    }

    if (!cycle) {
      throw createNotFoundError('Survey cycle');
    }

    // Fetch all spots for the cycle with related data
    const { data: spots, error: spotsError } = await supabaseAdmin
      .from('spots')
      .select(`
        spot_id,
        spot_name,
        starting_point,
        status,
        assigned_fi_id,
        barangay:barangay_id (
          barangay_name
        ),
        assigned_fi:assigned_fi_id (
          id,
          firstName,
          lastName
        ),
        questionnaires (
          questionnaire_id,
          status,
          visit_count
        )
      `)
      .eq('cycle_id', cycleId)
      .order('created_at', { ascending: true });

    if (spotsError) {
      throw handleDatabaseError(spotsError, 'fetch spots for monitoring');
    }

    // Get all Field Interviewers who have spots assigned in this cycle
    const fiIds = [...new Set((spots || []).filter(s => s.assigned_fi_id).map(s => s.assigned_fi_id))];
    
    // Fetch FI details
    const { data: fis, error: fisError } = await supabaseAdmin
      .from('user')
      .select('id, firstName, lastName, email')
      .in('id', fiIds);

    if (fisError) {
      throw handleDatabaseError(fisError, 'fetch field interviewers');
    }

    // Calculate performance metrics for each FI
    const fieldInterviewers = (fis || []).map((fi) => {
      // Get all spots assigned to this FI
      const fiSpots = (spots || []).filter(s => s.assigned_fi_id === fi.id);
      const assignedSpots = fiSpots.length;

      // Calculate interview statistics
      let completedInterviews = 0;
      let inProgress = 0;
      let callbacks = 0;
      let flaggedForSubstitution = 0;

      fiSpots.forEach(spot => {
        (spot.questionnaires || []).forEach((q: any) => {
          if (q.status === "Completed") {
            completedInterviews++;
          } else if (q.status === "In_Progress") {
            inProgress++;
            callbacks += q.visit_count - 1; // Subtract 1 because first visit is not a callback
          } else if (q.status === "Flagged_For_Substitution") {
            flaggedForSubstitution++;
          }
        });
      });

      // Calculate total interviews (5 per spot)
      const totalInterviews = assignedSpots * 5;
      const completionRate = totalInterviews > 0 
        ? parseFloat((completedInterviews / totalInterviews).toFixed(2))
        : 0;

      return {
        fiId: fi.id,
        name: `${fi.firstName} ${fi.lastName}`,
        email: fi.email,
        assignedSpots,
        completedInterviews,
        inProgress,
        callbacks,
        flaggedForSubstitution,
        totalInterviews,
        completionRate,
      };
    });

    // Sort by completion rate (descending)
    const validFIs = fieldInterviewers.sort((a, b) => b.completionRate - a.completionRate);

    // Format spots data for map display
    const spotsData = (spots || []).map((spot: any) => {
      const questionnaires = spot.questionnaires || [];
      const completedCount = questionnaires.filter((q: any) => q.status === "Completed").length;
      const inProgressCount = questionnaires.filter((q: any) => q.status === "In_Progress").length;
      const flaggedCount = questionnaires.filter((q: any) => q.status === "Flagged_For_Substitution").length;
      
      // Determine overall spot status based on questionnaires
      let spotStatus: "Pending" | "In_Progress" | "Completed" | "Flagged" = spot.status;
      if (flaggedCount > 0) {
        spotStatus = "Flagged";
      } else if (completedCount === 5) {
        spotStatus = "Completed";
      } else if (inProgressCount > 0 || completedCount > 0) {
        spotStatus = "In_Progress";
      }

      const barangay = Array.isArray(spot.barangay) ? spot.barangay[0] : spot.barangay;
      const assignedFi = Array.isArray(spot.assigned_fi) ? spot.assigned_fi[0] : spot.assigned_fi;

      return {
        spotId: spot.spot_id,
        spotName: spot.spot_name,
        barangayName: barangay?.barangay_name || "Unknown",
        status: spotStatus,
        startingPoint: spot.starting_point as { lat: number; lng: number },
        assignedFI: assignedFi 
          ? `${assignedFi.firstName} ${assignedFi.lastName}`
          : null,
        assignedFIId: spot.assigned_fi_id,
        completedCount,
        totalCount: 5,
        inProgressCount,
        flaggedCount,
        questionnaires: questionnaires.map((q: any) => ({
          questionnaireId: q.questionnaire_id,
          status: q.status,
          visitCount: q.visit_count,
        })),
      };
    });

    return NextResponse.json({
      cycleId,
      cycleName: cycle.name,
      spots: spotsData,
      fieldInterviewers: validFIs,
      summary: {
        totalSpots: (spots || []).length,
        assignedSpots: (spots || []).filter((s: any) => s.assigned_fi_id).length,
        unassignedSpots: (spots || []).filter((s: any) => !s.assigned_fi_id).length,
        completedSpots: spotsData.filter(s => s.status === "Completed").length,
        totalInterviews: (spots || []).length * 5,
        completedInterviews: spotsData.reduce((sum, s) => sum + s.completedCount, 0),
        totalFIs: validFIs.length,
      },
    });
  } catch (error: any) {
    return createErrorResponse(error, 'GET /api/fs/monitoring', {
      cycleId: request.url
    });
  }
}
