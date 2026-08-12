'use client';

import { formatNumber } from '../../../lib/format';

const TONES = [
  'bg-[var(--dash-navy)]',
  'bg-sky-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-emerald-500',
];

/**
 * Conversion funnel from backend steps: [{ key, label, value }]
 */
export default function FunnelChart({
  steps = [],
  emptyLabel = 'No campaign data available yet.',
}) {
  const max = Math.max(...steps.map((s) => Number(s.value || 0)), 0);

  if (!steps.length || max === 0) {
    return <p className="py-8 text-center text-sm text-[var(--dash-muted)]">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Conversion funnel">
      {steps.map((step, index) => {
        const value = Number(step.value || 0);
        const width = Math.max(4, Math.round((value / max) * 100));
        return (
          <div key={step.key || step.label} role="listitem">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--dash-ink-soft)]">{step.label}</span>
              <span className="tabular-nums text-[var(--dash-muted)]">{formatNumber(value)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--dash-surface-2)]">
              <div
                className={`h-full rounded-full ${TONES[index % TONES.length]}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
