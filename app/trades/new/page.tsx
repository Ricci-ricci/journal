"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "../../../components/layout/Layout";
import { TradeForm } from "../../../components/forms/TradeForm";

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
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    // Fetch accounts and strategies for form dropdowns
    // This would normally be API calls
    setAccounts([
      { id: "1", name: "Main Trading Account", currency: "USD" },
      { id: "2", name: "Demo Account", currency: "USD" },
      { id: "3", name: "Paper Trading", currency: "USD" },
    ]);

    setStrategies([
      { id: "1", name: "Breakout Strategy" },
      { id: "2", name: "Mean Reversion" },
      { id: "3", name: "Swing Trading v1" },
    ]);
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);

      // Mock API call to create trade
      console.log("Creating trade with data:", formData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, we'll just log the data and redirect
      // In a real app, you'd make an API call to POST /api/trades
      const tradeData = {
        userId: "demo-user-id", // This would come from auth context
        accountId: formData.accountId || null,
        strategyId: formData.strategyId || null,
        symbol: formData.symbol,
        assetType: formData.assetType || null,
        direction: formData.direction,
        status: formData.status || "OPEN",
        entryDate: formData.entryDate,
        entryPrice: parseFloat(formData.entryPrice),
        quantity: parseFloat(formData.quantity),
        exitDate: formData.exitDate || null,
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

      console.log("Trade created successfully:", tradeData);

      // Redirect to trades page
      router.push("/trades");
    } catch (error) {
      console.error("Failed to create trade:", error);
      // Here you would show an error message to the user
      alert("Failed to create trade. Please try again.");
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
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Trades
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  New Trade
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
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
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tips for Recording Trades
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Fill in as much detail as possible for better analysis later
                  </li>
                  <li>Entry price and quantity are required fields</li>
                  <li>
                    Add your emotional state and confidence level for
                    psychological insights
                  </li>
                  <li>
                    Link to a strategy if this trade follows a specific plan
                  </li>
                  <li>Use notes to record market conditions and reasoning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Form */}
        <TradeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          accounts={accounts}
          strategies={strategies}
        />
      </div>
    </Layout>
  );
};

export default NewTradePage;
