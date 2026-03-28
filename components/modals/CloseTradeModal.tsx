"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";

interface Trade {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  account?: { name: string; currency: string } | null;
}

interface CloseTradeModalProps {
  trade: Trade | null;
  onConfirm: (data: {
    exitPrice: number;
    exitDate: string;
    profitLoss: number;
    profitLossPercent: number | null;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// ─── Inner form — remounts via key={trade.id} so state always resets ─────────

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
  const [profitLoss, setProfitLoss] = useState("");
  const [profitLossPercent, setProfitLossPercent] = useState("");

  const [errors, setErrors] = useState<{
    exitPrice?: string;
    profitLoss?: string;
  }>({});

  const currency = trade.account?.currency ?? "USD";
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  // Derived display values
  const plNum = parseFloat(profitLoss);
  const plPctNum = parseFloat(profitLossPercent);
  const hasValidPl = profitLoss.trim() !== "" && !isNaN(plNum);
  const hasValidPct = profitLossPercent.trim() !== "" && !isNaN(plPctNum);

  const isProfit = hasValidPl && plNum > 0;
  const isLoss = hasValidPl && plNum < 0;

  const plColor = isProfit
    ? "text-emerald-400"
    : isLoss
      ? "text-red-400"
      : "text-muted-foreground";

  const previewBorder = !hasValidPl
    ? "border-border bg-muted/30"
    : isProfit
      ? "border-emerald-500/30 bg-emerald-500/5"
      : isLoss
        ? "border-red-500/30 bg-red-500/5"
        : "border-border bg-muted/20";

  const handleConfirm = async () => {
    const newErrors: typeof errors = {};

    const exitPriceNum = parseFloat(exitPrice);
    if (exitPrice.trim() === "" || isNaN(exitPriceNum) || exitPriceNum <= 0) {
      newErrors.exitPrice = "Enter a valid exit price greater than 0";
    }

    const plValue = parseFloat(profitLoss);
    if (profitLoss.trim() === "" || isNaN(plValue)) {
      newErrors.profitLoss = "Enter the profit or loss for this trade";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    await onConfirm({
      exitPrice: exitPriceNum,
      exitDate: new Date(exitDate).toISOString(),
      profitLoss: plValue,
      profitLossPercent: hasValidPct ? plPctNum : null,
    });
  };

  const inputClass = (hasError?: boolean) =>
    [
      "block w-full rounded-md border-0 py-2 px-3 text-sm shadow-sm",
      "ring-1 ring-inset transition-colors",
      "bg-background text-foreground placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-inset",
      hasError
        ? "ring-red-500 focus:ring-red-500"
        : "ring-border focus:ring-ring",
      loading ? "opacity-50 cursor-not-allowed" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="relative z-10 w-full max-w-md rounded-xl bg-card border border-border shadow-2xl overflow-hidden">
      {/* ── Header ── */}
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
              &nbsp;·&nbsp;Entry&nbsp;{formatCurrency(trade.entryPrice)}
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

      {/* ── Body ── */}
      <div className="px-6 py-5 space-y-4">
        {/* Row: Exit Price + Exit Date */}
        <div className="grid grid-cols-2 gap-3">
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
                if (errors.exitPrice)
                  setErrors((prev) => ({ ...prev, exitPrice: undefined }));
              }}
              placeholder="0.00"
              autoFocus
              disabled={loading}
              className={inputClass(!!errors.exitPrice)}
            />
            {errors.exitPrice && (
              <p className="mt-1 text-xs text-red-400">{errors.exitPrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Exit Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              disabled={loading}
              className={inputClass()}
            />
          </div>
        </div>

        {/* Row: P&L amount + P&L % */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Profit / Loss <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={profitLoss}
              onChange={(e) => {
                setProfitLoss(e.target.value);
                if (errors.profitLoss)
                  setErrors((prev) => ({ ...prev, profitLoss: undefined }));
              }}
              placeholder="-50.00"
              disabled={loading}
              className={inputClass(!!errors.profitLoss)}
            />
            {errors.profitLoss && (
              <p className="mt-1 text-xs text-red-400">{errors.profitLoss}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              P&amp;L&nbsp;%&nbsp;
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={profitLossPercent}
                onChange={(e) => setProfitLossPercent(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                className={[inputClass(), "pr-7"].join(" ")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>

        {/* ── Live P&L preview ── */}
        <div
          className={`rounded-lg border px-4 py-4 transition-colors ${previewBorder}`}
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Result
          </p>

          {!hasValidPl ? (
            <p className="text-sm text-muted-foreground">
              Enter the profit or loss to see a preview
            </p>
          ) : (
            <div className="flex items-baseline justify-between gap-4">
              {/* Big amount */}
              <span className={`text-3xl font-bold tabular-nums ${plColor}`}>
                {isProfit ? "+" : ""}
                {formatCurrency(plNum)}
              </span>

              {/* Percentage pill */}
              {hasValidPct && (
                <span
                  className={[
                    "text-sm font-semibold tabular-nums px-2.5 py-1 rounded-full border",
                    isProfit
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : isLoss
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-muted text-muted-foreground border-border",
                  ].join(" ")}
                >
                  {plPctNum >= 0 ? "+" : ""}
                  {plPctNum.toFixed(2)}%
                </span>
              )}
            </div>
          )}

          {/* Label below */}
          {hasValidPl && (
            <p className={`mt-1.5 text-xs font-medium ${plColor}`}>
              {isProfit ? "▲ Profit" : isLoss ? "▼ Loss" : "— Break-even"}
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
          Status will be set to&nbsp;
          <span className="font-medium text-foreground">Closed</span>
          &nbsp;and the account balance will be updated immediately.
        </p>
      </div>

      {/* ── Footer ── */}
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
          disabled={loading}
        >
          Confirm Close
        </Button>
      </div>
    </div>
  );
};

// ─── Public wrapper ───────────────────────────────────────────────────────────

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      {/* key resets all form state when a different trade is selected */}
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
