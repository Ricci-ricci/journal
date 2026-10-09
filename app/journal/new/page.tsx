"use client";

interface JournalFormData {
  entryDate: string;
  entryType?: string;
  title?: string;
  content?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lessonsLearned?: string;
  goalsNextPeriod?: string;
  marketConditions?: string;
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "../../../components/layout/Layout";
import { JournalEntryForm } from "../../../components/forms/JournalEntryForm";
import { useAuth } from "../../../contexts/AuthContext";

const NewJournalEntryPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: JournalFormData) => {
    if (!user) {
      setErrorMessage("You must be logged in to create a journal entry.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Build the payload matching the /api/journal-entries POST schema
      const payload = {
        userId: user.id,
        entryDate: new Date(formData.entryDate).toISOString(),
        entryType: formData.entryType || "DAILY",
        title: formData.title?.trim() || null,
        content: formData.content?.trim() || null,
        whatWentWell: formData.whatWentWell?.trim() || null,
        whatWentWrong: formData.whatWentWrong?.trim() || null,
        lessonsLearned: formData.lessonsLearned?.trim() || null,
        goalsNextPeriod: formData.goalsNextPeriod?.trim() || null,
        marketConditions: formData.marketConditions?.trim() || null,
      };

      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Successfully created — redirect to journal list
        router.push("/journal");
      } else {
        // API returned an error (e.g. duplicate entry, validation)
        const message = result.error || "Failed to create journal entry.";
        setErrorMessage(message);
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to create journal entry:", error);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout title="New entry">
      <div className="max-w-3xl">
        <Link
          href="/journal"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Journal
        </Link>

        {/* Error Banner */}
        {errorMessage && (
          <p
            role="alert"
            className="mb-5 rounded-md border border-loss/40 bg-loss/10 px-3 py-2.5 text-sm text-loss"
          >
            {errorMessage}
          </p>
        )}

        {/* Journal Entry Form */}
        <JournalEntryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default NewJournalEntryPage;
