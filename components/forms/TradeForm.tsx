"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface Strategy {
  id: string;
  name: string;
}

interface TradeFormData {
  accountId: string;
  strategyId: string;
  symbol: string;
  assetType: string;
  direction: string;
  status: string;
  entryDate: string;
  entryPrice: string;
  quantity: string;
  exitDate: string;
  exitPrice: string;
  commission: string;
  fees: string;
  profitLoss: string;
  profitLossPercent: string;
  stopLoss: string;
  takeProfit: string;
  riskRewardRatio: string;
  setupType: string;
  timeFrame: string;
  notes: string;
  confidenceLevel: string;
  emotionalState: string;
}

interface TradeFormProps {
  onSubmit: (data: TradeFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TradeFormData>;
  loading?: boolean;
  accounts?: Account[];
  strategies?: Strategy[];
}

const assetTypeOptions = [
  { value: "STOCK", label: "Stock" },
  { value: "FOREX", label: "Forex" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "OPTIONS", label: "Options" },
  { value: "FUTURES", label: "Futures" },
  { value: "OTHER", label: "Other" },
];

const directionOptions = [
  { value: "LONG", label: "Long" },
  { value: "SHORT", label: "Short" },
];

const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "PARTIAL", label: "Partial" },
];

const timeFrameOptions = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
];

function calcProfitLoss(
  direction: string,
  entryPrice: string,
  exitPrice: string,
  quantity: string,
  commission: string,
  fees: string,
): { pl: string; plPct: string } | null {
  const entry = parseFloat(entryPrice);
  const exit = parseFloat(exitPrice);
  const qty = parseFloat(quantity);
  const comm = parseFloat(commission || "0");
  const fee = parseFloat(fees || "0");

  if (isNaN(entry) || isNaN(exit) || isNaN(qty) || entry <= 0 || qty <= 0) {
    return null;
  }

  const raw =
    direction === "SHORT" ? (entry - exit) * qty : (exit - entry) * qty;

  const pl = raw - comm - fee;
  const cost = entry * qty;
  const plPct = cost !== 0 ? (pl / cost) * 100 : 0;

  return {
    pl: pl.toFixed(2),
    plPct: plPct.toFixed(2),
  };
}

