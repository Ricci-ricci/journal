"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";

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

// ─── Avatar colour helper ─────────────────────────────────────────────────────

const AVATAR_COLORS = ["blue", "purple", "emerald", "amber", "rose"] as const;
type AvatarColor = (typeof AVATAR_COLORS)[number];

function hashAvatarColor(str: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const avatarColorClasses: Record<AvatarColor, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

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
  const avatarColor = hashAvatarColor(post.user.id);
  const colorClass = avatarColorClasses[avatarColor];

  const plPositive = post.profitLoss !== null && post.profitLoss >= 0;
  const plColor =
    post.profitLoss === null
      ? "text-muted-foreground"
      : plPositive
        ? "text-emerald-400"
        : "text-red-400";

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

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border ${colorClass}`}
          >
            {avatarChar}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-none">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {relativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Delete button (own posts only) */}
        {currentUserId === post.userId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete post"
            className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Trade info row */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-sm font-bold text-foreground">
            {post.symbol}
          </span>
          <Badge
            variant={post.direction === "LONG" ? "success" : "danger"}
            size="sm"
          >
            {post.direction}
          </Badge>
          {post.assetType && (
            <span className="text-xs text-muted-foreground">
              {post.assetType}
            </span>
          )}
          <Badge
            variant={post.status === "OPEN" ? "info" : "default"}
            size="sm"
          >
            {post.status}
          </Badge>
        </div>

        {/* Prices + P&L row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">
            Entry:{" "}
            <span className="text-foreground font-medium">
              ${post.entryPrice.toFixed(2)}
            </span>
          </span>
          {post.exitPrice !== null && (
            <span className="text-muted-foreground">
              Exit:{" "}
              <span className="text-foreground font-medium">
                ${post.exitPrice.toFixed(2)}
              </span>
            </span>
          )}
          {post.showPnL && post.profitLoss !== null && (
            <span className={`font-semibold ${plColor}`}>
              {plPositive ? "+" : ""}${post.profitLoss.toFixed(2)}
              {post.profitLossPct !== null && (
                <span className="ml-1 text-xs opacity-80">
                  ({post.profitLossPct >= 0 ? "+" : ""}
                  {post.profitLossPct.toFixed(2)}%)
                </span>
              )}
            </span>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-foreground leading-relaxed">
            {post.caption}
          </p>
        )}
      </div>

      {/* ── Action row ── */}
      <div className="flex items-center gap-5 px-4 py-2 border-t border-border">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
            liked
              ? "text-rose-400"
              : "text-muted-foreground hover:text-rose-400"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likeCount}</span>
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={handleToggleComments}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            commentsOpen
              ? "text-blue-400"
              : "text-muted-foreground hover:text-blue-400"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentCount}</span>
        </button>
      </div>

      {/* ── Comment section (collapsible) ── */}
      {commentsOpen && (
        <div className="border-t border-border bg-muted/10 px-4 py-3 space-y-3">
          {commentsLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-3 bg-muted rounded w-3/4" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const cName = comment.user.name || comment.user.email;
                const cColor =
                  avatarColorClasses[hashAvatarColor(comment.user.id)];
                return (
                  <div key={comment.id} className="flex items-start gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border shrink-0 ${cColor}`}
                    >
                      {cName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">
                          {cName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {relativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5 wrap-break-word">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment input (logged-in users only) */}
          {currentUserId && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
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
                className="flex-1 rounded-md border-0 py-1.5 px-3 text-sm bg-background text-foreground placeholder:text-muted-foreground ring-1 ring-inset ring-border focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={commentSubmitting || !newComment.trim()}
                className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? "…" : "Post"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
