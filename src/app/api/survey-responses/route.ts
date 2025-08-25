import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      surveyNumber,
      location,
      selectedMember,
      interviewerId,
      barangayId,
      financialAdmin,
      disasterPrep,
      safetyPeace,
      businessFriendly,
      environmental,
      socialProtection
    } = body

    // Validate required fields
    if (!surveyNumber || !location || !interviewerId || !barangayId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the survey response record
    const surveyResponse = await prisma.survey_response.create({
      data: {
        survey_number: surveyNumber,
        barangay_id: parseInt(barangayId),
        interviewer_id: parseInt(interviewerId),
        respondent_name: selectedMember,
        location_lat: parseFloat(location.lat),
        location_lng: parseFloat(location.lng),
        location_address: location.address,
        location_accuracy: location.accuracy ? parseFloat(location.accuracy) : null,
        location_timestamp: location.timestamp ? new Date(location.timestamp) : null,
        location_barangay: location.barangay,
        location_municipality: location.municipality,
        location_province: location.province,
        status: 'completed',
        progress: 100,
        completed_at: new Date(),
        submitted_at: new Date()
      }
    })

    // Create survey sections with their data
    const sections = [
      { key: 'financial', name: 'Financial Administration', data: financialAdmin },
      { key: 'disaster', name: 'Disaster Preparedness', data: disasterPrep },
      { key: 'safety', name: 'Safety & Peace Order', data: safetyPeace },
      { key: 'business', name: 'Business Friendliness', data: businessFriendly },
      { key: 'environmental', name: 'Environmental Management', data: environmental },
      { key: 'social', name: 'Social Protection', data: socialProtection }
    ]

    // Save each section
    for (const section of sections) {
      await prisma.survey_section.create({
        data: {
          response_id: surveyResponse.response_id,
          section_name: section.name,
          section_key: section.key,
          status: 'completed',
          data: JSON.stringify(section.data),
          started_at: new Date(),
          completed_at: new Date()
        }
      })
    }

    // Update survey target progress for the barangay
    const surveyTarget = await prisma.surveyTarget.findFirst({
      where: { barangay_id: parseInt(barangayId) }
    })

    if (surveyTarget) {
      const newAchieved = (surveyTarget.achieved || 0) + 1
      const newPercentage = Math.round((newAchieved / surveyTarget.target) * 100)
      
      await prisma.surveyTarget.update({
        where: { target_id: surveyTarget.target_id },
        data: {
          achieved: newAchieved,
          percentage: newPercentage,
          updated_at: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      responseId: surveyResponse.response_id,
      message: "Survey submitted successfully"
    })

  } catch (error) {
    console.error("Error saving survey response:", error)
    return NextResponse.json(
      { error: "Failed to save survey response" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barangayId = searchParams.get('barangayId')
    const interviewerId = searchParams.get('interviewerId')

    let whereClause: any = {}
    
    if (barangayId) {
      whereClause.barangay_id = parseInt(barangayId)
    }
    
    if (interviewerId) {
      whereClause.interviewer_id = parseInt(interviewerId)
    }

    const responses = await prisma.survey_response.findMany({
      where: whereClause,
      include: {
        barangay: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        survey_section: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(responses)

  } catch (error) {
    console.error("Error fetching survey responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey responses" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}