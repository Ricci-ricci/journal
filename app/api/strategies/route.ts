import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

type CreateStrategyBody = {
  userId?: string;
  name?: string;
  description?: string;
  entryRules?: string;
  exitRules?: string;
  riskManagementRules?: string;
  isActive?: boolean;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? undefined;

    const strategies = await prisma.strategy.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: strategies.length,
      data: strategies,
    });
  } catch (error) {
    console.error("GET /api/strategies failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch strategies",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStrategyBody;

    if (!body.userId || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          required: ["userId", "name"],
        },
        { status: 400 },
      );
    }

    // Ensure referenced user exists
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          details: `No user found with id: ${body.userId}`,
        },
        { status: 404 },
      );
    }

    const strategy = await prisma.strategy.create({
      data: {
        userId: body.userId,
        name: body.name.trim(),
        description: body.description?.trim(),
        entryRules: body.entryRules?.trim(),
        exitRules: body.exitRules?.trim(),
        riskManagementRules: body.riskManagementRules?.trim(),
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Strategy created successfully",
        data: strategy,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/strategies failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create strategy",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
