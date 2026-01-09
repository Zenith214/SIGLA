import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("pulse_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { currentPassword, newPassword, isFirstLogin } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Enhanced password validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }

    // Check for number
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character (!@#$%^&* etc.)" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Get current user
      const userResult = await client.query(
        'SELECT id, password FROM "user" WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = userResult.rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password and firstLogin flag if this is a first-time login
      if (isFirstLogin) {
        await client.query(
          'UPDATE "user" SET password = $1, "firstLogin" = false WHERE id = $2',
          [newPasswordHash, decoded.id]
        );
      } else {
        await client.query(
          'UPDATE "user" SET password = $1 WHERE id = $2',
          [newPasswordHash, decoded.id]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
