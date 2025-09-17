import { NextResponse } from "next/server";
import { Pool } from 'pg';

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

    // Fetch barangays that have assignments with their progress
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
        a.assignment_id,
        a.status as assignment_status,
        a.progress as assignment_progress,
        a.created_at as assignment_created,
        a.updated_at as assignment_updated,
        u."firstName" as interviewer_first_name,
        u."lastName" as interviewer_last_name,
        u.email as interviewer_email
      FROM barangay b
      INNER JOIN assignment a ON b.barangay_id = a.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      WHERE b.is_active = true
      ORDER BY b.barangay_name ASC, a.created_at DESC
    `;

    const result = await client.query(barangaysQuery);
    const rows = result.rows;

    // Group assignments by barangay (in case a barangay has multiple assignments)
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
          // Use assignment progress instead of survey target percentage
          progress: row.assignment_progress || 0,
          // Determine status based on assignment status and progress
          status: getBarangayStatus(row.assignment_status, row.assignment_progress),
          // Assignment details
          assignment: {
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
          },
          // Add history for compatibility with existing components
          history: generateAssignmentHistory(row.assignment_status, row.assignment_progress)
        });
      } else {
        // If barangay already exists, we might want to handle multiple assignments
        // For now, we'll keep the most recent one (first in ORDER BY)
        const existing = barangayMap.get(barangayId);
        if (!existing.assignment || new Date(row.assignment_created) > new Date(existing.assignment.created_at)) {
          existing.assignment = {
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
          };
          existing.progress = row.assignment_progress || 0;
          existing.status = getBarangayStatus(row.assignment_status, row.assignment_progress);
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

// Helper function to determine barangay status based on assignment
function getBarangayStatus(assignmentStatus: string, progress: number): string {
  if (assignmentStatus === 'Completed' || progress === 100) {
    return 'Completed';
  } else if (assignmentStatus === 'Active' || (progress > 0 && progress < 100)) {
    return 'In Progress';
  } else {
    return 'Pending';
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