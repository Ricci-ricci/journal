'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

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
    name: initialData?.name || '',
    description: initialData?.description || '',
    entryRules: initialData?.entryRules || '',
    exitRules: initialData?.exitRules || '',
    riskManagementRules: initialData?.riskManagementRules || '',
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<StrategyFormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name as keyof StrategyFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StrategyFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Strategy name is required';
    }

    if (!formData.entryRules.trim()) {
      newErrors.entryRules = 'Entry rules are required';
    }

    if (!formData.exitRules.trim()) {
      newErrors.exitRules = 'Exit rules are required';
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
          {initialData ? 'Edit Trading Strategy' : 'Create New Trading Strategy'}
        </CardTitle>
      </CardHeader>
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Strategy
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Brief description of the strategy..."
            />
          </div>

          {/* Entry Rules */}
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
              Entry Rules *
            </label>
            <textarea
              name="entryRules"
              rows={4}
              value={formData.entryRules}
              onChange={handleInputChange}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.entryRules
                  ? 'ring-red-300 focus:ring-red-500'
                  : 'ring-gray-300 focus:ring-blue-600'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
              placeholder="Define when to enter trades:
• Technical indicators
• Chart patterns
• Market conditions
• Confirmation signals"
            />
            {errors.entryRules && (
              <p className="mt-2 text-sm text-red-600">{errors.entryRules}</p>
            )}
          </div>

          {/* Exit Rules */}
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
              Exit Rules *
            </label>
            <textarea
              name="exitRules"
              rows={4}
              value={formData.exitRules}
              onChange={handleInputChange}
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.exitRules
                  ? 'ring-red-300 focus:ring-red-500'
                  : 'ring-gray-300 focus:ring-blue-600'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
              placeholder="Define when to exit trades:
• Profit targets
• Stop loss levels
• Time-based exits
• Reversal signals"
            />
            {errors.exitRules && (
              <p className="mt-2 text-sm text-red-600">{errors.exitRules}</p>
            )}
          </div>

          {/* Risk Management Rules */}
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
              Risk Management Rules
            </label>
            <textarea
              name="riskManagementRules"
              rows={4}
              value={formData.riskManagementRules}
              onChange={handleInputChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Define risk management rules:
• Position sizing
• Maximum daily loss
• Risk per trade
• Portfolio allocation"
            />
          </div>

          {/* Strategy Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Strategy Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Be specific with your rules to avoid subjective decisions</li>
              <li>• Include measurable criteria (e.g., "RSI below 30")</li>
              <li>• Define position sizing and risk limits clearly</li>
              <li>• Consider different market conditions (trending vs. ranging)</li>
              <li>• Test your strategy on historical data before using it live</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {initialData ? 'Update Strategy' : 'Create Strategy'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
