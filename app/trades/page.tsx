"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "../../components/layout/Layout";
import { TradesTable } from "../../components/tables/TradesTable";
import { Button } from "../../components/ui/Button";
import { AddIconButton } from "../../components/ui/IconButton";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";

interface Trade {
  id: string;
  symbol: string;
  assetType: string | null;
  direction: "LONG" | "SHORT";
  status: "OPEN" | "CLOSED" | "PARTIAL";
  entryDate: string;
  entryPrice: number;
  quantity: number;
  exitDate: string | null;
  exitPrice: number | null;
  commission: number;
  fees: number;
  profitLoss: number | null;
  profitLossPercent: number | null;
  setupType: string | null;
  timeFrame: string | null;
  notes: string | null;
  confidenceLevel: number | null;
  emotionalState: string | null;
  createdAt: string;
  account?: {
    name: string;
    currency: string;
  } | null;
}

interface TradesStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnL: number;
  winRate: number;
}

type Period = "week" | "month" | "year" | "all";

const PERIODS: { label: string; value: Period }[] = [
  { label: "7D", value: "week" },
  { label: "1M", value: "month" },
  { label: "1Y", value: "year" },
  { label: "All", value: "all" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "PARTIAL", label: "Partial" },
];

const directionOptions = [
  { value: "", label: "All Directions" },
  { value: "LONG", label: "Long" },
  { value: "SHORT", label: "Short" },
];

const TradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("period", period);
        if (statusFilter) params.append("status", statusFilter);
        if (directionFilter) params.append("direction", directionFilter);

        const response = await fetch(`/api/trades?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
          setTrades(result.data);

          // Compute stats from all returned trades
          const allTrades: Trade[] = result.data;
          const openTrades = allTrades.filter(
            (t) => t.status === "OPEN",
          ).length;
          const closedTrades = allTrades.filter((t) => t.status === "CLOSED");
          const totalPnL = closedTrades.reduce(
            (sum, t) => sum + (t.profitLoss || 0),
            0,
          );
          const winningTrades = closedTrades.filter(
            (t) => (t.profitLoss || 0) > 0,
          ).length;
          const winRate =
            closedTrades.length > 0
              ? (winningTrades / closedTrades.length) * 100
              : 0;

          setStats({
            totalTrades: allTrades.length,
            openTrades,
            closedTrades: closedTrades.length,
            totalPnL,
            winRate,
          });
        } else {
          console.error("Failed to fetch trades:", result.error);
        }
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [period, statusFilter, directionFilter]);

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteTrade = async (tradeId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this trade? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setTrades((prev) => prev.filter((t) => t.id !== tradeId));
        setStats((prev) => {
          if (!prev) return prev;
          const remaining = trades.filter((t) => t.id !== tradeId);
          const closed = remaining.filter((t) => t.status === "CLOSED");
          const winning = closed.filter((t) => (t.profitLoss || 0) > 0).length;
          return {
            totalTrades: remaining.length,
            openTrades: remaining.filter((t) => t.status === "OPEN").length,
            closedTrades: closed.length,
            totalPnL: closed.reduce((s, t) => s + (t.profitLoss || 0), 0),
            winRate: closed.length > 0 ? (winning / closed.length) * 100 : 0,
          };
        });
      } else {
        alert("Failed to delete trade: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete trade:", error);
    }
  };

  const handleEditTrade = (trade: Trade) => {
    console.log("Edit trade:", trade.id);
  };

  const handleViewTrade = (trade: Trade) => {
    console.log("View trade:", trade.id);
  };

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatPercent = (percent: number): string => `${percent.toFixed(1)}%`;

  return (
    <Layout title="My Trades">
      <div className="space-y-6">
        {/* Period toggle + header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing stats for the selected period
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period toggle */}
            <div className="inline-flex rounded-lg border border-border overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    period === p.value
                      ? "bg-blue-600 text-white"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Link href="/trades/new">
              <AddIconButton tooltip="New Trade" size="md" />
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Trades
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalTrades}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Open</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.openTrades}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Closed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.closedTrades}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total P&L
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(stats.totalPnL)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                  <p
                    className={`text-2xl font-bold ${
                      stats.winRate >= 50 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatPercent(stats.winRate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters + Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by symbol..."
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

              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />

              <Select
                options={directionOptions}
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setDirectionFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>

            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading…"
                  : `${filteredTrades.length} trade${filteredTrades.length !== 1 ? "s" : ""}${
                      filteredTrades.length !== trades.length
                        ? ` (filtered from ${trades.length})`
                        : ""
                    }`}
              </p>
            </div>

            <TradesTable
              trades={filteredTrades}
              loading={loading}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onViewTrade={handleViewTrade}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradesPage;
