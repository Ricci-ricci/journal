import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const prisma = new PrismaClient();

async function seedData() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Create a demo user
    console.log("👤 Creating demo user...");
    const user = await prisma.user.upsert({
      where: { email: "demo@tradingjournal.com" },
      update: {},
      create: {
        email: "demo@tradingjournal.com",
        name: "Demo Trader",
        password:
          "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFCho4.pLG6WdZ6", // "password123" hashed
      },
    });
    console.log(`✅ User created: ${user.email} (${user.id})`);

    // 2. Create trading accounts
    console.log("💰 Creating trading accounts...");
    const accounts = await Promise.all([
      prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: "Main Trading Account",
          broker: "Interactive Brokers",
          accountType: "LIVE",
          initialBalance: 50000.0,
          currency: "USD",
        },
      }),
      prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: "Demo Practice Account",
          broker: "TD Ameritrade",
          accountType: "DEMO",
          initialBalance: 100000.0,
          currency: "USD",
        },
      }),
      prisma.tradingAccount.create({
        data: {
          userId: user.id,
          name: "Paper Trading",
          broker: null,
          accountType: "PAPER",
          initialBalance: 25000.0,
          currency: "USD",
        },
      }),
    ]);
    console.log(`✅ Created ${accounts.length} trading accounts`);

    // 3. Create trading strategies
    console.log("🎯 Creating trading strategies...");
    const strategies = await Promise.all([
      prisma.strategy.create({
        data: {
          userId: user.id,
          name: "Breakout Strategy v1",
          description: "High-volume breakout strategy for trending markets",
          entryRules:
            "• Price breaks above resistance with volume > 1.5x average\n• RSI above 50\n• MACD bullish crossover\n• Clear trend direction on higher timeframe",
          exitRules:
            "• Take profit at 2:1 risk/reward ratio\n• Stop loss at previous support level\n• Exit if volume drops below average\n• Trail stop at 20 EMA on pullbacks",
          riskManagementRules:
            "• Risk maximum 2% per trade\n• No more than 3 concurrent positions\n• Daily loss limit: 6% of account\n• Position sizing based on ATR",
          totalTrades: 47,
          winningTrades: 29,
          losingTrades: 18,
          winRate: 61.7,
          averageProfit: 156.8,
          averageLoss: -89.2,
          isActive: true,
        },
      }),
      prisma.strategy.create({
        data: {
          userId: user.id,
          name: "Mean Reversion Strategy",
          description:
            "Counter-trend strategy for oversold/overbought conditions",
          entryRules:
            "• RSI below 30 (oversold) or above 70 (overbought)\n• Price touches Bollinger Band\n• Stochastic oversold/overbought confirmation\n• Volume spike on reversal signal",
          exitRules:
            "• Exit when RSI returns to 50 level\n• Take profit at opposite Bollinger Band\n• Stop loss beyond recent swing high/low\n• Time-based exit after 2 days",
          riskManagementRules:
            "• Risk maximum 1.5% per trade\n• Maximum 2 positions at once\n• Avoid during strong trending markets\n• Reduce size during high volatility",
          totalTrades: 23,
          winningTrades: 16,
          losingTrades: 7,
          winRate: 69.6,
          averageProfit: 92.4,
          averageLoss: -45.8,
          isActive: true,
        },
      }),
      prisma.strategy.create({
        data: {
          userId: user.id,
          name: "Swing Trading v1",
          description: "Multi-day swing trading strategy for momentum stocks",
          entryRules:
            "• Higher highs and higher lows pattern\n• 50 EMA above 200 EMA (uptrend)\n• Volume confirmation on entry\n• Strong sector performance",
          exitRules:
            "• Hold for 3-7 days target\n• Exit on momentum divergence\n• Trailing stop at 20 EMA\n• Take partial profits at resistance",
          riskManagementRules:
            "• Risk maximum 3% per trade\n• Maximum 5 positions in portfolio\n• No trades during earnings week\n• Sector diversification required",
          totalTrades: 12,
          winningTrades: 5,
          losingTrades: 7,
          winRate: 41.7,
          averageProfit: 234.5,
          averageLoss: -123.2,
          isActive: false,
        },
      }),
    ]);
    console.log(`✅ Created ${strategies.length} trading strategies`);

    // 4. Create trades
    console.log("📈 Creating trades...");
    const trades = await Promise.all([
      // Recent successful trade
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id, // Main account
          strategyId: strategies[0].id, // Breakout strategy
          symbol: "BTC/USD",
          assetType: "CRYPTO",
          direction: "LONG",
          status: "CLOSED",
          entryDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
          entryPrice: 64000.0,
          quantity: 0.5,
          exitDate: new Date(Date.now() - 86400000), // 1 day ago
          exitPrice: 66000.0,
          commission: 15.0,
          fees: 5.0,
          profitLoss: 980.0,
          profitLossPercent: 3.06,
          stopLoss: 62000.0,
          takeProfit: 68000.0,
          riskRewardRatio: 2.0,
          setupType: "Volume Breakout",
          timeFrame: "1h",
          notes:
            "Perfect breakout setup with strong volume confirmation. Market opened with clear bullish momentum.",
          tags: ["crypto", "breakout", "high-volume"],
          confidenceLevel: 8,
          emotionalState: "Confident",
        },
      }),
      // Current open trade
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          strategyId: strategies[0].id,
          symbol: "NVDA",
          assetType: "STOCK",
          direction: "LONG",
          status: "OPEN",
          entryDate: new Date(),
          entryPrice: 850.5,
          quantity: 10,
          commission: 2.0,
          fees: 1.0,
          stopLoss: 825.0,
          takeProfit: 900.0,
          riskRewardRatio: 1.94,
          setupType: "AI Momentum",
          timeFrame: "4h",
          notes:
            "Strong AI sector momentum with earnings catalyst. Clear breakout above resistance.",
          tags: ["ai", "momentum", "earnings"],
          confidenceLevel: 9,
          emotionalState: "Excited",
        },
      }),
      // Failed trade for learning
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[1].id, // Demo account
          strategyId: strategies[1].id, // Mean reversion
          symbol: "EUR/USD",
          assetType: "FOREX",
          direction: "SHORT",
          status: "CLOSED",
          entryDate: new Date(Date.now() - 3600000 * 6), // 6 hours ago
          entryPrice: 1.095,
          quantity: 10000,
          exitDate: new Date(Date.now() - 3600000 * 2), // 2 hours ago
          exitPrice: 1.098,
          commission: 0.0,
          fees: 2.5,
          profitLoss: -32.5,
          profitLossPercent: -0.3,
          stopLoss: 1.1,
          takeProfit: 1.09,
          riskRewardRatio: 1.0,
          setupType: "Overbought Reversal",
          timeFrame: "15m",
          notes:
            "RSI showed overbought but trend was too strong. Should have waited for confirmation.",
          tags: ["forex", "reversal", "lesson"],
          confidenceLevel: 5,
          emotionalState: "Frustrated",
        },
      }),
      // Additional successful trade
      prisma.trade.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          strategyId: strategies[0].id,
          symbol: "AAPL",
          assetType: "STOCK",
          direction: "LONG",
          status: "CLOSED",
          entryDate: new Date(Date.now() - 86400000 * 3),
          entryPrice: 182.5,
          quantity: 50,
          exitDate: new Date(Date.now() - 86400000 * 1),
          exitPrice: 185.95,
          commission: 2.0,
          fees: 1.0,
          profitLoss: 172.5,
          profitLossPercent: 1.89,
          stopLoss: 180.0,
          takeProfit: 188.0,
          riskRewardRatio: 2.2,
          setupType: "Support Bounce",
          timeFrame: "4h",
          notes:
            "Clean bounce off support level with good volume. Followed plan perfectly.",
          tags: ["support", "bounce", "discipline"],
          confidenceLevel: 7,
          emotionalState: "Calm",
        },
      }),
    ]);
    console.log(`✅ Created ${trades.length} trades`);

    // 5. Create journal entries
    console.log("📖 Creating journal entries...");
    const journalEntries = await Promise.all([
      // Today's daily entry
      prisma.journalEntry.create({
        data: {
          userId: user.id,
          entryDate: new Date(),
          entryType: "DAILY",
          title: "Strong Trading Day - Breakout Success",
          content:
            "Today was an exceptional trading day with clear market direction. Successfully captured NVDA breakout and maintained discipline throughout the session. Market conditions were ideal for my breakout strategy.",
          whatWentWell:
            "Perfect execution on NVDA breakout trade. Risk management was excellent - set stops and targets before entry. Emotional control remained strong even during volatile periods. Followed my trading plan without deviation.",
          whatWentWrong:
            "Missed the AAPL setup due to hesitation when all my criteria were met. Spent too much time analyzing instead of executing. Need to trust my analysis more.",
          lessonsLearned:
            "Hesitation costs money in trading. When all my criteria align, I need to execute without second-guessing. Analysis paralysis is real and expensive.",
          goalsNextPeriod:
            "Focus on faster execution tomorrow. Review the AAPL setup to understand what caused my hesitation. Practice trusting my analysis.",
          marketConditions:
            "Strong bullish momentum in tech sector. Low overall market volatility with clear directional moves. Perfect environment for breakout strategies. VIX below 20.",
        },
      }),
      // Weekly review
      prisma.journalEntry.create({
        data: {
          userId: user.id,
          entryDate: new Date(Date.now() - 86400000 * 7),
          entryType: "WEEKLY",
          title: "Week 47 Review - Mixed Results",
          content:
            "This week showed mixed results with 3 winning days and 2 losing days. Overall profitable but performance was below my average. Need to focus on consistency.",
          whatWentWell:
            "Risk management was consistent throughout the week. No major drawdowns or emotional trading. Stuck to position sizing rules and daily loss limits.",
          whatWentWrong:
            "Missed several high-probability setups due to lack of preparation. Position sizing was too conservative on my best setups. Didn't adapt well to changing market conditions mid-week.",
          lessonsLearned:
            "Preparation is absolutely key to consistent performance. Evening analysis routine needs to be mandatory, not optional. Market adaptation skills need improvement.",
          goalsNextPeriod:
            "Implement strict 30-minute evening routine for next day preparation. Increase position size on highest conviction trades. Develop better market regime recognition.",
          marketConditions:
            "Mixed week with sector rotation from tech to value. First half was choppy, second half showed clearer trends. Fed commentary created some volatility mid-week.",
        },
      }),
      // Monthly analysis
      prisma.journalEntry.create({
        data: {
          userId: user.id,
          entryDate: new Date(Date.now() - 86400000 * 30),
          entryType: "MONTHLY",
          title: "November Performance Analysis",
          content:
            "November was a strong month with 12% portfolio growth. Breakout strategy performed exceptionally well in the trending market environment. Risk management improvements are paying off.",
          whatWentWell:
            "Breakout strategy delivered consistent results with 65% win rate. Risk management rules prevented any major drawdowns. Emotional discipline improved significantly from last month.",
          whatWentWrong:
            "Mean reversion strategy underperformed in trending environment. Position sizing was inconsistent on swing trades. Missed opportunities due to over-analysis.",
          lessonsLearned:
            "Strategy selection must match market regime. Trending markets favor breakout strategies. Need better tools for regime identification. Consistency in position sizing is crucial.",
          goalsNextPeriod:
            "Develop market regime filter for strategy selection. Create position sizing calculator. Focus on executing fewer, higher quality trades.",
          marketConditions:
            "Strong trending month driven by AI and tech momentum. Low volatility environment with sustained directional moves. Perfect conditions for momentum strategies.",
        },
      }),
    ]);
    console.log(`✅ Created ${journalEntries.length} journal entries`);

    // 6. Create performance metrics
    console.log("📊 Creating performance metrics...");
    const performanceMetrics = await Promise.all([
      // Today's metrics for main account
      prisma.performanceMetric.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          metricDate: new Date(),
          totalTrades: 2,
          winningTrades: 2,
          losingTrades: 0,
          dailyPnl: 245.75,
          cumulativePnl: 2847.5,
          accountBalance: 52847.5,
          winRate: 100.0,
          profitFactor: 2.45,
          sharpeRatio: 1.85,
          maxDrawdown: -234.5,
        },
      }),
      // Yesterday's metrics for main account
      prisma.performanceMetric.create({
        data: {
          userId: user.id,
          accountId: accounts[0].id,
          metricDate: new Date(Date.now() - 86400000),
          totalTrades: 3,
          winningTrades: 2,
          losingTrades: 1,
          dailyPnl: 342.8,
          cumulativePnl: 2601.75,
          accountBalance: 52601.75,
          winRate: 66.7,
          profitFactor: 2.15,
          sharpeRatio: 1.72,
          maxDrawdown: -189.25,
        },
      }),
      // Demo account metrics
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
          maxDrawdown: -445.8,
        },
      }),
      // Paper account metrics
      prisma.performanceMetric.create({
        data: {
          userId: user.id,
          accountId: accounts[2].id,
          metricDate: new Date(),
          totalTrades: 8,
          winningTrades: 5,
          losingTrades: 3,
          dailyPnl: 156.3,
          cumulativePnl: 3245.8,
          accountBalance: 28245.8,
          winRate: 62.5,
          profitFactor: 2.12,
          sharpeRatio: 1.45,
          maxDrawdown: -678.45,
        },
      }),
    ]);
    console.log(`✅ Created ${performanceMetrics.length} performance metrics`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`👤 Users: 1`);
    console.log(`💰 Trading Accounts: ${accounts.length}`);
    console.log(`🎯 Strategies: ${strategies.length}`);
    console.log(`📈 Trades: ${trades.length}`);
    console.log(`📖 Journal Entries: ${journalEntries.length}`);
    console.log(`📊 Performance Metrics: ${performanceMetrics.length}`);
    console.log("\n✅ All data has been successfully inserted into MongoDB!");

    // Return IDs for reference
    return {
      user: { id: user.id, email: user.email },
      accounts: accounts.map((acc) => ({ id: acc.id, name: acc.name })),
      strategies: strategies.map((str) => ({ id: str.id, name: str.name })),
      trades: trades.map((trade) => ({ id: trade.id, symbol: trade.symbol })),
      journalEntries: journalEntries.map((entry) => ({
        id: entry.id,
        title: entry.title,
      })),
      performanceMetrics: performanceMetrics.map((metric) => ({
        id: metric.id,
        date: metric.metricDate,
      })),
    };
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedData()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export default seedData;
