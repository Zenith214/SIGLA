import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest) {
  const token = req.cookies.get("pulse_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let client;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    client = await pool.connect();

    // Get user's barangay assignment
    const assignmentResult = await client.query(
      `SELECT barangay_id FROM assignment WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (assignmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No barangay assignment found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      barangay_id: assignmentResult.rows[0].barangay_id,
    });
  } catch (error) {
    console.error("Error fetching user barangay:", error);
    return NextResponse.json(
      { error: "Failed to fetch barangay assignment" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
