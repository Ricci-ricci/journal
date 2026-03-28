"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";

interface Trade {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  commission: number;
  fees: number;
  account?: { name: string; currency: string } | null;
}

interface CloseTradeModalProps {
  trade: Trade | null;
  onConfirm: (data: {
    exitPrice: number;
    exitDate: string;
    profitLoss: number;
    profitLossPercent: number;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function computePnL(
  direction: "LONG" | "SHORT",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  commission: number,
  fees: number,
): { pl: number; plPct: number } {
  const raw =
    direction === "SHORT"
      ? (entryPrice - exitPrice) * quantity
      : (exitPrice - entryPrice) * quantity;
  const pl = raw - commission - fees;
  const cost = entryPrice * quantity;
  const plPct = cost !== 0 ? (pl / cost) * 100 : 0;
  return { pl, plPct };
}

// ─── Inner form — mounted fresh for every trade thanks to key={trade.id} ─────

interface CloseTradeFormProps {
  trade: Trade;
  onConfirm: CloseTradeModalProps["onConfirm"];
  onCancel: () => void;
  loading: boolean;
}

const CloseTradeForm: React.FC<CloseTradeFormProps> = ({
  trade,
  onConfirm,
  onCancel,
  loading,
}) => {
  const [exitPrice, setExitPrice] = useState("");
  const [exitDate, setExitDate] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [exitPriceError, setExitPriceError] = useState<string | null>(null);

  const exitPriceNum = parseFloat(exitPrice);
  const hasValidExit = !isNaN(exitPriceNum) && exitPriceNum > 0;

  const pnl = hasValidExit
    ? computePnL(
        trade.direction,
        trade.entryPrice,
        exitPriceNum,
        trade.quantity,
        trade.commission,
        trade.fees,
      )
    : null;

  const isProfit = pnl !== null && pnl.pl > 0;
  const isLoss = pnl !== null && pnl.pl < 0;

  const currency = trade.account?.currency ?? "USD";
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

  const handleConfirm = async () => {
    if (!exitPrice.trim()) {
      setExitPriceError("Exit price is required");
      return;
    }
    if (isNaN(exitPriceNum) || exitPriceNum <= 0) {
      setExitPriceError("Enter a valid exit price greater than 0");
      return;
    }
    setExitPriceError(null);

    const { pl, plPct } = computePnL(
      trade.direction,
      trade.entryPrice,
      exitPriceNum,
      trade.quantity,
      trade.commission,
      trade.fees,
    );

    await onConfirm({
      exitPrice: exitPriceNum,
      exitDate: new Date(exitDate).toISOString(),
      profitLoss: pl,
      profitLossPercent: plPct,
    });
  };

  return (
    /* Panel */
    <div className="relative z-10 w-full max-w-md rounded-xl bg-card border border-border shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <svg
              className="h-4 w-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2
              id="close-trade-title"
              className="text-sm font-semibold text-foreground"
            >
              Close Trade
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
              &nbsp;·&nbsp;Entry {formatCurrency(trade.entryPrice)}
              &nbsp;×&nbsp;{trade.quantity.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
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

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Exit Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Exit Price <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => {
              setExitPrice(e.target.value);
              if (exitPriceError) setExitPriceError(null);
            }}
            placeholder="0.00"
            autoFocus
            disabled={loading}
            className={[
              "block w-full rounded-md border-0 py-2 px-3 text-sm shadow-sm ring-1 ring-inset transition-colors",
              "bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset",
              exitPriceError
                ? "ring-red-500 focus:ring-red-500"
                : "ring-border focus:ring-ring",
              loading ? "opacity-50 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          {exitPriceError && (
            <p className="mt-1 text-xs text-red-400">{exitPriceError}</p>
          )}
        </div>

        {/* Exit Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Exit Date &amp; Time
          </label>
          <input
            type="datetime-local"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            disabled={loading}
            className={[
              "block w-full rounded-md border-0 py-2 px-3 text-sm shadow-sm ring-1 ring-inset ring-border transition-colors",
              "bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
              loading ? "opacity-50 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        {/* Live P&L preview */}
        <div
          className={[
            "rounded-lg border px-4 py-3 transition-colors",
            pnl === null
              ? "border-border bg-muted/30"
              : isProfit
                ? "border-emerald-500/30 bg-emerald-500/5"
                : isLoss
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-border bg-muted/30",
          ].join(" ")}
        >
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Estimated P&amp;L
          </p>
          {pnl === null ? (
            <p className="text-sm text-muted-foreground">
              Enter an exit price to preview your P&amp;L
            </p>
          ) : (
            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-bold tabular-nums ${
                  isProfit
                    ? "text-emerald-400"
                    : isLoss
                      ? "text-red-400"
                      : "text-foreground"
                }`}
              >
                {isProfit ? "+" : ""}
                {formatCurrency(pnl.pl)}
              </span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  isProfit
                    ? "text-emerald-400"
                    : isLoss
                      ? "text-red-400"
                      : "text-muted-foreground"
                }`}
              >
                {pnl.plPct >= 0 ? "+" : ""}
                {pnl.plPct.toFixed(2)}%
              </span>
            </div>
          )}
          {pnl !== null && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Includes commission &amp; fees&nbsp;(
              {formatCurrency(trade.commission + trade.fees)})
            </p>
          )}
        </div>

        {/* Info note */}
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <svg
            className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          The trade status will be set to&nbsp;
          <span className="font-medium text-foreground">Closed</span> and the
          account balance will be updated immediately.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
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
          onClick={handleConfirm}
          loading={loading}
          disabled={loading || !hasValidExit}
        >
          Confirm Close
        </Button>
      </div>
    </div>
  );
};

// ─── Public modal wrapper ─────────────────────────────────────────────────────

export const CloseTradeModal: React.FC<CloseTradeModalProps> = ({
  trade,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!trade) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-trade-title"
    >
      {/* Dimmed overlay — click outside to cancel */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      {/* key={trade.id} makes React fully remount CloseTradeForm
          whenever a different trade is selected, resetting all form state. */}
      <CloseTradeForm
        key={trade.id}
        trade={trade}
        onConfirm={onConfirm}
        onCancel={onCancel}
        loading={loading}
      />
    </div>
  );
};
