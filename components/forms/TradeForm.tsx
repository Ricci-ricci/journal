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
  stopLoss: string;
  takeProfit: string;
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
    stopLoss: initialData?.stopLoss || "",
    takeProfit: initialData?.takeProfit || "",
    setupType: initialData?.setupType || "",
    timeFrame: initialData?.timeFrame || "",
    notes: initialData?.notes || "",
    confidenceLevel: initialData?.confidenceLevel || "",
    emotionalState: initialData?.emotionalState || "",
  });

  const [errors, setErrors] = useState<Partial<TradeFormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof TradeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

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

          {/* Trade Details */}
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
            <div></div> {/* Empty cell for grid alignment */}
          </div>

          {/* Risk Management */}
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
          </div>

          {/* Costs */}
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

          {/* Strategy Information */}
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

          {/* Psychology */}
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
