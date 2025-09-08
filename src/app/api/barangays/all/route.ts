import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch ALL barangays using Prisma
    const barangays = await prisma.barangay.findMany({
      where: {
        is_active: true
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
    console.error('Error fetching all barangays:', error);
    return NextResponse.json(
      { message: 'Failed to fetch barangays', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { barangayId, ...updates } = body;

    console.log('Received update request:', { barangayId, updates });

    if (!barangayId) {
      return NextResponse.json(
        { message: 'Barangay ID is required' },
        { status: 400 }
      );
    }

    // Map frontend field names to database field names
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.barangay_name = updates.name;
    if (updates.seal !== undefined) updateData.seal = updates.seal;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.population !== undefined) updateData.population = updates.population;
    if (updates.households !== undefined) updateData.households = updates.households;
    if (updates.captain !== undefined) updateData.captain = updates.captain;
    if (updates.currentStatus !== undefined) updateData.currentStatus = updates.currentStatus;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

    console.log('Mapped update data:', updateData);

    const updatedBarangay = await prisma.barangay.update({
      where: {
        barangay_id: parseInt(barangayId)
      },
      data: updateData
    });

    if (!updatedBarangay) {
      throw new Error('Failed to update barangay');
    }

    // Transform response to match frontend expectations
    const transformedResponse = {
      id: updatedBarangay.barangay_id,
      barangay_id: updatedBarangay.barangay_id,
      name: updatedBarangay.barangay_name,
      seal: updatedBarangay.seal,
      description: updatedBarangay.description,
      population: updatedBarangay.population,
      households: updatedBarangay.households,
      captain: updatedBarangay.captain,
      currentStatus: updatedBarangay.currentStatus,
      is_active: updatedBarangay.is_active
    };

    console.log('Update successful:', transformedResponse);
    return NextResponse.json(transformedResponse);
  } catch (error: any) {
    console.error('Error updating barangay:', error);
    return NextResponse.json(
      { message: 'Failed to update barangay', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}