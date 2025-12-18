import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import {
  createErrorResponse,
  createAuthError,
  createValidationError,
  handleDatabaseError
} from '@/lib/api-error-handler';
import { calculateDisplayId } from '@/utils/displayIdCalculator';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

/**
 * GET /api/fi/assignments
 * Get all spots assigned to the logged-in Field Interviewer for active cycle
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.cookies.get('pulse_token')?.value;
    if (!token) {
      throw createAuthError('Authentication required');
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
      
      if (!userId || typeof userId !== 'number') {
        throw createAuthError('Invalid token payload');
      }
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        throw createAuthError('Invalid or expired token');
      }
      throw e;
    }

    // Get cycle_id from query params (optional)
    const { searchParams } = new URL(request.url);
    const cycleIdParam = searchParams.get('cycleId');

    let cycleId: number | null = null;

    if (cycleIdParam) {
      cycleId = parseInt(cycleIdParam);
      if (isNaN(cycleId) || cycleId <= 0) {
        throw createValidationError('cycleId must be a positive integer', 'cycleId', cycleIdParam);
      }
    } else {
      // Get active cycle if not specified
      const { data: activeCycle, error: cycleError } = await supabaseAdmin
        .from('survey_cycle')
        .select('cycle_id')
        .eq('is_active', true)
        .maybeSingle();

      if (cycleError && cycleError.code !== 'PGRST116') {
        throw handleDatabaseError(cycleError, 'fetch active cycle');
      }

      if (activeCycle) {
        cycleId = activeCycle.cycle_id;
      }
    }

    // If no cycle found, return empty assignments
    if (!cycleId) {
      return NextResponse.json({
        assignments: [],
        message: "No active cycle found"
      });
    }

    // Fetch spots assigned to this FI for the specified cycle
    const { data: spots, error: spotsError } = await supabaseAdmin
      .from('spots')
      .select(`
        spot_id,
        cycle_id,
        barangay_id,
        spot_name,
        starting_point,
        random_start,
        status,
        created_at,
        updated_at,
        barangay:barangay_id (
          barangay_id,
          barangay_name
        ),
        questionnaires (
          questionnaire_id,
          sequence_number,
          status,
          visit_count,
          visits (
            visit_id,
            visit_number,
            visit_timestamp,
            outcome,
            notes,
            location_lat,
            location_lng
          )
        )
      `)
      .eq('assigned_fi_id', userId)
      .eq('cycle_id', cycleId)
      .order('created_at', { ascending: true });

    if (spotsError) {
      throw handleDatabaseError(spotsError, 'fetch FI assignments');
    }

    // Format the response with progress information
    const assignments = (spots || []).map(spot => {
      const questionnaires = spot.questionnaires || [];
      const completedCount = questionnaires.filter(q => q.status === 'Completed').length;
      const totalCount = questionnaires.length;
      const inProgressCount = questionnaires.filter(q => q.status === 'In_Progress').length;
      const flaggedCount = questionnaires.filter(q => q.status === 'Flagged_For_Substitution').length;

      // Determine overall spot status
      let spotStatus = spot.status;
      if (completedCount === totalCount && totalCount > 0) {
        spotStatus = 'Completed';
      } else if (inProgressCount > 0 || completedCount > 0) {
        spotStatus = 'In_Progress';
      }

      const barangay = Array.isArray(spot.barangay) ? spot.barangay[0] : spot.barangay;

      return {
        spotId: spot.spot_id,
        spotName: spot.spot_name,
        barangayId: spot.barangay_id,
        barangayName: barangay?.barangay_name || null,
        cycleId: spot.cycle_id,
        startingPoint: spot.starting_point,
        randomStart: spot.random_start,
        status: spotStatus,
        completedCount,
        totalCount,
        inProgressCount,
        flaggedCount,
        createdAt: spot.created_at,
        updatedAt: spot.updated_at,
        interviews: questionnaires
          .sort((a, b) => a.sequence_number - b.sequence_number)
          .map(q => {
            // Calculate display_id for each questionnaire
            const display_id = calculateDisplayId(q.questionnaire_id);
            
            // Log warning if display_id calculation fails
            if (display_id === null) {
              console.warn(`Failed to calculate display_id for questionnaire: ${q.questionnaire_id}`);
            }
            
            return {
              questionnaireId: q.questionnaire_id,
              displayId: display_id,
              sequenceNumber: q.sequence_number,
              status: q.status,
              visitCount: q.visit_count || 0,
              visits: (q.visits || [])
                .sort((a: any, b: any) => a.visit_number - b.visit_number)
                .map((v: any) => ({
                  visitId: v.visit_id,
                  visitNumber: v.visit_number,
                  timestamp: v.visit_timestamp,
                  outcome: v.outcome,
                  notes: v.notes,
                  location: v.location_lat && v.location_lng ? {
                    lat: parseFloat(v.location_lat),
                    lng: parseFloat(v.location_lng)
                  } : null
                }))
            };
          })
      };
    });

    return NextResponse.json({
      cycleId,
      assignments,
      total: assignments.length,
      summary: {
        totalSpots: assignments.length,
        completedSpots: assignments.filter(a => a.status === 'Completed').length,
        inProgressSpots: assignments.filter(a => a.status === 'In_Progress').length,
        pendingSpots: assignments.filter(a => a.status === 'Pending').length,
        totalInterviews: assignments.reduce((sum, a) => sum + a.totalCount, 0),
        completedInterviews: assignments.reduce((sum, a) => sum + a.completedCount, 0)
      }
    });

  } catch (error: any) {
    return createErrorResponse(error, 'GET /api/fi/assignments', {
      userId: request.cookies.get('pulse_token') ? 'authenticated' : 'unauthenticated'
    });
  }
}
