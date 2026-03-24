"use client";

import Link from "next/link";

const features = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    title: "Trade Tracking",
    description:
      "Log every entry and exit with full context — price, size, direction, and notes. Never lose track of a trade again.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z"
        />
      </svg>
    ),
    title: "Performance Analytics",
    description:
      "Deep insights into your win rate, P&L curves, average R, drawdown, and risk-adjusted returns over time.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: "Strategy Builder",
    description:
      "Document, tag, and refine your trading strategies. Know exactly which setups work and which ones to cut.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "Trading Journal",
    description:
      "Write daily market notes, capture your mindset, and review past entries to spot behavioral patterns.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    title: "Multi-Account",
    description:
      "Manage live, demo, and paper trading accounts side by side. Keep your real and practice results separate.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Risk Management",
    description:
      "Track position sizing, risk per trade, and portfolio exposure to protect your capital at every step.",
  },
];

const stats = [
  { value: "0", label: "Trades Logged" },
  { value: "0", label: "Active Traders" },
  { value: "0%", label: "Satisfaction Rate" },
];

export default function AccueilPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TJ</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Trading Journal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center relative overflow-hidden">
        {/* subtle glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Track every trade · Improve every session
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 max-w-4xl">
            Master Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Trading Edge
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            A professional trading journal built for serious traders. Log
            trades, analyze performance patterns, and build the discipline that
            separates consistent winners from the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Start Free Today →
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto border border-border hover:bg-muted text-foreground px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              View Demo Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-border px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Everything you need to trade smarter
            </h2>
            <p className="text-muted-foreground">
              One platform for all your trading analytics and journaling needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-card border border-border rounded-xl p-6 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to level up your trading?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join traders who use their journal as their edge. Start tracking
            today — it's free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Create Your Journal →
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto border border-border hover:bg-muted text-foreground px-8 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Explore the Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">TJ</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Trading Journal
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Trading Journal. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
