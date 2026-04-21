import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// ─── GET /api/posts ──────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam ?? 20), 1), 50);

    const posts = await prisma.post.findMany({
      take: limit + 1, // fetch one extra to determine hasMore
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    // Compute likedByMe for each post if a session user exists
    let likedPostIds = new Set<string>();
    if (session) {
      const likes = await prisma.like.findMany({
        where: {
          userId: session.userId,
          postId: { in: page.map((p) => p.id) },
        },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    const data = page.map((post) => ({
      ...post,
      likedByMe: likedPostIds.has(post.id),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { hasMore, nextCursor },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts", details: message },
      { status: 500 },
    );
  }
}

// ─── POST /api/posts ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      tradeId?: string;
      caption?: string;
      showPnL?: boolean;
      showAccountSize?: boolean;
    };

    if (!body.tradeId) {
      return NextResponse.json(
        { success: false, error: "tradeId is required" },
        { status: 400 },
      );
    }

    // Validate trade exists and belongs to session user
    const trade = await prisma.trade.findUnique({
      where: { id: body.tradeId },
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 },
      );
    }

    if (trade.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: trade does not belong to you" },
        { status: 403 },
      );
    }

    const post = await prisma.post.create({
      data: {
        userId: session.userId,
        tradeId: trade.id,
        caption: body.caption ?? null,
        showPnL: body.showPnL ?? false,
        showAccountSize: body.showAccountSize ?? false,
        // Snapshot trade fields at publish time
        symbol: trade.symbol,
        direction: trade.direction,
        assetType: trade.assetType ?? null,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice ?? null,
        profitLoss: trade.profitLoss ?? null,
        profitLossPct: trade.profitLossPercent ?? null,
        status: trade.status,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: { ...post, likedByMe: false } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to create post", details: message },
      { status: 500 },
    );
  }
}
