"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import { StrategyForm } from "../../components/forms/StrategyForm";
import { Button } from "../../components/ui/Button";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
  ActivateIconButton,
} from "../../components/ui/IconButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";

interface Strategy {
  id: string;
  name: string;
  description: string | null;
  entryRules: string | null;
  exitRules: string | null;
  riskManagementRules: string | null;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
  averageProfit: number | null;
  averageLoss: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const StrategiesPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const response = await fetch("/api/strategies");
      const result = await response.json();
      if (result.success) {
        setStrategies(result.data);
      } else {
        console.log("failed to fetch Strategie");
      }
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = async (formData: any) => {
    try {
      setSubmitting(true);

      // Mock API call
      const newStrategy: Strategy = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description || null,
        entryRules: formData.entryRules || null,
        exitRules: formData.exitRules || null,
        riskManagementRules: formData.riskManagementRules || null,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: null,
        averageProfit: null,
        averageLoss: null,
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setStrategies((prev) => [newStrategy, ...prev]);
      setShowForm(false);
      console.log("Strategy created successfully");
    } catch (error) {
      console.error("Failed to create strategy:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setShowForm(true);
  };

  const handleUpdateStrategy = async (formData: any) => {
    if (!editingStrategy) return;

    try {
      setSubmitting(true);

      const updatedStrategy: Strategy = {
        ...editingStrategy,
        name: formData.name,
        description: formData.description || null,
        entryRules: formData.entryRules || null,
        exitRules: formData.exitRules || null,
        riskManagementRules: formData.riskManagementRules || null,
        isActive: formData.isActive,
        updatedAt: new Date().toISOString(),
      };

      setStrategies((prev) =>
        prev.map((strategy) =>
          strategy.id === editingStrategy.id ? updatedStrategy : strategy,
        ),
      );

      setShowForm(false);
      setEditingStrategy(null);
    } catch (error) {
      console.error("Failed to update strategy:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this strategy? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setStrategies((prev) =>
        prev.filter((strategy) => strategy.id !== strategyId),
      );
      console.log("Strategy deleted successfully");
    } catch (error) {
      console.error("Failed to delete strategy:", error);
    }
  };

  const handleToggleActive = async (strategy: Strategy) => {
    try {
      const updatedStrategy: Strategy = {
        ...strategy,
        isActive: !strategy.isActive,
        updatedAt: new Date().toISOString(),
      };

      setStrategies((prev) =>
        prev.map((s) => (s.id === strategy.id ? updatedStrategy : s)),
      );
    } catch (error) {
      console.error("Failed to toggle strategy status:", error);
    }
  };

  const filteredStrategies = strategies.filter((strategy) => {
    const matchesSearch =
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (strategy.description &&
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterActive === null || strategy.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  const formatPercent = (percent: number | null): string => {
    if (percent === null) return "N/A";
    return `${percent.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (showForm) {
    return (
      <Layout title={editingStrategy ? "Edit Strategy" : "Create New Strategy"}>
        <div className="max-w-4xl">
          <StrategyForm
            onSubmit={
              editingStrategy ? handleUpdateStrategy : handleCreateStrategy
            }
            onCancel={() => {
              setShowForm(false);
              setEditingStrategy(null);
            }}
            initialData={
              editingStrategy
                ? {
                    name: editingStrategy.name,
                    description: editingStrategy.description || "",
                    entryRules: editingStrategy.entryRules || "",
                    exitRules: editingStrategy.exitRules || "",
                    riskManagementRules:
                      editingStrategy.riskManagementRules || "",
                    isActive: editingStrategy.isActive,
                  }
                : undefined
            }
            loading={submitting}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Trading Strategies">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Your Trading Strategies
            </h2>
            <p className="text-sm text-muted-foreground">
              Create, manage and track the performance of your trading
              strategies.
            </p>
          </div>
          <AddIconButton
            tooltip="Create Strategy"
            size="lg"
            onClick={() => setShowForm(true)}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search strategies..."
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
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={filterActive === null ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(null)}
                >
                  All
                </Button>
                <Button
                  variant={filterActive === true ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(true)}
                >
                  Active
                </Button>
                <Button
                  variant={filterActive === false ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(false)}
                >
                  Inactive
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredStrategies.length} of {strategies.length}{" "}
                strategies
                {(searchTerm || filterActive !== null) && (
                  <span className="ml-1">(filtered)</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Strategies List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStrategies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">
                {searchTerm || filterActive !== null
                  ? "No strategies match your filters"
                  : "No strategies"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || filterActive !== null
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first trading strategy."}
              </p>
              {!searchTerm && filterActive === null && (
                <div className="mt-6 flex justify-center">
                  <AddIconButton
                    tooltip="Create Your First Strategy"
                    size="lg"
                    onClick={() => setShowForm(true)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredStrategies.map((strategy) => (
              <Card
                key={strategy.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle>{strategy.name}</CardTitle>
                      <Badge
                        variant={strategy.isActive ? "success" : "secondary"}
                      >
                        {strategy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ActivateIconButton
                        isActive={strategy.isActive}
                        size="sm"
                        onClick={() => handleToggleActive(strategy)}
                      />
                      <EditIconButton
                        size="sm"
                        onClick={() => handleEditStrategy(strategy)}
                      />
                      <DeleteIconButton
                        size="sm"
                        onClick={() => handleDeleteStrategy(strategy.id)}
                      />
                    </div>
                  </div>
                  {strategy.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {strategy.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Performance Metrics */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">
                        Performance
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Trades
                          </span>
                          <span className="text-sm font-medium">
                            {strategy.totalTrades}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Win Rate
                          </span>
                          <span
                            className={`text-sm font-medium ${strategy.winRate && strategy.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {formatPercent(strategy.winRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Avg Profit
                          </span>
                          <span className="text-sm font-medium text-emerald-400">
                            {formatCurrency(strategy.averageProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Avg Loss
                          </span>
                          <span className="text-sm font-medium text-red-400">
                            {formatCurrency(strategy.averageLoss)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Entry Rules */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Entry Rules
                      </h4>
                      {strategy.entryRules ? (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans">
                            {strategy.entryRules}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No entry rules defined
                        </p>
                      )}
                    </div>

                    {/* Exit Rules */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Exit Rules
                      </h4>
                      {strategy.exitRules ? (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans">
                            {strategy.exitRules}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No exit rules defined
                        </p>
                      )}
                    </div>

                    {/* Risk Management */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Risk Management
                      </h4>
                      {strategy.riskManagementRules ? (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans">
                            {strategy.riskManagementRules}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No risk rules defined
                        </p>
                      )}
                      <div className="pt-2 text-xs text-muted-foreground">
                        <p>Created: {formatDate(strategy.createdAt)}</p>
                        <p>Updated: {formatDate(strategy.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StrategiesPage;
