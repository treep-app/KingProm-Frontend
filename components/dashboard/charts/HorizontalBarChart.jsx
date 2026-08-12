'use client';

import { formatNumber } from '../../../lib/format';

/**
 * Accessible horizontal bar list.
 * items: { id?, label, value }[]
 */
export default function HorizontalBarChart({
  items = [],
  emptyLabel = 'No data available yet.',
  maxItems = 8,
  ariaLabel = 'Comparison chart',
}) {
  const rows = items.slice(0, maxItems);
  const max = Math.max(...rows.map((r) => Number(r.value || 0)), 0);

  if (!rows.length || max === 0) {
    return <p className="py-8 text-center text-sm text-[var(--dash-muted)]">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {rows.map((row, index) => {
        const value = Number(row.value || 0);
        const width = Math.max(4, Math.round((value / max) * 100));
        return (
          <li key={row.id || row.label || index}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-medium text-[var(--dash-ink-soft)]">
                {row.label}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--dash-muted)]">
                {formatNumber(value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--dash-surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--dash-navy)]"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
