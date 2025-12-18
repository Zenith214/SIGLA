import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getActiveCycle } from "@/utils/surveyCycleHelpers";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const { barangayId } = body;

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId is required" },
        { status: 400 }
      );
    }

    // Get active cycle
    const activeCycle = await getActiveCycle();
    if (!activeCycle) {
      return NextResponse.json(
        { error: "No active survey cycle found" },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Get current counter WITHOUT incrementing
    const result = await client.query(
      `SELECT current_number 
       FROM questionnaire_counter
       WHERE barangay_id = $1 AND cycle_id = $2`,
      [parseInt(barangayId), activeCycle.cycle_id]
    );

    // Next number will be current + 1 (or 1 if no counter exists yet)
    const nextNumber = result.rows.length > 0 
      ? result.rows[0].current_number + 1 
      : 1;

    return NextResponse.json({
      success: true,
      nextQuestionnaireNumber: nextNumber,
      type: nextNumber % 2 === 1 ? 'odd' : 'even',
      barangayId: parseInt(barangayId),
      cycleId: activeCycle.cycle_id
    });

  } catch (error) {
    console.error("Error previewing questionnaire number:", error);
    return NextResponse.json(
      { error: "Failed to preview questionnaire number" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
