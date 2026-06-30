"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../components/layout/Layout";
import { BacktestForm, BacktestFormData } from "../../components/forms/BacktestForm";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
} from "../../components/ui/IconButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

interface Backtest {
  id: string;
  name: string;
  platform: string | null;
  symbol: string | null;
  timeFrame: string | null;
  periodMonth: string;
  totalPnL: number | null;
  winRate: number | null;
  totalTrades: number;
  winningTrades: number | null;
  losingTrades: number | null;
  profitFactor: number | null;
  maxDrawdown: number | null;
  initialBalance: number | null;
  accountSize: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const BacktestPage: React.FC = () => {
  const { user } = useAuth();
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Backtest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBacktests = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/backtests?userId=${user.id}`);
      const result = await response.json();
      if (result.success) {
        setBacktests(result.data);
      } else {
        console.error("Failed to fetch backtests:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch backtests:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBacktests();
  }, [fetchBacktests]);

  const handleCreate = async (formData: BacktestFormData) => {
    if (!user) return;
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await fetch("/api/backtests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchBacktests();
        setShowForm(false);
      } else {
        setErrorMsg(result.error || "Failed to create backtest.");
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to create backtest:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData: BacktestFormData) => {
    if (!editing) return;
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await fetch(`/api/backtests/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchBacktests();
        setShowForm(false);
        setEditing(null);
      } else {
        setErrorMsg(result.error || "Failed to update backtest.");
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to update backtest:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (backtest: Backtest) => {
    setEditing(backtest);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this backtest? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/backtests/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setBacktests((prev) => prev.filter((b) => b.id !== id));
      } else {
        console.error("Failed to delete backtest:", result.error);
        alert(result.error || "Failed to delete backtest.");
      }
    } catch (error) {
      console.error("Failed to delete backtest:", error);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatCurrency = (amount: number | null): string => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercent = (percent: number | null): string => {
    if (percent === null || percent === undefined) return "—";
    return `${percent.toFixed(1)}%`;
  };

  const formatAccountSize = (value: number | null): string => {
    if (value === null || value === undefined) return "—";
    return value >= 1000 ? `$${value / 1000}k` : `$${value}`;
  };

  // Profit/loss as a percentage of the account size the backtest ran on.
  const returnOnAccount = (b: Backtest): number | null => {
    if (!b.accountSize || b.accountSize <= 0 || b.totalPnL === null) return null;
    return (b.totalPnL / b.accountSize) * 100;
  };

  const formatMonth = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

  const monthInputValue = (dateString: string): string => {
    const d = new Date(dateString);
    const month = `${d.getUTCMonth() + 1}`.padStart(2, "0");
    return `${d.getUTCFullYear()}-${month}`;
  };

  const filtered = backtests.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.platform && b.platform.toLowerCase().includes(q)) ||
      (b.symbol && b.symbol.toLowerCase().includes(q))
    );
  });

  // ─── Aggregate stats ──────────────────────────────────────────────────────
  const totalPnL = backtests.reduce((sum, b) => sum + (b.totalPnL ?? 0), 0);
  const totalTrades = backtests.reduce((sum, b) => sum + (b.totalTrades ?? 0), 0);
  const winRateValues = backtests.filter((b) => b.winRate !== null);
  const avgWinRate =
    winRateValues.length > 0
      ? winRateValues.reduce((sum, b) => sum + (b.winRate ?? 0), 0) /
        winRateValues.length
      : null;

  // ─── Form view ────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <Layout title={editing ? "Edit Backtest" : "Add New Backtest"}>
        <div className="max-w-4xl">
          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-md p-4 text-sm text-red-400">
              {errorMsg}
            </div>
          )}
          <BacktestForm
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              setErrorMsg(null);
            }}
            initialData={
              editing
                ? {
                    name: editing.name,
                    platform: editing.platform || "",
                    symbol: editing.symbol || "",
                    timeFrame: editing.timeFrame || "",
                    month: monthInputValue(editing.periodMonth),
                    totalPnL: editing.totalPnL?.toString() || "",
                    winRate: editing.winRate?.toString() || "",
                    totalTrades: editing.totalTrades?.toString() || "",
                    winningTrades: editing.winningTrades?.toString() || "",
                    losingTrades: editing.losingTrades?.toString() || "",
                    profitFactor: editing.profitFactor?.toString() || "",
                    maxDrawdown: editing.maxDrawdown?.toString() || "",
                    initialBalance: editing.initialBalance?.toString() || "",
                    accountSize: editing.accountSize?.toString() || "",
                    notes: editing.notes || "",
                  }
                : undefined
            }
            loading={submitting}
          />
        </div>
      </Layout>
    );
  }

  // ─── List view ────────────────────────────────────────────────────────────
  return (
    <Layout title="Backtests">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Your Backtests
            </h2>
            <p className="text-sm text-muted-foreground">
              Store and track backtests you ran on other platforms — monthly
              PnL, win rate and more.
            </p>
          </div>
          <AddIconButton
            tooltip="Add Backtest"
            size="lg"
            onClick={() => setShowForm(true)}
          />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                Total Backtests
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {backtests.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                Total PnL
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatCurrency(totalPnL)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Win Rate
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatPercent(avgWinRate)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                Total Trades
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {totalTrades}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent>
            <Input
              placeholder="Search by name, platform or symbol..."
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
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filtered.length} of {backtests.length} backtests
              {searchTerm && <span className="ml-1">(filtered)</span>}
            </p>
          </CardContent>
        </Card>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">
                {searchTerm ? "No backtests match your search" : "No backtests yet"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search."
                  : "Get started by adding your first backtest."}
              </p>
              {!searchTerm && (
                <div className="mt-6 flex justify-center">
                  <AddIconButton
                    tooltip="Add Your First Backtest"
                    size="lg"
                    onClick={() => setShowForm(true)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((b) => (
              <Card
                key={b.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                      <CardTitle>{b.name}</CardTitle>
                      <Badge variant="info">{formatMonth(b.periodMonth)}</Badge>
                      {b.platform && (
                        <Badge variant="secondary">{b.platform}</Badge>
                      )}
                      {b.symbol && <Badge variant="default">{b.symbol}</Badge>}
                      {b.timeFrame && (
                        <Badge variant="default">{b.timeFrame}</Badge>
                      )}
                      {b.accountSize !== null && (
                        <Badge variant="secondary">
                          {formatAccountSize(b.accountSize)} account
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <EditIconButton size="sm" onClick={() => handleEdit(b)} />
                      <DeleteIconButton
                        size="sm"
                        onClick={() => handleDelete(b.id)}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total PnL</p>
                      <p
                        className={`text-sm font-semibold mt-0.5 ${
                          (b.totalPnL ?? 0) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(b.totalPnL)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Return (% acct)
                      </p>
                      {(() => {
                        const ret = returnOnAccount(b);
                        return (
                          <p
                            className={`text-sm font-semibold mt-0.5 ${
                              ret === null
                                ? "text-foreground"
                                : ret >= 0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                            }`}
                          >
                            {ret === null
                              ? "—"
                              : `${ret >= 0 ? "+" : ""}${ret.toFixed(2)}%`}
                          </p>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p
                        className={`text-sm font-semibold mt-0.5 ${
                          b.winRate !== null && b.winRate >= 50
                            ? "text-emerald-400"
                            : "text-foreground"
                        }`}
                      >
                        {formatPercent(b.winRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Trades</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {b.totalTrades || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">W / L</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {b.winningTrades ?? "—"} / {b.losingTrades ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Profit Factor
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {b.profitFactor !== null
                          ? b.profitFactor.toFixed(2)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Max Drawdown
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {formatPercent(b.maxDrawdown)}
                      </p>
                    </div>
                  </div>

                  {b.notes && (
                    <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                      <pre className="whitespace-pre-wrap font-sans">
                        {b.notes}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BacktestPage;
