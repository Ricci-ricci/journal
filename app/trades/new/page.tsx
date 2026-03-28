"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "../../../components/layout/Layout";
import { TradeForm } from "../../../components/forms/TradeForm";
import { useAccounts } from "../../../contexts/AccountsContext";

// Demo user ID from seeded data
const DEMO_USER_ID = "69c1194ba84c42e638b96e03";

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
          fetch(`/api/accounts?userId=${DEMO_USER_ID}`),
          fetch("/api/strategies"),
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
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Build the payload matching the /api/trades POST endpoint
      const payload = {
        userId: DEMO_USER_ID,
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
    <Layout title="Add New Trade">
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
                  New Trade
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 mb-6 flex items-center space-x-3">
            <svg
              className="h-5 w-5 text-emerald-400 flex-shrink-0"
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
              className="h-5 w-5 text-red-400 flex-shrink-0"
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

        {/* Tips */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-400">
                Tips for Recording Trades
              </h3>
              <div className="mt-2 text-sm text-blue-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Fill in as much detail as possible for better analysis later
                  </li>
                  <li>
                    Symbol, direction, entry price and quantity are required
                  </li>
                  <li>
                    Add your emotional state and confidence level for
                    psychological insights
                  </li>
                  <li>
                    Link to a strategy if this trade follows a specific plan
                  </li>
                  <li>
                    Use notes to record market conditions and your reasoning
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Loading accounts/strategies */}
        {fetchingData ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
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
