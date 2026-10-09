"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Hash,
  Percent,
  Scale,
  Wallet,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { buttonClasses } from "../../components/ui/Button";
import { EmptyState, Segmented } from "../../components/ui/Stat";
import { EquityChart } from "../../components/dashboard/EquityChart";
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
  const [curve, setCurve] = useState<number[]>([]);
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

          // Cumulative P&L over time (closed trades, oldest first).
          let run = 0;
          const series = [...closedTrades]
            .sort(
              (a, b) =>
                new Date(a.entryDate).getTime() -
                new Date(b.entryDate).getTime(),
            )
            .map((t) => (run += t.profitLoss ?? 0));
          setCurve(series);

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
      <div className="space-y-5">
        {/* ── Account balance + period toggle ── */}
        <div className="panel relative overflow-hidden flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-56 w-96 rounded-full bg-primary/25 blur-3xl"
          />
          {activeAccount ? (
            <div className="relative min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">
                  {activeAccount.name}
                  {activeAccount.broker && ` · ${activeAccount.broker}`}
                </span>
                <span className="chip">
                  {activeAccount.accountType.toLowerCase()}
                </span>
              </p>
              <p className="num mt-2 text-4xl sm:text-[2.75rem] font-semibold leading-none tracking-tight text-foreground">
                {formatCurrency(activeAccount.currentBalance, currency)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                <span
                  className={`num font-medium ${getProfitLossColor(activeAccount.totalPnL)}`}
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
            <div className="relative min-w-0">
              <p className="font-heading text-xl text-foreground">
                All accounts
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Every account together.{" "}
                <Link href="/accounts" className="link">
                  Manage accounts
                </Link>
              </p>
            </div>
          )}

          <Segmented
            options={PERIODS}
            value={period}
            onChange={setPeriod}
            className="relative self-start sm:self-auto"
          />
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Net P&L",
              value: stats ? formatCurrency(stats.totalPnL, currency) : "—",
              hint: periodLabel,
              icon: Wallet,
              tone:
                stats && stats.totalPnL !== 0
                  ? stats.totalPnL > 0
                    ? "text-profit"
                    : "text-loss"
                  : "text-foreground",
            },
            {
              label: "Win rate",
              value: stats ? formatPercent(stats.winRate) : "—",
              hint: stats ? `${stats.closedTrades} closed` : "",
              icon: Percent,
              tone: "text-foreground",
            },
            {
              label: "Trades",
              value: stats ? stats.totalTrades : "—",
              hint: stats ? `${stats.openTrades} open` : "",
              icon: Hash,
              tone: "text-foreground",
            },
            {
              label: "Profit factor",
              value: profitFactor,
              hint: stats
                ? `avg win ${formatCurrency(stats.averageWin, currency)}`
                : "",
              icon: Scale,
              tone: "text-foreground",
            },
          ].map((k) => (
            <div key={k.label} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="label">{k.label}</p>
                <span
                  aria-hidden
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                >
                  <k.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
              </div>
              <p
                className={`num mt-3 text-2xl sm:text-[1.75rem] font-semibold leading-none tracking-tight ${k.tone}`}
              >
                {k.value}
              </p>
              {k.hint && (
                <p className="mt-2 text-xs text-muted-foreground truncate">
                  {k.hint}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── P&L over time ── */}
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-[15px] text-foreground">
              P&amp;L over time
            </h2>
            <span className="chip">{periodLabel}</span>
          </div>
          <div className="mt-5">
            {loading ? (
              <div className="h-56 rounded-xl bg-muted/40" />
            ) : curve.length >= 2 ? (
              <EquityChart series={curve} format={(v) => formatCurrency(v, currency)} />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                Close at least two trades to see the curve.
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-5 items-start">
          {/* ── Recent trades ── */}
          <section className="panel min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 h-14 border-b border-border">
              <h2 className="font-heading text-[15px] text-foreground">
                Recent trades
              </h2>
              <Link href="/trades" className="link text-[13px]">
                All trades →
              </Link>
            </div>

            {!loading && recentTrades.length === 0 ? (
              <div className="p-4">
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
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentTrades.map((trade) => (
                  <li
                    key={trade.id}
                    className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-muted/40 transition-colors"
                  >
                    <span
                      aria-hidden
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                        trade.direction === "LONG"
                          ? "bg-profit/10 text-profit"
                          : "bg-loss/10 text-loss"
                      }`}
                    >
                      {trade.direction === "LONG" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
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
                        className={`num text-sm font-medium flex-shrink-0 ${getProfitLossColor(trade.profitLoss)}`}
                      >
                        {trade.profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(trade.profitLoss, currency)}
                      </span>
                    ) : (
                      <span className="chip flex-shrink-0">
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
