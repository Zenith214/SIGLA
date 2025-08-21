import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Get barangay data including survey targets and latest response
    const data = await prisma.barangay.findUnique({
      where: { 
        barangay_id: id 
      },
      include: {
        surveyTargets: {
          select: {
            target: true,
            achieved: true,
            percentage: true,
            created_at: true
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        },
        survey_response: {
          select: {
            completed_at: true,
            status: true
          },
          orderBy: {
            completed_at: 'desc'
          },
          take: 1
        }
      }
    })

    if (!data) {
      return NextResponse.json({ error: "Barangay not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching barangay:", error)
    return NextResponse.json(
      { error: "Error fetching barangay data" },
      { status: 500 }
    )
  }
}