'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/layout/Layout';
import { TradesTable } from '../../components/tables/TradesTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

interface Trade {
  id: string;
  symbol: string;
  assetType: string | null;
  direction: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED' | 'PARTIAL';
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

interface TradesStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnL: number;
  winRate: number;
}

const TradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'PARTIAL', label: 'Partial' },
  ];

  const directionOptions = [
    { value: '', label: 'All Directions' },
    { value: 'LONG', label: 'Long' },
    { value: 'SHORT', label: 'Short' },
  ];

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);

        // Mock data - replace with actual API call
        const mockTrades: Trade[] = [
          {
            id: '1',
            symbol: 'BTC/USD',
            assetType: 'CRYPTO',
            direction: 'LONG',
            status: 'OPEN',
            entryDate: new Date().toISOString(),
            entryPrice: 67500,
            quantity: 0.5,
            exitDate: null,
            exitPrice: null,
            commission: 15,
            fees: 5,
            profitLoss: null,
            profitLossPercent: null,
            setupType: 'Breakout',
            timeFrame: '1h',
            notes: 'Strong bullish momentum',
            confidenceLevel: 8,
            emotionalState: 'Confident',
            createdAt: new Date().toISOString(),
            account: { name: 'Main Account', currency: 'USD' },
          },
          {
            id: '2',
            symbol: 'AAPL',
            assetType: 'STOCK',
            direction: 'LONG',
            status: 'CLOSED',
            entryDate: new Date(Date.now() - 86400000).toISOString(),
            entryPrice: 182.50,
            quantity: 100,
            exitDate: new Date(Date.now() - 43200000).toISOString(),
            exitPrice: 185.95,
            commission: 2,
            fees: 1,
            profitLoss: 342,
            profitLossPercent: 1.87,
            setupType: 'Support Bounce',
            timeFrame: '4h',
            notes: 'Clean bounce off support level',
            confidenceLevel: 7,
            emotionalState: 'Calm',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            account: { name: 'Main Account', currency: 'USD' },
          },
          {
            id: '3',
            symbol: 'EUR/USD',
            assetType: 'FOREX',
            direction: 'SHORT',
            status: 'CLOSED',
            entryDate: new Date(Date.now() - 172800000).toISOString(),
            entryPrice: 1.0845,
            quantity: 10000,
            exitDate: new Date(Date.now() - 129600000).toISOString(),
            exitPrice: 1.0878,
            commission: 0,
            fees: 2,
            profitLoss: -35,
            profitLossPercent: -0.30,
            setupType: 'Resistance Rejection',
            timeFrame: '15m',
            notes: 'Failed to hold below resistance',
            confidenceLevel: 5,
            emotionalState: 'Frustrated',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            account: { name: 'Forex Account', currency: 'USD' },
          },
        ];

        setTrades(mockTrades);

        // Calculate stats
        const openTrades = mockTrades.filter(t => t.status === 'OPEN').length;
        const closedTrades = mockTrades.filter(t => t.status === 'CLOSED');
        const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
        const winningTrades = closedTrades.filter(t => (t.profitLoss || 0) > 0).length;
        const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

        setStats({
          totalTrades: mockTrades.length,
          openTrades,
          closedTrades: closedTrades.length,
          totalPnL,
          winRate,
        });

      } catch (error) {
        console.error('Failed to fetch trades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || trade.status === statusFilter;
    const matchesDirection = !directionFilter || trade.direction === directionFilter;

    return matchesSearch && matchesStatus && matchesDirection;
  });

  const handleEditTrade = (trade: Trade) => {
    // Navigate to edit page or open modal
    console.log('Edit trade:', trade.id);
  };

  const handleDeleteTrade = (tradeId: string) => {
    // Confirm and delete trade
    if (confirm('Are you sure you want to delete this trade?')) {
      setTrades(trades.filter(t => t.id !== tradeId));
    }
  };

  const handleViewTrade = (trade: Trade) => {
    // Navigate to trade details page
    console.log('View trade:', trade.id);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <Layout title="Trading History">
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Trades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Open Trades</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.openTrades}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Closed Trades</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.closedTrades}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total P&L</p>
                  <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.totalPnL)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{formatPercent(stats.winRate)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <CardTitle>Trade History</CardTitle>
              <Link href="/trades/new">
                <Button variant="primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Trade
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search and Filter Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />

              <Select
                options={directionOptions}
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                placeholder="Filter by direction"
              />

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setDirectionFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredTrades.length} of {trades.length} trades
                {(searchTerm || statusFilter || directionFilter) && (
                  <span className="ml-1">(filtered)</span>
                )}
              </p>
            </div>

            {/* Trades Table */}
            <TradesTable
              trades={filteredTrades}
              loading={loading}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onViewTrade={handleViewTrade}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradesPage;
