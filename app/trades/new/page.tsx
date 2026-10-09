"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "../../../components/layout/Layout";
import { TradeForm } from "../../../components/forms/TradeForm";
import { useAccounts } from "../../../contexts/AccountsContext";
import { useAuth } from "../../../contexts/AuthContext";

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface Strategy {
  id: string;
  name: string;
}

const NewTradePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { refetch: refetchAccounts } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch accounts and strategies from real API on mount
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setFetchingData(true);

        const [accountsRes, strategiesRes] = await Promise.all([
          fetch(`/api/accounts?userId=${user?.id}`),
          fetch(`/api/strategies?userId=${user?.id}`),
        ]);

        const [accountsData, strategiesData] = await Promise.all([
          accountsRes.json(),
          strategiesRes.json(),
        ]);

        if (accountsData.success) {
          setAccounts(accountsData.data);
        } else {
          console.error("Failed to fetch accounts:", accountsData.error);
        }

        if (strategiesData.success) {
          setStrategies(strategiesData.data);
        } else {
          console.error("Failed to fetch strategies:", strategiesData.error);
        }
      } catch (error) {
        console.error("Failed to fetch form data:", error);
        setErrorMsg("Failed to load accounts and strategies.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchFormData();
  }, [user?.id]);

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
      setErrorMsg("You must be logged in to create a trade.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Build the payload matching the /api/trades POST endpoint
      const payload = {
        userId: user?.id ?? "",
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

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMsg(
          `Trade for ${result.data.symbol} created successfully! Redirecting...`,
        );
        // If the trade was created as CLOSED, refresh account balances immediately
        if (result.data.status === "CLOSED") {
          await refetchAccounts();
        }
        setTimeout(() => {
          router.push("/trades");
        }, 1500);
      } else {
        setErrorMsg(
          `Failed to create trade: ${result.error || result.details}`,
        );
        console.error("API error:", result);
      }
    } catch (error) {
      console.error("Failed to create trade:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout title="New trade">
      <div className="max-w-3xl">
        <Link
          href="/trades"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Trades
        </Link>

        {successMsg && (
          <p
            role="status"
            className="mb-5 rounded-md border border-profit/40 bg-profit/10 px-3 py-2.5 text-sm text-profit"
          >
            {successMsg}
          </p>
        )}

        {errorMsg && (
          <p
            role="alert"
            className="mb-5 rounded-md border border-loss/40 bg-loss/10 px-3 py-2.5 text-sm text-loss"
          >
            {errorMsg}
          </p>
        )}

        {/* Loading accounts/strategies */}
        {fetchingData ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            
            <p className="text-sm text-muted-foreground">
              Loading accounts and strategies...
            </p>
          </div>
        ) : (
          <TradeForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            accounts={accounts}
            strategies={strategies}
          />
        )}
      </div>
    </Layout>
  );
};

export default NewTradePage;
