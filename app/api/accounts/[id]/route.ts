import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const ALLOWED_ACCOUNT_TYPES = new Set(["LIVE", "DEMO", "PAPER"]);

// ─── GET /api/accounts/[id] ───────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const account = await prisma.tradingAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Trading account not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trading account",
        details: message,
      },
      { status: 500 },
    );
  }
}

// ─── PUT /api/accounts/[id] ───────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify account exists
    const existing = await prisma.tradingAccount.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Trading account not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Validate accountType if provided
    if (
      body.accountType !== undefined &&
      !ALLOWED_ACCOUNT_TYPES.has(body.accountType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "accountType must be one of: LIVE, DEMO, PAPER",
        },
        { status: 400 },
      );
    }

    // Validate initialBalance if provided
    if (
      body.initialBalance !== undefined &&
      (typeof body.initialBalance !== "number" ||
        Number.isNaN(body.initialBalance) ||
        body.initialBalance < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "initialBalance must be a valid non-negative number",
        },
        { status: 400 },
      );
    }

    // Build partial update payload — only include fields that were sent
    const data: Record<string, any> = {};

    if (body.name !== undefined) data.name = body.name.trim();
    if (body.broker !== undefined) data.broker = body.broker?.trim() || null;
    if (body.accountType !== undefined) data.accountType = body.accountType;
    if (body.initialBalance !== undefined)
      data.initialBalance = Number(body.initialBalance);
    if (body.currency !== undefined)
      data.currency = body.currency.trim().toUpperCase();

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.tradingAccount.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trading account updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update trading account",
        details: message,
      },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/accounts/[id] ────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify account exists before deleting
    const existing = await prisma.tradingAccount.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Trading account not found" },
        { status: 404 },
      );
    }

    // Delete account (trades and metrics linked to it will have their
    // accountId set to null via the onDelete: SetNull relation in the schema)
    await prisma.tradingAccount.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Trading account "${existing.name}" deleted successfully`,
      deletedId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete trading account",
        details: message,
      },
      { status: 500 },
    );
  }
}
