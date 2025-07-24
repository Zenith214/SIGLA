import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const assignments = await prisma.assignment.findMany();
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const assignment = await prisma.assignment.create({ data });
  return NextResponse.json(assignment);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { assignment_id, ...updateData } = data;
  const assignment = await prisma.assignment.update({
    where: { assignment_id },
    data: updateData,
  });
  return NextResponse.json(assignment);
}

export async function DELETE(req: NextRequest) {
  const { assignment_id } = await req.json();
  await prisma.assignment.delete({ where: { assignment_id } });
  return NextResponse.json({ success: true });
} 