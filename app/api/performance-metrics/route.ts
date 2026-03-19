import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

type CreatePerformanceMetricBody = {
  userId: string;
  accountId?: string | null;
  metricDate: string;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  dailyPnl?: number;
  cumulativePnl?: number;
  accountBalance?: number | null;
  winRate?: number | null;
  profitFactor?: number | null;
  sharpeRatio?: number | null;
  maxDrawdown?: number | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const accountId = searchParams.get("accountId");
    const limitParam = searchParams.get("limit");

    const limit = Math.min(Math.max(Number(limitParam ?? 50), 1), 200);

    const where = {
      ...(userId ? { userId } : {}),
      ...(accountId ? { accountId } : {}),
    };

    const metrics = await prisma.performanceMetric.findMany({
      where,
      orderBy: { metricDate: "desc" },
      take: Number.isNaN(limit) ? 50 : limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: metrics.length,
      data: metrics,
    });
  } catch (error) {
    console.error("Failed to fetch performance metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance metrics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePerformanceMetricBody;

    if (!body?.userId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: userId" },
        { status: 400 },
      );
    }

    if (!body?.metricDate) {
      return NextResponse.json(
        { success: false, error: "Missing required field: metricDate" },
        { status: 400 },
      );
    }

    const parsedMetricDate = new Date(body.metricDate);
    if (Number.isNaN(parsedMetricDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid metricDate. Use ISO date format." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found for the given userId" },
        { status: 404 },
      );
    }

    if (body.accountId) {
      const account = await prisma.tradingAccount.findUnique({
        where: { id: body.accountId },
        select: { id: true, userId: true },
      });

      if (!account) {
        return NextResponse.json(
          { success: false, error: "Trading account not found for accountId" },
          { status: 404 },
        );
      }

      if (account.userId !== body.userId) {
        return NextResponse.json(
          {
            success: false,
            error: "accountId does not belong to the provided userId",
          },
          { status: 400 },
        );
      }
    }

    const metric = await prisma.performanceMetric.create({
      data: {
        userId: body.userId,
        accountId: body.accountId ?? null,
        metricDate: parsedMetricDate,
        totalTrades: body.totalTrades ?? 0,
        winningTrades: body.winningTrades ?? 0,
        losingTrades: body.losingTrades ?? 0,
        dailyPnl: body.dailyPnl ?? 0,
        cumulativePnl: body.cumulativePnl ?? 0,
        accountBalance: body.accountBalance ?? null,
        winRate: body.winRate ?? null,
        profitFactor: body.profitFactor ?? null,
        sharpeRatio: body.sharpeRatio ?? null,
        maxDrawdown: body.maxDrawdown ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Performance metric created successfully",
        data: metric,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Failed to create performance metric:", error);

    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("Unique constraint failed") ||
      message.includes("duplicate key")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A metric already exists for this user/account on the same metricDate",
          details: message,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create performance metric",
        details: message,
      },
      { status: 500 },
    );
  }
}
