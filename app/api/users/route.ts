import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CreateUserBody = {
  email?: string;
  name?: string;
  password?: string;
};

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("GET /api/users failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateUserBody;

    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, password",
        },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const name = body.name?.trim() || null;
    const password = body.password;

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/users failed:", error);

    const message = error instanceof Error ? error.message : String(error);
    const isUniqueConflict =
      message.includes("Unique constraint failed") ||
      message.includes("duplicate key") ||
      message.includes("P2002");

    if (isUniqueConflict) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email or password already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: message,
      },
      { status: 500 },
    );
  }
}
