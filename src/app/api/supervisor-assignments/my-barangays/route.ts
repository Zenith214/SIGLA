import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key'

// GET: Fetch barangays assigned to the logged-in supervisor for the active cycle
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('pulse_token')?.value
    
    console.log("[my-barangays] Token exists:", !!token)
    
    if (!token) {
      console.log("[my-barangays] No token found")
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Decode JWT token
    let user: any
    try {
      user = jwt.verify(token, JWT_SECRET) as any
      console.log("[my-barangays] User:", { id: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` })
    } catch (error) {
      console.log("[my-barangays] Invalid token:", error)
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }
    
    // Verify user has FS role
    if (user.role?.toLowerCase() !== 'fs') {
      console.log("[my-barangays] User is not a supervisor, role:", user.role)
      return NextResponse.json(
        { success: false, error: "Only supervisors can access this endpoint" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cycleId = searchParams.get("cycle_id")

    console.log("[my-barangays] Cycle ID:", cycleId)

    if (!cycleId) {
      console.log("[my-barangays] No cycle_id provided")
      return NextResponse.json(
        { success: false, error: "cycle_id is required" },
        { status: 400 }
      )
    }

    // Fetch barangays assigned to this supervisor for the specified cycle
    console.log("[my-barangays] Executing query for supervisor_id:", user.id, "cycle_id:", cycleId)
    
    const barangays = await prisma.$queryRaw`
      SELECT 
        sa.id as assignment_id,
        sa.barangay_id,
        sa.status,
        b.barangay_name,
        st.target_id,
        st.target,
        st.achieved,
        st.percentage
      FROM supervisor_assignments sa
      INNER JOIN barangay b ON sa.barangay_id = b.barangay_id
      LEFT JOIN survey_target st ON sa.barangay_id = st.barangay_id AND sa.cycle_id = st.survey_cycle_id
      WHERE sa.supervisor_id = ${user.id}
        AND sa.cycle_id = ${parseInt(cycleId)}
        AND sa.status = 'Active'
      ORDER BY b.barangay_name ASC
    `
    console.log("[my-barangays] Found", Array.isArray(barangays) ? barangays.length : 0, "barangays")

    return NextResponse.json({ 
      success: true, 
      data: barangays,
      supervisor: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    })
  } catch (error: any) {
    console.error("[my-barangays] Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch assigned barangays" },
      { status: 500 }
    )
  }
}
