import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { AssetType, TradeDirection, TradeStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type CreateTradeBody = {
  userId?: string;
  accountId?: string | null;
  strategyId?: string | null;
  symbol?: string;
  assetType?: AssetType | null;
  direction?: TradeDirection;
  status?: TradeStatus;
  entryDate?: string;
  entryPrice?: number;
  quantity?: number;
  exitDate?: string | null;
  exitPrice?: number | null;
  commission?: number;
  fees?: number;
  profitLoss?: number | null;
  profitLossPercent?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  riskRewardRatio?: number | null;
  setupType?: string | null;
  timeFrame?: string | null;
  notes?: string | null;
  tags?: string[];
  chartImageUrl?: string | null;
  confidenceLevel?: number | null;
  emotionalState?: string | null;
};

function isValidEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: unknown,
): value is T[keyof T] {
  return typeof value === "string" && Object.values(enumObj).includes(value);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const accountId = url.searchParams.get("accountId");
    const status = url.searchParams.get("status");
    const symbol = url.searchParams.get("symbol");
    const limitParam = url.searchParams.get("limit");

    const limit = Math.min(Math.max(Number(limitParam || 50), 1), 200);

    const trades = await prisma.trade.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(accountId ? { accountId } : {}),
        ...(symbol ? { symbol } : {}),
        ...(status && isValidEnumValue(TradeStatus, status)
          ? { status }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        strategy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trades",
        details: message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateTradeBody;

    if (!body.userId || !body.symbol || !body.direction) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, symbol, direction",
        },
        { status: 400 },
      );
    }

    if (!isValidEnumValue(TradeDirection, body.direction)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid direction. Allowed: ${Object.values(TradeDirection).join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (body.status && !isValidEnumValue(TradeStatus, body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Allowed: ${Object.values(TradeStatus).join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (body.assetType && !isValidEnumValue(AssetType, body.assetType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid assetType. Allowed: ${Object.values(AssetType).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const entryDate = body.entryDate ? new Date(body.entryDate) : new Date();
    if (Number.isNaN(entryDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid entryDate format" },
        { status: 400 },
      );
    }

    let exitDate: Date | null = null;
    if (body.exitDate) {
      const parsedExitDate = new Date(body.exitDate);
      if (Number.isNaN(parsedExitDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid exitDate format" },
          { status: 400 },
        );
      }
      exitDate = parsedExitDate;
    }

    const created = await prisma.trade.create({
      data: {
        userId: body.userId,
        accountId: body.accountId ?? null,
        strategyId: body.strategyId ?? null,
        symbol: body.symbol.trim(),
        assetType: body.assetType ?? null,
        direction: body.direction,
        status: body.status ?? TradeStatus.OPEN,
        entryDate,
        entryPrice: Number(body.entryPrice ?? 0),
        quantity: Number(body.quantity ?? 0),
        exitDate,
        exitPrice:
          body.exitPrice === undefined ? null : Number(body.exitPrice ?? 0),
        commission: Number(body.commission ?? 0),
        fees: Number(body.fees ?? 0),
        profitLoss:
          body.profitLoss === undefined ? null : Number(body.profitLoss ?? 0),
        profitLossPercent:
          body.profitLossPercent === undefined
            ? null
            : Number(body.profitLossPercent ?? 0),
        stopLoss:
          body.stopLoss === undefined ? null : Number(body.stopLoss ?? 0),
        takeProfit:
          body.takeProfit === undefined ? null : Number(body.takeProfit ?? 0),
        riskRewardRatio:
          body.riskRewardRatio === undefined
            ? null
            : Number(body.riskRewardRatio ?? 0),
        setupType: body.setupType ?? null,
        timeFrame: body.timeFrame ?? null,
        notes: body.notes ?? null,
        tags: body.tags ?? [],
        chartImageUrl: body.chartImageUrl ?? null,
        confidenceLevel:
          body.confidenceLevel === undefined ? null : body.confidenceLevel,
        emotionalState: body.emotionalState ?? null,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        strategy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Trade created successfully",
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create trade",
        details: message,
      },
      { status: 500 },
    );
  }
}
