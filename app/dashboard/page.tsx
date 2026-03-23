'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

interface DashboardStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnL: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
}

interface RecentTrade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED' | 'PARTIAL';
  entryPrice: number;
  profitLoss: number | null;
  entryDate: string;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls - replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Mock data for now
        setStats({
          totalTrades: 47,
          openTrades: 3,
          closedTrades: 44,
          totalPnL: 2847.50,
          winRate: 63.6,
          averageWin: 127.30,
          averageLoss: -89.20,
          bestTrade: 542.80,
          worstTrade: -234.50,
        });

        setRecentTrades([
          {
            id: '1',
            symbol: 'BTC/USD',
            direction: 'LONG',
            status: 'OPEN',
            entryPrice: 67500,
            profitLoss: null,
            entryDate: new Date().toISOString(),
          },
          {
            id: '2',
            symbol: 'AAPL',
            direction: 'LONG',
            status: 'CLOSED',
            entryPrice: 182.50,
            profitLoss: 145.20,
            entryDate: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            symbol: 'EUR/USD',
            direction: 'SHORT',
            status: 'CLOSED',
            entryPrice: 1.0845,
            profitLoss: -67.80,
            entryDate: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    return `${percent.toFixed(1)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDirectionBadgeVariant = (direction: string) => {
    return direction === 'LONG' ? 'success' : 'danger';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'CLOSED':
        return 'default';
      case 'PARTIAL':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getProfitLossColor = (profitLoss: number | null): string => {
    if (profitLoss === null) return 'text-gray-500';
    return profitLoss >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Trader!</h2>
          <p className="text-blue-100">
            Here's how your portfolio is performing today.
          </p>
        </div>

        {/* Key Performance Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total P&L</p>
                    <p className={`text-2xl font-bold ${getProfitLossColor(stats.totalPnL)}`}>
                      {formatCurrency(stats.totalPnL)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17V7a1 1 0 011-1h4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1zM9 7a1 1 0 012 0v10a1 1 0 11-2 0V7zM13 5a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercent(stats.winRate)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Trades</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
                    <p className="text-xs text-gray-500">
                      {stats.openTrades} open, {stats.closedTrades} closed
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Trade</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.bestTrade)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Worst: {formatCurrency(stats.worstTrade)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trades */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Trades</CardTitle>
                  <Link href="/trades">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrades.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent trades</p>
                  ) : (
                    recentTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{trade.symbol}</span>
                            <span className="text-sm text-gray-500">{formatDate(trade.entryDate)}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={getDirectionBadgeVariant(trade.direction)} size="sm">
                              {trade.direction}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(trade.status)} size="sm">
                              {trade.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(trade.entryPrice)}
                            </div>
                            {trade.profitLoss !== null && (
                              <div className={`text-sm font-medium ${getProfitLossColor(trade.profitLoss)}`}>
                                {formatCurrency(trade.profitLoss)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Performance Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/trades/new">
                    <Button className="w-full justify-start" variant="primary">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Trade
                    </Button>
                  </Link>
                  <Link href="/journal/new">
                    <Button className="w-full justify-start" variant="secondary">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Add Journal Entry
                    </Button>
                  </Link>
                  <Link href="/strategies">
                    <Button className="w-full justify-start" variant="outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      View Strategies
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Win</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(stats.averageWin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Loss</span>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(stats.averageLoss)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Profit Factor</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(Math.abs(stats.averageWin / stats.averageLoss)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
