import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get users with interviewer role - this endpoint doesn't require admin auth
    // since it's needed for assignment functionality
    const interviewers = await prisma.user.findMany({
      where: {
        role: 'interviewer',
        // Only get active users
        OR: [
          { status: 'Active' },
          { status: null } // Handle cases where status might be null
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })
    
    return NextResponse.json(interviewers)
  } catch (error) {
    console.error("Error fetching interviewers:", error)
    return NextResponse.json(
      { error: "Failed to fetch interviewers" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}