"use client";

import React, { useState, useEffect } from "react";

import { Layout } from "../../components/layout/Layout";
import { JournalEntryForm } from "../../components/forms/JournalEntryForm";

import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  AddIconButton,
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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const entryTypeOptions = [
    { value: "", label: "All Types" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const response = await fetch("/api/journal-entries");
      const result = await response.json();
      if (result.success) {
        setEntries(result.data);
      } else {
        console.log("Failed to fetch strategies");
      }
    } catch (error) {
      console.error("Failed to fetch journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (formData: any) => {
    try {
      setSubmitting(true);

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        entryDate: formData.entryDate,
        entryType: formData.entryType,
        title: formData.title || null,
        content: formData.content || null,
        whatWentWell: formData.whatWentWell || null,
        whatWentWrong: formData.whatWentWrong || null,
        lessonsLearned: formData.lessonsLearned || null,
        goalsNextPeriod: formData.goalsNextPeriod || null,
        marketConditions: formData.marketConditions || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEntries((prev) => [newEntry, ...prev]);
      setShowForm(false);
      console.log("Journal entry created successfully");
    } catch (error) {
      console.error("Failed to create journal entry:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleUpdateEntry = async (formData: any) => {
    if (!editingEntry) return;

    try {
      setSubmitting(true);

      const updatedEntry: JournalEntry = {
        ...editingEntry,
        entryDate: formData.entryDate,
        entryType: formData.entryType,
        title: formData.title || null,
        content: formData.content || null,
        whatWentWell: formData.whatWentWell || null,
        whatWentWrong: formData.whatWentWrong || null,
        lessonsLearned: formData.lessonsLearned || null,
        goalsNextPeriod: formData.goalsNextPeriod || null,
        marketConditions: formData.marketConditions || null,
        updatedAt: new Date().toISOString(),
      };

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingEntry.id ? updatedEntry : entry,
        ),
      );

      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Failed to update journal entry:", error);
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
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      console.log("Journal entry deleted successfully");
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

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "DAILY":
        return "info";
      case "WEEKLY":
        return "warning";
      case "MONTHLY":
        return "success";
      default:
        return "default";
    }
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
      <Layout title={editingEntry ? "Edit Journal Entry" : "New Journal Entry"}>
        <div className="max-w-4xl">
          <JournalEntryForm
            onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
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

  return (
    <Layout title="Trading Journal">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Your Trading Journal
            </h2>
            <p className="text-sm text-muted-foreground">
              Reflect on your trading journey, document insights, and track your
              progress.
            </p>
          </div>
          <AddIconButton
            tooltip="New Entry"
            size="lg"
            onClick={() => setShowForm(true)}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search entries by title, content, or lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />
              </div>

              <div className="sm:w-48">
                <Select
                  options={entryTypeOptions}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  placeholder="Filter by type"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEntries.length} of {entries.length} entries
                {(searchTerm || filterType) && (
                  <span className="ml-1">(filtered)</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Journal Entries */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">
                {searchTerm || filterType
                  ? "No entries match your filters"
                  : "No journal entries"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || filterType
                  ? "Try adjusting your search or filter criteria."
                  : "Start documenting your trading journey by creating your first entry."}
              </p>
              {!searchTerm && !filterType && (
                <div className="mt-6">
                  <AddIconButton
                    tooltip="Write Your First Entry"
                    size="lg"
                    onClick={() => setShowForm(true)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge
                            variant={getTypeBadgeVariant(entry.entryType)}
                            size="sm"
                          >
                            {entry.entryType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(entry.entryDate)}
                          </span>
                        </div>
                        <CardTitle className="text-lg">
                          {entry.title || "Untitled Entry"}
                        </CardTitle>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ExpandIconButton
                        isExpanded={expandedEntry === entry.id}
                        size="sm"
                        onClick={() =>
                          setExpandedEntry(
                            expandedEntry === entry.id ? null : entry.id,
                          )
                        }
                      />
                      <EditIconButton
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      />
                      <DeleteIconButton
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Main Content */}
                    {entry.content && (
                      <div>
                        <p className="text-foreground leading-relaxed">
                          {expandedEntry === entry.id
                            ? entry.content
                            : truncateText(entry.content)}
                        </p>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {expandedEntry === entry.id && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                        {entry.whatWentWell && (
                          <div>
                            <h4 className="text-sm font-medium text-emerald-400 mb-2">
                              ✅ What Went Well
                            </h4>
                            <p className="text-sm text-foreground bg-emerald-500/10 p-3 rounded">
                              {entry.whatWentWell}
                            </p>
                          </div>
                        )}

                        {entry.whatWentWrong && (
                          <div>
                            <h4 className="text-sm font-medium text-red-400 mb-2">
                              ❌ What Went Wrong
                            </h4>
                            <p className="text-sm text-foreground bg-red-500/10 p-3 rounded">
                              {entry.whatWentWrong}
                            </p>
                          </div>
                        )}

                        {entry.lessonsLearned && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-400 mb-2">
                              💡 Lessons Learned
                            </h4>
                            <p className="text-sm text-foreground bg-blue-500/10 p-3 rounded">
                              {entry.lessonsLearned}
                            </p>
                          </div>
                        )}

                        {entry.goalsNextPeriod && (
                          <div>
                            <h4 className="text-sm font-medium text-purple-400 mb-2">
                              🎯 Goals Next Period
                            </h4>
                            <p className="text-sm text-foreground bg-purple-500/10 p-3 rounded">
                              {entry.goalsNextPeriod}
                            </p>
                          </div>
                        )}

                        {entry.marketConditions && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              📈 Market Conditions
                            </h4>
                            <p className="text-sm text-foreground bg-muted/50 p-3 rounded">
                              {entry.marketConditions}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Preview of lessons when collapsed */}
                    {expandedEntry !== entry.id && entry.lessonsLearned && (
                      <div className="border-l-4 border-blue-400 pl-4">
                        <h4 className="text-sm font-medium text-blue-400 mb-1">
                          Key Lesson
                        </h4>
                        <p className="text-sm text-muted-foreground italic">
                          {truncateText(entry.lessonsLearned, 100)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Journal Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Journal Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {entries.filter((e) => e.entryType === "DAILY").length}
                </div>
                <p className="text-sm text-muted-foreground">Daily Entries</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {entries.filter((e) => e.entryType === "WEEKLY").length}
                </div>
                <p className="text-sm text-muted-foreground">Weekly Reviews</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {entries.filter((e) => e.entryType === "MONTHLY").length}
                </div>
                <p className="text-sm text-muted-foreground">Monthly Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default JournalPage;
