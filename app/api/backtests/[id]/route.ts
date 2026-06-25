import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

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

const parseMonth = (v?: string): Date | null => {
  if (!v) return null;
  const str = /^\d{4}-\d{2}$/.test(v) ? `${v}-01` : v;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
};

// ─── GET /api/backtests/[id] ─────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const backtest = await prisma.backtest.findUnique({ where: { id } });

    if (!backtest) {
      return NextResponse.json(
        { success: false, error: "Backtest not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: backtest });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch backtest", details: message },
      { status: 500 },
    );
  }
}

// ─── PUT /api/backtests/[id] ─────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.backtest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Backtest not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const trimmed = body.name?.trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, error: "name cannot be empty" },
          { status: 400 },
        );
      }
      data.name = trimmed;
    }

    if (body.month !== undefined) {
      const periodMonth = parseMonth(body.month);
      if (!periodMonth) {
        return NextResponse.json(
          { success: false, error: "A valid month is required" },
          { status: 400 },
        );
      }
      data.periodMonth = periodMonth;
    }

    if (body.platform !== undefined) data.platform = body.platform?.trim() || null;
    if (body.symbol !== undefined) data.symbol = body.symbol?.trim() || null;
    if (body.timeFrame !== undefined) data.timeFrame = body.timeFrame?.trim() || null;
    if (body.totalPnL !== undefined) data.totalPnL = toFloat(body.totalPnL);
    if (body.winRate !== undefined) data.winRate = toFloat(body.winRate);
    if (body.totalTrades !== undefined) data.totalTrades = toInt(body.totalTrades) ?? 0;
    if (body.winningTrades !== undefined) data.winningTrades = toInt(body.winningTrades);
    if (body.losingTrades !== undefined) data.losingTrades = toInt(body.losingTrades);
    if (body.profitFactor !== undefined) data.profitFactor = toFloat(body.profitFactor);
    if (body.maxDrawdown !== undefined) data.maxDrawdown = toFloat(body.maxDrawdown);
    if (body.initialBalance !== undefined) data.initialBalance = toFloat(body.initialBalance);
    if (body.accountSize !== undefined) data.accountSize = toFloat(body.accountSize);
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.backtest.update({ where: { id }, data });

    return NextResponse.json({
      success: true,
      message: "Backtest updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to update backtest", details: message },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/backtests/[id] ──────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.backtest.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Backtest not found" },
        { status: 404 },
      );
    }

    await prisma.backtest.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Backtest "${existing.name}" deleted successfully`,
      deletedId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to delete backtest", details: message },
      { status: 500 },
    );
  }
}
