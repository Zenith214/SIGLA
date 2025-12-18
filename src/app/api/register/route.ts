import { NextRequest, NextResponse } from "next/server";
import * as Prisma from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new Prisma.PrismaClient();

export async function POST(req: NextRequest) {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    organization,
    jobTitle,
  } = await req.json();

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !organization ||
    !jobTitle
  ) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        organization,
        jobTitle,
        role: "officer", // Default role for new registrations
      },
    });
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Registration failed",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
