import { NextRequest, NextResponse } from 'next/server';
import * as Prisma from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new Prisma.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Helper to verify admin role
async function verifyAdminRole(request: NextRequest) {
  const token = request.cookies.get('sigla_token')?.value;
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        organization: true,
        jobTitle: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to fetch users', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await req.json();
    
    // Hash the password if provided
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }
    
    const user = await prisma.user.create({ 
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        organization: true,
        jobTitle: true,
        createdAt: true,
        lastLogin: true,
      }
    });
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}