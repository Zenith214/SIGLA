import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json(
        { error: "Barangay name is required" },
        { status: 400 }
      )
    }

    // Search for barangay by name (exact match, case-insensitive)
    const barangay = await prisma.barangay.findFirst({
      where: {
        barangay_name: name,
        is_active: true
      }
    })

    if (!barangay) {
      return NextResponse.json(
        { error: "Barangay not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(barangay)
  } catch (error) {
    console.error("Error fetching barangay by name:", error)
    return NextResponse.json(
      { error: "Failed to fetch barangay" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}