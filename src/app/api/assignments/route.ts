import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        barangay: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barangay_id, user_id, status, progress } = body

    const assignment = await prisma.assignment.create({
      data: {
        barangay_id: parseInt(barangay_id),
        user_id: parseInt(user_id),
        status: status || 'Pending',
        progress: parseInt(progress) || 0
      },
      include: {
        barangay: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!assignment) {
      throw new Error('Failed to create assignment');
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignment_id, barangay_id, user_id, status, progress } = body

    const assignment = await prisma.assignment.update({
      where: {
        assignment_id: assignment_id
      },
      data: {
        barangay_id: parseInt(barangay_id),
        user_id: parseInt(user_id),
        status,
        progress: parseInt(progress) || 0,
        updated_at: new Date()
      },
      include: {
        barangay: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!assignment) {
      throw new Error('Failed to update assignment');
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignment_id } = body

    await prisma.assignment.delete({
      where: {
        assignment_id: assignment_id
      }
    });



    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}