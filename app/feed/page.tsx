"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

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
  <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
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
    <Layout title="Community Feed">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            See what other traders are sharing
          </p>
        </div>

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
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-5 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h.01M17 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              No trades shared yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Be the first to share one from your{" "}
              <a href="/trades" className="text-blue-400 hover:underline">
                Trades page
              </a>
              .
            </p>
          </div>
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
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
