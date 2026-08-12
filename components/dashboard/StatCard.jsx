import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

function TrendBadge({ trend }) {
  if (!trend) return null;

  const direction = trend.direction || 'flat';
  const text =
    trend.label != null
      ? String(trend.label)
      : trend.percent != null
        ? `${Number(trend.percent).toFixed(1)}%`
        : null;

  if (!text) return null;

  const styles =
    direction === 'up'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
      : direction === 'down'
        ? 'bg-rose-50 text-rose-700 ring-rose-200/80'
        : 'bg-[var(--dash-surface-2)] text-[var(--dash-muted)] ring-[var(--dash-border)]';

  const Icon =
    direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ${styles}`}
    >
      <Icon className="size-3" strokeWidth={2.25} aria-hidden />
      {text}
    </span>
  );
}

function CardShell({ children, icon: Icon }) {
  return (
    <div className="dash-panel flex h-full min-h-0 flex-col px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        {Icon ? (
          <div className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-surface-2)] text-[var(--dash-ink-soft)] ring-1 ring-[var(--dash-border)] sm:flex">
            <Icon className="size-3.5" strokeWidth={1.75} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Compact KPI metric card — dense on phones, roomier from sm up.
 */
export default function StatCard({
  label,
  value,
  hint,
  description,
  trend = null,
  pending = false,
  status: statusProp = null,
  source = null,
  icon: Icon = null,
  errorMessage = null,
}) {
  const descriptionText = description ?? hint ?? null;
  const isDemo = source === 'demo';

  let status = statusProp;
  if (!status) {
    if (pending) status = 'loading';
    else status = 'ready';
  }

  if (status === 'loading') {
    return (
      <CardShell icon={Icon}>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-16 animate-pulse rounded bg-[var(--dash-surface-2)] sm:w-24" />
        </div>
        <div className="mt-2 h-6 w-14 animate-pulse rounded bg-[var(--dash-surface-2)] sm:mt-2.5 sm:h-7 sm:w-20" />
        <div className="mt-2 hidden h-3 w-28 animate-pulse rounded bg-[var(--dash-surface-2)] sm:block" />
        <span className="sr-only">Loading {label}</span>
      </CardShell>
    );
  }

  if (status === 'error') {
    return (
      <CardShell icon={Icon}>
        <p className="text-[11px] font-medium text-[var(--dash-muted)] sm:text-[12px]">{label}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--dash-ink-soft)] sm:mt-1.5 sm:text-xl">
          —
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-rose-600 sm:mt-1.5">
          {errorMessage || 'Unable to load'}
        </p>
      </CardShell>
    );
  }

  if (status === 'empty') {
    return (
      <CardShell icon={Icon}>
        <p className="text-[11px] font-medium text-[var(--dash-muted)] sm:text-[12px]">{label}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--dash-ink-soft)] sm:mt-1.5 sm:text-xl">
          No data
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--dash-muted)] sm:mt-1.5">
          {descriptionText || 'Nothing to show for this period'}
        </p>
      </CardShell>
    );
  }

  return (
    <CardShell icon={Icon}>
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-[11px] font-medium leading-tight text-[var(--dash-muted)] sm:text-[12px]">
          {label}
        </p>
        {isDemo ? (
          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200/80">
            Demo
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:mt-1.5 sm:gap-2">
        <p className="text-lg font-semibold tracking-tight tabular-nums text-[var(--dash-ink)] sm:text-xl">
          {value}
        </p>
        <TrendBadge trend={trend} />
      </div>

      {descriptionText ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--dash-muted)] sm:mt-1.5">
          {descriptionText}
        </p>
      ) : null}
    </CardShell>
  );
}
