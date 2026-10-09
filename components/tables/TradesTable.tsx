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
      <div className="border-t border-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-border py-4">
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <EmptyState title="No trades to show">
        Nothing matches yet. Log a trade, or loosen the filters.
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                Direction
              </th>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                Status
              </th>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                Entry
              </th>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                Exit
              </th>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="label px-3 first:pl-0 py-2.5 text-left font-normal"
              >
                P&L
              </th>
              <th scope="col" className="relative px-3 py-2.5">
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
                className={`border-b border-border transition-all duration-300 ease-out ${
                  isDeleting
                    ? "opacity-0 -translate-x-4 bg-loss/10 pointer-events-none"
                    : "hover:bg-muted/30"
                }`}
              >
                <td className="px-3 first:pl-0 py-3 whitespace-nowrap">
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
                <td className="px-3 first:pl-0 py-3 whitespace-nowrap">
                  <span className="text-muted-foreground">
                    {trade.direction === "LONG" ? "Long" : "Short"}
                  </span>
                </td>
                <td className="px-3 first:pl-0 py-3 whitespace-nowrap">
                  <span
                    className={
                      trade.status === "CLOSED"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }
                  >
                    {trade.status.charAt(0) + trade.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-3 first:pl-0 py-3 whitespace-nowrap">
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
                <td className="px-3 first:pl-0 py-3 whitespace-nowrap">
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
                <td className="num px-3 py-3 whitespace-nowrap text-foreground">
                  {trade.quantity.toLocaleString()}
                </td>
                <td className="px-3 first:pl-0 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    {trade.profitLoss !== null ? (
                      <>
                        <div
                          className={`num ${getProfitLossColor(trade.profitLoss)}`}
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
                <td className="pl-3 py-3 whitespace-nowrap text-right">
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
