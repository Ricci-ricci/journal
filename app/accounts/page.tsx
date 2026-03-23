'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/layout/Layout';
import { AccountForm } from '../../components/forms/AccountForm';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Account {
  id: string;
  name: string;
  broker: string | null;
  accountType: 'LIVE' | 'DEMO' | 'PAPER';
  initialBalance: number;
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

      // Mock data - replace with actual API call
      const mockAccounts: Account[] = [
        {
          id: '1',
          name: 'Main Trading Account',
          broker: 'Interactive Brokers',
          accountType: 'LIVE',
          initialBalance: 50000,
          currency: 'USD',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '2',
          name: 'Demo Practice Account',
          broker: 'TD Ameritrade',
          accountType: 'DEMO',
          initialBalance: 100000,
          currency: 'USD',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '3',
          name: 'Paper Trading',
          broker: null,
          accountType: 'PAPER',
          initialBalance: 25000,
          currency: 'USD',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (formData: any) => {
    try {
      setSubmitting(true);

      // Mock API call - replace with actual implementation
      const newAccount: Account = {
        id: Date.now().toString(),
        name: formData.name,
        broker: formData.broker || null,
        accountType: formData.accountType,
        initialBalance: parseFloat(formData.initialBalance),
        currency: formData.currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAccounts(prev => [newAccount, ...prev]);
      setShowForm(false);

      // Show success message (you could add a toast here)
      console.log('Account created successfully');

    } catch (error) {
      console.error('Failed to create account:', error);
      // Handle error (show error message)
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleUpdateAccount = async (formData: any) => {
    if (!editingAccount) return;

    try {
      setSubmitting(true);

      // Mock API call
      const updatedAccount: Account = {
        ...editingAccount,
        name: formData.name,
        broker: formData.broker || null,
        accountType: formData.accountType,
        initialBalance: parseFloat(formData.initialBalance),
        currency: formData.currency,
        updatedAt: new Date().toISOString(),
      };

      setAccounts(prev =>
        prev.map(acc => acc.id === editingAccount.id ? updatedAccount : acc)
      );

      setShowForm(false);
      setEditingAccount(null);

    } catch (error) {
      console.error('Failed to update account:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      // Mock API call
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAccountTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'LIVE':
        return 'danger';
      case 'DEMO':
        return 'warning';
      case 'PAPER':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (showForm) {
    return (
      <Layout title={editingAccount ? 'Edit Account' : 'Add New Account'}>
        <div className="max-w-2xl">
          <AccountForm
            onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
            onCancel={() => {
              setShowForm(false);
              setEditingAccount(null);
            }}
            initialData={editingAccount ? {
              name: editingAccount.name,
              broker: editingAccount.broker || '',
              accountType: editingAccount.accountType,
              initialBalance: editingAccount.initialBalance.toString(),
              currency: editingAccount.currency,
            } : undefined}
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
            <h2 className="text-lg font-medium text-gray-900">Manage your trading accounts</h2>
            <p className="text-sm text-gray-500">
              Add and manage your trading accounts across different brokers and account types.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Account
          </Button>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first trading account.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Account
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{account.name}</CardTitle>
                      {account.broker && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{account.broker}</p>
                      )}
                    </div>
                    <Badge variant={getAccountTypeBadgeVariant(account.accountType)}>
                      {account.accountType}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Initial Balance</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(account.initialBalance, account.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Currency</span>
                      <span className="font-medium">{account.currency}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created</span>
                      <span>{formatDate(account.createdAt)}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="flex-1"
                        >
                          Delete
                        </Button>
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
                <Badge variant="secondary" size="sm">PAPER</Badge>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Paper Trading</h4>
                  <p className="text-xs text-gray-500">
                    Virtual trading with simulated money for practice and strategy testing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="warning" size="sm">DEMO</Badge>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Demo Account</h4>
                  <p className="text-xs text-gray-500">
                    Broker-provided demo account with virtual funds and real market data.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="danger" size="sm">LIVE</Badge>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Live Account</h4>
                  <p className="text-xs text-gray-500">
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
