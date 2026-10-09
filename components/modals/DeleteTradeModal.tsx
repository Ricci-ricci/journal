"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

interface Trade {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  status: "OPEN" | "CLOSED" | "PARTIAL";
  entryPrice: number;
  account?: { name: string; currency: string } | null;
}

interface DeleteTradeModalProps {
  trade: Trade | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteTradeModal: React.FC<DeleteTradeModalProps> = ({
  trade,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!trade) return null;

  const currency = trade.account?.currency ?? "USD";
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-trade-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-popover border border-border shadow-pop overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="flex items-center gap-3">
            <div>
              <h2
                id="delete-trade-title"
                className="font-heading text-lg leading-tight text-foreground"
              >
                Delete this trade?
              </h2>
              <p className="text-xs text-muted-foreground">
                {trade.symbol}&nbsp;·&nbsp;
                {trade.direction.toLowerCase()}
                &nbsp;·&nbsp;Entry&nbsp;{formatCurrency(trade.entryPrice)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          className="-mr-1.5 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">
          <p className="text-sm text-foreground">
            This removes the trade for good. It cannot be undone.
          </p>
          {trade.status === "CLOSED" && (
            <p className="text-xs text-muted-foreground">
              The account balance will be recalculated to reflect this removal.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            Delete trade
          </Button>
        </div>
      </div>
    </div>
  );
};
