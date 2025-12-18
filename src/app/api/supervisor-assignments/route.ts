import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET: Fetch all supervisor assignments or filter by cycle/supervisor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cycleId = searchParams.get("cycle_id")
    const supervisorId = searchParams.get("supervisor_id")

    let query = `
      SELECT 
        sa.id,
        sa.supervisor_id,
        sa.barangay_id,
        sa.cycle_id,
        sa.status,
        sa.assigned_at,
        sa.updated_at,
        u.id as "user_id",
        u."firstName" as "supervisor_first_name",
        u."lastName" as "supervisor_last_name",
        u.email as "supervisor_email",
        b.barangay_id,
        b.barangay_name,
        sc.cycle_id,
        sc.name as "cycle_name",
        sc.year as "cycle_year"
      FROM supervisor_assignments sa
      INNER JOIN "user" u ON sa.supervisor_id = u.id
      INNER JOIN barangay b ON sa.barangay_id = b.barangay_id
      INNER JOIN survey_cycle sc ON sa.cycle_id = sc.cycle_id
    `

    const conditions = []
    if (cycleId) conditions.push(`sa.cycle_id = ${parseInt(cycleId)}`)
    if (supervisorId) conditions.push(`sa.supervisor_id = ${parseInt(supervisorId)}`)
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY sa.assigned_at DESC`

    const assignments = await prisma.$queryRawUnsafe(query)

    return NextResponse.json({ success: true, data: assignments })
  } catch (error: any) {
    console.error("Error fetching supervisor assignments:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch supervisor assignments" },
      { status: 500 }
    )
  }
}

// POST: Create new supervisor assignment(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supervisor_id, barangay_ids, cycle_id, status = "Active" } = body

    if (!supervisor_id || !barangay_ids || !Array.isArray(barangay_ids) || barangay_ids.length === 0 || !cycle_id) {
      return NextResponse.json(
        { success: false, error: "supervisor_id, barangay_ids (array), and cycle_id are required" },
        { status: 400 }
      )
    }

    // Verify supervisor has 'fs' role
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisor_id },
      select: { role: true, firstName: true, lastName: true }
    })

    if (!supervisor || supervisor.role?.toLowerCase() !== "fs") {
      return NextResponse.json(
        { success: false, error: "User must have 'fs' (supervisor) role" },
        { status: 400 }
      )
    }

    // Create assignments for each barangay
    const assignments = await Promise.all(
      barangay_ids.map(async (barangay_id: number) => {
        return prisma.$executeRawUnsafe(`
          INSERT INTO supervisor_assignments (supervisor_id, barangay_id, cycle_id, status)
          VALUES (${supervisor_id}, ${barangay_id}, ${cycle_id}, '${status}')
          ON CONFLICT (supervisor_id, barangay_id, cycle_id) 
          DO UPDATE SET status = '${status}', updated_at = CURRENT_TIMESTAMP
        `)
      })
    )

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${barangay_ids.length} barangay(s) to ${supervisor.firstName} ${supervisor.lastName}`,
      count: assignments.length
    })
  } catch (error: any) {
    console.error("Error creating supervisor assignment:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create supervisor assignment" },
      { status: 500 }
    )
  }
}

// PUT: Update supervisor assignment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, cycle_id, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Assignment id is required" },
        { status: 400 }
      )
    }

    if (!cycle_id && !status) {
      return NextResponse.json(
        { success: false, error: "At least one field (cycle_id or status) must be provided" },
        { status: 400 }
      )
    }

    // Build update query dynamically
    const updates = []
    if (cycle_id) updates.push(`cycle_id = ${parseInt(cycle_id)}`)
    if (status) updates.push(`status = '${status}'`)
    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    await prisma.$executeRawUnsafe(`
      UPDATE supervisor_assignments 
      SET ${updates.join(', ')}
      WHERE id = ${id}
    `)

    return NextResponse.json({
      success: true,
      message: "Supervisor assignment updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating supervisor assignment:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update supervisor assignment" },
      { status: 500 }
    )
  }
}

// DELETE: Remove supervisor assignment
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Assignment id is required" },
        { status: 400 }
      )
    }

    await prisma.$executeRawUnsafe(`
      DELETE FROM supervisor_assignments WHERE id = ${id}
    `)

    return NextResponse.json({
      success: true,
      message: "Supervisor assignment deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting supervisor assignment:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete supervisor assignment" },
      { status: 500 }
    )
  }
}
