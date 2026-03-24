"use client";

import React from "react";
import { Badge } from "../ui/Badge";

import {
  EditIconButton,
  DeleteIconButton,
  ViewIconButton,
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
  if (profitLoss === null) return "text-gray-500";
  return profitLoss >= 0 ? "text-green-600" : "text-red-600";
};

export const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  loading = false,
  onEditTrade,
  onDeleteTrade,
  onViewTrade,
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
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
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trades</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first trade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Direction
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Entry
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Exit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                P&L
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {trade.symbol}
                    </div>
                    {trade.assetType && (
                      <div className="text-xs text-gray-500">
                        {trade.assetType}
                      </div>
                    )}
                    {trade.setupType && (
                      <div className="text-xs text-gray-500">
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
                    <div className="text-sm text-gray-900">
                      {formatCurrency(
                        trade.entryPrice,
                        trade.account?.currency,
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(trade.entryDate)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {trade.exitPrice ? (
                      <>
                        <div className="text-sm text-gray-900">
                          {formatCurrency(
                            trade.exitPrice,
                            trade.account?.currency,
                          )}
                        </div>
                        {trade.exitDate && (
                          <div className="text-xs text-gray-500">
                            {formatDate(trade.exitDate)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">-</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                      <div className="text-sm text-gray-500">-</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-1">
                    {onViewTrade && (
                      <ViewIconButton
                        size="sm"
                        onClick={() => onViewTrade(trade)}
                      />
                    )}
                    {onEditTrade && (
                      <EditIconButton
                        size="sm"
                        onClick={() => onEditTrade(trade)}
                      />
                    )}
                    {onDeleteTrade && (
                      <DeleteIconButton
                        size="sm"
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
