"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Layout } from "../../../../components/layout/Layout";
import { TradeForm } from "../../../../components/forms/TradeForm";
import { useAccounts } from "../../../../contexts/AccountsContext";
import { useAuth } from "../../../../contexts/AuthContext";

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface Strategy {
  id: string;
  name: string;
}

interface TradeData {
  id: string;
  accountId: string | null;
  strategyId: string | null;
  symbol: string;
  assetType: string | null;
  direction: string;
  status: string;
  entryDate: string;
  entryPrice: number;
  quantity: number;
  exitDate: string | null;
  exitPrice: number | null;
  commission: number;
  fees: number;
  profitLoss: number | null;
  profitLossPercent: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  riskRewardRatio: number | null;
  setupType: string | null;
  timeFrame: string | null;
  notes: string | null;
  confidenceLevel: number | null;
  emotionalState: string | null;
  tags: string[];
  chartImageUrl: string | null;
}

const EditTradePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const tradeId = params?.id as string;

  const { user } = useAuth();
  const { refetch: refetchAccounts } = useAccounts();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [trade, setTrade] = useState<TradeData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !tradeId) return;

    const fetchPageData = async () => {
      try {
        setFetchingData(true);
        setErrorMsg(null);

        const [tradeRes, accountsRes, strategiesRes] = await Promise.all([
          fetch(`/api/trades/${tradeId}`),
          fetch(`/api/accounts?userId=${user.id}`),
          fetch(`/api/strategies?userId=${user.id}`),
        ]);

        const [tradeData, accountsData, strategiesData] = await Promise.all([
          tradeRes.json(),
          accountsRes.json(),
          strategiesRes.json(),
        ]);

        if (!tradeData.success) {
          setErrorMsg(tradeData.error || "Failed to load trade.");
          return;
        }

        setTrade(tradeData.data);

        if (accountsData.success) setAccounts(accountsData.data);
        if (strategiesData.success) setStrategies(strategiesData.data);
      } catch (error) {
        console.error("Failed to fetch page data:", error);
        setErrorMsg("Failed to load trade data. Please try again.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchPageData();
  }, [user, tradeId]);

  // Convert the numeric trade fields to strings for TradeForm
  const buildInitialData = (t: TradeData) => ({
    accountId: t.accountId ?? "",
    strategyId: t.strategyId ?? "",
    symbol: t.symbol,
    assetType: t.assetType ?? "",
    direction: t.direction,
    status: t.status,
    entryDate: new Date(t.entryDate).toISOString().slice(0, 16),
    entryPrice: t.entryPrice.toString(),
    quantity: t.quantity.toString(),
    exitDate: t.exitDate ? new Date(t.exitDate).toISOString().slice(0, 16) : "",
    exitPrice: t.exitPrice != null ? t.exitPrice.toString() : "",
    commission: t.commission.toString(),
    fees: t.fees.toString(),
    profitLoss: t.profitLoss != null ? t.profitLoss.toString() : "",
    profitLossPercent:
      t.profitLossPercent != null ? t.profitLossPercent.toString() : "",
    stopLoss: t.stopLoss != null ? t.stopLoss.toString() : "",
    takeProfit: t.takeProfit != null ? t.takeProfit.toString() : "",
    riskRewardRatio:
      t.riskRewardRatio != null ? t.riskRewardRatio.toString() : "",
    setupType: t.setupType ?? "",
    timeFrame: t.timeFrame ?? "",
    notes: t.notes ?? "",
    confidenceLevel:
      t.confidenceLevel != null ? t.confidenceLevel.toString() : "",
    emotionalState: t.emotionalState ?? "",
  });

  const handleSubmit = async (formData: {
    accountId: string;
    strategyId: string;
    symbol: string;
    assetType: string;
    direction: string;
    status: string;
    entryDate: string;
    entryPrice: string;
    quantity: string;
    exitDate: string;
    exitPrice: string;
    commission: string;
    fees: string;
    profitLoss: string;
    profitLossPercent: string;
    stopLoss: string;
    takeProfit: string;
    riskRewardRatio: string;
    setupType: string;
    timeFrame: string;
    notes: string;
    confidenceLevel: string;
    emotionalState: string;
    tags?: string[];
    chartImageUrl?: string;
  }) => {
    if (!user) {
      setErrorMsg("You must be logged in to edit a trade.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload = {
        accountId: formData.accountId || null,
        strategyId: formData.strategyId || null,
        symbol: formData.symbol,
        assetType: formData.assetType || null,
        direction: formData.direction,
        status: formData.status || "OPEN",
        entryDate: new Date(formData.entryDate).toISOString(),
        entryPrice: parseFloat(formData.entryPrice),
        quantity: parseFloat(formData.quantity),
        exitDate: formData.exitDate
          ? new Date(formData.exitDate).toISOString()
          : null,
        exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
        commission: parseFloat(formData.commission || "0"),
        fees: parseFloat(formData.fees || "0"),
        profitLoss: formData.profitLoss
          ? parseFloat(formData.profitLoss)
          : null,
        profitLossPercent: formData.profitLossPercent
          ? parseFloat(formData.profitLossPercent)
          : null,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        takeProfit: formData.takeProfit
          ? parseFloat(formData.takeProfit)
          : null,
        riskRewardRatio: formData.riskRewardRatio
          ? parseFloat(formData.riskRewardRatio)
          : null,
        setupType: formData.setupType || null,
        timeFrame: formData.timeFrame || null,
        notes: formData.notes || null,
        tags: formData.tags || [],
        chartImageUrl: formData.chartImageUrl || null,
        confidenceLevel: formData.confidenceLevel
          ? parseInt(formData.confidenceLevel)
          : null,
        emotionalState: formData.emotionalState || null,
      };

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // If status changed to CLOSED, refresh account balances
        if (result.data.status === "CLOSED") {
          await refetchAccounts();
        }
        setSuccessMsg(
          `Trade for ${result.data.symbol} updated successfully! Redirecting...`,
        );
        setTimeout(() => {
          router.push("/trades");
        }, 1500);
      } else {
        setErrorMsg(`Failed to update trade: ${result.error || result.details}`);
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to update trade:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/trades");
  };

  return (
    <Layout title="Edit Trade">
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="/trades"
                className="inline-flex items-center text-sm font-medium text-foreground hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Trades
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-muted-foreground md:ml-2">
                  Edit Trade
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 mb-6 flex items-center space-x-3">
            <svg
              className="h-5 w-5 text-emerald-400 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-emerald-400">{successMsg}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-6 flex items-center space-x-3">
            <svg
              className="h-5 w-5 text-red-400 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* Loading State */}
        {fetchingData ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading trade data...</p>
          </div>
        ) : trade ? (
          <TradeForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={buildInitialData(trade)}
            loading={loading}
            accounts={accounts}
            strategies={strategies}
          />
        ) : (
          !errorMsg && (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Trade not found.</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default EditTradePage;
