"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export interface AccountFormData {
  name: string;
  broker: string;
  accountType: string;
  initialBalance: string;
  currency: string;
}

interface AccountFormProps {
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<AccountFormData>;
  loading?: boolean;
}

const accountTypeOptions = [
  { value: "PAPER", label: "Paper Trading" },
  { value: "DEMO", label: "Demo Account" },
  { value: "LIVE", label: "Live Account" },
];

const currencyOptions = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
];

export const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    name: initialData?.name || "",
    broker: initialData?.broker || "",
    accountType: initialData?.accountType || "PAPER",
    initialBalance: initialData?.initialBalance || "",
    currency: initialData?.currency || "USD",
  });

  const [errors, setErrors] = useState<Partial<AccountFormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof AccountFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AccountFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Account name is required";
    }

    if (
      !formData.initialBalance ||
      isNaN(Number(formData.initialBalance)) ||
      Number(formData.initialBalance) < 0
    ) {
      newErrors.initialBalance = "Valid initial balance is required";
    }

    if (!formData.accountType) {
      newErrors.accountType = "Account type is required";
    }

    if (!formData.currency) {
      newErrors.currency = "Currency is required";
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
        <CardTitle>
          {initialData ? "Edit Trading Account" : "Add New Trading Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Account Name *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="e.g., Main Trading Account"
            />

            <Input
              label="Broker"
              name="broker"
              value={formData.broker}
              onChange={handleInputChange}
              placeholder="e.g., Interactive Brokers, TD Ameritrade"
            />

            <Select
              label="Account Type *"
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              options={accountTypeOptions}
              error={errors.accountType}
            />

            <Select
              label="Currency *"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              options={currencyOptions}
              error={errors.currency}
            />
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Initial Balance *"
              name="initialBalance"
              type="number"
              step="0.01"
              min="0"
              value={formData.initialBalance}
              onChange={handleInputChange}
              error={errors.initialBalance}
              placeholder="0.00"
            />

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Account Type Info:</strong>
                </p>
                <ul className="text-xs space-y-1">
                  <li>
                    <strong>Paper:</strong> Simulated trading with fake money
                  </li>
                  <li>
                    <strong>Demo:</strong> Broker demo account with virtual
                    funds
                  </li>
                  <li>
                    <strong>Live:</strong> Real money trading account
                  </li>
                </ul>
              </div>
            </div>
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
              {initialData ? "Update Account" : "Create Account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
