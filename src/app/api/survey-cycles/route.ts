import { NextRequest, NextResponse } from 'next/server';
import * as Prisma from '@prisma/client';

const prisma = new Prisma.PrismaClient();

export async function GET() {
  const cycles = await prisma.surveycycle.findMany();
  return NextResponse.json(cycles);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const cycle = await prisma.surveycycle.create({ data });
  return NextResponse.json(cycle);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { cycle_id, ...updateData } = data;
  const cycle = await prisma.surveycycle.update({
    where: { cycle_id },
    data: updateData,
  });
  return NextResponse.json(cycle);
}

export async function DELETE(req: NextRequest) {
  const { cycle_id } = await req.json();
  await prisma.surveycycle.delete({ where: { cycle_id } });
  return NextResponse.json({ success: true });
}