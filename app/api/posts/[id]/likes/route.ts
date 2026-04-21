import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getSessionUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

// ─── POST /api/posts/[id]/likes ───────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;

    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: session.userId, postId } },
    });

    let liked: boolean;

    if (existing) {
      // Unlike — remove the like
      await prisma.like.delete({
        where: { userId_postId: { userId: session.userId, postId } },
      });
      liked = false;
    } else {
      // Like — create a new like
      await prisma.like.create({
        data: { userId: session.userId, postId },
      });
      liked = true;
    }

    const count = await prisma.like.count({ where: { postId } });

    return NextResponse.json({ success: true, liked, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to toggle like", details: message },
      { status: 500 },
    );
  }
}
