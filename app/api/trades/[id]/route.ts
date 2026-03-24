import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { AssetType, TradeDirection, TradeStatus } from "@prisma/client";

// ─── GET /api/trades/[id] ────────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        account: {
          select: { id: true, name: true, currency: true },
        },
        strategy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trade", details: message },
      { status: 500 },
    );
  }
}

// ─── PUT /api/trades/[id] ────────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check trade exists first
    const existing = await prisma.trade.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Validate enums if provided
    if (
      body.direction &&
      !Object.values(TradeDirection).includes(body.direction)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid direction. Allowed: ${Object.values(TradeDirection).join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (body.status && !Object.values(TradeStatus).includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Allowed: ${Object.values(TradeStatus).join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (body.assetType && !Object.values(AssetType).includes(body.assetType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid assetType. Allowed: ${Object.values(AssetType).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Build update payload — only include fields that were sent
    const data: Record<string, any> = {};

    if (body.symbol !== undefined) data.symbol = body.symbol.trim();
    if (body.assetType !== undefined) data.assetType = body.assetType ?? null;
    if (body.direction !== undefined) data.direction = body.direction;
    if (body.status !== undefined) data.status = body.status;
    if (body.accountId !== undefined) data.accountId = body.accountId ?? null;
    if (body.strategyId !== undefined)
      data.strategyId = body.strategyId ?? null;
    if (body.entryDate !== undefined) data.entryDate = new Date(body.entryDate);
    if (body.entryPrice !== undefined)
      data.entryPrice = Number(body.entryPrice);
    if (body.quantity !== undefined) data.quantity = Number(body.quantity);
    if (body.exitDate !== undefined)
      data.exitDate = body.exitDate ? new Date(body.exitDate) : null;
    if (body.exitPrice !== undefined)
      data.exitPrice = body.exitPrice !== null ? Number(body.exitPrice) : null;
    if (body.commission !== undefined)
      data.commission = Number(body.commission);
    if (body.fees !== undefined) data.fees = Number(body.fees);
    if (body.profitLoss !== undefined)
      data.profitLoss =
        body.profitLoss !== null ? Number(body.profitLoss) : null;
    if (body.profitLossPercent !== undefined)
      data.profitLossPercent =
        body.profitLossPercent !== null ? Number(body.profitLossPercent) : null;
    if (body.stopLoss !== undefined)
      data.stopLoss = body.stopLoss !== null ? Number(body.stopLoss) : null;
    if (body.takeProfit !== undefined)
      data.takeProfit =
        body.takeProfit !== null ? Number(body.takeProfit) : null;
    if (body.riskRewardRatio !== undefined)
      data.riskRewardRatio =
        body.riskRewardRatio !== null ? Number(body.riskRewardRatio) : null;
    if (body.setupType !== undefined) data.setupType = body.setupType ?? null;
    if (body.timeFrame !== undefined) data.timeFrame = body.timeFrame ?? null;
    if (body.notes !== undefined) data.notes = body.notes ?? null;
    if (body.tags !== undefined)
      data.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.chartImageUrl !== undefined)
      data.chartImageUrl = body.chartImageUrl ?? null;
    if (body.confidenceLevel !== undefined)
      data.confidenceLevel =
        body.confidenceLevel !== null ? Number(body.confidenceLevel) : null;
    if (body.emotionalState !== undefined)
      data.emotionalState = body.emotionalState ?? null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.trade.update({
      where: { id },
      data,
      include: {
        account: { select: { id: true, name: true, currency: true } },
        strategy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trade updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to update trade", details: message },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/trades/[id] ─────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.trade.findUnique({
      where: { id },
      select: { id: true, symbol: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 },
      );
    }

    await prisma.trade.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Trade ${existing.symbol} deleted successfully`,
      deletedId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to delete trade", details: message },
      { status: 500 },
    );
  }
}
