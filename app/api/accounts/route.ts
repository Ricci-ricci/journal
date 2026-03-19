import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

type CreateAccountBody = {
  userId?: string;
  name?: string;
  broker?: string;
  accountType?: "LIVE" | "DEMO" | "PAPER";
  initialBalance?: number;
  currency?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAccountBody;

    if (!body.userId || !body.name || body.initialBalance === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, name, initialBalance",
        },
        { status: 400 },
      );
    }

    if (typeof body.initialBalance !== "number" || Number.isNaN(body.initialBalance)) {
      return NextResponse.json(
        {
          success: false,
          error: "initialBalance must be a valid number",
        },
        { status: 400 },
      );
    }

    const allowedAccountTypes = new Set(["LIVE", "DEMO", "PAPER"]);
    const accountType = body.accountType ?? "PAPER";

    if (!allowedAccountTypes.has(accountType)) {
      return NextResponse.json(
        {
          success: false,
          error: "accountType must be one of: LIVE, DEMO, PAPER",
        },
        { status: 400 },
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found for provided userId",
        },
        { status: 404 },
      );
    }

    const account = await prisma.tradingAccount.create({
      data: {
        userId: body.userId,
        name: body.name.trim(),
        broker: body.broker?.trim() || null,
        accountType,
        initialBalance: body.initialBalance,
        currency: body.currency?.trim().toUpperCase() || "USD",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Trading account created successfully",
        data: account,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create trading account",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    const accounts = await prisma.tradingAccount.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trading accounts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
