import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getSessionUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// ─── GET /api/posts/[id] ─────────────────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSessionUser(request);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    let likedByMe = false;
    if (session) {
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId: session.userId, postId: id } },
        select: { id: true },
      });
      likedByMe = !!like;
    }

    return NextResponse.json({ success: true, data: { ...post, likedByMe } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch post", details: message },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/posts/[id] ──────────────────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    if (post.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: you do not own this post" },
        { status: 403 },
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to delete post", details: message },
      { status: 500 },
    );
  }
}
