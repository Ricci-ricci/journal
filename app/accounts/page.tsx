"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import {
  AccountForm,
  AccountFormData,
} from "../../components/forms/AccountForm";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  EditIconButton,
  DeleteIconButton,
} from "../../components/ui/IconButton";
import { EmptyState } from "../../components/ui/Stat";
import { useAuth } from "../../contexts/AuthContext";
import { useAccounts } from "../../contexts/AccountsContext";

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
  const { user } = useAuth();
  const { refetch: refetchAccountsContext } = useAccounts();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      // Real API call to fetch accounts
      const response = await fetch(`/api/accounts?userId=${user?.id}`);
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
    if (!user) {
      alert("You must be logged in to create an account.");
      return;
    }

    try {
      setSubmitting(true);

      // Real API call to create account
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id ?? "",
          name: formData.name,
          broker: formData.broker || null,
          accountType: formData.accountType,
          initialBalance: parseFloat(formData.initialBalance),
          currency: formData.currency,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await Promise.all([fetchAccounts(), refetchAccountsContext()]);
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
          initialBalance: parseFloat(formData.initialBalance),
          currency: formData.currency,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await Promise.all([fetchAccounts(), refetchAccountsContext()]);
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
        await refetchAccountsContext();
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

  if (showForm) {
    return (
      <Layout title={editingAccount ? "Edit account" : "New account"}>
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
    <Layout title="Accounts">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground max-w-xl">
            One per broker account. Live, demo and paper balances are tracked
            separately.
          </p>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add account
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="mt-5 h-7 w-2/3 rounded bg-muted" />
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            action={
              <Button size="sm" onClick={() => setShowForm(true)}>
                Add an account
              </Button>
            }
          >
            Add the account you trade from so balances and P&amp;L have
            somewhere to live.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-medium text-foreground truncate">
                      {account.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {[account.broker, account.accountType.toLowerCase()]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0 -mt-1.5 -mr-2">
                    <EditIconButton
                      size="md"
                      onClick={() => handleEditAccount(account)}
                    />
                    <DeleteIconButton
                      size="md"
                      onClick={() => handleDeleteAccount(account.id)}
                    />
                  </div>
                </div>

                <p className="num mt-5 text-2xl tracking-tight text-foreground">
                  {formatCurrency(account.currentBalance, account.currency)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span
                    className={`num ${
                      account.totalPnL > 0
                        ? "text-profit"
                        : account.totalPnL < 0
                          ? "text-loss"
                          : ""
                    }`}
                  >
                    {account.totalPnL >= 0 ? "+" : ""}
                    {formatCurrency(account.totalPnL, account.currency)}
                  </span>{" "}
                  from{" "}
                  <span className="num">
                    {formatCurrency(account.initialBalance, account.currency)}
                  </span>{" "}
                  · opened {formatDate(account.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AccountsPage;
