'use client';

import { useEffect, useId, useState } from 'react';

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 16, right: 8, bottom: 32, left: 32 };

function formatTickDate(iso, compact = false) {
  const d = new Date(`${iso}T12:00:00`);
  if (compact) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Lightweight SVG line/area chart — no chart library dependency.
 * series: { date: 'YYYY-MM-DD', [valueKey]: number }[]
 */
export default function TimeSeriesChart({
  series = [],
  valueKey = 'redemptions',
  unitLabel = 'redemptions',
  ariaLabel = 'Trend over time',
  emptyLabel = 'No data for this period',
}) {
  const gradId = useId().replace(/:/g, '');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (!series.length) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-[var(--dash-muted)] sm:h-[220px]">
        {emptyLabel}
      </div>
    );
  }

  const pad = compact ? { top: 12, right: 4, bottom: 28, left: 28 } : PAD;
  const innerW = WIDTH - pad.left - pad.right;
  const innerH = HEIGHT - pad.top - pad.bottom;
  const maxY = Math.max(...series.map((p) => Number(p[valueKey] || 0)), 1);
  const niceMax = Math.ceil(maxY / 5) * 5 || 5;

  const xAt = (i) =>
    pad.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const yAt = (v) => pad.top + innerH - (v / niceMax) * innerH;

  const linePath = series
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(2)} ${yAt(Number(p[valueKey] || 0)).toFixed(2)}`,
    )
    .join(' ');

  const areaPath = `${linePath} L ${xAt(series.length - 1).toFixed(2)} ${(pad.top + innerH).toFixed(2)} L ${xAt(0).toFixed(2)} ${(pad.top + innerH).toFixed(2)} Z`;

  const yTicks = compact
    ? [0, 0.5, 1].map((t) => Math.round(niceMax * t))
    : [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));
  const xLabelEvery = compact
    ? Math.max(3, Math.ceil(series.length / 4))
    : series.length > 10
      ? 2
      : 1;
  const active = hoverIndex != null ? series[hoverIndex] : null;

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[180px] w-full touch-pan-y sm:h-[220px]"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`ts-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(215 70% 40%)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(215 70% 40%)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = yAt(tick);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={WIDTH - pad.right}
                y1={y}
                y2={y}
                stroke="var(--dash-border)"
                strokeDasharray={tick === 0 ? undefined : '3 4'}
              />
              <text
                x={pad.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--dash-muted)]"
                style={{ fontSize: compact ? 9 : 10 }}
              >
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#ts-fill-${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke="hsl(215 70% 36%)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {series.map((point, i) => {
          const value = Number(point[valueKey] || 0);
          const x = xAt(i);
          const y = yAt(value);
          const showLabel = i % xLabelEvery === 0 || i === series.length - 1;
          const hitW = Math.max(innerW / series.length, compact ? 16 : 8);
          return (
            <g key={point.date}>
              <circle
                cx={x}
                cy={y}
                r={hoverIndex === i ? 4.5 : compact ? 3 : 2.5}
                fill="hsl(215 70% 36%)"
              />
              {showLabel ? (
                <text
                  x={x}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-[var(--dash-muted)]"
                  style={{ fontSize: compact ? 9 : 10 }}
                >
                  {formatTickDate(point.date, compact)}
                </text>
              ) : null}
              <rect
                x={x - hitW / 2}
                y={pad.top}
                width={hitW}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onFocus={() => setHoverIndex(i)}
                onTouchStart={() => setHoverIndex(i)}
              />
            </g>
          );
        })}

        {active && hoverIndex != null ? (
          <line
            x1={xAt(hoverIndex)}
            x2={xAt(hoverIndex)}
            y1={pad.top}
            y2={pad.top + innerH}
            stroke="var(--dash-border-strong)"
            strokeDasharray="3 3"
          />
        ) : null}
      </svg>

      {active ? (
        <div className="pointer-events-none absolute left-1/2 top-1 z-10 max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-lg border border-[var(--dash-border)] bg-white px-2.5 py-1.5 text-xs shadow-sm sm:top-2 sm:px-3">
          <p className="font-medium text-[var(--dash-ink)]">{formatTickDate(active.date)}</p>
          <p className="tabular-nums text-[var(--dash-muted)]">
            {Number(active[valueKey] || 0).toLocaleString('en-US')} {unitLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
