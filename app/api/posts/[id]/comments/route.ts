import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getSessionUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

// ─── GET /api/posts/[id]/comments ────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;

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

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments", details: message },
      { status: 500 },
    );
  }
}

// ─── POST /api/posts/[id]/comments ───────────────────────────────────────────
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

    const body = (await request.json()) as { content?: string };

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment content cannot be empty" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.userId,
        postId,
        content: body.content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to add comment", details: message },
      { status: 500 },
    );
  }
}
