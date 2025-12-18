import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function PUT(request: NextRequest) {
  console.log('[API Profile] PUT request received');
  
  try {
    // Verify authentication
    const token = request.cookies.get("pulse_token")?.value;
    console.log('[API Profile] Token exists:', !!token);
    
    if (!token) {
      console.error('[API Profile] No token found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('[API Profile] Token decoded, user ID:', decoded.id);
    } catch (error) {
      console.error('[API Profile] Token verification failed:', error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    console.log('[API Profile] Request body received:', {
      firstName: body.firstName,
      lastName: body.lastName,
      profilePictureLength: body.profilePicture?.length || 0,
    });
    
    const { firstName, lastName, profilePicture } = body;

    // Validate input
    if (!firstName || !lastName) {
      console.error('[API Profile] Missing required fields');
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    console.log('[API Profile] Connecting to database...');
    const client = await pool.connect();

    try {
      console.log('[API Profile] Updating user profile for user ID:', decoded.id);
      
      // Update user profile
      const result = await client.query(
        `UPDATE "user" 
         SET "firstName" = $1, "lastName" = $2, "profilePicture" = $3
         WHERE id = $4
         RETURNING id, email, "firstName", "lastName", role, "profilePicture"`,
        [firstName, lastName, profilePicture, decoded.id]
      );

      console.log('[API Profile] Query executed, rows affected:', result.rowCount);

      if (result.rows.length === 0) {
        console.error('[API Profile] User not found for ID:', decoded.id);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = result.rows[0];
      console.log('[API Profile] Profile updated successfully for user:', user.email);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      });
    } catch (dbError) {
      console.error('[API Profile] Database error:', dbError);
      throw dbError;
    } finally {
      client.release();
      console.log('[API Profile] Database connection released');
    }
  } catch (error) {
    console.error("[API Profile] Error updating profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
