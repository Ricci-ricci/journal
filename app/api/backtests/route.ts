import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

type CreateBacktestBody = {
  userId?: string;
  name?: string;
  platform?: string;
  symbol?: string;
  timeFrame?: string;
  month?: string; // "YYYY-MM" or ISO date
  totalPnL?: string | number;
  winRate?: string | number;
  totalTrades?: string | number;
  winningTrades?: string | number;
  losingTrades?: string | number;
  profitFactor?: string | number;
  maxDrawdown?: string | number;
  initialBalance?: string | number;
  accountSize?: string | number;
  notes?: string;
};

// Parse a possibly-empty value into a Float or null.
const toFloat = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};

const toInt = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
};

// Convert a "YYYY-MM" (or full date) string into the first day of that month.
const parseMonth = (v?: string): Date | null => {
  if (!v) return null;
  const str = /^\d{4}-\d{2}$/.test(v) ? `${v}-01` : v;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? undefined;

    const backtests = await prisma.backtest.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { periodMonth: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: backtests.length,
      data: backtests,
    });
  } catch (error) {
    console.error("GET /api/backtests failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch backtests",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBacktestBody;

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

    const periodMonth = parseMonth(body.month);
    if (!periodMonth) {
      return NextResponse.json(
        { success: false, error: "A valid month is required" },
        { status: 400 },
      );
    }

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

    const backtest = await prisma.backtest.create({
      data: {
        userId: body.userId,
        name: body.name.trim(),
        platform: body.platform?.trim() || null,
        symbol: body.symbol?.trim() || null,
        timeFrame: body.timeFrame?.trim() || null,
        periodMonth,
        totalPnL: toFloat(body.totalPnL),
        winRate: toFloat(body.winRate),
        totalTrades: toInt(body.totalTrades) ?? 0,
        winningTrades: toInt(body.winningTrades),
        losingTrades: toInt(body.losingTrades),
        profitFactor: toFloat(body.profitFactor),
        maxDrawdown: toFloat(body.maxDrawdown),
        initialBalance: toFloat(body.initialBalance),
        accountSize: toFloat(body.accountSize),
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Backtest created successfully",
        data: backtest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/backtests failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create backtest",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
