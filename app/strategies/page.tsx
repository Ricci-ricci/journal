"use client";

interface StrategyFormData {
  name: string;
  description?: string;
  entryRules?: string;
  exitRules?: string;
  riskManagementRules?: string;
  isActive: boolean;
}

import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../components/layout/Layout";
import { StrategyForm } from "../../components/forms/StrategyForm";
import { Button } from "../../components/ui/Button";
import { Plus } from "lucide-react";
import {
  EditIconButton,
  DeleteIconButton,
  ActivateIconButton,
} from "../../components/ui/IconButton";
import { EmptyState, Segmented } from "../../components/ui/Stat";
import { SearchInput } from "../../components/ui/SearchInput";
import { useAuth } from "../../contexts/AuthContext";

interface Strategy {
  id: string;
  name: string;
  description: string | null;
  entryRules: string | null;
  exitRules: string | null;
  riskManagementRules: string | null;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
  averageProfit: number | null;
  averageLoss: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const StrategiesPage: React.FC = () => {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/strategies?userId=${user.id}`);
      const result = await response.json();
      if (result.success) {
        setStrategies(result.data);
      } else {
        console.error("Failed to fetch strategies:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleCreateStrategy = async (formData: StrategyFormData) => {
    if (!user) return;
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          description: formData.description || null,
          entryRules: formData.entryRules || null,
          exitRules: formData.exitRules || null,
          riskManagementRules: formData.riskManagementRules || null,
          isActive: formData.isActive ?? true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchStrategies();
        setShowForm(false);
      } else {
        setErrorMsg(result.error || "Failed to create strategy.");
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to create strategy:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setShowForm(true);
  };

  const handleUpdateStrategy = async (formData: StrategyFormData) => {
    if (!editingStrategy) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await fetch(`/api/strategies/${editingStrategy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          entryRules: formData.entryRules || null,
          exitRules: formData.exitRules || null,
          riskManagementRules: formData.riskManagementRules || null,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchStrategies();
        setShowForm(false);
        setEditingStrategy(null);
      } else {
        setErrorMsg(result.error || "Failed to update strategy.");
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to update strategy:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this strategy? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setStrategies((prev) => prev.filter((s) => s.id !== strategyId));
      } else {
        console.error("Failed to delete strategy:", result.error);
        alert(result.error || "Failed to delete strategy.");
      }
    } catch (error) {
      console.error("Failed to delete strategy:", error);
    }
  };

  const handleToggleActive = async (strategy: Strategy) => {
    try {
      const response = await fetch(`/api/strategies/${strategy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !strategy.isActive }),
      });

      const result = await response.json();

      if (result.success) {
        setStrategies((prev) =>
          prev.map((s) =>
            s.id === strategy.id
              ? {
                  ...s,
                  isActive: !s.isActive,
                  updatedAt: result.data.updatedAt,
                }
              : s,
          ),
        );
      } else {
        console.error("Failed to toggle strategy status:", result.error);
      }
    } catch (error) {
      console.error("Failed to toggle strategy status:", error);
    }
  };

  const filteredStrategies = strategies.filter((strategy) => {
    const matchesSearch =
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (strategy.description &&
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterActive === null || strategy.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  const formatPercent = (percent: number | null): string => {
    if (percent === null) return "—";
    return `${percent.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (showForm) {
    return (
      <Layout title={editingStrategy ? "Edit strategy" : "New strategy"}>
        <div className="mx-auto max-w-3xl">
          {errorMsg && (
            <div className="mb-4 bg-loss/10 border border-loss/30 rounded-xl px-4 py-3 text-sm text-loss">
              {errorMsg}
            </div>
          )}
          <StrategyForm
            onSubmit={
              editingStrategy ? handleUpdateStrategy : handleCreateStrategy
            }
            onCancel={() => {
              setShowForm(false);
              setEditingStrategy(null);
              setErrorMsg(null);
            }}
            initialData={
              editingStrategy
                ? {
                    name: editingStrategy.name,
                    description: editingStrategy.description || "",
                    entryRules: editingStrategy.entryRules || "",
                    exitRules: editingStrategy.exitRules || "",
                    riskManagementRules:
                      editingStrategy.riskManagementRules || "",
                    isActive: editingStrategy.isActive,
                  }
                : undefined
            }
            loading={submitting}
          />
        </div>
      </Layout>
    );
  }

  const hasFilters = Boolean(searchTerm) || filterActive !== null;

  return (
    <Layout
      title="Strategies"
      headerRight={
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search strategies..."
        />
      }
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            options={[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            value={
              filterActive === null
                ? "all"
                : filterActive
                  ? "active"
                  : "inactive"
            }
            onChange={(v) => setFilterActive(v === "all" ? null : v === "active")}
          />
          <p className="text-[13px] text-muted-foreground">
            {loading
              ? "Loading…"
              : hasFilters
                ? `${filteredStrategies.length} of ${strategies.length}`
                : `${strategies.length} strateg${strategies.length !== 1 ? "ies" : "y"}`}
          </p>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            New strategy
          </Button>
        </div>

        {loading ? (
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="panel p-5 sm:p-6 space-y-3 animate-pulse">
                <div className="h-5 w-1/3 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredStrategies.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title={hasFilters ? "No strategies match" : "No strategies yet"}
              action={
                !hasFilters && (
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    Write down a setup
                  </Button>
                )
              }
            >
              {hasFilters
                ? "Try a different search or filter."
                : "Describe a setup once, then tag trades with it to see how it does."}
            </EmptyState>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            {filteredStrategies.map((strategy) => {
              const rules = [
                { label: "Entry", text: strategy.entryRules },
                { label: "Exit", text: strategy.exitRules },
                { label: "Risk", text: strategy.riskManagementRules },
              ];

              return (
                <article
                  key={strategy.id}
                  className={`panel p-5 sm:p-6 ${
                    strategy.isActive ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="flex flex-wrap items-center gap-2.5 font-heading text-lg leading-snug text-foreground">
                        {strategy.name}
                        <span
                          className={`chip ${
                            strategy.isActive
                              ? "border-profit/25 bg-profit/10 text-profit"
                              : ""
                          }`}
                        >
                          {strategy.isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                          {strategy.isActive ? "active" : "inactive"}
                        </span>
                      </h2>
                      {strategy.description && (
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {strategy.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center flex-shrink-0 -mr-1.5">
                      <ActivateIconButton
                        isActive={strategy.isActive}
                        size="md"
                        onClick={() => handleToggleActive(strategy)}
                      />
                      <EditIconButton
                        size="md"
                        onClick={() => handleEditStrategy(strategy)}
                      />
                      <DeleteIconButton
                        size="md"
                        onClick={() => handleDeleteStrategy(strategy.id)}
                      />
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
                    {[
                      { l: "Trades", v: strategy.totalTrades, c: "" },
                      { l: "Win rate", v: formatPercent(strategy.winRate), c: "" },
                      {
                        l: "Avg win",
                        v: formatCurrency(strategy.averageProfit),
                        c: strategy.averageProfit ? "text-profit" : "",
                      },
                      {
                        l: "Avg loss",
                        v: formatCurrency(strategy.averageLoss),
                        c: strategy.averageLoss ? "text-loss" : "",
                      },
                    ].map((m) => (
                      <div key={m.l} className="bg-card px-3.5 py-3">
                        <dt className="label">{m.l}</dt>
                        <dd
                          className={`num mt-1 text-base font-semibold text-foreground ${m.c}`}
                        >
                          {m.v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {rules.some((r) => r.text) && (
                    <dl className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                      {rules.map(
                        (r) =>
                          r.text && (
                            <div key={r.label}>
                              <dt className="label">{r.label}</dt>
                              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                {r.text}
                              </dd>
                            </div>
                          ),
                      )}
                    </dl>
                  )}

                  <p className="mt-5 border-t border-border pt-3.5 text-xs text-muted-foreground">
                    Updated {formatDate(strategy.updatedAt)}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StrategiesPage;
