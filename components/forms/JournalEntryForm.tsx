"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

interface JournalEntryFormData {
  entryDate: string;
  entryType: string;
  title: string;
  content: string;
  whatWentWell: string;
  whatWentWrong: string;
  lessonsLearned: string;
  goalsNextPeriod: string;
  marketConditions: string;
}

interface JournalEntryFormProps {
  onSubmit: (data: JournalEntryFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<JournalEntryFormData>;
  loading?: boolean;
}

const entryTypeOptions = [
  { value: "DAILY", label: "Daily Entry" },
  { value: "WEEKLY", label: "Weekly Review" },
  { value: "MONTHLY", label: "Monthly Analysis" },
];

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<JournalEntryFormData>({
    entryDate: initialData?.entryDate || new Date().toISOString().slice(0, 10),
    entryType: initialData?.entryType || "DAILY",
    title: initialData?.title || "",
    content: initialData?.content || "",
    whatWentWell: initialData?.whatWentWell || "",
    whatWentWrong: initialData?.whatWentWrong || "",
    lessonsLearned: initialData?.lessonsLearned || "",
    goalsNextPeriod: initialData?.goalsNextPeriod || "",
    marketConditions: initialData?.marketConditions || "",
  });

  const [errors, setErrors] = useState<Partial<JournalEntryFormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof JournalEntryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<JournalEntryFormData> = {};

    if (!formData.entryDate) {
      newErrors.entryDate = "Entry date is required";
    }

    if (!formData.entryType) {
      newErrors.entryType = "Entry type is required";
    }

    // At least one content field should be filled
    const hasContent =
      formData.title ||
      formData.content ||
      formData.whatWentWell ||
      formData.whatWentWrong ||
      formData.lessonsLearned ||
      formData.goalsNextPeriod ||
      formData.marketConditions;

    if (!hasContent) {
      newErrors.content = "Please fill in at least one content field";
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

  const getPlaceholderByType = (type: string) => {
    switch (type) {
      case "DAILY":
        return {
          title: "Today's Trading Summary",
          content: "Write about your trading session today...",
          whatWentWell: "What trades or decisions went well today?",
          whatWentWrong: "What mistakes or poor decisions were made?",
          lessonsLearned: "What did you learn from today's trading?",
          goalsNextPeriod: "What do you want to focus on tomorrow?",
          marketConditions: "How were the market conditions today?",
        };
      case "WEEKLY":
        return {
          title: "Weekly Trading Review",
          content: "Reflect on this week's trading performance...",
          whatWentWell: "What strategies or approaches worked this week?",
          whatWentWrong: "What patterns or mistakes need attention?",
          lessonsLearned: "Key insights from this week's trading?",
          goalsNextPeriod: "Goals and focus areas for next week?",
          marketConditions: "How did market conditions affect your trading?",
        };
      case "MONTHLY":
        return {
          title: "Monthly Performance Analysis",
          content: "Comprehensive review of this month's trading...",
          whatWentWell: "What strategies delivered consistent results?",
          whatWentWrong: "What major issues or drawdowns occurred?",
          lessonsLearned: "Major lessons and insights from this month?",
          goalsNextPeriod: "Strategic goals for next month?",
          marketConditions:
            "How did changing market conditions impact performance?",
        };
      default:
        return {
          title: "Trading Journal Entry",
          content: "Write your thoughts and analysis...",
          whatWentWell: "What went well?",
          whatWentWrong: "What could be improved?",
          lessonsLearned: "What did you learn?",
          goalsNextPeriod: "Goals for next period?",
          marketConditions: "Market conditions and impact?",
        };
    }
  };

  const placeholders = getPlaceholderByType(formData.entryType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Journal Entry" : "New Journal Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Entry Date *"
              name="entryDate"
              type="date"
              value={formData.entryDate}
              onChange={handleInputChange}
              error={errors.entryDate}
            />

            <Select
              label="Entry Type *"
              name="entryType"
              value={formData.entryType}
              onChange={handleInputChange}
              options={entryTypeOptions}
              error={errors.entryType}
            />
          </div>

          {/* Title */}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={placeholders.title}
          />

          {/* Main Content */}
          <div>
            <label className="block text-sm font-medium leading-6 text-foreground mb-2">
              Main Content
            </label>
            <textarea
              name="content"
              rows={4}
              value={formData.content}
              onChange={handleInputChange}
              className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
              placeholder={placeholders.content}
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Reflection Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Went Well */}
            <div>
              <label className="block text-sm font-medium leading-6 text-foreground mb-2">
                What Went Well
              </label>
              <textarea
                name="whatWentWell"
                rows={3}
                value={formData.whatWentWell}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
                placeholder={placeholders.whatWentWell}
              />
            </div>

            {/* What Went Wrong */}
            <div>
              <label className="block text-sm font-medium leading-6 text-foreground mb-2">
                What Went Wrong
              </label>
              <textarea
                name="whatWentWrong"
                rows={3}
                value={formData.whatWentWrong}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
                placeholder={placeholders.whatWentWrong}
              />
            </div>
          </div>

          {/* Lessons and Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lessons Learned */}
            <div>
              <label className="block text-sm font-medium leading-6 text-foreground mb-2">
                Lessons Learned
              </label>
              <textarea
                name="lessonsLearned"
                rows={3}
                value={formData.lessonsLearned}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
                placeholder={placeholders.lessonsLearned}
              />
            </div>

            {/* Goals Next Period */}
            <div>
              <label className="block text-sm font-medium leading-6 text-foreground mb-2">
                Goals for Next{" "}
                {formData.entryType === "DAILY"
                  ? "Day"
                  : formData.entryType === "WEEKLY"
                    ? "Week"
                    : "Month"}
              </label>
              <textarea
                name="goalsNextPeriod"
                rows={3}
                value={formData.goalsNextPeriod}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
                placeholder={placeholders.goalsNextPeriod}
              />
            </div>
          </div>

          {/* Market Conditions */}
          <div>
            <label className="block text-sm font-medium leading-6 text-foreground mb-2">
              Market Conditions & Analysis
            </label>
            <textarea
              name="marketConditions"
              rows={3}
              value={formData.marketConditions}
              onChange={handleInputChange}
              className="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6"
              placeholder={placeholders.marketConditions}
            />
          </div>

          {/* Journal Tips */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4">
            <h4 className="text-sm font-medium text-emerald-400 mb-2">
              {formData.entryType === "DAILY"
                ? "Daily"
                : formData.entryType === "WEEKLY"
                  ? "Weekly"
                  : "Monthly"}{" "}
              Journal Tips
            </h4>
            <ul className="text-xs text-emerald-400 space-y-1">
              {formData.entryType === "DAILY" && (
                <>
                  <li>• Record your emotional state during key trades</li>
                  <li>• Note any deviations from your trading plan</li>
                  <li>• Document market news that affected your decisions</li>
                  <li>
                    • Review your P&L and identify the biggest contributors
                  </li>
                </>
              )}
              {formData.entryType === "WEEKLY" && (
                <>
                  <li>• Analyze patterns in your trading decisions</li>
                  <li>• Review which strategies performed best/worst</li>
                  <li>• Set specific goals for the upcoming week</li>
                  <li>• Document any changes to your trading plan</li>
                </>
              )}
              {formData.entryType === "MONTHLY" && (
                <>
                  <li>• Compare actual vs. expected performance</li>
                  <li>• Identify seasonal patterns or trends</li>
                  <li>• Update risk management rules if needed</li>
                  <li>• Plan strategic changes for next month</li>
                </>
              )}
            </ul>
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
              {initialData ? "Update Entry" : "Save Entry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
