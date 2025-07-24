import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const barangays = await prisma.barangay.findMany();
  return NextResponse.json(barangays);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const barangay = await prisma.barangay.create({ data });
  return NextResponse.json(barangay);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { barangay_id, ...updateData } = data;
  const barangay = await prisma.barangay.update({
    where: { barangay_id },
    data: updateData,
  });
  return NextResponse.json(barangay);
}

export async function DELETE(req: NextRequest) {
  const { barangay_id } = await req.json();
  await prisma.barangay.delete({ where: { barangay_id } });
  return NextResponse.json({ success: true });
} 