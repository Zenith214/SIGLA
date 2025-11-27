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
    await client.query("BEGIN");

    // Initialize counter for this barangay and cycle if it doesn't exist
    await client.query(
      `INSERT INTO questionnaire_counter (barangay_id, cycle_id, current_number, updated_at)
       VALUES ($1, $2, 0, NOW())
       ON CONFLICT (barangay_id, cycle_id) DO NOTHING`,
      [parseInt(barangayId), activeCycle.cycle_id]
    );

    // Atomically increment and get the next number for this barangay in this cycle
    const result = await client.query(
      `UPDATE questionnaire_counter
       SET current_number = current_number + 1, updated_at = NOW()
       WHERE barangay_id = $1 AND cycle_id = $2
       RETURNING current_number`,
      [parseInt(barangayId), activeCycle.cycle_id]
    );

    await client.query("COMMIT");

    const questionnaireNumber = result.rows[0].current_number;
    
    // Generate full survey number in format YYYY-BB-SS-QQQ
    // For on-the-fly generation (not tied to spots), use spot number 00
    const yearPart = activeCycle.year;
    const barangayPart = String(barangayId);
    const spotPart = '00'; // Special spot number for non-spot questionnaires
    const questionnairePart = String(questionnaireNumber).padStart(3, '0');
    const fullSurveyNumber = `${yearPart}-${barangayPart}-${spotPart}-${questionnairePart}`;

    // Note: We no longer return 'type' field (odd/even)
    // Gender requirements are now calculated dynamically based on questionnaire number parity
    return NextResponse.json({
      success: true,
      questionnaireNumber: questionnaireNumber,
      surveyNumber: fullSurveyNumber,
      barangayId: parseInt(barangayId),
      cycleId: activeCycle.cycle_id,
      cycleName: activeCycle.name
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate number" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
