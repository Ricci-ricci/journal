import React from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: React.ReactNode;
  /* Smaller line under the figure. */
  hint?: React.ReactNode;
  tone?: "default" | "profit" | "loss";
}

const toneClasses = {
  default: "text-foreground",
  profit: "text-profit",
  loss: "text-loss",
};

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  hint,
  tone = "default",
}) => (
  <div className="panel min-w-0 px-4 py-4">
    <p className="label truncate">{label}</p>
    <p
      className={cn(
        "num mt-2 text-2xl font-semibold tracking-tight truncate",
        toneClasses[tone],
      )}
    >
      {value}
    </p>
    {hint && (
      <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>
    )}
  </div>
);

/* A row of figure cards that wraps to fit the width. */
export const StatRow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3",
      className,
    )}
  >
    {children}
  </div>
);

/* Signed tone for a P&L figure. */
export const pnlTone = (n: number | null | undefined): StatProps["tone"] =>
  n == null || n === 0 ? "default" : n > 0 ? "profit" : "loss";

interface SegmentedProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/* Small toggle group, e.g. for a time range. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex flex-shrink-0 rounded-lg border border-border bg-card p-0.5 shadow-xs",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "h-7 px-3 rounded-md text-[13px] font-medium transition-colors",
            value === o.value
              ? "bg-accent text-foreground shadow-button"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* Centered message for a list with nothing in it yet. */
export const EmptyState: React.FC<{
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, children, action }) => (
  <div className="rounded-xl border border-dashed border-input bg-card/40 px-6 py-14 text-center">
    <p className="font-heading text-[15px] text-foreground">{title}</p>
    {children && (
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {children}
      </p>
    )}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);
