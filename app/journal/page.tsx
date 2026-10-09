"use client";

interface JournalFormData {
  entryDate: string;
  entryType: string;
  title?: string;
  content?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lessonsLearned?: string;
  goalsNextPeriod?: string;
  marketConditions?: string;
}

import React, { useState, useEffect, useCallback } from "react";

import { Layout } from "../../components/layout/Layout";
import { JournalEntryForm } from "../../components/forms/JournalEntryForm";
import { useAuth } from "../../contexts/AuthContext";

import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Stat";
import {
  EditIconButton,
  DeleteIconButton,
  ExpandIconButton,
} from "../../components/ui/IconButton";

interface JournalEntry {
  id: string;
  entryDate: string;
  entryType: "DAILY" | "WEEKLY" | "MONTHLY";
  title: string | null;
  content: string | null;
  whatWentWell: string | null;
  whatWentWrong: string | null;
  lessonsLearned: string | null;
  goalsNextPeriod: string | null;
  marketConditions: string | null;
  createdAt: string;
  updatedAt: string;
}

const JournalPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const entryTypeOptions = [
    { value: "", label: "All types" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
  ];

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/journal-entries?userId=${user.id}`);
      const result = await response.json();
      if (result.success) {
        setEntries(result.data);
      } else {
        console.error("Failed to fetch journal entries:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch journal entries:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleCreateEntry = async (formData: JournalFormData) => {
    if (!user) return;
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchEntries();
        setShowForm(false);
      } else {
        setErrorMsg(result.error || "Failed to create journal entry.");
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to create journal entry:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleUpdateEntry = async (formData: JournalFormData) => {
    if (!editingEntry) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await fetch(`/api/journal-entries/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryDate: new Date(formData.entryDate).toISOString(),
          entryType: formData.entryType || "DAILY",
          title: formData.title?.trim() || null,
          content: formData.content?.trim() || null,
          whatWentWell: formData.whatWentWell?.trim() || null,
          whatWentWrong: formData.whatWentWrong?.trim() || null,
          lessonsLearned: formData.lessonsLearned?.trim() || null,
          goalsNextPeriod: formData.goalsNextPeriod?.trim() || null,
          marketConditions: formData.marketConditions?.trim() || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchEntries();
        setShowForm(false);
        setEditingEntry(null);
      } else {
        setErrorMsg(result.error || "Failed to update journal entry.");
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to update journal entry:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this journal entry? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/journal-entries/${entryId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      } else {
        console.error("Failed to delete journal entry:", result.error);
        alert(result.error || "Failed to delete journal entry.");
      }
    } catch (error) {
      console.error("Failed to delete journal entry:", error);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      (entry.title &&
        entry.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.content &&
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.lessonsLearned &&
        entry.lessonsLearned.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || entry.entryType === filterType;

    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (
    text: string | null,
    maxLength: number = 150,
  ): string => {
    if (!text) return "";
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  if (showForm) {
    return (
      <Layout title={editingEntry ? "Edit entry" : "New entry"}>
        <div className="max-w-3xl">
          {errorMsg && (
            <div className="mb-4 bg-loss/10 border border-loss/30 rounded-md p-4 text-sm text-loss">
              {errorMsg}
            </div>
          )}
          <JournalEntryForm
            onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
              setErrorMsg(null);
            }}
            initialData={
              editingEntry
                ? {
                    entryDate: editingEntry.entryDate,
                    entryType: editingEntry.entryType,
                    title: editingEntry.title || "",
                    content: editingEntry.content || "",
                    whatWentWell: editingEntry.whatWentWell || "",
                    whatWentWrong: editingEntry.whatWentWrong || "",
                    lessonsLearned: editingEntry.lessonsLearned || "",
                    goalsNextPeriod: editingEntry.goalsNextPeriod || "",
                    marketConditions: editingEntry.marketConditions || "",
                  }
                : undefined
            }
            loading={submitting}
          />
        </div>
      </Layout>
    );
  }

  const hasFilters = Boolean(searchTerm || filterType);

  return (
    <Layout
      title="Journal"
      headerRight={
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search entries..."
        />
      }
    >
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              aria-label="Entry type"
              options={entryTypeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
          <p className="text-[13px] text-muted-foreground">
            {loading
              ? "Loading…"
              : hasFilters
                ? `${filteredEntries.length} of ${entries.length} entries`
                : `${entries.length} entr${entries.length !== 1 ? "ies" : "y"}`}
          </p>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            New entry
          </Button>
        </div>

        {loading ? (
          <div className="mt-6 border-t border-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-border py-6 space-y-3">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-5 w-1/2 rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={hasFilters ? "No entries match" : "Nothing written yet"}
              action={
                !hasFilters && (
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    Write the first entry
                  </Button>
                )
              }
            >
              {hasFilters
                ? "Try a different search or entry type."
                : "A few lines after each session is enough to start."}
            </EmptyState>
          </div>
        ) : (
          <div className="mt-6 border-t border-border">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedEntry === entry.id;
              const sections = [
                { label: "What went well", text: entry.whatWentWell },
                { label: "What went wrong", text: entry.whatWentWrong },
                { label: "Lessons", text: entry.lessonsLearned },
                { label: "Next period", text: entry.goalsNextPeriod },
                { label: "Market conditions", text: entry.marketConditions },
              ].filter((x) => x.text);

              return (
                <article
                  key={entry.id}
                  className="group border-b border-border py-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="label">
                        {formatDate(entry.entryDate)} ·{" "}
                        {entry.entryType.toLowerCase()}
                      </p>
                      <h2 className="mt-1.5 font-heading text-2xl leading-tight text-foreground">
                        {entry.title || "Untitled entry"}
                      </h2>
                    </div>
                    <div className="flex items-center flex-shrink-0 -mr-1.5">
                      <ExpandIconButton
                        isExpanded={isExpanded}
                        size="md"
                        onClick={() =>
                          setExpandedEntry(isExpanded ? null : entry.id)
                        }
                      />
                      <EditIconButton
                        size="md"
                        onClick={() => handleEditEntry(entry)}
                      />
                      <DeleteIconButton
                        size="md"
                        onClick={() => handleDeleteEntry(entry.id)}
                      />
                    </div>
                  </div>

                  {entry.content && (
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
                      {isExpanded ? entry.content : truncateText(entry.content)}
                    </p>
                  )}

                  {isExpanded && sections.length > 0 && (
                    <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      {sections.map((x) => (
                        <div key={x.label}>
                          <dt className="label">{x.label}</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                            {x.text}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {!isExpanded && entry.lessonsLearned && (
                    <p className="mt-3 border-l border-foreground/30 pl-3 text-sm text-muted-foreground">
                      {truncateText(entry.lessonsLearned, 100)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JournalPage;
