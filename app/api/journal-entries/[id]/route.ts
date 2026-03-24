import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { JournalEntryType } from "@prisma/client";

// GET /api/journal-entries/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const entry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch journal entry",
        details: message,
      },
      { status: 500 },
    );
  }
}

// PUT /api/journal-entries/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if entry exists
    const existing = await prisma.journalEntry.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Validate entryType if provided
    const validEntryTypes: JournalEntryType[] = ["DAILY", "WEEKLY", "MONTHLY"];
    if (body.entryType && !validEntryTypes.includes(body.entryType)) {
      return NextResponse.json(
        {
          success: false,
          error: "entryType must be one of: DAILY, WEEKLY, MONTHLY",
        },
        { status: 400 },
      );
    }

    // Validate entryDate if provided
    let parsedEntryDate: Date | undefined;
    if (body.entryDate) {
      parsedEntryDate = new Date(body.entryDate);
      if (isNaN(parsedEntryDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid entryDate format" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(parsedEntryDate && { entryDate: parsedEntryDate }),
        ...(body.entryType && { entryType: body.entryType }),
        ...(body.title !== undefined && { title: body.title?.trim() || null }),
        ...(body.content !== undefined && {
          content: body.content?.trim() || null,
        }),
        ...(body.whatWentWell !== undefined && {
          whatWentWell: body.whatWentWell?.trim() || null,
        }),
        ...(body.whatWentWrong !== undefined && {
          whatWentWrong: body.whatWentWrong?.trim() || null,
        }),
        ...(body.lessonsLearned !== undefined && {
          lessonsLearned: body.lessonsLearned?.trim() || null,
        }),
        ...(body.goalsNextPeriod !== undefined && {
          goalsNextPeriod: body.goalsNextPeriod?.trim() || null,
        }),
        ...(body.marketConditions !== undefined && {
          marketConditions: body.marketConditions?.trim() || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Journal entry updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("P2002") || message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A journal entry already exists for this user, date, and entry type",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update journal entry",
        details: message,
      },
      { status: 500 },
    );
  }
}

// DELETE /api/journal-entries/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if entry exists before deleting
    const existing = await prisma.journalEntry.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 },
      );
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Journal entry "${existing.title || id}" deleted successfully`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete journal entry",
        details: message,
      },
      { status: 500 },
    );
  }
}
