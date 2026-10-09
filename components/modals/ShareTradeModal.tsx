"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldClasses, fieldLabelClasses } from "../ui/Input";
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
        checked ? "bg-primary" : "bg-accent",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-3.5 w-3.5 transform rounded-full transition-transform",
          checked
            ? "translate-x-4.5 bg-primary-foreground"
            : "translate-x-0.5 bg-foreground/70",
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
        ? "text-profit"
        : "text-loss";

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
    <div className="relative z-10 w-full max-w-md rounded-2xl bg-popover border border-border shadow-pop overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex items-center gap-3">
          <div>
            <h2
              id="share-trade-title"
              className="font-heading text-lg leading-tight text-foreground"
            >
              Share to the feed
            </h2>
            <p className="text-xs text-muted-foreground">
              {trade.symbol}&nbsp;·&nbsp;
              {trade.direction.toLowerCase()}
              {trade.assetType && <>&nbsp;·&nbsp;{trade.assetType}</>}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="-mr-1.5 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-5 space-y-4">
        {/* Trade preview */}
        <div className="rounded-xl border border-border bg-background/50 px-4 py-3 space-y-1.5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{trade.symbol}</span>{" "}
            {trade.direction.toLowerCase()} · {trade.status.toLowerCase()}
          </p>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              Entry:{" "}
              <span className="num text-foreground">
                {formatCurrency(trade.entryPrice)}
              </span>
            </span>
            {trade.exitPrice !== null && (
              <span className="text-muted-foreground">
                Exit:{" "}
                <span className="num text-foreground">
                  {formatCurrency(trade.exitPrice)}
                </span>
              </span>
            )}
            {trade.profitLoss !== null && (
              <span className={`num ${plColor}`}>
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
          <label className={fieldLabelClasses}>
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
            className={cn(fieldClasses, "h-auto px-3 py-2 resize-none")}
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
          label="Show account size"
          description="Display account balance on your post"
        />

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-loss/30 bg-loss/10 px-3 py-2.5 text-sm text-loss"
          >
            {error}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-2 px-5 pb-5">
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
          Share
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
