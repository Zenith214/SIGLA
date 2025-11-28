import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycle } from '@/utils/surveyCycleHelpers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

/**
 * GET /api/barangays-with-assignments
 * Get barangays with spot assignments for the current interviewer
 * Used by Field Interviewer dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('pulse_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let userId: number;
    let userRole: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
      userRole = (decoded.role || '').toLowerCase();
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Get active cycle
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return NextResponse.json([]);
    }

    // Get survey targets for the active cycle (with target numbers)
    const { data: targets, error: targetsError } = await supabaseAdmin
      .from('survey_target')
      .select('barangay_id, target, achieved')
      .eq('survey_cycle_id', activeCycle.cycle_id);

    if (targetsError) {
      console.error('Error fetching survey targets:', targetsError);
      return NextResponse.json({ error: 'Failed to fetch survey targets', details: targetsError.message }, { status: 500 });
    }

    if (!targets || targets.length === 0) {
      return NextResponse.json([]);
    }

    // Create a map of barangay targets for easy lookup
    const targetMap = new Map(targets.map(t => [t.barangay_id, { target: t.target, achieved: t.achieved || 0 }]));

    // Get barangay details for the targets
    const barangayIds = targets.map(t => t.barangay_id);
    const { data: barangays, error: barangaysError } = await supabaseAdmin
      .from('barangay')
      .select('barangay_id, barangay_name')
      .in('barangay_id', barangayIds);

    if (barangaysError) {
      console.error('Error fetching barangays:', barangaysError);
      return NextResponse.json({ error: 'Failed to fetch barangays', details: barangaysError.message }, { status: 500 });
    }

    // Get spots assigned to this interviewer in the active cycle
    const { data: spots, error: spotsError } = await supabaseAdmin
      .from('spots')
      .select(`
        spot_id,
        spot_name,
        barangay_id,
        cycle_id,
        status,
        starting_point,
        assigned_fi_id,
        questionnaires (
          questionnaire_id,
          status,
          visit_count
        )
      `)
      .eq('cycle_id', activeCycle.cycle_id)
      .eq('assigned_fi_id', userId);

    if (spotsError) {
      console.error('Error fetching spots:', spotsError);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    // Initialize barangay map with all survey targets
    const barangayMap = new Map();
    
    if (barangays) {
      barangays.forEach(barangay => {
        const targetInfo = targetMap.get(barangay.barangay_id) || { target: 0, achieved: 0 };
        barangayMap.set(barangay.barangay_id, {
          id: barangay.barangay_id,
          name: barangay.barangay_name,
          spots: [],
          totalQuestionnaires: 0,
          completedQuestionnaires: 0,
          hasAssignments: false,
          surveyTarget: targetInfo.target,
          surveyAchieved: targetInfo.achieved
        });
      });
    }
    
    // Add assigned spots to their respective barangays
    if (spots && spots.length > 0) {
      spots.forEach(spot => {
        const barangayId = spot.barangay_id;

        if (!barangayMap.has(barangayId)) return;

        const questionnaires = spot.questionnaires || [];
        const completedCount = questionnaires.filter(q => q.status === 'Completed').length;

        const barangayData = barangayMap.get(barangayId);
        barangayData.hasAssignments = true;
        barangayData.spots.push({
          spotId: spot.spot_id,
          spotName: spot.spot_name,
          status: spot.status,
          startingPoint: spot.starting_point,
          totalQuestionnaires: questionnaires.length,
          completedQuestionnaires: completedCount,
          questionnaires: questionnaires.map(q => ({
            questionnaireId: q.questionnaire_id,
            status: q.status,
            visitCount: q.visit_count
          }))
        });

        barangayData.totalQuestionnaires += questionnaires.length;
        barangayData.completedQuestionnaires += completedCount;
      });
    }

    // Convert map to array and format for frontend
    const result = Array.from(barangayMap.values()).map(b => ({
      id: b.id,
      name: b.name,
      // Calculate progress based on barangay's survey target, not interviewer's assignments
      progress: b.surveyTarget > 0 
        ? Math.round((b.surveyAchieved / b.surveyTarget) * 100)
        : 0,
      status: b.hasAssignments ? 'assigned' : 'not_assigned',
      spots: b.spots,
      totalQuestionnaires: b.totalQuestionnaires,
      completedQuestionnaires: b.completedQuestionnaires,
      surveyTarget: b.surveyTarget,
      surveyAchieved: b.surveyAchieved,
      // Add assignment info if there are spots
      ...(b.hasAssignments && b.spots.length > 0 && {
        assignment: {
          assignment_id: b.spots[0].spotId,
          status: b.spots[0].status,
          progress: b.progress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          interviewer: {
            firstName: 'Current',
            lastName: 'User',
            email: userRole
          }
        }
      })
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in barangays-with-assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
