import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const backups = await prisma.backup.findMany();
  return NextResponse.json(backups);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const backup = await prisma.backup.create({ data });
  return NextResponse.json(backup);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { backup_id, ...updateData } = data;
  const backup = await prisma.backup.update({
    where: { backup_id },
    data: updateData,
  });
  return NextResponse.json(backup);
}

export async function DELETE(req: NextRequest) {
  const { backup_id } = await req.json();
  await prisma.backup.delete({ where: { backup_id } });
  return NextResponse.json({ success: true });
} 