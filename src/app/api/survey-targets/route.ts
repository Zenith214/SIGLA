import { NextRequest, NextResponse } from 'next/server';
import * as Prisma from '@prisma/client';

const prisma = new Prisma.PrismaClient();

export async function GET() {
  try {
    const targets = await prisma.SurveyTarget.findMany();
    return NextResponse.json(targets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const target = await prisma.SurveyTarget.create({ data });
    return NextResponse.json(target);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { target_id, ...updateData } = data;
    const target = await prisma.SurveyTarget.update({
      where: { target_id },
      data: updateData,
    });
    return NextResponse.json(target);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { target_id } = await req.json();
    await prisma.SurveyTarget.delete({ where: { target_id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}