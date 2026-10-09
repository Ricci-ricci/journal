"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { EmptyState } from "../ui/Stat";

import {
  EditIconButton,
  DeleteIconButton,
  ViewIconButton,
  CloseTradeIconButton,
  IconButton,
} from "../ui/IconButton";

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

interface TradesTableProps {
  trades: Trade[];
  loading?: boolean;
  deletingId?: string | null;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
  onViewTrade?: (trade: Trade) => void;
  onCloseTrade?: (trade: Trade) => void;
  onShareTrade?: (trade: Trade) => void;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatPercent = (percent: number): string => {
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
};

const getProfitLossColor = (profitLoss: number | null): string => {
  if (profitLoss === null) return "text-muted-foreground";
  return profitLoss >= 0 ? "text-profit" : "text-loss";
};

export const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  loading = false,
  deletingId = null,
  onEditTrade,
  onDeleteTrade,
  onViewTrade,
  onCloseTrade,
  onShareTrade,
}) => {
  if (loading) {
    return (
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-5 py-5">
            <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="p-4">
        <EmptyState title="No trades to show">
          Nothing matches yet. Log a trade, or loosen the filters.
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                Direction
              </th>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                Status
              </th>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                Entry
              </th>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                Exit
              </th>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="label px-4 first:pl-5 py-2.5 text-left"
              >
                P&L
              </th>
              <th scope="col" className="relative px-4 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const isDeleting = deletingId === trade.id;
              return (
              <tr
                key={trade.id}
                className={`border-b border-border last:border-b-0 transition-all duration-300 ease-out ${
                  isDeleting
                    ? "opacity-0 -translate-x-4 bg-loss/10 pointer-events-none"
                    : "hover:bg-muted/40"
                }`}
              >
                <td className="px-4 first:pl-5 py-3.5 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="font-medium text-foreground">
                      {trade.symbol}
                    </div>
                    {trade.assetType && (
                      <div className="text-xs text-muted-foreground">
                        {trade.assetType}
                      </div>
                    )}
                    {trade.setupType && (
                      <div className="text-xs text-muted-foreground">
                        {trade.setupType}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 first:pl-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`chip ${
                      trade.direction === "LONG"
                        ? "border-profit/25 bg-profit/10 text-profit"
                        : "border-loss/25 bg-loss/10 text-loss"
                    }`}
                  >
                    {trade.direction === "LONG" ? "Long" : "Short"}
                  </span>
                </td>
                <td className="px-4 first:pl-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`chip ${
                      trade.status === "CLOSED"
                        ? ""
                        : "border-brand/30 bg-primary/15 text-brand"
                    }`}
                  >
                    {trade.status !== "CLOSED" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                    {trade.status.charAt(0) + trade.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 first:pl-5 py-3.5 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="num text-foreground">
                      {formatCurrency(
                        trade.entryPrice,
                        trade.account?.currency,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(trade.entryDate)}
                    </div>
                  </div>
                </td>
                <td className="px-4 first:pl-5 py-3.5 whitespace-nowrap">
                  <div className="flex flex-col">
                    {trade.exitPrice ? (
                      <>
                        <div className="num text-foreground">
                          {formatCurrency(
                            trade.exitPrice,
                            trade.account?.currency,
                          )}
                        </div>
                        {trade.exitDate && (
                          <div className="text-xs text-muted-foreground">
                            {formatDate(trade.exitDate)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>
                </td>
                <td className="num px-4 py-3.5 whitespace-nowrap text-foreground">
                  {trade.quantity.toLocaleString()}
                </td>
                <td className="px-4 first:pl-5 py-3.5 whitespace-nowrap">
                  <div className="flex flex-col">
                    {trade.profitLoss !== null ? (
                      <>
                        <div
                          className={`num font-medium ${getProfitLossColor(trade.profitLoss)}`}
                        >
                          {formatCurrency(
                            trade.profitLoss,
                            trade.account?.currency,
                          )}
                        </div>
                        {trade.profitLossPercent !== null && (
                          <div
                            className={`num text-xs ${getProfitLossColor(trade.profitLoss)}`}
                          >
                            {formatPercent(trade.profitLossPercent)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>
                </td>
                <td className="pl-3 pr-3 py-3.5 whitespace-nowrap text-right">
                  <div className="flex justify-end items-center">
                    {onViewTrade && (
                      <ViewIconButton
                        size="md"
                        onClick={() => onViewTrade(trade)}
                      />
                    )}
                    {onEditTrade && (
                      <EditIconButton
                        size="md"
                        onClick={() => onEditTrade(trade)}
                      />
                    )}
                    {onCloseTrade &&
                      (trade.status === "OPEN" ||
                        trade.status === "PARTIAL") && (
                        <CloseTradeIconButton
                          size="md"
                          onClick={() => onCloseTrade(trade)}
                        />
                      )}
                    {onShareTrade && (
                      <IconButton
                        variant="default"
                        tooltip="Share"
                        size="md"
                        onClick={() => onShareTrade(trade)}
                        icon={<Share2 className="w-full h-full" />}
                      />
                    )}
                    {onDeleteTrade && (
                      <DeleteIconButton
                        size="md"
                        disabled={isDeleting}
                        onClick={() => onDeleteTrade(trade.id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
