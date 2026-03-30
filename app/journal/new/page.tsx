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
    <Layout title="New Journal Entry">
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="/journal"
                className="inline-flex items-center text-sm font-medium text-foreground hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Journal
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-muted-foreground md:ml-2">
                  New Entry
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-start space-x-3">
            <svg
              className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-400">
                Error creating entry
              </h3>
              <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tips Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-emerald-400">
                Benefits of Regular Journaling
              </h3>
              <div className="mt-2 text-sm text-emerald-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Track patterns in your trading behavior and emotions</li>
                  <li>Document lessons learned to avoid repeating mistakes</li>
                  <li>Set and review goals to maintain focus and direction</li>
                  <li>Analyze market conditions impact on your performance</li>
                  <li>Build self-awareness and emotional intelligence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

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
