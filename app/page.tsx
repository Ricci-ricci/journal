import Link from "next/link";
import { Wordmark } from "@/components/layout/Wordmark";
import { buttonClasses } from "@/components/ui/Button";

// Illustrative figures for the sample page below — not real results.
const sampleTrades = [
  {
    time: "09:42",
    sym: "EUR/USD",
    side: "Long",
    entry: "1.0832",
    exit: "1.0861",
    pnl: 290,
  },
  {
    time: "11:05",
    sym: "NQ",
    side: "Short",
    entry: "20,184.50",
    exit: "20,151.25",
    pnl: 665,
  },
  {
    time: "13:30",
    sym: "EUR/USD",
    side: "Long",
    entry: "1.0858",
    exit: "1.0846",
    pnl: -120,
  },
  {
    time: "15:12",
    sym: "XAU/USD",
    side: "Long",
    entry: "2,631.40",
    exit: "—",
    pnl: null,
  },
];

const sections = [
  {
    name: "Trades",
    text: "Symbol, direction, size, entry, stop and target. When you close a trade you record the result and the account balance follows.",
  },
  {
    name: "Journal",
    text: "Daily, weekly or monthly entries: what went well, what went wrong, what you learned, and what you want from the next period.",
  },
  {
    name: "Strategies",
    text: "Write a setup down once — entry rules, exit rules, risk rules — then tag trades with it and see its win rate on its own.",
  },
  {
    name: "Backtests",
    text: "Keep backtest results by month next to the live numbers, so you can tell whether the idea survived contact with the market.",
  },
  {
    name: "Accounts",
    text: "Live, demo and paper accounts stay separate, each with its own balance and history. Switch between them or look at everything at once.",
  },
  {
    name: "Feed",
    text: "Share a trade with other people here if you want a second opinion. You choose whether the P&L and account size are shown.",
  },
];

const money = (n: number) =>
  `${n >= 0 ? "+" : "−"}$${Math.abs(n).toLocaleString("en-US")}`;

// Open / high / low / close for the candles beside the headline. Illustrative.
const candles = [
  { o: 42, h: 58, l: 36, c: 54 },
  { o: 54, h: 60, l: 44, c: 47 },
  { o: 47, h: 66, l: 45, c: 63 },
  { o: 63, h: 70, l: 52, c: 56 },
  { o: 56, h: 59, l: 40, c: 43 },
  { o: 43, h: 72, l: 41, c: 69 },
  { o: 69, h: 92, l: 65, c: 88 },
];

function Candles() {
  const W = 272;
  const H = 280;
  const step = W / candles.length;
  const body = 18;
  // price → y, with the 30–96 range filling the drawing
  const y = (p: number) => H - ((p - 30) / 66) * H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Candlestick chart"
      className="w-full max-w-[13rem] lg:max-w-none h-auto"
    >
      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const x = i * step + step / 2;
        const top = y(Math.max(k.o, k.c));
        const height = Math.max(2, Math.abs(y(k.o) - y(k.c)));
        return (
          <g key={i} className={up ? "text-profit" : "text-loss"}>
            <line
              x1={x}
              x2={x}
              y1={y(k.h)}
              y2={y(k.l)}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <rect
              x={x - body / 2}
              y={top}
              width={body}
              height={height}
              rx={1.5}
              fill="currentColor"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 sm:px-8 h-16">
        <Link href="/">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/login" className={buttonClasses("ghost", "sm")}>
            Sign in
          </Link>
          <Link href="/register" className={buttonClasses("primary", "sm")}>
            Create account
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* ── Opening ── */}
        <section className="pt-14 sm:pt-24 pb-14 sm:pb-20 grid lg:grid-cols-[minmax(0,1fr)_17rem] gap-x-12 gap-y-10 items-center">
          <div className="max-w-3xl">
            <h1 className="font-heading text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.02] tracking-tight text-balance">
              Write down every trade.{" "}
              <em className="text-muted-foreground">
                Find out which ones were worth taking.
              </em>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground text-pretty">
              Rally is a trading journal. You log your entries and exits, keep
              notes on each session, and it shows you how you are doing by
              account and by strategy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/register" className={buttonClasses("primary", "lg")}>
                Create an account
              </Link>
              <Link
                href="/login"
                className="text-[15px] text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground transition-colors"
              >
                or look around with the demo account
              </Link>
            </div>
          </div>

          <Candles />
        </section>

        {/* ── A sample page: the day's notes next to the day's trades ── */}
        <section aria-label="Sample journal page">
          <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-6 sm:p-8 md:border-r border-b md:border-b-0 border-border">
              <p className="label">Tuesday · daily entry</p>
              <p className="mt-4 font-heading text-[22px] leading-snug">
                Took the London open long as planned. Gave some back after lunch
                chasing a move that had already happened.
              </p>
              <dl className="mt-6 space-y-4 text-sm leading-relaxed">
                <div>
                  <dt className="label">What went well</dt>
                  <dd className="mt-1 text-muted-foreground">
                    Waited for the retest on both morning trades. Sized
                    correctly.
                  </dd>
                </div>
                <div>
                  <dt className="label">What went wrong</dt>
                  <dd className="mt-1 text-muted-foreground">
                    The 13:30 entry had no setup. I was bored.
                  </dd>
                </div>
                <div>
                  <dt className="label">For tomorrow</dt>
                  <dd className="mt-1 text-muted-foreground">
                    No new positions between 12:00 and 14:00.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-6 sm:p-8 min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="label">Trades that day</p>
                <p className="num text-sm text-profit">+$835</p>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      {["Time", "Symbol", "Side", "Entry", "Exit"].map((h) => (
                        <th key={h} className="label pb-2 pr-4 font-normal">
                          {h}
                        </th>
                      ))}
                      <th className="label pb-2 font-normal text-right">
                        P&amp;L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleTrades.map((t) => (
                      <tr key={t.time} className="border-t border-border">
                        <td className="num py-2.5 pr-4 text-muted-foreground">
                          {t.time}
                        </td>
                        <td className="py-2.5 pr-4 font-medium whitespace-nowrap">
                          {t.sym}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {t.side}
                        </td>
                        <td className="num py-2.5 pr-4">{t.entry}</td>
                        <td className="num py-2.5 pr-4">{t.exit}</td>
                        <td
                          className={`num py-2.5 text-right ${
                            t.pnl === null
                              ? "text-muted-foreground"
                              : t.pnl >= 0
                                ? "text-profit"
                                : "text-loss"
                          }`}
                        >
                          {t.pnl === null ? "open" : money(t.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sample page with made-up figures.
          </p>
        </section>

        {/* ── What is in it ── */}
        <section className="py-20 sm:py-28 grid md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-x-12 gap-y-8">
          <h2 className="font-heading text-[32px] leading-tight tracking-tight">
            What is in it
          </h2>
          <dl className="grid sm:grid-cols-2 gap-x-10">
            {sections.map((s) => (
              <div key={s.name} className="border-t border-border py-5">
                <dt className="font-medium">{s.name}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {s.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Close ── */}
        <section className="border-t border-border py-16 sm:py-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="font-heading text-[28px] leading-tight tracking-tight max-w-md text-balance">
            The first entry takes about a minute.
          </p>
          <Link
            href="/register"
            className={buttonClasses(
              "primary",
              "lg",
              "self-start sm:self-auto",
            )}
          >
            Create an account
          </Link>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-5 sm:px-8 py-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
        <span>© {new Date().getFullYear()} Rally</span>
        <Link href="/login" className="hover:text-foreground transition-colors">
          Sign in
        </Link>
      </footer>
    </div>
  );
}
