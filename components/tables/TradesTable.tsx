"use client";

import React from "react";
import { Badge } from "../ui/Badge";

import {
  EditIconButton,
  DeleteIconButton,
  ViewIconButton,
  CloseTradeIconButton,
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
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
  onViewTrade?: (trade: Trade) => void;
  onCloseTrade?: (trade: Trade) => void;
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

const getDirectionBadgeVariant = (direction: string) => {
  return direction === "LONG" ? "success" : "danger";
};

const getProfitLossColor = (profitLoss: number | null): string => {
  if (profitLoss === null) return "text-muted-foreground";
  return profitLoss >= 0 ? "text-emerald-400" : "text-red-400";
};

export const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  loading = false,
  onEditTrade,
  onDeleteTrade,
  onViewTrade,
  onCloseTrade,
}) => {
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="text-center py-12">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-foreground">
            No trades
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first trade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Direction
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Entry
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Exit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                P&L
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-foreground">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getDirectionBadgeVariant(trade.direction)}>
                    {trade.direction}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusBadgeVariant(trade.status)}>
                    {trade.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-foreground">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {trade.exitPrice ? (
                      <>
                        <div className="text-sm text-foreground">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {trade.quantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {trade.profitLoss !== null ? (
                      <>
                        <div
                          className={`text-sm font-medium ${getProfitLossColor(trade.profitLoss)}`}
                        >
                          {formatCurrency(
                            trade.profitLoss,
                            trade.account?.currency,
                          )}
                        </div>
                        {trade.profitLossPercent !== null && (
                          <div
                            className={`text-xs ${getProfitLossColor(trade.profitLoss)}`}
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-1">
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
                    {onDeleteTrade && (
                      <DeleteIconButton
                        size="md"
                        onClick={() => onDeleteTrade(trade.id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
