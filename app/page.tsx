import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/layout/Wordmark";
import { buttonClasses } from "@/components/ui/Button";

const coverage = ["Forex", "Stocks", "Crypto", "Futures", "Options"];

const modules: [string, string][] = [
  [
    "Trades",
    "Symbol, direction, size, entry, stop and target. Close a trade and the result is worked out and the balance follows.",
  ],
  [
    "Journal",
    "Daily, weekly or monthly entries — what went well, what went wrong, what you learned, what you want next.",
  ],
  [
    "Strategies",
    "Write a setup down once, tag your trades with it, and see its win rate on its own.",
  ],
  [
    "Backtests",
    "Keep backtest results by month next to the live numbers and tell whether the idea survived the market.",
  ],
  [
    "Accounts",
    "Live, demo and paper accounts stay separate, each with its own balance and history.",
  ],
  [
    "Feed",
    "Share a trade for a second opinion. You decide whether the P&L and account size are shown.",
  ],
];

// Illustrative daily candles for the panel strip — not real data.
const candles = [
  { o: 40, h: 56, l: 34, c: 52 },
  { o: 52, h: 58, l: 43, c: 46 },
  { o: 46, h: 64, l: 44, c: 61 },
  { o: 61, h: 68, l: 50, c: 55 },
  { o: 55, h: 58, l: 38, c: 42 },
  { o: 42, h: 70, l: 40, c: 67 },
  { o: 67, h: 90, l: 63, c: 86 },
  { o: 86, h: 94, l: 72, c: 78 },
];

function CandleStrip() {
  const W = 520;
  const H = 120;
  const step = W / candles.length;
  const body = 20;
  const y = (p: number) => H - ((p - 28) / 70) * H;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      className="h-24 w-full"
    >
      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const x = i * step + step / 2;
        const top = y(Math.max(k.o, k.c));
        const height = Math.max(2, Math.abs(y(k.o) - y(k.c)));
        const color = up ? "oklch(0.86 0.16 160)" : "oklch(0.72 0.15 25)";
        return (
          <g key={i} fill={color} stroke={color}>
            <line
              x1={x}
              x2={x}
              y1={y(k.h)}
              y2={y(k.l)}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <rect x={x - body / 2} y={top} width={body} height={height} rx={2} />
          </g>
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 h-16">
          <Link href="/">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonClasses("ghost", "sm")}>
              Sign in
            </Link>
            <Link href="/register" className={buttonClasses("primary", "sm")}>
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Hero ── */}
        <section className="pt-16 sm:pt-24 pb-16 sm:pb-24">
          <p className="label flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            A trading journal
          </p>
          <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_19rem] gap-x-12 gap-y-8 lg:items-end">
            <h1 className="font-heading text-[clamp(2.5rem,7vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.03em] text-balance">
              Write down every trade.{" "}
              <span className="text-brand">
                Find out which ones were worth taking.
              </span>
            </h1>
            <div className="lg:pb-3">
              <p className="text-[15px] leading-relaxed text-muted-foreground text-pretty">
                Rally records what you actually did — your entries, exits and the
                notes you wrote at the time. No signals, tips or motivational
                noise.
              </p>
              <dl className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between py-1">
                  <dt>Your data</dt>
                  <dd className="text-foreground">Private by default</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt>Accounts</dt>
                  <dd className="text-foreground">Live · demo · paper</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/register" className={buttonClasses("primary", "lg")}>
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className={buttonClasses("outline", "lg")}>
              Try the demo account
            </Link>
          </div>
        </section>

        {/* ── Coverage row ── */}
        <section className="flex flex-col gap-5 border-y border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-medium text-muted-foreground">
            {coverage.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Whatever you trade, one place to log it.
          </p>
        </section>

        {/* ── Emerald panel ── */}
        <section className="my-16 sm:my-20">
          <div
            className="overflow-hidden rounded-3xl border border-border p-7 sm:p-12"
            style={{
              backgroundImage:
                "linear-gradient(135deg, oklch(0.42 0.11 160) 0%, oklch(0.2 0.03 160) 55%, oklch(0.16 0.01 160) 100%)",
            }}
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="label text-white/60">The point of it</p>
                <p className="mt-4 font-heading text-2xl sm:text-3xl leading-snug tracking-tight text-white text-balance">
                  Patterns only show up once they are written down. Rally turns a
                  pile of trades into a win rate, an equity curve and a reason.
                </p>
                <Link
                  href="/register"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
                >
                  Start your journal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-2xl bg-black/25 p-5 ring-1 ring-white/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-white/60">
                    Equity, sample month
                  </span>
                  <span className="num text-sm text-[oklch(0.88_0.16_160)]">
                    +18.4%
                  </span>
                </div>
                <div className="mt-4">
                  <CandleStrip />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What is in it ── */}
        <section className="pb-20 sm:pb-28">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
            What is in it
          </h2>
          <dl className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {modules.map(([name, text]) => (
              <div
                key={name}
                className="flex flex-col gap-1.5 border-t border-border py-5 sm:flex-row sm:gap-8"
              >
                <dt className="font-heading text-[15px] sm:w-32 sm:flex-shrink-0">
                  {name}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 py-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Rally</span>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
