"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { useAuth } from "../../contexts/AuthContext";
import { useAccounts } from "../../contexts/AccountsContext";

interface TradeLite {
  entryDate: string;
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// JS getDay returns 0=Sun..6=Sat. We want 0=Mon..6=Sun.
function dayIndexMonFirst(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function TradeActivityHeatmap() {
  const { user } = useAuth();
  const { activeAccountId } = useAccounts();
  const [trades, setTrades] = useState<TradeLite[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams();
    params.set("userId", user.id);
    params.set("period", "all");
    if (activeAccountId) params.set("accountId", activeAccountId);

    setLoading(true);
    let cancelled = false;
    fetch(`/api/trades?${params.toString()}`)
      .then((r) => r.json())
      .then((result) => {
        if (cancelled) return;
        if (result.success) setTrades(result.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, activeAccountId]);

  const { dayMap, earliestTs } = useMemo(() => {
    const map = new Map<string, number>();
    let earliest = Infinity;
    for (const t of trades) {
      const d = new Date(t.entryDate);
      if (isNaN(d.getTime())) continue;
      const key = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
      map.set(key, (map.get(key) ?? 0) + 1);
      const ts = d.getTime();
      if (ts < earliest) earliest = ts;
    }
    return { dayMap: map, earliestTs: earliest === Infinity ? null : earliest };
  }, [trades]);

  const calendar = useMemo(() => {
    const { year, month } = view;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const leadingPad = dayIndexMonFirst(firstDay);

    const cells: { day: number | null; count: number; isToday: boolean }[] = [];
    for (let i = 0; i < leadingPad; i++) {
      cells.push({ day: null, count: 0, isToday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const count = dayMap.get(dayKey(year, month, d)) ?? 0;
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        d === today.getDate();
      cells.push({ day: d, count, isToday });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, count: 0, isToday: false });
    }

    let monthTotal = 0;
    let peakCount = 0;
    let peakDay = 0;
    for (const c of cells) {
      if (c.day === null) continue;
      monthTotal += c.count;
      if (c.count > peakCount) {
        peakCount = c.count;
        peakDay = c.day;
      }
    }

    let buckets: number[];
    if (peakCount <= 4) {
      buckets = [1, 2, 3, 4];
    } else {
      const b1 = 1;
      const b2 = Math.max(2, Math.ceil(peakCount * 0.25));
      const b3 = Math.max(b2 + 1, Math.ceil(peakCount * 0.5));
      const b4 = Math.max(b3 + 1, Math.ceil(peakCount * 0.75));
      buckets = [b1, b2, b3, b4];
    }

    return { cells, monthTotal, peakDay, peakCount, buckets };
  }, [view, dayMap, today]);

  function intensity(count: number, buckets: number[]): number {
    if (count <= 0) return 0;
    if (count >= buckets[3]) return 4;
    if (count >= buckets[2]) return 3;
    if (count >= buckets[1]) return 2;
    return 1;
  }

  function cellStyle(count: number, buckets: number[]): React.CSSProperties {
    const i = intensity(count, buckets);
    const fills = [
      "rgba(244, 63, 94, 0.06)",
      "rgba(244, 63, 94, 0.30)",
      "rgba(244, 63, 94, 0.55)",
      "rgba(244, 63, 94, 0.78)",
      "rgba(244, 63, 94, 1.00)",
    ];
    const base = fills[i];
    if (i === 0) return { backgroundColor: base };
    return {
      backgroundColor: base,
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 5px)",
    };
  }

  const earliestDate = earliestTs ? new Date(earliestTs) : null;
  const canGoPrev = earliestDate
    ? view.year > earliestDate.getFullYear() ||
      (view.year === earliestDate.getFullYear() &&
        view.month > earliestDate.getMonth())
    : false;
  const canGoNext =
    view.year < today.getFullYear() ||
    (view.year === today.getFullYear() && view.month < today.getMonth());

  function shiftMonth(delta: number) {
    setView((v) => {
      let y = v.year;
      let m = v.month + delta;
      while (m < 0) {
        m += 12;
        y--;
      }
      while (m > 11) {
        m -= 12;
        y++;
      }
      return { year: y, month: m };
    });
  }

  const peakLabel =
    calendar.peakCount > 0
      ? `Peak ${MONTH_NAMES[view.month].slice(0, 3)} ${calendar.peakDay} · ${calendar.peakCount} trade${calendar.peakCount !== 1 ? "s" : ""}`
      : "No trades this month";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Trades by day</CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftMonth(-1)}
                disabled={!canGoPrev}
                aria-label="Previous month"
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 18l-6-6 6-6"
                  />
                </svg>
              </button>
              <span className="text-sm font-medium text-foreground min-w-[120px] text-center tabular-nums">
                {MONTH_NAMES[view.month]} {view.year}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                disabled={!canGoNext}
                aria-label="Next month"
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 18l6-6-6-6"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {calendar.monthTotal} trade{calendar.monthTotal !== 1 ? "s" : ""} · {peakLabel}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              {calendar.buckets.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={cellStyle(b, calendar.buckets)}
                  />
                  {b}+
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="text-[10px] text-muted-foreground text-center"
            >
              {d}
            </div>
          ))}
        </div>
        {loading ? (
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {calendar.cells.map((cell, i) => {
              if (cell.day === null) {
                return <div key={i} className="aspect-square" />;
              }
              const dateLabel = `${MONTH_NAMES[view.month]} ${cell.day}, ${view.year}`;
              return (
                <div
                  key={i}
                  title={`${dateLabel} — ${cell.count} trade${cell.count !== 1 ? "s" : ""}`}
                  className={`aspect-square rounded ring-1 ring-inset flex items-center justify-center text-[10px] font-medium transition-transform hover:scale-110 hover:ring-white/20 ${
                    cell.isToday ? "ring-blue-400/60" : "ring-white/[0.04]"
                  }`}
                  style={cellStyle(cell.count, calendar.buckets)}
                >
                  <span
                    className={
                      cell.count > 0 ? "text-white" : "text-muted-foreground/60"
                    }
                  >
                    {cell.day}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
