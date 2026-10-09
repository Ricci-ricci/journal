"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Stat";

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

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-muted rounded w-28" />
        <div className="h-2.5 bg-muted rounded w-16" />
      </div>
    </div>
    <div className="px-4 py-3 space-y-2.5">
      <div className="flex gap-2">
        <div className="h-5 bg-muted rounded w-14" />
        <div className="h-5 bg-muted rounded w-12" />
        <div className="h-5 bg-muted rounded w-16" />
      </div>
      <div className="h-4 bg-muted rounded w-52" />
      <div className="h-4 bg-muted rounded w-40" />
    </div>
    <div className="px-4 py-2 border-t border-border flex gap-5">
      <div className="h-4 bg-muted rounded w-10" />
      <div className="h-4 bg-muted rounded w-10" />
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Fetch helper ───────────────────────────────────────────────────────────

  const fetchPosts = async (cursor?: string) => {
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/posts?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  // ── Initial load ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await fetchPosts();
        if (cancelled) return;
        if (data.success) {
          setPosts(data.data);
          setHasMore(data.pagination.hasMore);
          setNextCursor(data.pagination.nextCursor);
        } else {
          setFetchError("Failed to load posts.");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Feed fetch error:", err);
          setFetchError("Something went wrong. Please try refreshing.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load more ──────────────────────────────────────────────────────────────

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPosts(nextCursor);
      if (data.success) {
        setPosts((prev) => [...prev, ...data.data]);
        setHasMore(data.pagination.hasMore);
        setNextCursor(data.pagination.nextCursor);
      }
    } catch (err) {
      console.error("Load-more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Event handlers passed down to PostCard ─────────────────────────────────

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleLikeToggled = (postId: string, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: liked, _count: { ...p._count, likes: count } }
          : p,
      ),
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout title="Feed">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-muted-foreground">
          Trades other people chose to share. Share one of yours from the{" "}
          <Link
            href="/trades"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
          >
            Trades
          </Link>{" "}
          page.
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error state */}
        {!loading && fetchError && (
          <div className="rounded-md border border-loss/40 bg-loss/10 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-loss">{fetchError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && posts.length === 0 && (
          <EmptyState title="Nothing shared yet">
            Be the first — open a trade on the Trades page and share it.
          </EmptyState>
        )}

        {/* Post list */}
        {!loading && !fetchError && posts.length > 0 && (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id ?? null}
                  onDelete={handleDelete}
                  onLikeToggled={handleLikeToggled}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-2 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  loading={loadingMore}
                  disabled={loadingMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
