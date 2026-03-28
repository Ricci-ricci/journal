"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import {
  AccountForm,
  AccountFormData,
} from "../../components/forms/AccountForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
} from "../../components/ui/IconButton";

interface Account {
  id: string;
  name: string;
  broker: string | null;
  accountType: "LIVE" | "DEMO" | "PAPER";
  initialBalance: number;
  currentBalance: number;
  totalPnL: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      // Real API call to fetch accounts
      const response = await fetch("/api/accounts");
      const result = await response.json();

      if (result.success) {
        setAccounts(result.data);
      } else {
        console.error("Failed to fetch accounts:", result.error);
        alert("Failed to fetch accounts: " + result.error);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      alert("Failed to fetch accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (formData: AccountFormData) => {
    try {
      setSubmitting(true);

      // Real API call to create account
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "69c1194ba84c42e638b96e03", // Demo user ID from seeded data
          name: formData.name,
          broker: formData.broker || null,
          accountType: formData.accountType,
          initialBalance: formData.initialBalance,
          currency: formData.currency,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAccounts((prev) => [result.data, ...prev]);
        setShowForm(false);
        alert("Account created successfully!");
      } else {
        console.error("Failed to create account:", result.error);
        alert("Failed to create account: " + result.error);
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      alert("Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleUpdateAccount = async (formData: AccountFormData) => {
    if (!editingAccount) return;

    try {
      setSubmitting(true);

      // Real API call to update account (Note: PUT endpoint needs to be created)
      const response = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          broker: formData.broker || null,
          accountType: formData.accountType,
          initialBalance: formData.initialBalance,
          currency: formData.currency,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === editingAccount.id ? result.data : acc)),
        );
        setShowForm(false);
        setEditingAccount(null);
        alert("Account updated successfully!");
      } else {
        console.error("Failed to update account:", result.error);
        alert("Failed to update account: " + result.error);
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      alert("Failed to update account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Real API call to delete account (Note: DELETE endpoint needs to be created)
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        alert("Account deleted successfully!");
      } else {
        console.error("Failed to delete account:", result.error);
        alert("Failed to delete account: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAccountTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "LIVE":
        return "danger";
      case "DEMO":
        return "warning";
      case "PAPER":
        return "secondary";
      default:
        return "default";
    }
  };

  if (showForm) {
    return (
      <Layout title={editingAccount ? "Edit Account" : "Add New Account"}>
        <div className="max-w-2xl">
          <AccountForm
            onSubmit={
              editingAccount ? handleUpdateAccount : handleCreateAccount
            }
            onCancel={() => {
              setShowForm(false);
              setEditingAccount(null);
            }}
            initialData={
              editingAccount
                ? {
                    name: editingAccount.name,
                    broker: editingAccount.broker || "",
                    accountType: editingAccount.accountType,
                    initialBalance: editingAccount.initialBalance.toString(),
                    currency: editingAccount.currency,
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
    <Layout title="Trading Accounts">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Manage your trading accounts
            </h2>
            <p className="text-sm text-muted-foreground">
              Add and manage your trading accounts across different brokers and
              account types.
            </p>
          </div>
          <AddIconButton
            tooltip="Add Account"
            size="md"
            onClick={() => setShowForm(true)}
          />
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">
                No accounts
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first trading account.
              </p>
              <div className="mt-6">
                <AddIconButton
                  tooltip="Add Your First Account"
                  size="lg"
                  onClick={() => setShowForm(true)}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{account.name}</CardTitle>
                      {account.broker && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {account.broker}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={getAccountTypeBadgeVariant(account.accountType)}
                    >
                      {account.accountType}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Current Balance */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current Balance
                      </span>
                      <span className="text-lg font-semibold text-foreground">
                        {formatCurrency(
                          account.currentBalance,
                          account.currency,
                        )}
                      </span>
                    </div>

                    {/* P&L */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        All-time P&L
                      </span>
                      <span
                        className={`font-medium ${
                          account.totalPnL >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {account.totalPnL >= 0 ? "+" : ""}
                        {formatCurrency(account.totalPnL, account.currency)}
                      </span>
                    </div>

                    {/* Initial Balance */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Initial Balance
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(
                          account.initialBalance,
                          account.currency,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Currency</span>
                      <span className="font-medium">{account.currency}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(account.createdAt)}</span>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-end space-x-2">
                        <EditIconButton
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                        />
                        <DeleteIconButton
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Account Types Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" size="sm">
                  PAPER
                </Badge>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Paper Trading
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Virtual trading with simulated money for practice and
                    strategy testing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="warning" size="sm">
                  DEMO
                </Badge>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Demo Account
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Broker-provided demo account with virtual funds and real
                    market data.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="danger" size="sm">
                  LIVE
                </Badge>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Live Account
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Real money trading account with actual market execution.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AccountsPage;
