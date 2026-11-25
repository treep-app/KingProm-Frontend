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
  compact = false,
}) {
  const isLive = source === 'live' && Array.isArray(series);
  const showLoading = Boolean(loading) && !isLive;
  const showError = Boolean(error) && !isLive && !loading;
  const data = isLive ? series : [];
  const total = data.reduce((sum, p) => sum + (p.redemptions || 0), 0);

  const chartSize = compact ? 'dense' : 'default';
  const chartSkeletonHeight = compact ? 'h-[132px]' : 'h-[180px] sm:h-[220px]';

  return (
    <section aria-label="Analytics preview" className={compact ? 'space-y-2' : 'space-y-3'}>
      <SectionHeader
        title="Redemptions"
        description={compact ? null : 'Voucher redemptions over the selected period'}
        href="/dashboard/analytics"
        linkLabel="Full analytics"
      />

      <div className={`dash-panel overflow-hidden ${compact ? 'p-3 sm:p-4' : 'p-3 sm:p-5'}`}>
        <div className="flex items-baseline justify-between gap-3">
          {!showLoading && !showError ? (
            <p className="text-lg font-semibold tabular-nums tracking-tight text-[var(--dash-ink)]">
              {total.toLocaleString('en-US')}
              <span className="ml-1.5 text-xs font-medium text-[var(--dash-muted)]">
                · {days}d
              </span>
            </p>
          ) : (
            <span className="text-sm text-[var(--dash-muted)]">Trend</span>
          )}
        </div>

        <div className={`min-w-0 ${compact ? 'mt-2' : 'mt-3 border-t border-[var(--dash-border)] pt-3'}`}>
          {showLoading ? (
            <div className={`flex flex-col justify-end gap-2 px-1 ${chartSkeletonHeight}`}>
              <div
                className={`w-full animate-pulse rounded-lg bg-[var(--dash-surface-2)] ${compact ? 'h-[100px]' : 'h-[120px] sm:h-[140px]'}`}
              />
            </div>
          ) : showError ? (
            <div
              className={`flex items-center justify-center text-sm text-rose-600 ${chartSkeletonHeight}`}
            >
              {error}
            </div>
          ) : (
            <RedemptionsChart series={data} size={chartSize} />
          )}
        </div>
      </div>
    </section>
  );
}
