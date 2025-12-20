import { NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    const barangayId = parseInt(id);

    if (isNaN(barangayId)) {
      return NextResponse.json(
        { error: 'Invalid barangay ID' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Get the active survey cycle ID
    const activeCycleId = await getActiveCycleId();
    
    if (!activeCycleId) {
      return NextResponse.json([]);
    }

    // Fetch all assignments for this barangay in the active cycle
    // Get interviewers assigned to spots in this barangay with actual progress
    const query = `
      SELECT DISTINCT
        s.spot_id as assignment_id,
        s.status as spot_status,
        s.created_at,
        s.updated_at,
        u."firstName",
        u."lastName",
        u.email,
        s.spot_name,
        COUNT(DISTINCT q.questionnaire_id) as total_questionnaires,
        COUNT(DISTINCT CASE WHEN q.status = 'Completed' THEN q.questionnaire_id END) as completed_questionnaires,
        COUNT(DISTINCT sr.response_id) as submitted_responses
      FROM spots s
      INNER JOIN "user" u ON s.assigned_fi_id = u.id
      LEFT JOIN questionnaires q ON q.spot_id = s.spot_id
      LEFT JOIN survey_response sr ON sr.spot_id = s.spot_id
      WHERE s.barangay_id = $1 AND s.cycle_id = $2 AND s.assigned_fi_id IS NOT NULL
      GROUP BY s.spot_id, s.status, s.created_at, s.updated_at, u."firstName", u."lastName", u.email, s.spot_name
      ORDER BY s.created_at DESC
    `;

    const result = await client.query(query, [barangayId, activeCycleId]);

    const assignments = result.rows.map((row: any) => {
      const totalQuestionnaires = parseInt(row.total_questionnaires) || 0;
      const completedQuestionnaires = parseInt(row.completed_questionnaires) || 0;
      const submittedResponses = parseInt(row.submitted_responses) || 0;
      
      // Calculate actual status based on progress
      let actualStatus = 'Pending';
      if (totalQuestionnaires > 0 && completedQuestionnaires === totalQuestionnaires) {
        actualStatus = 'Completed';
      } else if (submittedResponses > 0 || completedQuestionnaires > 0) {
        actualStatus = 'In_Progress';
      }
      
      const progress = totalQuestionnaires > 0 
        ? Math.round((submittedResponses / totalQuestionnaires) * 100)
        : 0;
      
      return {
        assignment_id: row.assignment_id,
        status: actualStatus,
        progress: progress,
        created_at: row.created_at,
        updated_at: row.updated_at,
        spot_name: row.spot_name,
        total_questionnaires: totalQuestionnaires,
        completed_questionnaires: completedQuestionnaires,
        submitted_responses: submittedResponses,
        interviewer: {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email
        }
      };
    });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error('Error fetching barangay assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments', message: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
