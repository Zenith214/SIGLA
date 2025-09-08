import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const barangayId = parseInt(id);
    
    if (isNaN(barangayId)) {
      return NextResponse.json({ error: "Invalid barangay ID" }, { status: 400 });
    }

    const barangay = await prisma.barangay.findUnique({
      where: {
        barangay_id: barangayId,
        seal: 'yes' // Only allow access to barangays with seal
      },
      include: {
        surveyTargets: true
      }
    });

    if (!barangay) {
      return NextResponse.json({ error: "Barangay not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const surveyTarget = barangay.surveyTargets?.[0];
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
      surveyTargets: barangay.surveyTargets || [],
      survey_response: [], // Would need separate query for responses
      seal: barangay.seal
    };

    return NextResponse.json(transformedBarangay);
  } catch (error: any) {
    console.error("Error fetching barangay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}