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

const TradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

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

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter) params.append("status", statusFilter);
        if (directionFilter) params.append("direction", directionFilter);
        params.append("limit", "50");

        // Real API call to fetch trades
        const response = await fetch(`/api/trades?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
          setTrades(result.data);

          // Calculate stats from real data
          const openTrades = result.data.filter(
            (t: Trade) => t.status === "OPEN",
          ).length;
          const closedTrades = result.data.filter(
            (t: Trade) => t.status === "CLOSED",
          );
          const totalPnL = closedTrades.reduce(
            (sum: string, trade: Trade) => sum + (trade.profitLoss || 0),
            0,
          );
          const winningTrades = closedTrades.filter(
            (t: Trade) => (t.profitLoss || 0) > 0,
          ).length;
          const winRate =
            closedTrades.length > 0
              ? (winningTrades / closedTrades.length) * 100
              : 0;

          setStats({
            totalTrades: result.data.length,
            openTrades,
            closedTrades: closedTrades.length,
            totalPnL,
            winRate,
          });
        } else {
          console.error("Failed to fetch trades:", result.error);
          alert("Failed to fetch trades: " + result.error);
        }
      } catch (error) {
        console.error("Failed to fetch trades:", error);
        alert("Failed to fetch trades. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [statusFilter, directionFilter]);

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || trade.status === statusFilter;
    const matchesDirection =
      !directionFilter || trade.direction === directionFilter;

    return matchesSearch && matchesStatus && matchesDirection;
  });

  const handleEditTrade = (trade: Trade) => {
    // Navigate to edit page or open modal
    console.log("Edit trade:", trade.id);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this trade? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Real API call to delete trade (Note: DELETE endpoint needs to be created)
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setTrades(trades.filter((t) => t.id !== tradeId));
        alert("Trade deleted successfully!");
      } else {
        console.error("Failed to delete trade:", result.error);
        alert("Failed to delete trade: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete trade:", error);
      alert("Failed to delete trade. Please try again.");
    }
  };

  const handleViewTrade = (trade: Trade) => {
    // Navigate to trade details page
    console.log("View trade:", trade.id);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <Layout title="Trading History">
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalTrades}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Open Trades</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.openTrades}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Closed Trades</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {stats.closedTrades}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p
                    className={`text-2xl font-bold ${stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {formatCurrency(stats.totalPnL)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPercent(stats.winRate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <CardTitle>Trade History</CardTitle>
              <Link href="/trades/new">
                <AddIconButton tooltip="New Trade" size="md" />
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search and Filter Controls */}
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
                placeholder="Filter by status"
              />

              <Select
                options={directionOptions}
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                placeholder="Filter by direction"
              />

              <div className="flex space-x-2">
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
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTrades.length} of {trades.length} trades
                {(searchTerm || statusFilter || directionFilter) && (
                  <span className="ml-1">(filtered)</span>
                )}
              </p>
            </div>

            {/* Trades Table */}
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
