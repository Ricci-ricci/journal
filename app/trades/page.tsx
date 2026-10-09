"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "../../components/layout/Layout";
import { TradesTable } from "../../components/tables/TradesTable";
import { CloseTradeModal } from "../../components/modals/CloseTradeModal";
import { DeleteTradeModal } from "../../components/modals/DeleteTradeModal";
import { ShareTradeModal } from "../../components/modals/ShareTradeModal";
import { Plus } from "lucide-react";
import { Button, buttonClasses } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Segmented, Stat, StatRow, pnlTone } from "../../components/ui/Stat";
import { useAccounts } from "../../contexts/AccountsContext";
import { useAuth } from "../../contexts/AuthContext";

interface PostUser {
  id: string;
  name: string | null;
  email: string;
}

interface PostWithRelations {
  id: string;
  userId: string;
  user: PostUser;
  tradeId: string | null;
  caption: string | null;
  showPnL: boolean;
  showAccountSize: boolean;
  symbol: string;
  direction: "LONG" | "SHORT";
  assetType: string | null;
  entryPrice: number;
  exitPrice: number | null;
  profitLoss: number | null;
  profitLossPct: number | null;
  status: "OPEN" | "CLOSED" | "PARTIAL";
  createdAt: string;
  _count: { likes: number; comments: number };
  likedByMe: boolean;
}

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
  { value: "", label: "Any status" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "PARTIAL", label: "Partial" },
];

const directionOptions = [
  { value: "", label: "Any direction" },
  { value: "LONG", label: "Long" },
  { value: "SHORT", label: "Short" },
];

const TradesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    activeAccount,
    activeAccountId,
    refetch: refetchAccounts,
  } = useAccounts();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  // Close trade modal state
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  // Delete trade modal state
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Share trade modal state
  const [tradeToShare, setTradeToShare] = useState<Trade | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("userId", user.id);
        params.append("period", period);
        if (activeAccountId) params.append("accountId", activeAccountId);
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
  }, [period, activeAccountId, statusFilter, directionFilter, user]);

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteTrade = (tradeId: string) => {
    const trade = trades.find((t) => t.id === tradeId);
    if (trade) setTradeToDelete(trade);
  };

  const handleDeleteTradeConfirm = async () => {
    if (!tradeToDelete) return;
    const tradeId = tradeToDelete.id;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!result.success) {
        alert("Failed to delete trade: " + (result.error || result.details));
        setDeleteLoading(false);
        return;
      }

      // Close modal, then play the row animation before removing from state
      setTradeToDelete(null);
      setDeleteLoading(false);
      setDeletingId(tradeId);

      setTimeout(() => {
        setTrades((prev) => {
          const remaining = prev.filter((t) => t.id !== tradeId);
          const closed = remaining.filter((t) => t.status === "CLOSED");
          const winning = closed.filter((t) => (t.profitLoss || 0) > 0).length;
          setStats({
            totalTrades: remaining.length,
            openTrades: remaining.filter((t) => t.status === "OPEN").length,
            closedTrades: closed.length,
            totalPnL: closed.reduce((s, t) => s + (t.profitLoss || 0), 0),
            winRate: closed.length > 0 ? (winning / closed.length) * 100 : 0,
          });
          return remaining;
        });
        setDeletingId(null);
        // Account balance depends on trades — refresh sidebar balances
        refetchAccounts();
      }, 320);
    } catch (error) {
      console.error("Failed to delete trade:", error);
      alert("An unexpected error occurred. Please try again.");
      setDeleteLoading(false);
    }
  };

  const handleCloseTrade = (trade: Trade) => {
    setTradeToClose(trade);
  };

  const handleCloseTradeConfirm = async (data: {
    exitPrice: number;
    exitDate: string;
    profitLoss: number;
    profitLossPercent: number | null;
  }) => {
    if (!tradeToClose) return;
    setCloseLoading(true);
    try {
      const response = await fetch(`/api/trades/${tradeToClose.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CLOSED",
          exitPrice: data.exitPrice,
          exitDate: data.exitDate,
          profitLoss: data.profitLoss,
          profitLossPercent: data.profitLossPercent,
        }),
      });
      const result = await response.json();

      if (result.success) {
        // Update the trade in local state
        setTrades((prev) =>
          prev.map((t) =>
            t.id === tradeToClose.id
              ? {
                  ...t,
                  status: "CLOSED",
                  exitPrice: data.exitPrice,
                  exitDate: data.exitDate,
                  profitLoss: data.profitLoss,
                  profitLossPercent: data.profitLossPercent,
                }
              : t,
          ),
        );

        // Recompute stats inline
        setStats((prev) => {
          if (!prev) return prev;
          const updatedTrades = trades.map((t) =>
            t.id === tradeToClose.id
              ? { ...t, status: "CLOSED" as const, profitLoss: data.profitLoss }
              : t,
          );
          const closed = updatedTrades.filter((t) => t.status === "CLOSED");
          const winning = closed.filter((t) => (t.profitLoss || 0) > 0).length;
          return {
            totalTrades: updatedTrades.length,
            openTrades: updatedTrades.filter((t) => t.status === "OPEN").length,
            closedTrades: closed.length,
            totalPnL: closed.reduce((s, t) => s + (t.profitLoss || 0), 0),
            winRate: closed.length > 0 ? (winning / closed.length) * 100 : 0,
          };
        });

        // Refresh account balances in the sidebar
        await refetchAccounts();

        setTradeToClose(null);
      } else {
        alert("Failed to close trade: " + (result.error || result.details));
      }
    } catch (err) {
      console.error("Failed to close trade:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setCloseLoading(false);
    }
  };

  const handleShareTrade = (trade: Trade) => setTradeToShare(trade);

  const handleShared: (post: PostWithRelations) => void = () =>
    setTradeToShare(null);

  const handleEditTrade = (trade: Trade) => {
    router.push(`/trades/${trade.id}/edit`);
  };

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatPercent = (percent: number): string => `${percent.toFixed(1)}%`;

  return (
    <Layout
      title="Trades"
      headerRight={
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by symbol..."
        />
      }
    >
      {/* Share Trade Modal */}
      <ShareTradeModal
        trade={tradeToShare}
        onClose={() => setTradeToShare(null)}
        onShared={handleShared}
      />
      {/* Close Trade Modal */}
      <CloseTradeModal
        trade={tradeToClose}
        onConfirm={handleCloseTradeConfirm}
        onCancel={() => setTradeToClose(null)}
        loading={closeLoading}
      />
      {/* Delete Trade Modal */}
      <DeleteTradeModal
        trade={tradeToDelete}
        onConfirm={handleDeleteTradeConfirm}
        onCancel={() => setTradeToDelete(null)}
        loading={deleteLoading}
      />
      <div className="space-y-5">
        {/* Account line + period + new trade */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activeAccount ? (
              <>
                {activeAccount.name} ·{" "}
                <span className="num text-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: activeAccount.currency,
                  }).format(activeAccount.currentBalance)}
                </span>
              </>
            ) : (
              "All accounts"
            )}
          </p>
          <div className="flex items-center gap-2">
            <Segmented options={PERIODS} value={period} onChange={setPeriod} />
            <Link href="/trades/new" className={buttonClasses("primary", "sm")}>
              <Plus className="h-4 w-4" />
              New trade
            </Link>
          </div>
        </div>

        {stats && (
          <StatRow>
            <Stat
              label="Net P&L"
              value={formatCurrency(stats.totalPnL)}
              tone={pnlTone(stats.totalPnL)}
            />
            <Stat label="Win rate" value={formatPercent(stats.winRate)} />
            <Stat label="Trades" value={stats.totalTrades} />
            <Stat label="Open" value={stats.openTrades} />
            <Stat label="Closed" value={stats.closedTrades} />
          </StatRow>
        )}

        <section className="panel overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-border">
            <div className="w-36">
              <Select
                aria-label="Status"
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Select
                aria-label="Direction"
                options={directionOptions}
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
              />
            </div>
            {(searchTerm || statusFilter || directionFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setDirectionFilter("");
                }}
              >
                Clear
              </Button>
            )}
            <p className="ml-auto text-[13px] text-muted-foreground">
              {loading
                ? "Loading…"
                : `${filteredTrades.length} trade${filteredTrades.length !== 1 ? "s" : ""}${
                    filteredTrades.length !== trades.length
                      ? ` of ${trades.length}`
                      : ""
                  }`}
            </p>
          </div>

            <TradesTable
              trades={filteredTrades}
              loading={loading}
              deletingId={deletingId}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onCloseTrade={handleCloseTrade}
              onShareTrade={handleShareTrade}
            />
        </section>
      </div>
    </Layout>
  );
};

export default TradesPage;
