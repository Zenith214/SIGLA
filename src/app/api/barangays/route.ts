import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch barangays with seals (awardees) for dashboard display
    const barangays = await prisma.barangay.findMany({
      where: {
        is_active: true,
        seal: 'yes' // Only show awardees on dashboard
      },
      include: {
        surveyTargets: true
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedBarangays = barangays.map(barangay => {
      const surveyTarget = barangay.surveyTargets?.[0];
      const progress = surveyTarget?.percentage || 0;
      
      let status = "Pending";
      if (progress === 100) {
        status = "Completed";
      } else if (progress > 0) {
        status = "In Progress";
      }

      return {
        id: barangay.barangay_id, // Transform barangay_id to id
        barangay_id: barangay.barangay_id, // Keep original for updates
        name: barangay.barangay_name, // Transform barangay_name to name
        progress: progress,
        status: status,
        population: barangay.population || 0,
        households: barangay.households || 0,
        captain: barangay.captain,
        description: barangay.description,
        currentStatus: barangay.currentStatus || status,
        seal: barangay.seal,
        history: [] // Add empty history for now
      };
    });

    return NextResponse.json(transformedBarangays);
  } catch (error: any) {
    console.error('Error fetching barangays:', error);
    return NextResponse.json(
      { message: 'Failed to fetch barangays', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}