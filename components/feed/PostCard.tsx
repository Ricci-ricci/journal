"use client";

import React, { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteIconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostUser {
  id: string;
  name: string | null;
  email: string;
}

interface PostWithRelations {
  id: string;
  userId: string;
  user: PostUser;
  tradeId: string | null;
  caption: string | null;
  showPnL: boolean;
  showAccountSize: boolean;
  symbol: string;
  direction: "LONG" | "SHORT";
  assetType: string | null;
  entryPrice: number;
  exitPrice: number | null;
  profitLoss: number | null;
  profitLossPct: number | null;
  status: "OPEN" | "CLOSED" | "PARTIAL";
  createdAt: string;
  _count: { likes: number; comments: number };
  likedByMe: boolean;
}

interface CommentWithUser {
  id: string;
  userId: string;
  user: PostUser;
  postId: string;
  content: string;
  createdAt: string;
}

interface PostCardProps {
  post: PostWithRelations;
  currentUserId: string | null;
  onDelete: (postId: string) => void;
  onLikeToggled: (postId: string, liked: boolean, count: number) => void;
}

// ─── Relative-time helper ─────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3_600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3_600)}h ago`;
  if (diff < 2_592_000) return `${Math.floor(diff / 86_400)}d ago`;
  return `${Math.floor(diff / 2_592_000)}mo ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onDelete,
  onLikeToggled,
}) => {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [likeLoading, setLikeLoading] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [commentsFetched, setCommentsFetched] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post._count.comments);

  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // ── Derived display values ──
  const displayName = post.user.name || post.user.email;
  const avatarChar = displayName[0].toUpperCase();

  const plPositive = post.profitLoss !== null && post.profitLoss >= 0;
  const plColor =
    post.profitLoss === null
      ? "text-muted-foreground"
      : plPositive
        ? "text-profit"
        : "text-loss";

  // ── Handlers ──

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/likes`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.count);
        onLikeToggled(post.id, data.liked, data.count);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) onDelete(post.id);
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleComments = async () => {
    const opening = !commentsOpen;
    setCommentsOpen(opening);
    if (opening && !commentsFetched) {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const data = await res.json();
        if (data.success) {
          setComments(data.data);
          setCommentsFetched(true);
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setCommentCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const avatar =
    "flex items-center justify-center rounded-full bg-muted font-medium text-foreground shrink-0";

  return (
    <article className="bg-card border border-border rounded-lg">
      <div className="p-4 sm:p-5">
        {/* ── Who and when ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`${avatar} h-7 w-7 text-xs`}>{avatarChar}</span>
            <p className="text-sm text-foreground truncate">
              <span className="font-medium">{displayName}</span>{" "}
              <span className="text-muted-foreground">
                · {relativeTime(post.createdAt)}
              </span>
            </p>
          </div>

          {currentUserId === post.userId && (
            <DeleteIconButton
              size="sm"
              tooltip="Delete post"
              onClick={handleDelete}
              disabled={deleting}
            />
          )}
        </div>

        {/* ── The trade ── */}
        <div className="mt-4 flex items-baseline justify-between gap-4 flex-wrap">
          <p className="text-foreground">
            <span className="font-heading text-2xl leading-none">
              {post.symbol}
            </span>{" "}
            <span className="text-sm text-muted-foreground">
              {post.direction.toLowerCase()}
              {post.assetType && ` · ${post.assetType.toLowerCase()}`} ·{" "}
              {post.status.toLowerCase()}
            </span>
          </p>
          {post.showPnL && post.profitLoss !== null && (
            <p className={`num text-lg ${plColor}`}>
              {plPositive ? "+" : ""}${post.profitLoss.toFixed(2)}
              {post.profitLossPct !== null && (
                <span className="ml-1.5 text-xs">
                  {post.profitLossPct >= 0 ? "+" : ""}
                  {post.profitLossPct.toFixed(2)}%
                </span>
              )}
            </p>
          )}
        </div>

        <p className="mt-1.5 text-sm text-muted-foreground">
          In at{" "}
          <span className="num text-foreground">
            ${post.entryPrice.toFixed(2)}
          </span>
          {post.exitPrice !== null && (
            <>
              , out at{" "}
              <span className="num text-foreground">
                ${post.exitPrice.toFixed(2)}
              </span>
            </>
          )}
        </p>

        {post.caption && (
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
            {post.caption}
          </p>
        )}

        {/* ── Actions ── */}
        <div className="mt-4 flex items-center gap-4 text-[13px]">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            aria-pressed={liked}
            className={`inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              liked
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart
              className="h-4 w-4"
              fill={liked ? "currentColor" : "none"}
              strokeWidth={1.75}
            />
            <span className="num">{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleComments}
            aria-expanded={commentsOpen}
            className={`inline-flex items-center gap-1.5 transition-colors ${
              commentsOpen
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
            <span className="num">{commentCount}</span>
          </button>
        </div>
      </div>

      {/* ── Comments ── */}
      {commentsOpen && (
        <div className="border-t border-border p-4 sm:p-5 space-y-4">
          {commentsLoading ? (
            <p className="text-xs text-muted-foreground">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const cName = comment.user.name || comment.user.email;
                return (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    <span className={`${avatar} h-6 w-6 text-[11px]`}>
                      {cName[0].toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {cName}
                        </span>{" "}
                        · {relativeTime(comment.createdAt)}
                      </p>
                      <p className="text-sm text-foreground/90 mt-0.5 wrap-break-word">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {currentUserId && (
            <div className="flex gap-2">
              <Input
                aria-label="Comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment..."
                disabled={commentSubmitting}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddComment}
                disabled={commentSubmitting || !newComment.trim()}
              >
                Post
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
