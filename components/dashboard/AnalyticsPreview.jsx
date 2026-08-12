'use client';

import RedemptionsChart from './RedemptionsChart';
import { SectionHeader } from './ui';

/**
 * Dashboard analytics preview.
 *
 * Pass `series` from GET /analytics/redemptions-series:
 *   [{ date: 'YYYY-MM-DD', redemptions: number }, ...]
 */
export default function AnalyticsPreview({
  series = null,
  source = null,
  loading = false,
  error = null,
  days = 30,
}) {
  const isLive = source === 'live' && Array.isArray(series);
  const showLoading = Boolean(loading) && !isLive;
  const showError = Boolean(error) && !isLive && !loading;
  const data = isLive ? series : [];
  const total = data.reduce((sum, p) => sum + (p.redemptions || 0), 0);

  return (
    <section aria-label="Analytics preview" className="space-y-3">
      <SectionHeader
        title="Analytics"
        description="Voucher redemptions over the selected period"
        href="/dashboard/analytics"
        linkLabel="Full analytics"
      />

      <div className="dash-panel overflow-hidden p-3 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h3 className="text-[13px] font-medium text-[var(--dash-muted)]">
              Voucher Redemptions
            </h3>
            {!showLoading && !showError ? (
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-[var(--dash-ink)]">
                {total.toLocaleString('en-US')}
                <span className="ml-1.5 text-xs font-medium text-[var(--dash-muted)]">
                  in chart window
                </span>
              </p>
            ) : null}
          </div>
          <p className="text-[11px] text-[var(--dash-muted)]">
            Date → Redemptions · {days}d filter
          </p>
        </div>

        <div className="mt-3 min-w-0 border-t border-[var(--dash-border)] pt-3">
          {showLoading ? (
            <div className="flex h-[180px] flex-col justify-end gap-2 px-2 pb-8 sm:h-[220px]">
              <div className="h-[120px] w-full animate-pulse rounded-lg bg-[var(--dash-surface-2)] sm:h-[140px]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--dash-surface-2)]" />
            </div>
          ) : showError ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-rose-600 sm:h-[220px]">
              {error}
            </div>
          ) : (
            <RedemptionsChart series={data} />
          )}
        </div>
      </div>
    </section>
  );
}
