import { NextRequest, NextResponse } from 'next/server';
import * as Prisma from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new Prisma.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    // Generate JWT with user info including role
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
                        lastName: user.lastName,
                email: user.email,
                role: (user.role || 'viewer').toLowerCase(), // Ensure role is lowercase
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Set JWT as HttpOnly cookie
                  const response = NextResponse.json({ 
                message: 'Login successful',
                role: (user.role || 'viewer').toLowerCase()
              }, { status: 200 });
    response.cookies.set('sigla_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Login failed', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}