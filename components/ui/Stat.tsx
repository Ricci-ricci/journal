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
  <div className="min-w-0 bg-card px-4 py-3.5">
    <p className="label">{label}</p>
    <p className={cn("num mt-1.5 text-xl truncate", toneClasses[tone])}>
      {value}
    </p>
    {hint && (
      <p className="mt-0.5 text-xs text-muted-foreground truncate">{hint}</p>
    )}
  </div>
);

/* A strip of figures sharing one frame, divided by hairlines. */
export const StatRow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-px overflow-hidden rounded-lg border border-border bg-border",
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
        "inline-flex flex-shrink-0 rounded-md border border-border p-0.5",
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
            "h-7 px-2.5 rounded text-[13px] transition-colors",
            value === o.value
              ? "bg-accent text-foreground font-medium"
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
  <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
    <p className="text-sm font-medium text-foreground">{title}</p>
    {children && (
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {children}
      </p>
    )}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);
