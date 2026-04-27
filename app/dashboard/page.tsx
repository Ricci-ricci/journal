"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "../../components/layout/Layout";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { TradeActivityHeatmap } from "../../components/dashboard/TradeActivityHeatmap";
import { useAccounts } from "../../contexts/AccountsContext";
import { useAuth } from "../../contexts/AuthContext";

type Period = "week" | "month" | "year" | "all";

const PERIODS: { label: string; value: Period }[] = [
  { label: "7D", value: "week" },
  { label: "1M", value: "month" },
  { label: "1Y", value: "year" },
  { label: "All", value: "all" },
];

interface DashboardStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnL: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
}

interface Trade {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  status: "OPEN" | "CLOSED" | "PARTIAL";
  entryDate: string;
  entryPrice: number;
  profitLoss: number | null;
}

const ACCOUNT_TYPE_BADGE: Record<string, "danger" | "warning" | "secondary"> = {
  LIVE: "danger",
  DEMO: "warning",
  PAPER: "secondary",
};

const ACCOUNT_TYPE_BG: Record<string, string> = {
  LIVE: "bg-red-500/10",
  DEMO: "bg-yellow-500/10",
  PAPER: "bg-muted",
};

const ACCOUNT_TYPE_ICON_COLOR: Record<string, string> = {
  LIVE: "text-red-400",
  DEMO: "text-yellow-400",
  PAPER: "text-muted-foreground",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeAccount, activeAccountId } = useAccounts();
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("userId", user.id);
        params.set("period", period);
        if (activeAccountId) params.set("accountId", activeAccountId);

        const res = await fetch(`/api/trades?${params.toString()}`);
        const result = await res.json();

        if (result.success) {
          const allTrades: Trade[] = result.data;

          setRecentTrades(allTrades.slice(0, 5));

          const openTrades = allTrades.filter(
            (t) => t.status === "OPEN",
          ).length;
          const closedTrades = allTrades.filter((t) => t.status === "CLOSED");

          const totalPnL = closedTrades.reduce(
            (sum, t) => sum + (t.profitLoss ?? 0),
            0,
          );

          const winningTrades = closedTrades.filter(
            (t) => (t.profitLoss ?? 0) > 0,
          );
          const losingTrades = closedTrades.filter(
            (t) => (t.profitLoss ?? 0) < 0,
          );

          const winRate =
            closedTrades.length > 0
              ? (winningTrades.length / closedTrades.length) * 100
              : 0;

          const averageWin =
            winningTrades.length > 0
              ? winningTrades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0) /
                winningTrades.length
              : 0;

          const averageLoss =
            losingTrades.length > 0
              ? losingTrades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0) /
                losingTrades.length
              : 0;

          const pnlValues = closedTrades.map((t) => t.profitLoss ?? 0);
          const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
          const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

          setStats({
            totalTrades: allTrades.length,
            openTrades,
            closedTrades: closedTrades.length,
            totalPnL,
            winRate,
            averageWin,
            averageLoss,
            bestTrade,
            worstTrade,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, activeAccountId, user]);

  const formatCurrency = (amount: number, currency = "USD"): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const formatPercent = (percent: number): string => `${percent.toFixed(1)}%`;

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getDirectionBadgeVariant = (direction: string) =>
    direction === "LONG" ? "success" : "danger";

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "info";
      case "CLOSED":
        return "default";
      case "PARTIAL":
        return "warning";
      default:
        return "default";
    }
  };

  const getProfitLossColor = (profitLoss: number | null): string => {
    if (profitLoss === null) return "text-muted-foreground";
    return profitLoss >= 0 ? "text-emerald-400" : "text-red-400";
  };

  const profitFactor =
    stats && stats.averageLoss !== 0
      ? Math.abs(stats.averageWin / stats.averageLoss).toFixed(2)
      : "—";

  const periodLabel = {
    week: "last 7 days",
    month: "last 30 days",
    year: "last 12 months",
    all: "all time",
  }[period];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* ── Header row: title + period toggle ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Welcome back, Trader!
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Showing stats for{" "}
              <span className="text-foreground font-medium">{periodLabel}</span>
              {stats && (
                <span className="ml-1">
                  · {stats.totalTrades} trade
                  {stats.totalTrades !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border overflow-hidden flex-shrink-0">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  period === p.value
                    ? "bg-blue-600 text-white"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Active account balance card ── */}
        {activeAccount && (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                      {activeAccount.name}
                    </span>
                    {activeAccount.broker && (
                      <span className="text-xs text-muted-foreground">
                        · {activeAccount.broker}
                      </span>
                    )}
                    <Badge
                      variant={
                        ACCOUNT_TYPE_BADGE[activeAccount.accountType] ??
                        "default"
                      }
                      size="sm"
                    >
                      {activeAccount.accountType}
                    </Badge>
                  </div>

                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(
                      activeAccount.currentBalance,
                      activeAccount.currency,
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      Initial:{" "}
                      {formatCurrency(
                        activeAccount.initialBalance,
                        activeAccount.currency,
                      )}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        activeAccount.totalPnL >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {activeAccount.totalPnL >= 0 ? "+" : ""}
                      {formatCurrency(
                        activeAccount.totalPnL,
                        activeAccount.currency,
                      )}{" "}
                      all-time P&L
                    </span>
                    {activeAccount.initialBalance !== 0 && (
                      <span
                        className={`text-xs font-medium ${
                          activeAccount.totalPnL >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        (
                        {(
                          (activeAccount.totalPnL /
                            activeAccount.initialBalance) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    ACCOUNT_TYPE_BG[activeAccount.accountType] ?? "bg-muted"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${
                      ACCOUNT_TYPE_ICON_COLOR[activeAccount.accountType] ??
                      "text-muted-foreground"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── No account selected hint ── */}
        {!activeAccount && (
          <div className="rounded-lg border border-dashed border-border p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              No account selected — showing stats across all accounts.
            </p>
            <Link href="/accounts">
              <Button variant="outline" size="sm">
                Manage Accounts
              </Button>
            </Link>
          </div>
        )}

        {/* ── KPI Stats ── */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total P&L */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total P&L
                    </p>
                    <p
                      className={`text-2xl font-bold ${getProfitLossColor(stats.totalPnL)}`}
                    >
                      {formatCurrency(stats.totalPnL, activeAccount?.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {periodLabel}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17V7a1 1 0 011-1h4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1zM9 7a1 1 0 012 0v10a1 1 0 11-2 0V7zM13 5a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Win Rate */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Win Rate
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercent(stats.winRate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.closedTrades} closed trades
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Trades */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Trades
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalTrades}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.openTrades} open · {stats.closedTrades} closed
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Trade */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Best Trade
                    </p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(stats.bestTrade, activeAccount?.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Worst:{" "}
                      {formatCurrency(
                        stats.worstTrade,
                        activeAccount?.currency,
                      )}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── No trades empty state ── */}
        {!loading && stats && stats.totalTrades === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <h3 className="text-sm font-medium text-foreground">
                No trades for this period
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different time range or add a new trade.
              </p>
              <div className="mt-4">
                <Link href="/trades/new">
                  <Button variant="primary" size="sm">
                    Add Trade
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Day heatmap + Recent Trades row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Trades by day ── */}
          <div className="lg:col-span-1">
            <TradeActivityHeatmap />
          </div>

          {/* ── Recent Trades ── */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Trades</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last 5 of {periodLabel}
                      {activeAccount ? ` · ${activeAccount.name}` : ""}
                    </p>
                  </div>
                  <Link href="/trades">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      No trades for this period
                    </p>
                  ) : (
                    recentTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground text-sm">
                              {trade.symbol}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(trade.entryDate)}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <Badge
                              variant={getDirectionBadgeVariant(
                                trade.direction,
                              )}
                              size="sm"
                            >
                              {trade.direction}
                            </Badge>
                            <Badge
                              variant={getStatusBadgeVariant(trade.status)}
                              size="sm"
                            >
                              {trade.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-foreground">
                            {formatCurrency(
                              trade.entryPrice,
                              activeAccount?.currency,
                            )}
                          </div>
                          {trade.profitLoss !== null && (
                            <div
                              className={`text-sm font-medium ${getProfitLossColor(trade.profitLoss)}`}
                            >
                              {trade.profitLoss >= 0 ? "+" : ""}
                              {formatCurrency(
                                trade.profitLoss,
                                activeAccount?.currency,
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* ── Quick Actions + Performance Summary row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Link href="/trades/new">
                    <Button className="w-full justify-start" variant="primary">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      New Trade
                    </Button>
                  </Link>
                  <Link href="/journal/new">
                    <Button
                      className="w-full justify-start"
                      variant="secondary"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Add Journal Entry
                    </Button>
                  </Link>
                  <Link href="/strategies">
                    <Button className="w-full justify-start" variant="outline">
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      View Strategies
                    </Button>
                  </Link>
                  <Link href="/accounts">
                    <Button className="w-full justify-start" variant="outline">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Manage Accounts
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            {stats && stats.closedTrades > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Average Win
                      </span>
                      <span className="text-sm font-medium text-emerald-400">
                        {formatCurrency(
                          stats.averageWin,
                          activeAccount?.currency,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Average Loss
                      </span>
                      <span className="text-sm font-medium text-red-400">
                        {formatCurrency(
                          stats.averageLoss,
                          activeAccount?.currency,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        Profit Factor
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {profitFactor}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </Layout>
  );
}
