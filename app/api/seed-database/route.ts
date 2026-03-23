import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log('🌱 Starting database seeding via API...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.performanceMetric.deleteMany({});
    await prisma.journalEntry.deleteMany({});
    await prisma.trade.deleteMany({});
    await prisma.strategy.deleteMany({});
    await prisma.tradingAccount.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Create a demo user
    console.log('👤 Creating demo user...');
    const user = await prisma.user.create({
      data: {
        email: 'demo@tradingjournal.com',
        name: 'Demo Trader',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFCho4.pLG6WdZ6', // "password123" hashed
      },
    });

    // 2. Create trading accounts
    console.log('💰 Creating trading accounts...');
    const accounts = await Promise.all([
      prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: 'Main Trading Account',
          broker: 'Interactive Brokers',
          accountType: 'LIVE',
          initialBalance: 50000.00,
          currency: 'USD',
        },
      }),
      prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: 'Demo Practice Account',
          broker: 'TD Ameritrade',
          accountType: 'DEMO',
          initialBalance: 100000.00,
          currency: 'USD',
        },
      }),
      prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: 'Paper Trading',
          broker: null,
          accountType: 'PAPER',
          initialBalance: 25000.00,
          currency: 'USD',
        },
      }),
    ]);

    // 3. Create trading strategies
    console.log('🎯 Creating trading strategies...');
    const strategies = await Promise.all([
      prisma.strategy.create({
        data: {
          userId: user.id,
          name: 'Breakout Strategy v1',
          description: 'High-volume breakout strategy for trending markets',
          entryRules: '• Price breaks above resistance with volume > 1.5x average\n• RSI above 50\n• MACD bullish crossover\n• Clear trend direction on higher timeframe',
          exitRules: '• Take profit at 2:1 risk/reward ratio\n• Stop loss at previous support level\n• Exit if volume drops below average\n• Trail stop at 20 EMA on pullbacks',
          riskManagementRules: '• Risk maximum 2% per trade\n• No more than 3 concurrent positions\n• Daily loss limit: 6% of account\n• Position sizing based on ATR',
          totalTrades: 47,
          winningTrades: 29,
          losingTrades: 18,
          winRate: 61.7,
          averageProfit: 156.80,
          averageLoss: -89.20,
          isActive: true,
        },
      }),
      prisma.strategy.create({
        data: {
          userId: user.id,
          name: 'Mean Reversion Strategy',
          description: 'Counter-trend strategy for oversold/overbought conditions',
          entryRules: '• RSI below 30 (oversold) or above 70 (overbought)\n• Price touches Bollinger Band\n• Stochastic oversold/overbought confirmation\n• Volume spike on reversal signal',
          exitRules: '• Exit when RSI returns to 50 level\n• Take profit at opposite Bollinger Band\n• Stop loss beyond recent swing high/low\n• Time-based exit after 2 days',
          riskManagementRules: '• Risk maximum 1.5% per trade\n• Maximum 2 positions at once\n• Avoid during strong trending markets\n• Reduce size during high volatility',
          totalTrades: 23,
          winningTrades: 16,
          losingTrades: 7,
          winRate: 69.6,
          averageProfit: 92.40,
          averageLoss: -45.80,
          isActive: true,
        },
      }),
      prisma.strategy.create({
        data: {
          userId: user.id,
          name: 'Swing Trading v1',
          description: 'Multi-day swing trading strategy for momentum stocks',
          entryRules: '• Higher highs and higher lows pattern\n• 50 EMA above 200 EMA (uptrend)\n• Volume confirmation on entry\n• Strong sector performance',
          exitRules: '• Hold for 3-7 days target\n• Exit on momentum divergence\n• Trailing stop at 20 EMA\n• Take partial profits at resistance',
          riskManagementRules: '• Risk maximum 3% per trade\n• Maximum 5 positions in portfolio\n• No trades during earnings week\n• Sector diversification required',
          totalTrades: 12,
          winningTrades: 5,
          losingTrades: 7,
          winRate: 41.7,
          averageProfit: 234.50,
          averageLoss: -123.20,
          isActive: false,
        },
      }),
    ]);

    // 4. Create trades
    console.log('📈 Creating trades...');
    const trades = await Promise.all([
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          strategyId: strategies[0].id,
          symbol: 'BTC/USD',
          assetType: 'CRYPTO',
          direction: 'LONG',
          status: 'CLOSED',
          entryDate: new Date(Date.now() - 86400000 * 2),
          entryPrice: 64000.00,
          quantity: 0.5,
          exitDate: new Date(Date.now() - 86400000),
          exitPrice: 66000.00,
          commission: 15.00,
          fees: 5.00,
          profitLoss: 980.00,
          profitLossPercent: 3.06,
          stopLoss: 62000.00,
          takeProfit: 68000.00,
          riskRewardRatio: 2.0,
          setupType: 'Volume Breakout',
          timeFrame: '1h',
          notes: 'Perfect breakout setup with strong volume confirmation. Market opened with clear bullish momentum.',
          tags: ['crypto', 'breakout', 'high-volume'],
          confidenceLevel: 8,
          emotionalState: 'Confident',
        },
      }),
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          strategyId: strategies[0].id,
          symbol: 'NVDA',
          assetType: 'STOCK',
          direction: 'LONG',
          status: 'OPEN',
          entryDate: new Date(),
          entryPrice: 850.50,
          quantity: 10,
          commission: 2.00,
          fees: 1.00,
          stopLoss: 825.00,
          takeProfit: 900.00,
          riskRewardRatio: 1.94,
          setupType: 'AI Momentum',
          timeFrame: '4h',
          notes: 'Strong AI sector momentum with earnings catalyst. Clear breakout above resistance.',
          tags: ['ai', 'momentum', 'earnings'],
          confidenceLevel: 9,
          emotionalState: 'Excited',
        },
      }),
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[1].id,
          strategyId: strategies[1].id,
          symbol: 'EUR/USD',
          assetType: 'FOREX',
          direction: 'SHORT',
          status: 'CLOSED',
          entryDate: new Date(Date.now() - 3600000 * 6),
          entryPrice: 1.0950,
          quantity: 10000,
          exitDate: new Date(Date.now() - 3600000 * 2),
          exitPrice: 1.0980,
          commission: 0.00,
          fees: 2.50,
          profitLoss: -32.50,
          profitLossPercent: -0.30,
          stopLoss: 1.1000,
          takeProfit: 1.0900,
          riskRewardRatio: 1.0,
          setupType: 'Overbought Reversal',
          timeFrame: '15m',
          notes: 'RSI showed overbought but trend was too strong. Should have waited for confirmation.',
          tags: ['forex', 'reversal', 'lesson'],
          confidenceLevel: 5,
          emotionalState: 'Frustrated',
        },
      }),
    ]);

    // 5. Create journal entries
    console.log('📖 Creating journal entries...');
    const journalEntries = await Promise.all([
      prisma.journalEntry.create({
        data: {
          userId: user.id,
          entryDate: new Date(),
          entryType: 'DAILY',
          title: 'Strong Trading Day - Breakout Success',
          content: 'Today was an exceptional trading day with clear market direction. Successfully captured NVDA breakout and maintained discipline throughout the session.',
          whatWentWell: 'Perfect execution on NVDA breakout trade. Risk management was excellent - set stops and targets before entry. Emotional control remained strong.',
          whatWentWrong: 'Missed the AAPL setup due to hesitation when all my criteria were met. Need to trust my analysis more.',
          lessonsLearned: 'Hesitation costs money in trading. When all criteria align, execute without second-guessing.',
          goalsNextPeriod: 'Focus on faster execution tomorrow. Review the AAPL setup to understand hesitation cause.',
          marketConditions: 'Strong bullish momentum in tech sector. Low volatility with clear directional moves. Perfect for breakout strategies.',
        },
      }),
      prisma.journalEntry.create({
        data: {
          userId: user.id,
          entryDate: new Date(Date.now() - 86400000 * 7),
          entryType: 'WEEKLY',
          title: 'Week 47 Review - Mixed Results',
          content: 'This week showed mixed results with 3 winning days and 2 losing days. Overall profitable but below average performance.',
          whatWentWell: 'Risk management was consistent. No major drawdowns or emotional trading. Stuck to position sizing rules.',
          whatWentWrong: 'Missed several high-probability setups due to lack of preparation. Position sizing too conservative on best setups.',
          lessonsLearned: 'Preparation is key to consistent performance. Evening analysis routine must be mandatory.',
          goalsNextPeriod: 'Implement 30-minute evening routine. Increase size on highest conviction trades.',
          marketConditions: 'Mixed week with sector rotation. First half choppy, second half showed clearer trends.',
        },
      }),
      prisma.journalEntry.create({
        data: {
          userId: user.id,
          entryDate: new Date(Date.now() - 86400000 * 30),
          entryType: 'MONTHLY',
          title: 'November Performance Analysis',
          content: 'November was a strong month with 12% portfolio growth. Breakout strategy performed exceptionally well.',
          whatWentWell: 'Breakout strategy delivered 65% win rate. Risk management prevented major drawdowns. Emotional discipline improved.',
          whatWentWrong: 'Mean reversion underperformed in trending environment. Position sizing inconsistent on swing trades.',
          lessonsLearned: 'Strategy selection must match market regime. Trending markets favor breakout strategies.',
          goalsNextPeriod: 'Develop market regime filter. Create position sizing calculator. Focus on quality over quantity.',
          marketConditions: 'Strong trending month driven by AI momentum. Low volatility with sustained directional moves.',
        },
      }),
    ]);

    // 6. Create performance metrics
    console.log('📊 Creating performance metrics...');
    const performanceMetrics = await Promise.all([
      prisma.performanceMetric.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          metricDate: new Date(),
          totalTrades: 2,
          winningTrades: 1,
          losingTrades: 0,
          dailyPnl: 125.50,
          cumulativePnl: 2847.50,
          accountBalance: 52847.50,
          winRate: 100.0,
          profitFactor: 2.45,
          sharpeRatio: 1.85,
          maxDrawdown: -234.50,
        },
      }),
      prisma.performanceMetric.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          metricDate: new Date(Date.now() - 86400000),
          totalTrades: 3,
          winningTrades: 2,
          losingTrades: 1,
          dailyPnl: 342.80,
          cumulativePnl: 2722.00,
          accountBalance: 52722.00,
          winRate: 66.7,
          profitFactor: 2.15,
          sharpeRatio: 1.72,
          maxDrawdown: -189.25,
        },
      }),
      prisma.performanceMetric.create({
        data: {
          userId: user.id,
          accountId: accounts[1].id,
          metricDate: new Date(),
          totalTrades: 5,
          winningTrades: 3,
          losingTrades: 2,
          dailyPnl: -87.25,
          cumulativePnl: 1456.75,
          accountBalance: 101456.75,
          winRate: 60.0,
          profitFactor: 1.89,
          sharpeRatio: 1.32,
          maxDrawdown: -445.80,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: 1,
        accounts: accounts.length,
        strategies: strategies.length,
        trades: trades.length,
        journalEntries: journalEntries.length,
        performanceMetrics: performanceMetrics.length,
      }
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
