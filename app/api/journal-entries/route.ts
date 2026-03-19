import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { JournalEntryType } from "@prisma/client";

export const dynamic = "force-dynamic";

type CreateJournalEntryBody = {
  userId?: string;
  entryDate?: string;
  entryType?: JournalEntryType;
  title?: string;
  content?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lessonsLearned?: string;
  goalsNextPeriod?: string;
  marketConditions?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId") ?? undefined;
    const entryTypeParam = searchParams.get("entryType") ?? undefined;
    const limitParam = searchParams.get("limit") ?? "50";
    const skipParam = searchParams.get("skip") ?? "0";

    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200);
    const skip = Math.max(parseInt(skipParam, 10) || 0, 0);

    const validEntryTypes: JournalEntryType[] = ["DAILY", "WEEKLY", "MONTHLY"];
    const entryType =
      entryTypeParam && validEntryTypes.includes(entryTypeParam as JournalEntryType)
        ? (entryTypeParam as JournalEntryType)
        : undefined;

    const where = {
      ...(userId ? { userId } : {}),
      ...(entryType ? { entryType } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        orderBy: { entryDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + items.length < total,
      },
      filters: {
        userId: userId ?? null,
        entryType: entryType ?? null,
      },
    });
  } catch (error) {
    console.error("GET /api/journal-entries failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch journal entries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateJournalEntryBody;

    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: "`userId` is required" },
        { status: 400 },
      );
    }

    if (!body.entryDate) {
      return NextResponse.json(
        { success: false, error: "`entryDate` is required (ISO date string)" },
        { status: 400 },
      );
    }

    const parsedDate = new Date(body.entryDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "`entryDate` is invalid" },
        { status: 400 },
      );
    }

    const entryType: JournalEntryType = body.entryType ?? "DAILY";
    const validEntryTypes: JournalEntryType[] = ["DAILY", "WEEKLY", "MONTHLY"];
    if (!validEntryTypes.includes(entryType)) {
      return NextResponse.json(
        {
          success: false,
          error: "`entryType` must be one of DAILY, WEEKLY, MONTHLY",
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
        { success: false, error: "User not found for provided `userId`" },
        { status: 404 },
      );
    }

    const created = await prisma.journalEntry.create({
      data: {
        userId: body.userId,
        entryDate: parsedDate,
        entryType,
        title: body.title,
        content: body.content,
        whatWentWell: body.whatWentWell,
        whatWentWrong: body.whatWentWrong,
        lessonsLearned: body.lessonsLearned,
        goalsNextPeriod: body.goalsNextPeriod,
        marketConditions: body.marketConditions,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Journal entry created successfully",
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/journal-entries failed:", error);

    // Handles Prisma unique constraint on (userId, entryDate, entryType)
    const message = error instanceof Error ? error.message : "Unknown error";
    const isUniqueConflict =
      message.includes("Unique constraint failed") ||
      message.includes("P2002");

    if (isUniqueConflict) {
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
        error: "Failed to create journal entry",
        details: message,
      },
      { status: 500 },
    );
  }
}
