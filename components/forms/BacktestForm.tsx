"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export interface BacktestFormData {
  name: string;
  platform: string;
  symbol: string;
  timeFrame: string;
  month: string; // "YYYY-MM"
  totalPnL: string;
  winRate: string;
  totalTrades: string;
  winningTrades: string;
  losingTrades: string;
  profitFactor: string;
  maxDrawdown: string;
  initialBalance: string;
  accountSize: string;
  notes: string;
}

// Common prop-firm / trading account sizes offered as presets.
const ACCOUNT_SIZE_PRESETS = [5000, 10000, 25000, 50000, 100000, 150000, 200000];

const formatAccountSize = (value: number): string =>
  value >= 1000 ? `$${value / 1000}k` : `$${value}`;

interface BacktestFormProps {
  onSubmit: (data: BacktestFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<BacktestFormData>;
  loading?: boolean;
}

const currentMonth = (): string => {
  // Avoid Date.now-based defaults; leave empty so user picks the month.
  return "";
};

export const BacktestForm: React.FC<BacktestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<BacktestFormData>({
    name: initialData?.name || "",
    platform: initialData?.platform || "",
    symbol: initialData?.symbol || "",
    timeFrame: initialData?.timeFrame || "",
    month: initialData?.month || currentMonth(),
    totalPnL: initialData?.totalPnL || "",
    winRate: initialData?.winRate || "",
    totalTrades: initialData?.totalTrades || "",
    winningTrades: initialData?.winningTrades || "",
    losingTrades: initialData?.losingTrades || "",
    profitFactor: initialData?.profitFactor || "",
    maxDrawdown: initialData?.maxDrawdown || "",
    initialBalance: initialData?.initialBalance || "",
    accountSize: initialData?.accountSize || "",
    notes: initialData?.notes || "",
  });

  // Whether the account size dropdown is set to "Custom" (a non-preset value).
  const [customAccount, setCustomAccount] = useState<boolean>(() => {
    const v = initialData?.accountSize;
    return !!v && !ACCOUNT_SIZE_PRESETS.includes(Number(v));
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BacktestFormData, string>>>({});

  // Live return on the chosen account size: profit/loss as a % of account size.
  const accountSizeNum = parseFloat(formData.accountSize);
  const pnlNum = parseFloat(formData.totalPnL);
  const returnPct =
    Number.isFinite(accountSizeNum) &&
    accountSizeNum > 0 &&
    Number.isFinite(pnlNum)
      ? (pnlNum / accountSizeNum) * 100
      : null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof BacktestFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAccountSizeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value } = e.target;
    if (value === "custom") {
      setCustomAccount(true);
      setFormData((prev) => ({ ...prev, accountSize: "" }));
    } else {
      setCustomAccount(false);
      setFormData((prev) => ({ ...prev, accountSize: value }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BacktestFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Backtest name is required";
    }

    if (!formData.month.trim()) {
      newErrors.month = "Month is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Backtest" : "Add New Backtest"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="e.g., EURUSD Breakout"
            />
            <Input
              label="Month *"
              name="month"
              type="month"
              value={formData.month}
              onChange={handleInputChange}
              error={errors.month}
            />
            <Input
              label="Platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              placeholder="e.g., TradingView, MT4, Forex Tester"
            />
            <Input
              label="Symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder="e.g., EUR/USD, BTC/USD"
            />
            <Input
              label="Time Frame"
              name="timeFrame"
              value={formData.timeFrame}
              onChange={handleInputChange}
              placeholder="e.g., M15, H1, D1"
            />
            <Input
              label="Initial Balance"
              name="initialBalance"
              type="number"
              step="any"
              value={formData.initialBalance}
              onChange={handleInputChange}
              placeholder="e.g., 10000"
            />
            <Select
              label="Account Size"
              value={customAccount ? "custom" : formData.accountSize}
              onChange={handleAccountSizeSelect}
              placeholder="Select an account size"
              options={[
                ...ACCOUNT_SIZE_PRESETS.map((v) => ({
                  value: String(v),
                  label: `${formatAccountSize(v)} account`,
                })),
                { value: "custom", label: "Custom…" },
              ]}
            />
            {customAccount && (
              <Input
                label="Custom Account Size"
                name="accountSize"
                type="number"
                step="any"
                value={formData.accountSize}
                onChange={handleInputChange}
                placeholder="e.g., 75000"
              />
            )}
          </div>

          {/* Return on account size */}
          {returnPct !== null && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                {returnPct >= 0 ? "Profit" : "Loss"} on account size:
              </span>
              <span
                className={`text-sm font-semibold ${
                  returnPct >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {returnPct >= 0 ? "+" : ""}
                {returnPct.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Results */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Total PnL"
                name="totalPnL"
                type="number"
                step="any"
                value={formData.totalPnL}
                onChange={handleInputChange}
                placeholder="e.g., 1250.50"
              />
              <Input
                label="Win Rate (%)"
                name="winRate"
                type="number"
                step="any"
                value={formData.winRate}
                onChange={handleInputChange}
                placeholder="e.g., 62.5"
              />
              <Input
                label="Total Trades"
                name="totalTrades"
                type="number"
                step="1"
                value={formData.totalTrades}
                onChange={handleInputChange}
                placeholder="e.g., 48"
              />
              <Input
                label="Winning Trades"
                name="winningTrades"
                type="number"
                step="1"
                value={formData.winningTrades}
                onChange={handleInputChange}
                placeholder="e.g., 30"
              />
              <Input
                label="Losing Trades"
                name="losingTrades"
                type="number"
                step="1"
                value={formData.losingTrades}
                onChange={handleInputChange}
                placeholder="e.g., 18"
              />
              <Input
                label="Profit Factor"
                name="profitFactor"
                type="number"
                step="any"
                value={formData.profitFactor}
                onChange={handleInputChange}
                placeholder="e.g., 1.8"
              />
              <Input
                label="Max Drawdown (%)"
                name="maxDrawdown"
                type="number"
                step="any"
                value={formData.maxDrawdown}
                onChange={handleInputChange}
                placeholder="e.g., 12.4"
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
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
              placeholder="Observations, conditions, parameters used..."
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
              {initialData ? "Update Backtest" : "Add Backtest"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
