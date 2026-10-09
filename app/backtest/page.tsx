"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../components/layout/Layout";
import { BacktestForm, BacktestFormData } from "../../components/forms/BacktestForm";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  EditIconButton,
  DeleteIconButton,
} from "../../components/ui/IconButton";
import { EmptyState, Stat, StatRow, pnlTone } from "../../components/ui/Stat";
import { SearchInput } from "../../components/ui/SearchInput";
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

  // ─── Account returns ──────────────────────────────────────────────────────
  // Every backtest that has a computable return on its account.
  const accountReturns = backtests
    .map((b) => ({ backtest: b, ret: returnOnAccount(b) }))
    .filter((r): r is { backtest: Backtest; ret: number } => r.ret !== null);

  // Combined return: the sum of every account's return percentage.
  const combinedReturn = accountReturns.reduce((sum, r) => sum + r.ret, 0);

  const formatSignedPercent = (value: number): string =>
    `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

  // ─── Form view ────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <Layout title={editing ? "Edit backtest" : "New backtest"}>
        <div className="mx-auto max-w-3xl">
          {errorMsg && (
            <div className="mb-4 bg-loss/10 border border-loss/30 rounded-xl px-4 py-3 text-sm text-loss">
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
  const th = "label px-4 first:pl-5 py-2.5 whitespace-nowrap";
  const td = "px-4 first:pl-5 py-3.5 align-top whitespace-nowrap";

  return (
    <Layout
      title="Backtests"
      headerRight={
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Name, platform or symbol..."
        />
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground max-w-xl">
            Results from backtests you ran elsewhere, kept by month.
          </p>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add backtest
          </Button>
        </div>

        <StatRow>
          <Stat
            label="Net P&L"
            value={formatCurrency(totalPnL)}
            tone={pnlTone(totalPnL)}
          />
          {accountReturns.length > 0 && (
            <Stat
              label="Combined return"
              value={formatSignedPercent(combinedReturn)}
              tone={pnlTone(combinedReturn)}
              hint={`across ${accountReturns.length} account${accountReturns.length !== 1 ? "s" : ""}`}
            />
          )}
          <Stat label="Avg win rate" value={formatPercent(avgWinRate)} />
          <Stat label="Trades" value={totalTrades} />
          <Stat label="Backtests" value={backtests.length} />
        </StatRow>

        {loading ? (
          <div className="panel divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-5">
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={searchTerm ? "No backtests match" : "No backtests yet"}
            action={
              !searchTerm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  Add a backtest
                </Button>
              )
            }
          >
            {searchTerm
              ? "Try a different search."
              : "Add the monthly result of a backtest to compare it with live trading."}
          </EmptyState>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className={`${th} text-left`}>Backtest</th>
                  <th className={`${th} text-left`}>Month</th>
                  <th className={`${th} text-right`}>P&amp;L</th>
                  <th className={`${th} text-right`}>Return</th>
                  <th className={`${th} text-right`}>Win rate</th>
                  <th className={`${th} text-right`}>Trades</th>
                  <th className={`${th} text-right`}>W / L</th>
                  <th className={`${th} text-right`}>PF</th>
                  <th className={`${th} text-right`}>Max DD</th>
                  <th className="py-2.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const ret = returnOnAccount(b);
                  const meta = [
                    b.symbol,
                    b.timeFrame,
                    b.platform,
                    b.accountSize !== null &&
                      `${formatAccountSize(b.accountSize)} account`,
                  ].filter(Boolean);

                  return (
                    <tr
                      key={b.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className={`${td} !whitespace-normal min-w-[14rem]`}>
                        <p className="font-medium text-foreground">{b.name}</p>
                        {meta.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {meta.join(" · ")}
                          </p>
                        )}
                        {b.notes && (
                          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-3">
                            {b.notes}
                          </p>
                        )}
                      </td>
                      <td className={`${td} text-muted-foreground`}>
                        {formatMonth(b.periodMonth)}
                      </td>
                      <td
                        className={`${td} num font-medium text-right ${
                          b.totalPnL === null
                            ? "text-muted-foreground"
                            : b.totalPnL >= 0
                              ? "text-profit"
                              : "text-loss"
                        }`}
                      >
                        {formatCurrency(b.totalPnL)}
                      </td>
                      <td
                        className={`${td} num text-right ${
                          ret === null
                            ? "text-muted-foreground"
                            : ret >= 0
                              ? "text-profit"
                              : "text-loss"
                        }`}
                      >
                        {ret === null ? "—" : formatSignedPercent(ret)}
                      </td>
                      <td className={`${td} num text-right`}>
                        {formatPercent(b.winRate)}
                      </td>
                      <td className={`${td} num text-right`}>
                        {b.totalTrades || "—"}
                      </td>
                      <td className={`${td} num text-right`}>
                        {b.winningTrades ?? "—"} / {b.losingTrades ?? "—"}
                      </td>
                      <td className={`${td} num text-right`}>
                        {b.profitFactor !== null
                          ? b.profitFactor.toFixed(2)
                          : "—"}
                      </td>
                      <td className={`${td} num text-right`}>
                        {formatPercent(b.maxDrawdown)}
                      </td>
                      <td className="pl-3 pr-3 py-2.5 align-top whitespace-nowrap text-right">
                        <EditIconButton size="md" onClick={() => handleEdit(b)} />
                        <DeleteIconButton
                          size="md"
                          onClick={() => handleDelete(b.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BacktestPage;
