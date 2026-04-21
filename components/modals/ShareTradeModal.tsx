"use client";

import React, { useState } from "react";
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

interface Trade {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  assetType: string | null;
  entryPrice: number;
  exitPrice: number | null;
  profitLoss: number | null;
  profitLossPercent: number | null;
  status: "OPEN" | "CLOSED" | "PARTIAL";
  account?: { name: string; currency: string } | null;
}

interface ShareTradeModalProps {
  trade: Trade | null;
  onClose: () => void;
  onShared: (post: PostWithRelations) => void;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled,
  label,
  description,
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-blue-600" : "bg-muted",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  </div>
);

// ─── Modal inner form ─────────────────────────────────────────────────────────

interface ShareTradeFormProps {
  trade: Trade;
  onClose: () => void;
  onShared: (post: PostWithRelations) => void;
}

const ShareTradeForm: React.FC<ShareTradeFormProps> = ({
  trade,
  onClose,
  onShared,
}) => {
  const [caption, setCaption] = useState("");
  const [showPnL, setShowPnL] = useState(true);
  const [showAccountSize, setShowAccountSize] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = trade.account?.currency ?? "USD";
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  const plPositive = trade.profitLoss !== null && trade.profitLoss >= 0;
  const plColor =
    trade.profitLoss === null
      ? "text-muted-foreground"
      : plPositive
        ? "text-emerald-400"
        : "text-red-400";

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeId: trade.id,
          caption: caption.trim() || undefined,
          showPnL,
          showAccountSize,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShared(data.data as PostWithRelations);
      } else {
        setError(data.error || "Failed to share trade. Please try again.");
      }
    } catch (err) {
      console.error("Failed to share trade:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md rounded-xl bg-card border border-border shadow-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
          <div>
            <h2
              id="share-trade-title"
              className="text-sm font-semibold text-foreground"
            >
              Share Trade
            </h2>
            <p className="text-xs text-muted-foreground">
              {trade.symbol}&nbsp;·&nbsp;
              <span
                className={
                  trade.direction === "LONG"
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {trade.direction}
              </span>
              {trade.assetType && <>&nbsp;·&nbsp;{trade.assetType}</>}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5 space-y-4">
        {/* Trade preview */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-2">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-bold text-foreground">
              {trade.symbol}
            </span>
            <span
              className={[
                "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1",
                trade.direction === "LONG"
                  ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
                  : "bg-red-500/15 text-red-400 ring-red-500/25",
              ].join(" ")}
            >
              {trade.direction}
            </span>
            <span
              className={[
                "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1",
                trade.status === "OPEN"
                  ? "bg-blue-500/15 text-blue-400 ring-blue-500/25"
                  : "bg-white/10 text-foreground ring-white/15",
              ].join(" ")}
            >
              {trade.status}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              Entry:{" "}
              <span className="text-foreground font-medium">
                {formatCurrency(trade.entryPrice)}
              </span>
            </span>
            {trade.exitPrice !== null && (
              <span className="text-muted-foreground">
                Exit:{" "}
                <span className="text-foreground font-medium">
                  {formatCurrency(trade.exitPrice)}
                </span>
              </span>
            )}
            {trade.profitLoss !== null && (
              <span className={`font-semibold ${plColor}`}>
                {plPositive ? "+" : ""}
                {formatCurrency(trade.profitLoss)}
                {trade.profitLossPercent !== null && (
                  <span className="ml-1 text-xs font-normal opacity-80">
                    ({trade.profitLossPercent >= 0 ? "+" : ""}
                    {trade.profitLossPercent.toFixed(2)}%)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Caption{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a comment about this trade..."
            rows={3}
            disabled={loading}
            className={[
              "block w-full rounded-md border-0 py-2 px-3 text-sm shadow-sm",
              "ring-1 ring-inset ring-border transition-colors resize-none",
              "bg-background text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
              loading ? "opacity-50 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        {/* Toggles */}
        <Toggle
          checked={showPnL}
          onChange={setShowPnL}
          disabled={loading}
          label="Show P&L"
          description="Display profit / loss on your post"
        />
        <Toggle
          checked={showAccountSize}
          onChange={setShowAccountSize}
          disabled={loading}
          label="Show Account Size"
          description="Display account balance on your post"
        />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2.5">
            <svg
              className="h-4 w-4 text-red-400 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleShare}
          loading={loading}
          disabled={loading}
        >
          Share to Feed
        </Button>
      </div>
    </div>
  );
};

// ─── Public wrapper ───────────────────────────────────────────────────────────

export const ShareTradeModal: React.FC<ShareTradeModalProps> = ({
  trade,
  onClose,
  onShared,
}) => {
  if (!trade) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-trade-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <ShareTradeForm
        key={trade.id}
        trade={trade}
        onClose={onClose}
        onShared={onShared}
      />
    </div>
  );
};
