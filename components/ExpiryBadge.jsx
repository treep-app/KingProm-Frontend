'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { formatDateTime, formatTimeRemaining } from '../lib/api';

/**
 * Live expiry chip — countdown when under 48h, date otherwise.
 */
export default function ExpiryBadge({ expiresAt, className = '' }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const remaining = formatTimeRemaining(expiresAt, now);
  const dateLabel = formatDateTime(expiresAt);

  const tone = remaining.expired
    ? 'border-rose-400/40 bg-rose-400/10 text-rose-300'
    : remaining.urgent
      ? 'border-amber-400/45 bg-amber-400/10 text-amber-200'
      : 'border-cyan-400/35 bg-cyan-400/10 text-cyan-200 md:border-white/10 md:bg-white/5 md:text-white/70';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums sm:text-sm ${tone} ${className}`}
      title={`Valid until ${dateLabel}`}
    >
      <Clock3 className="size-3.5 shrink-0 opacity-80" aria-hidden />
      {remaining.expired ? (
        <span>Expired {dateLabel}</span>
      ) : remaining.urgent ? (
        <span>
          Expires in {remaining.label.replace(/ left$/, '')}
          <span className="hidden font-normal opacity-70 sm:inline"> · {dateLabel}</span>
        </span>
      ) : (
        <span>Expires {dateLabel}</span>
      )}
    </span>
  );
}
