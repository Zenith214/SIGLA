import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cycles = await prisma.survey_cycle.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return NextResponse.json(cycles)
  } catch (error) {
    console.error("Error fetching survey cycles:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey cycles" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, status, start_date, end_date, responses } = body

    const cycle = await prisma.survey_cycle.create({
      data: {
        year,
        status,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        responses: responses || 0
      }
    });

    if (!cycle) {
      throw new Error('Failed to create survey cycle');
    }

    return NextResponse.json(cycle)
  } catch (error) {
    console.error("Error creating survey cycle:", error)
    return NextResponse.json(
      { error: "Failed to create survey cycle" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cycle_id, year, status, start_date, end_date, responses } = body

    const updateData: any = {};
    if (year !== undefined) updateData.year = year;
    if (status !== undefined) updateData.status = status;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (responses !== undefined) updateData.responses = responses;
    updateData.updated_at = new Date();
    
    const cycle = await prisma.survey_cycle.update({
      where: {
        cycle_id: cycle_id
      },
      data: updateData
    });

    if (!cycle) {
      throw new Error('Failed to update survey cycle');
    }

    return NextResponse.json(cycle)
  } catch (error) {
    console.error("Error updating survey cycle:", error)
    return NextResponse.json(
      { error: "Failed to update survey cycle" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { cycle_id } = body

    await prisma.survey_cycle.delete({
      where: {
        cycle_id: cycle_id
      }
    });



    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting survey cycle:", error)
    return NextResponse.json(
      { error: "Failed to delete survey cycle" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect();
  }
}