export const TradeForm: React.FC<TradeFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
  accounts = [],
  strategies = [],
}) => {
  const [formData, setFormData] = useState<TradeFormData>({
    accountId: initialData?.accountId || "",
    strategyId: initialData?.strategyId || "",
    symbol: initialData?.symbol || "",
    assetType: initialData?.assetType || "",
    direction: initialData?.direction || "",
    status: initialData?.status || "OPEN",
    entryDate: initialData?.entryDate || new Date().toISOString().slice(0, 16),
    entryPrice: initialData?.entryPrice || "",
    quantity: initialData?.quantity || "",
    exitDate: initialData?.exitDate || "",
    exitPrice: initialData?.exitPrice || "",
    commission: initialData?.commission || "0",
    fees: initialData?.fees || "0",
    profitLoss: initialData?.profitLoss || "",
    profitLossPercent: initialData?.profitLossPercent || "",
    stopLoss: initialData?.stopLoss || "",
    takeProfit: initialData?.takeProfit || "",
    riskRewardRatio: initialData?.riskRewardRatio || "",
    setupType: initialData?.setupType || "",
    timeFrame: initialData?.timeFrame || "",
    notes: initialData?.notes || "",
    confidenceLevel: initialData?.confidenceLevel || "",
    emotionalState: initialData?.emotionalState || "",
  });

  const [errors, setErrors] = useState<Partial<TradeFormData>>({});
  const [plAutoCalc, setPlAutoCalc] = useState(true);

  // Auto-calculate P&L whenever relevant fields change
  // Fields that should trigger auto P&L recalculation
  const PL_TRIGGER_FIELDS = new Set([
    "direction",
    "entryPrice",
    "exitPrice",
    "quantity",
    "commission",
    "fees",
    "status",
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // If the user manually edits P&L fields, disable auto-calc
    if (name === "profitLoss" || name === "profitLossPercent") {
      setPlAutoCalc(false);
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof TradeFormData]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
      return;
    }

    // Build next state with the changed field
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Auto-recalculate P&L when a trigger field changes and auto-calc is on
      if (plAutoCalc && PL_TRIGGER_FIELDS.has(name)) {
        const isClosed = next.status === "CLOSED" || next.status === "PARTIAL";
        if (isClosed && next.exitPrice) {
          const result = calcProfitLoss(
            next.direction,
            next.entryPrice,
            next.exitPrice,
            next.quantity,
            next.commission,
            next.fees,
          );
          if (result) {
            next.profitLoss = result.pl;
            next.profitLossPercent = result.plPct;
          }
        }
      }

      return next;
    });

    if (errors[name as keyof TradeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRecalculate = () => {
    const result = calcProfitLoss(
      formData.direction,
      formData.entryPrice,
      formData.exitPrice,
      formData.quantity,
      formData.commission,
      formData.fees,
    );

    if (result) {
      setFormData((prev) => ({
        ...prev,
        profitLoss: result.pl,
        profitLossPercent: result.plPct,
      }));
      setPlAutoCalc(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TradeFormData> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Symbol is required";
    }
    if (!formData.direction) {
      newErrors.direction = "Direction is required";
    }
    if (!formData.entryPrice || isNaN(Number(formData.entryPrice))) {
      newErrors.entryPrice = "Valid entry price is required";
    }
    if (!formData.quantity || isNaN(Number(formData.quantity))) {
      newErrors.quantity = "Valid quantity is required";
    }
    if (formData.exitPrice && isNaN(Number(formData.exitPrice))) {
      newErrors.exitPrice = "Exit price must be a valid number";
    }
    if (formData.commission && isNaN(Number(formData.commission))) {
      newErrors.commission = "Commission must be a valid number";
    }
    if (formData.fees && isNaN(Number(formData.fees))) {
      newErrors.fees = "Fees must be a valid number";
    }
    if (formData.profitLoss && isNaN(Number(formData.profitLoss))) {
      newErrors.profitLoss = "Profit/Loss must be a valid number";
    }
    if (
      formData.profitLossPercent &&
      isNaN(Number(formData.profitLossPercent))
    ) {
      newErrors.profitLossPercent = "P&L % must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const isClosed =
    formData.status === "CLOSED" || formData.status === "PARTIAL";

  const plValue = parseFloat(formData.profitLoss);
  const plIsPositive = !isNaN(plValue) && plValue > 0;
  const plIsNegative = !isNaN(plValue) && plValue < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Trade" : "Add New Trade"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account and Strategy Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Trading Account"
              name="accountId"
              value={formData.accountId}
              onChange={handleInputChange}
              options={[
                { value: "", label: "Select account (optional)" },
                ...accounts.map((acc) => ({
                  value: acc.id,
                  label: `${acc.name} (${acc.currency})`,
                })),
              ]}
              placeholder="Select account"
            />

            <Select
              label="Strategy"
              name="strategyId"
              value={formData.strategyId}
              onChange={handleInputChange}
              options={[
                { value: "", label: "Select strategy (optional)" },
                ...strategies.map((strategy) => ({
                  value: strategy.id,
                  label: strategy.name,
                })),
              ]}
              placeholder="Select strategy"
            />
          </div>

          {/* Basic Trade Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Symbol *"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              error={errors.symbol}
              placeholder="e.g., AAPL, BTC/USD"
            />

            <Select
              label="Asset Type"
              name="assetType"
              value={formData.assetType}
              onChange={handleInputChange}
              options={assetTypeOptions}
              placeholder="Select asset type"
            />

            <Select
              label="Direction *"
              name="direction"
              value={formData.direction}
              onChange={handleInputChange}
              options={directionOptions}
              placeholder="Select direction"
              error={errors.direction}
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
            />
          </div>

          {/* Entry Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
              Entry Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Entry Date *"
                name="entryDate"
                type="datetime-local"
                value={formData.entryDate}
                onChange={handleInputChange}
                error={errors.entryDate}
              />
              <Input
                label="Entry Price *"
                name="entryPrice"
                type="number"
                step="any"
                value={formData.entryPrice}
                onChange={handleInputChange}
                error={errors.entryPrice}
                placeholder="0.00"
              />
              <Input
                label="Quantity *"
                name="quantity"
                type="number"
                step="any"
                value={formData.quantity}
                onChange={handleInputChange}
                error={errors.quantity}
                placeholder="0"
              />
            </div>
          </div>

          {/* Exit Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
              Exit Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Exit Date"
                name="exitDate"
                type="datetime-local"
                value={formData.exitDate}
                onChange={handleInputChange}
              />
              <Input
                label="Exit Price"
                name="exitPrice"
                type="number"
                step="any"
                value={formData.exitPrice}
                onChange={handleInputChange}
                error={errors.exitPrice}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Costs */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
              Costs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Commission"
                name="commission"
                type="number"
                step="any"
                value={formData.commission}
                onChange={handleInputChange}
                error={errors.commission}
                placeholder="0.00"
              />
              <Input
                label="Fees"
                name="fees"
                type="number"
                step="any"
                value={formData.fees}
                onChange={handleInputChange}
                error={errors.fees}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Profit / Loss */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Profit / Loss
              </h3>
              <div className="flex items-center gap-3">
                {isClosed && formData.exitPrice && (
                  <span className="text-xs text-muted-foreground">
                    {plAutoCalc ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Auto-calculated
                      </span>
                    ) : (
                      <span className="text-amber-400">Manual override</span>
                    )}
                  </span>
                )}
                {isClosed && formData.exitPrice && !plAutoCalc && (
                  <button
                    type="button"
                    onClick={handleRecalculate}
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                  >
                    Recalculate from prices
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* P&L amount */}
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground mb-1.5">
                  Profit / Loss (amount)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="profitLoss"
                    step="any"
                    value={formData.profitLoss}
                    onChange={handleInputChange}
                    placeholder="0.00  (negative = loss)"
                    className={[
                      "block w-full rounded-md border-0 py-1.5 pr-3 pl-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors",
                      "bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring ring-border",
                      plIsPositive
                        ? "text-emerald-400 ring-emerald-500/40 focus:ring-emerald-500"
                        : plIsNegative
                          ? "text-red-400 ring-red-500/40 focus:ring-red-500"
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  {formData.profitLoss !== "" && !isNaN(plValue) && (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none ${
                        plIsPositive
                          ? "text-emerald-400"
                          : plIsNegative
                            ? "text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {plIsPositive ? "▲" : plIsNegative ? "▼" : "—"}
                    </span>
                  )}
                </div>
                {errors.profitLoss && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.profitLoss}
                  </p>
                )}
              </div>

              {/* P&L percent */}
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground mb-1.5">
                  Profit / Loss (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="profitLossPercent"
                    step="any"
                    value={formData.profitLossPercent}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={[
                      "block w-full rounded-md border-0 py-1.5 pr-8 pl-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors",
                      "bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring ring-border",
                      plIsPositive
                        ? "text-emerald-400 ring-emerald-500/40 focus:ring-emerald-500"
                        : plIsNegative
                          ? "text-red-400 ring-red-500/40 focus:ring-red-500"
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    %
                  </span>
                </div>
                {errors.profitLossPercent && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.profitLossPercent}
                  </p>
                )}
              </div>
            </div>

            {/* Visual P&L badge */}
            {formData.profitLoss !== "" && !isNaN(plValue) && (
              <div className="mt-3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    plIsPositive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : plIsNegative
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {plIsPositive
                    ? "▲ Profit"
                    : plIsNegative
                      ? "▼ Loss"
                      : "Break-even"}
                  <span>
                    {plIsPositive ? "+" : ""}
                    {plValue.toFixed(2)}
                    {formData.profitLossPercent !== "" &&
                      !isNaN(parseFloat(formData.profitLossPercent)) &&
                      ` (${parseFloat(formData.profitLossPercent) >= 0 ? "+" : ""}${parseFloat(formData.profitLossPercent).toFixed(2)}%)`}
                  </span>
                </div>
              </div>
            )}

            {/* Hint when trade is open */}
            {!isClosed && (
              <p className="mt-2 text-xs text-muted-foreground">
                P&L fields will be auto-calculated once status is set to{" "}
                <span className="text-foreground font-medium">Closed</span> or{" "}
                <span className="text-foreground font-medium">Partial</span> and
                an exit price is provided. You can also enter them manually.
              </p>
            )}
          </div>

          {/* Risk Management */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
              Risk Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stop Loss"
                name="stopLoss"
                type="number"
                step="any"
                value={formData.stopLoss}
                onChange={handleInputChange}
                placeholder="0.00"
              />
              <Input
                label="Take Profit"
                name="takeProfit"
                type="number"
                step="any"
                value={formData.takeProfit}
                onChange={handleInputChange}
                placeholder="0.00"
              />
              <Input
                label="Risk/Reward Ratio"
                name="riskRewardRatio"
                type="number"
                step="any"
                value={formData.riskRewardRatio}
                onChange={handleInputChange}
                placeholder="e.g., 2.5"
              />
            </div>
          </div>

          {/* Strategy Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
              Strategy & Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Setup Type"
                name="setupType"
                value={formData.setupType}
                onChange={handleInputChange}
                placeholder="e.g., Breakout, Support/Resistance"
              />
              <Select
                label="Time Frame"
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleInputChange}
                options={timeFrameOptions}
                placeholder="Select timeframe"
              />
            </div>
          </div>

          {/* Psychology */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
              Psychology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Confidence Level (1-10)"
                name="confidenceLevel"
                type="number"
                min="1"
                max="10"
                value={formData.confidenceLevel}
                onChange={handleInputChange}
                placeholder="5"
              />
              <Input
                label="Emotional State"
                name="emotionalState"
                value={formData.emotionalState}
                onChange={handleInputChange}
                placeholder="e.g., Confident, Nervous, Excited"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium leading-6 text-foreground mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleInputChange}
              className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
              placeholder="Trade analysis, market conditions, lessons learned..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" loading={loading} disabled={loading}>
              {initialData ? "Update Trade" : "Save Trade"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
