"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "../../components/layout/Layout";
import { buttonClasses } from "../../components/ui/Button";
import {
  EmptyState,
  Segmented,
  Stat,
  StatRow,
  pnlTone,
} from "../../components/ui/Stat";
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

  const getProfitLossColor = (profitLoss: number | null): string => {
    if (profitLoss === null) return "text-muted-foreground";
    return profitLoss >= 0 ? "text-profit" : "text-loss";
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

  const currency = activeAccount?.currency;

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* ── Account line + period toggle ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {activeAccount ? (
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                {activeAccount.name}
                {activeAccount.broker && ` · ${activeAccount.broker}`} ·{" "}
                {activeAccount.accountType.toLowerCase()}
              </p>
              <p className="num mt-1 text-4xl tracking-tight text-foreground">
                {formatCurrency(activeAccount.currentBalance, currency)}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                <span
                  className={`num ${getProfitLossColor(activeAccount.totalPnL)}`}
                >
                  {activeAccount.totalPnL >= 0 ? "+" : ""}
                  {formatCurrency(activeAccount.totalPnL, currency)}
                  {activeAccount.initialBalance !== 0 &&
                    ` (${(
                      (activeAccount.totalPnL / activeAccount.initialBalance) *
                      100
                    ).toFixed(1)}%)`}
                </span>{" "}
                since opening at{" "}
                <span className="num">
                  {formatCurrency(activeAccount.initialBalance, currency)}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              All accounts together.{" "}
              <Link
                href="/accounts"
                className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                Manage accounts
              </Link>
            </p>
          )}

          <Segmented options={PERIODS} value={period} onChange={setPeriod} />
        </div>

        {/* ── Figures for the period ── */}
        {loading || !stats ? (
          <StatRow>
            {["Net P&L", "Win rate", "Trades", "Avg win", "Avg loss"].map(
              (l) => (
                <Stat key={l} label={l} value="—" />
              ),
            )}
          </StatRow>
        ) : (
          <StatRow>
            <Stat
              label="Net P&L"
              value={formatCurrency(stats.totalPnL, currency)}
              tone={pnlTone(stats.totalPnL)}
              hint={periodLabel}
            />
            <Stat
              label="Win rate"
              value={formatPercent(stats.winRate)}
              hint={`${stats.closedTrades} closed`}
            />
            <Stat
              label="Trades"
              value={stats.totalTrades}
              hint={`${stats.openTrades} open`}
            />
            <Stat
              label="Avg win"
              value={formatCurrency(stats.averageWin, currency)}
              hint={`best ${formatCurrency(stats.bestTrade, currency)}`}
            />
            <Stat
              label="Avg loss"
              value={formatCurrency(stats.averageLoss, currency)}
              hint={`worst ${formatCurrency(stats.worstTrade, currency)}`}
            />
            <Stat label="Profit factor" value={profitFactor} />
          </StatRow>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          {/* ── Recent trades ── */}
          <section className="min-w-0">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className="text-sm font-medium text-foreground">
                Recent trades
              </h2>
              <Link
                href="/trades"
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                All trades →
              </Link>
            </div>

            {!loading && recentTrades.length === 0 ? (
              <EmptyState
                title="No trades in this period"
                action={
                  <Link
                    href="/trades/new"
                    className={buttonClasses("primary", "sm")}
                  >
                    Add a trade
                  </Link>
                }
              >
                Try a longer range, or log one now.
              </EmptyState>
            ) : (
              <ul className="border-t border-border">
                {recentTrades.map((trade) => (
                  <li
                    key={trade.id}
                    className="flex items-center justify-between gap-4 border-b border-border py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{trade.symbol}</span>{" "}
                        <span className="text-muted-foreground">
                          {trade.direction.toLowerCase()} at{" "}
                          <span className="num">
                            {formatCurrency(trade.entryPrice, currency)}
                          </span>
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(trade.entryDate)}
                      </p>
                    </div>
                    {trade.profitLoss !== null ? (
                      <span
                        className={`num text-sm flex-shrink-0 ${getProfitLossColor(trade.profitLoss)}`}
                      >
                        {trade.profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(trade.profitLoss, currency)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {trade.status.toLowerCase()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Trades by day ── */}
          <TradeActivityHeatmap />
        </div>
      </div>
    </Layout>
  );
}
