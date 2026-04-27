"use client";

import Link from "next/link";
import Image from "next/image";

const ticker = [
  { sym: "EUR/USD", px: "1.0847", chg: "+0.34%", up: true },
  { sym: "BTC/USD", px: "67,412", chg: "+2.18%", up: true },
  { sym: "S&P 500", px: "5,712.40", chg: "-0.42%", up: false },
  { sym: "NASDAQ", px: "20,142.91", chg: "+0.71%", up: true },
  { sym: "GBP/JPY", px: "194.82", chg: "-0.18%", up: false },
  { sym: "GOLD", px: "2,634.10", chg: "+0.92%", up: true },
  { sym: "OIL", px: "78.42", chg: "-1.24%", up: false },
  { sym: "DXY", px: "104.27", chg: "+0.11%", up: true },
  { sym: "AAPL", px: "227.84", chg: "+0.68%", up: true },
  { sym: "TSLA", px: "248.12", chg: "-2.04%", up: false },
  { sym: "NVDA", px: "121.40", chg: "+1.55%", up: true },
  { sym: "USD/JPY", px: "149.62", chg: "-0.22%", up: false },
];

const stats = [
  { value: "62.4%", label: "Average win rate", up: true, delta: "+3.1%" },
  { value: "1.84", label: "Average reward / risk", up: true, delta: "+0.22" },
  { value: "2.13", label: "Sharpe ratio", up: true, delta: "+0.18" },
  { value: "−8.7%", label: "Max drawdown", up: false, delta: "−1.2%" },
];

const features = [
  {
    title: "Trade tracking",
    description:
      "Log every entry and exit with full context — price, size, direction, notes. Nothing leaves the book unrecorded.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8m0 0v6m0-6h-6" />
      </svg>
    ),
  },
  {
    title: "Performance analytics",
    description:
      "Win rate, P&L curves, average R, drawdown, expectancy, Sharpe — risk-adjusted returns broken down by setup.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 19V9m4 10V5m4 14v-7m4 7V11" />
      </svg>
    ),
  },
  {
    title: "Strategy builder",
    description:
      "Document, tag, and refine your setups. See exactly which strategies print and which ones bleed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
  {
    title: "Trading journal",
    description:
      "Daily market notes, mindset captures, and session reviews. Patterns surface when you write them down.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25v13M12 6.25C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13C4.17 18.48 5.75 18 7.5 18s3.33.48 4.5 1.25M12 6.25C13.17 5.48 14.75 5 16.5 5s3.33.48 4.5 1.25v13c-1.17-.77-2.75-1.25-4.5-1.25-1.75 0-3.33.48-4.5 1.25" />
      </svg>
    ),
  },
  {
    title: "Multi-account",
    description:
      "Live, demo, and prop accounts side by side. Keep real and practice equity curves cleanly separated.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m3 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: "Risk management",
    description:
      "Position sizing, risk per trade, exposure caps. Capital protection built into the workflow, not bolted on.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5l8 3v6c0 4.5-3.4 8.7-8 10-4.6-1.3-8-5.5-8-10v-6l8-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const recentTrades = [
  { sym: "EUR/USD", side: "Long",  r: "+1.8R", pnl: "+$340", up: true },
  { sym: "NDX",     side: "Short", r: "+2.4R", pnl: "+$612", up: true },
  { sym: "BTC/USD", side: "Long",  r: "−1.0R", pnl: "−$185", up: false },
  { sym: "GBP/JPY", side: "Short", r: "+0.9R", pnl: "+$148", up: true },
  { sym: "GOLD",    side: "Long",  r: "+1.3R", pnl: "+$272", up: true },
];

// equity curve points — uptrend with realistic retracements
const curvePoints =
  "0,140 20,135 40,138 60,120 80,128 100,108 120,118 140,92 160,100 180,78 200,86 220,62 240,72 260,48 280,60 300,38 320,46 340,24 360,32 380,12";
const curveArea = `M0,140 L${curvePoints
  .split(" ")
  .map((p) => p)
  .join(" L")} L380,160 L0,160 Z`;
const curveLine = `M${curvePoints.split(" ").join(" L")}`;

