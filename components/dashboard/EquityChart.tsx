import React from "react";

interface EquityChartProps {
  /* Cumulative P&L, oldest point first. */
  series: number[];
  format: (value: number) => string;
}

/**
 * Cumulative-P&L area chart: a filled, diagonally-hatched area under a line,
 * with a dashed baseline at zero. Colour follows the final value.
 */
export const EquityChart: React.FC<EquityChartProps> = ({ series, format }) => {
  const W = 800;
  const H = 220;
  const last = series[series.length - 1] ?? 0;
  const up = last >= 0;
  const color = up ? "var(--profit)" : "var(--loss)";

  const min = Math.min(0, ...series);
  const max = Math.max(0, ...series);
  const span = max - min || 1;
  const x = (i: number) => (i / (series.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / span) * H;

  const line = series
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area = `M0,${H} ${series
    .map((v, i) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ")} L${W},${H} Z`;
  const zeroY = y(0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">
          Cumulative, {series.length} closed trade
          {series.length !== 1 ? "s" : ""}
        </span>
        <span
          className="num text-lg font-semibold"
          style={{ color }}
        >
          {last >= 0 ? "+" : ""}
          {format(last)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-3 h-52 w-full"
        role="img"
        aria-label="Cumulative profit and loss over time"
      >
        <defs>
          <pattern
            id="equity-hatch"
            width="7"
            height="7"
            patternTransform="rotate(-45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.28"
            />
          </pattern>
          <linearGradient id="equity-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#equity-fade)" />
        <path d={area} fill="url(#equity-hatch)" />

        {/* zero baseline */}
        <line
          x1="0"
          x2={W}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--muted-foreground)"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 5"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
