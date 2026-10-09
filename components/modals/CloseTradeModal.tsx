"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fieldClasses,
  fieldErrorClasses,
  fieldLabelClasses,
} from "../ui/Input";
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
    ? "text-profit"
    : isLoss
      ? "text-loss"
      : "text-muted-foreground";

  const previewBorder = !hasValidPl
    ? "border-border bg-muted/30"
    : isProfit
      ? "border-profit/30 bg-profit/5"
      : isLoss
        ? "border-loss/30 bg-loss/5"
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
    cn(fieldClasses, "px-3", hasError && fieldErrorClasses);

  return (
    <div className="relative z-10 w-full max-w-md rounded-lg bg-popover border border-border shadow-2xl shadow-black/50 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex items-center gap-3">
          <div>
            <h2
              id="close-trade-title"
              className="font-heading text-xl leading-tight text-foreground"
            >
              Close trade
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
          className="-mr-1.5 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-5 space-y-4">
        {/* Row: Exit Price + Exit Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabelClasses}>
              Exit Price <span className="text-loss">*</span>
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
              <p className="mt-1 text-xs text-loss">{errors.exitPrice}</p>
            )}
          </div>

          <div>
            <label className={fieldLabelClasses}>
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
            <label className={fieldLabelClasses}>
              Profit / Loss <span className="text-loss">*</span>
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
              <p className="mt-1 text-xs text-loss">{errors.profitLoss}</p>
            )}
          </div>

          <div>
            <label className={fieldLabelClasses}>
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
          className={`rounded-md border px-4 py-3.5 transition-colors ${previewBorder}`}
        >
          <p className="label mb-2">
            Result
          </p>

          {!hasValidPl ? (
            <p className="text-sm text-muted-foreground">
              Enter the profit or loss to see a preview
            </p>
          ) : (
            <div className="flex items-baseline justify-between gap-4">
              {/* Big amount */}
              <span className={`num text-3xl tracking-tight ${plColor}`}>
                {isProfit ? "+" : ""}
                {formatCurrency(plNum)}
              </span>

              {/* Percentage pill */}
              {hasValidPct && (
                <span className={`num text-sm ${plColor}`}>
                  {plPctNum >= 0 ? "+" : ""}
                  {plPctNum.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info note */}
        <p className="text-xs text-muted-foreground">
          Status will be set to&nbsp;
          <span className="font-medium text-foreground">Closed</span>
          &nbsp;and the account balance will be updated immediately.
        </p>
      </div>

      {/* ── Footer ── */}
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
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
        >
          Close trade
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
        className="absolute inset-0 bg-black/60"
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
