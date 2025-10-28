import { NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

export async function GET() {
  let client;
  try {
    client = await pool.connect();

    // Get the active survey cycle ID
    const activeCycleId = await getActiveCycleId();
    
    if (!activeCycleId) {
      // If no active cycle, return empty array with zero progress
      return NextResponse.json([]);
    }

    // Fetch barangays that have survey targets with their progress calculated from survey data
    // Show barangays as soon as they have survey targets, assignments are optional
    const barangaysQuery = `
      SELECT
        b.barangay_id,
        b.barangay_name,
        b.population,
        b.households,
        b.captain,
        b.description,
        b."currentStatus",
        b.seal,
        b.logo_url,
        a.assignment_id,
        a.status as assignment_status,
        a.progress as assignment_progress,
        a.created_at as assignment_created,
        a.updated_at as assignment_updated,
        u."firstName" as interviewer_first_name,
        u."lastName" as interviewer_last_name,
        u.email as interviewer_email,
        st.target as survey_target,
        COALESCE(sr_counts.completed_surveys, 0) as completed_surveys,
        CASE
          WHEN st.target > 0 THEN LEAST(100, ROUND((COALESCE(sr_counts.completed_surveys, 0)::decimal / st.target) * 100, 0))
          ELSE 0
        END as calculated_progress
      FROM barangay b
      INNER JOIN survey_target st ON b.barangay_id = st.barangay_id AND st.survey_cycle_id = $1
      LEFT JOIN assignment a ON b.barangay_id = a.barangay_id AND a.survey_cycle_id = $1
      LEFT JOIN "user" u ON a.user_id = u.id
      LEFT JOIN (
        SELECT barangay_id, COUNT(*) as completed_surveys
        FROM survey_response
        WHERE status IN ('completed', 'submitted') AND survey_cycle_id = $1
        GROUP BY barangay_id
      ) sr_counts ON b.barangay_id = sr_counts.barangay_id
      WHERE b.is_active = true
      ORDER BY b.barangay_name ASC, a.created_at DESC
    `;

    const result = await client.query(barangaysQuery, [activeCycleId]);
    const rows = result.rows;

    // Group assignments by barangay (support multiple assignments per barangay)
    const barangayMap = new Map();
    
    rows.forEach((row: any) => {
      const barangayId = row.barangay_id;
      
      if (!barangayMap.has(barangayId)) {
        // Create new barangay entry
        barangayMap.set(barangayId, {
          id: row.barangay_id,
          barangay_id: row.barangay_id,
          name: row.barangay_name,
          population: row.population || 0,
          households: row.households || 0,
          captain: row.captain,
          description: row.description,
          currentStatus: row.currentStatus,
          seal: row.seal,
          logo_url: row.logo_url,
          // Use calculated progress from actual survey completion
          progress: row.calculated_progress || 0,
          // Determine status based on assignment status and calculated progress
          status: getBarangayStatus(row.assignment_status, row.calculated_progress),
          // Store ALL assignments as an array
          assignments: row.assignment_id ? [{
            assignment_id: row.assignment_id,
            status: row.assignment_status,
            progress: row.assignment_progress || 0,
            created_at: row.assignment_created,
            updated_at: row.assignment_updated,
            interviewer: {
              firstName: row.interviewer_first_name,
              lastName: row.interviewer_last_name,
              email: row.interviewer_email
            }
          }] : [],
          // Keep first assignment for backward compatibility
          assignment: row.assignment_id ? {
            assignment_id: row.assignment_id,
            status: row.assignment_status,
            progress: row.assignment_progress || 0,
            created_at: row.assignment_created,
            updated_at: row.assignment_updated,
            interviewer: {
              firstName: row.interviewer_first_name,
              lastName: row.interviewer_last_name,
              email: row.interviewer_email
            }
          } : null,
          // Add history for compatibility with existing components
          history: generateAssignmentHistory(row.assignment_status, row.calculated_progress)
        });
      } else {
        // If barangay already exists, add this assignment to the array
        const existing = barangayMap.get(barangayId);
        if (row.assignment_id) {
          existing.assignments.push({
            assignment_id: row.assignment_id,
            status: row.assignment_status,
            progress: row.assignment_progress || 0,
            created_at: row.assignment_created,
            updated_at: row.assignment_updated,
            interviewer: {
              firstName: row.interviewer_first_name,
              lastName: row.interviewer_last_name,
              email: row.interviewer_email
            }
          });
        }
      }
    });

    const barangays = Array.from(barangayMap.values());

    return NextResponse.json(barangays);
  } catch (error: any) {
    console.error('Error fetching barangays with assignments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch barangays with assignments', error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Helper function to determine barangay status based on assignment and actual survey progress
function getBarangayStatus(assignmentStatus: string | null, calculatedProgress: number): string {
  if (calculatedProgress >= 100) {
    return 'Completed';
  } else if (calculatedProgress > 0) {
    return 'In Progress';
  } else if (assignmentStatus === 'In Progress') {
    return 'In Progress';
  } else if (assignmentStatus === 'Completed') {
    return 'Completed';
  } else if (assignmentStatus === 'Assigned') {
    return 'Assigned';
  } else {
    // No assignment yet
    return 'No Assignment';
  }
}

// Helper function to generate assignment history for compatibility
function generateAssignmentHistory(status: string, progress: number) {
  const currentYear = new Date().getFullYear().toString();
  return [
    { 
      year: currentYear, 
      status: getBarangayStatus(status, progress), 
      score: `${progress}%` 
    },
    // Add some mock historical data for display purposes
    { year: "2023", status: "Completed", score: "75%" },
    { year: "2022", status: "Completed", score: "70%" },
    { year: "2021", status: "Completed", score: "65%" },
  ];
}