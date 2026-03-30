import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// ─── GET /api/strategies/[id] ────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const strategy = await prisma.strategy.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { success: false, error: "Strategy not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: strategy });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch strategy", details: message },
      { status: 500 },
    );
  }
}

// ─── PUT /api/strategies/[id] ────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.strategy.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Strategy not found" },
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

    if (body.description !== undefined)
      data.description = body.description?.trim() || null;
    if (body.entryRules !== undefined)
      data.entryRules = body.entryRules?.trim() || null;
    if (body.exitRules !== undefined)
      data.exitRules = body.exitRules?.trim() || null;
    if (body.riskManagementRules !== undefined)
      data.riskManagementRules = body.riskManagementRules?.trim() || null;
    if (body.isActive !== undefined)
      data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.strategy.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Strategy updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to update strategy", details: message },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/strategies/[id] ─────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.strategy.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Strategy not found" },
        { status: 404 },
      );
    }

    await prisma.strategy.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Strategy "${existing.name}" deleted successfully`,
      deletedId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete strategy",
        details: message,
      },
      { status: 500 },
    );
  }
}
