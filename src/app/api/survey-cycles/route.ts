import { NextRequest, NextResponse } from 'next/server';
import * as Prisma from '@prisma/client';

const prisma = new Prisma.PrismaClient();

export async function GET() {
  try {
    const cycles = await prisma.survey_cycle.findMany();
    return NextResponse.json(cycles);
  } catch (error) {
    console.error('Error fetching survey cycles:', error);
    return NextResponse.json({ error: 'Failed to fetch survey cycles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const cycle = await prisma.survey_cycle.create({ data });
    return NextResponse.json(cycle);
  } catch (error) {
    console.error('Error creating survey cycle:', error);
    return NextResponse.json({ error: 'Failed to create survey cycle' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { cycle_id, ...updateData } = data;
    const cycle = await prisma.survey_cycle.update({
      where: { cycle_id },
      data: updateData,
    });
    return NextResponse.json(cycle);
  } catch (error) {
    console.error('Error updating survey cycle:', error);
    return NextResponse.json({ error: 'Failed to update survey cycle' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { cycle_id } = await req.json();
    await prisma.survey_cycle.delete({ where: { cycle_id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting survey cycle:', error);
    return NextResponse.json({ error: 'Failed to delete survey cycle' }, { status: 500 });
  }
}