export default function AccueilPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-blue-600/30">
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker-scroll 60s linear infinite; }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.jpg"
            alt="Rally logo"
            width={32}
            height={32}
            className="rounded-lg shrink-0 ring-1 ring-border"
          />
          <span
            className="text-lg tracking-tight"
            style={{ fontFamily: "var(--font-rally)" }}
          >
            Rally
          </span>
        </div>

        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-900/40"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 w-[560px] h-[560px] bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-32 w-[560px] h-[560px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/60 text-muted-foreground text-xs font-medium mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Built for serious traders
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] mb-6">
              Your trading,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
                quantified.
              </span>
              <br />
              Your edge,{" "}
              <span className="text-foreground/60">documented.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-9">
              Rally is the trading journal you wish your broker shipped. Log
              every fill, slice your performance by setup, and compound the
              discipline that separates consistent winners from gamblers.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                Start free today
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/dashboard"
                className="border border-border hover:bg-muted text-foreground px-7 py-3.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
              >
                View live demo
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> No card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Import from CSV
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Fully encrypted
              </span>
            </div>
          </div>

          {/* Right: dashboard preview card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
              {/* card header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Equity · last 30 days</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight tabular-nums">
                      $48,217.42
                    </span>
                    <span className="text-emerald-400 text-sm font-medium tabular-nums">
                      +12.84%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              </div>

              {/* equity curve */}
              <div className="px-5 pt-4 pb-2">
                <svg
                  viewBox="0 0 380 160"
                  className="w-full h-32"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="rgb(52,211,153)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[20, 60, 100, 140].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="380"
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="2 4"
                    />
                  ))}
                  <path d={curveArea} fill="url(#curveFill)" />
                  <path
                    d={curveLine}
                    fill="none"
                    stroke="rgb(110,231,183)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="380" cy="12" r="3" fill="rgb(110,231,183)" />
                  <circle cx="380" cy="12" r="6" fill="rgb(110,231,183)" fillOpacity="0.25" />
                </svg>
              </div>

              {/* mini stats row */}
              <div className="grid grid-cols-4 border-t border-border">
                {[
                  { l: "Win rate", v: "62%", c: "text-emerald-400" },
                  { l: "Avg R",    v: "1.84", c: "text-foreground" },
                  { l: "Drawdown", v: "−8.7%", c: "text-rose-400" },
                  { l: "Sharpe",   v: "2.13", c: "text-foreground" },
                ].map((s, i) => (
                  <div key={s.l} className={`px-3 py-3 ${i !== 3 ? "border-r border-border" : ""}`}>
                    <div className="text-[11px] text-muted-foreground">{s.l}</div>
                    <div className={`text-sm font-semibold mt-0.5 tabular-nums ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* recent trades */}
              <div className="border-t border-border">
                <div className="px-5 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Recent trades</span>
                  <span>P&amp;L</span>
                </div>
                <ul className="text-sm">
                  {recentTrades.map((t, i) => (
                    <li
                      key={i}
                      className="px-5 py-2.5 flex items-center justify-between border-b border-border/60 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-1 h-4 rounded-sm ${t.up ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <span className="font-medium w-20">{t.sym}</span>
                        <span className={`text-xs ${t.up ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.side}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{t.r}</span>
                      </div>
                      <span className={`font-medium tabular-nums ${t.up ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.pnl}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Soft live ticker ── */}
      <div className="border-b border-border bg-card/40 overflow-hidden">
        <div className="ticker-track flex w-max">
          {[...ticker, ...ticker].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-6 py-3 whitespace-nowrap text-sm"
            >
              <span className="text-muted-foreground">{t.sym}</span>
              <span className="text-foreground tabular-nums">{t.px}</span>
              <span className={`tabular-nums ${t.up ? "text-emerald-400" : "text-rose-400"}`}>
                {t.up ? "▲" : "▼"} {t.chg}
              </span>
              <span className="w-px h-4 bg-border ml-2" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats band ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-8 ${i % 2 !== 1 ? "border-r" : ""} ${i % 4 !== 3 ? "lg:border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} border-border`}
            >
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  {s.value}
                </span>
                <span className={`text-sm font-medium tabular-nums ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {s.up ? "▲" : "▼"} {s.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-b border-border px-6 py-24 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-400 mb-3">
                Everything you need
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-xl">
                Every primitive a serious trader needs.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Six modules wired into a single workspace — composable and built
              around how a working trader actually thinks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-card border border-border rounded-xl p-6 hover:border-blue-500/40 hover:bg-card/90 transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-600/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview / quote band ── */}
      <section id="preview" className="border-b border-border px-6 py-24 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[680px] h-[680px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="text-xs uppercase tracking-widest text-blue-400 mb-4">
            Why traders choose Rally
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium tracking-tight leading-snug text-foreground">
            “The journal isn&apos;t the chart. The journal{" "}
            <span className="text-muted-foreground">is</span> the edge — the
            place where hindsight becomes a system.”
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="w-8 h-px bg-border" />
            <span>The whole point of Rally</span>
            <span className="w-8 h-px bg-border" />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="pricing" className="border-b border-border px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.05]">
            Stop trading blind.
            <br />
            Start trading with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
              receipts.
            </span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10">
            Free to start. Your data, your journal. Build the habit that turns
            hindsight into a real edge.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              Create your journal
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/dashboard"
              className="border border-border hover:bg-muted text-foreground px-7 py-3.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
            >
              Explore demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.jpg"
              alt="Rally logo"
              width={24}
              height={24}
              className="rounded shrink-0"
            />
            <span
              className="text-sm text-muted-foreground font-medium"
              style={{ fontFamily: "var(--font-rally)" }}
            >
              Rally
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Rally. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
