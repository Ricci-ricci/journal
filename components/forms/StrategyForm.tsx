"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent } from "../ui/Card";

interface StrategyFormData {
  name: string;
  description: string;
  entryRules: string;
  exitRules: string;
  riskManagementRules: string;
  isActive: boolean;
}

interface StrategyFormProps {
  onSubmit: (data: StrategyFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<StrategyFormData>;
  loading?: boolean;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<StrategyFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    entryRules: initialData?.entryRules || "",
    exitRules: initialData?.exitRules || "",
    riskManagementRules: initialData?.riskManagementRules || "",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<StrategyFormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name as keyof StrategyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StrategyFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Strategy name is required";
    }

    if (!formData.entryRules.trim()) {
      newErrors.entryRules = "Entry rules are required";
    }

    if (!formData.exitRules.trim()) {
      newErrors.exitRules = "Exit rules are required";
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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Strategy Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Strategy Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="e.g., Breakout Strategy v1"
            />

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-foreground focus:ring-ring border-border rounded"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-foreground"
              >
                Active Strategy
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-foreground/30 focus:outline-none focus:border-foreground/60 focus:ring-2 focus:ring-ring/25"
              placeholder="Brief description of the strategy..."
            />
          </div>

          {/* Entry Rules */}
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Entry Rules *
            </label>
            <textarea
              name="entryRules"
              rows={4}
              value={formData.entryRules}
              onChange={handleInputChange}
              className={`block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ${
                errors.entryRules
                  ? "ring-destructive focus:ring-destructive"
                  : "ring-border focus:ring-ring"
              } placeholder:text-muted-foreground focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
              placeholder="Define when to enter trades:
• Technical indicators
• Chart patterns
• Market conditions
• Confirmation signals"
            />
            {errors.entryRules && (
              <p className="mt-1.5 text-xs text-loss">{errors.entryRules}</p>
            )}
          </div>

          {/* Exit Rules */}
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Exit Rules *
            </label>
            <textarea
              name="exitRules"
              rows={4}
              value={formData.exitRules}
              onChange={handleInputChange}
              className={`block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ${
                errors.exitRules
                  ? "ring-destructive focus:ring-destructive"
                  : "ring-border focus:ring-ring"
              } placeholder:text-muted-foreground focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
              placeholder="Define when to exit trades:
• Profit targets
• Stop loss levels
• Time-based exits
• Reversal signals"
            />
            {errors.exitRules && (
              <p className="mt-1.5 text-xs text-loss">{errors.exitRules}</p>
            )}
          </div>

          {/* Risk Management Rules */}
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Risk Management Rules
            </label>
            <textarea
              name="riskManagementRules"
              rows={4}
              value={formData.riskManagementRules}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-foreground/30 focus:outline-none focus:border-foreground/60 focus:ring-2 focus:ring-ring/25"
              placeholder="Define risk management rules:
• Position sizing
• Maximum daily loss
• Risk per trade
• Portfolio allocation"
            />
          </div>

          {/* Strategy Tips */}
          <div className="bg-muted border border-foreground/30 rounded-md p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Strategy Tips
            </h4>
            <ul className="text-xs text-foreground space-y-1">
              <li>
                • Be specific with your rules to avoid subjective decisions
              </li>
              <li>• Include measurable criteria (e.g., "RSI below 30")</li>
              <li>• Define position sizing and risk limits clearly</li>
              <li>
                • Consider different market conditions (trending vs. ranging)
              </li>
              <li>
                • Test your strategy on historical data before using it live
              </li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2">
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
              {initialData ? "Update Strategy" : "Create Strategy"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
