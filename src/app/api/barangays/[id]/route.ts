import { NextRequest, NextResponse } from "next/server";
import * as Prisma from "@prisma/client";

const prisma = new Prisma.PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const barangayId = parseInt(params.id);
    
    if (isNaN(barangayId)) {
      return NextResponse.json({ error: "Invalid barangay ID" }, { status: 400 });
    }

    const barangay = await prisma.barangay.findFirst({
      where: {
        barangay_id: barangayId,
        seal: 'yes' // Only allow access to barangays with seal
      },
      include: {
        surveyTargets: {
          select: {
            target: true,
            achieved: true,
            percentage: true,
            created_at: true
          }
        },
        survey_response: {
          where: {
            status: 'completed'
          },
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
    });

    if (!barangay) {
      return NextResponse.json({ error: "Barangay not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const surveyTarget = barangay.surveyTargets[0];
    const progress = surveyTarget?.percentage || 0;
    
    let status = "Pending";
    if (progress === 100) {
      status = "Completed";
    } else if (progress > 0) {
      status = "In Progress";
    }

    const transformedBarangay = {
      barangay_id: barangay.barangay_id,
      barangay_name: barangay.barangay_name,
      currentStatus: barangay.currentStatus || status,
      description: barangay.description,
      population: barangay.population || 0,
      households: barangay.households || 0,
      area: null, // Not in current schema
      captain: barangay.captain,
      surveyTargets: barangay.surveyTargets,
      survey_response: barangay.survey_response,
      seal: barangay.seal
    };

    return NextResponse.json(transformedBarangay);
  } catch (error: any) {
    console.error("Error fetching barangay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}