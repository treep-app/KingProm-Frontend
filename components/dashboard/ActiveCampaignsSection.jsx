import Link from 'next/link';
import { Megaphone } from 'lucide-react';
import { formatNumber } from '../../lib/format';
import { formatCodesLabel } from '../../lib/dashboard/buildActiveCampaignRows';
import {
  DEMO_ACTIVE_CAMPAIGNS,
  DEMO_ACTIVE_CAMPAIGNS_NOTE,
} from '../../lib/dashboard/demoActiveCampaigns';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from './ui';

function CampaignCardMobile({ row }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--dash-ink)]">{row.name}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--dash-muted)]">{row.purpose}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-[var(--dash-surface-2)]/70 px-2.5 py-2">
          <dt className="text-[var(--dash-muted)]">Codes</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-[var(--dash-ink)]">
            {formatCodesLabel(row.codes)}
          </dd>
        </div>
        <div className="rounded-lg bg-[var(--dash-surface-2)]/70 px-2.5 py-2">
          <dt className="text-[var(--dash-muted)]">Redeemed</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-[var(--dash-ink)]">
            {formatNumber(row.redeemed)}
          </dd>
        </div>
        <div className="rounded-lg bg-[var(--dash-surface-2)]/70 px-2.5 py-2">
          <dt className="text-[var(--dash-muted)]">Remaining</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-[var(--dash-ink)]">
            {formatNumber(row.remaining)}
          </dd>
        </div>
        <div className="rounded-lg bg-[var(--dash-surface-2)]/70 px-2.5 py-2">
          <dt className="text-[var(--dash-muted)]">Expiry</dt>
          <dd className="mt-0.5 font-semibold text-[var(--dash-ink)]">
            {row.expiresLabel && row.expiresLabel !== '—' ? row.expiresLabel : '—'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function CampaignRowDesktop({ row }) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--dash-ink)]">{row.name}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--dash-muted)]">{row.purpose}</p>
      </div>
      <p className="text-right text-xs tabular-nums text-[var(--dash-ink-soft)]">
        {formatCodesLabel(row.codes)}
      </p>
      <p className="text-right text-xs tabular-nums text-[var(--dash-ink-soft)]">
        {formatNumber(row.redeemed)} redeemed
      </p>
      <p className="text-right text-xs tabular-nums text-[var(--dash-ink-soft)]">
        {formatNumber(row.remaining)} remaining
      </p>
      <p className="text-right text-xs text-[var(--dash-ink-soft)]">
        {row.expiresLabel && row.expiresLabel !== '—'
          ? `Expires: ${row.expiresLabel}`
          : 'No fixed expiry'}
      </p>
      <div className="flex justify-end">
        <StatusBadge status={row.status} />
      </div>
    </>
  );

  const className =
    'grid grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.9fr))_auto] items-center gap-3 border-b border-[var(--dash-border)] px-4 py-2.5 last:border-b-0';

  if (row.href) {
    return (
      <Link
        href={row.href}
        className={`${className} transition-colors hover:bg-[var(--dash-surface-2)]/60`}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * Active Campaigns dashboard section.
 * Mobile: stacked metric cards · md+: tabular rows.
 */
export default function ActiveCampaignsSection({
  rows = null,
  source = null,
  loading = false,
  error = null,
  maxRows = null,
  compact = false,
}) {
  const hasLiveRows = Array.isArray(rows);
  const usingDemo = !hasLiveRows;
  const fullData = usingDemo ? DEMO_ACTIVE_CAMPAIGNS : rows;
  const data =
    typeof maxRows === 'number' && maxRows > 0 ? fullData.slice(0, maxRows) : fullData;
  const truncated =
    typeof maxRows === 'number' && maxRows > 0 && fullData.length > maxRows;
  const dataSource = source || (usingDemo ? 'demo' : 'live');

  return (
    <section aria-label="Active campaigns" className={compact ? 'space-y-2' : 'space-y-3'}>
      <SectionHeader
        title="Active campaigns"
        description={compact ? null : 'Running promotions with code volume and redemption progress'}
        href="/dashboard/campaigns"
        linkLabel={truncated ? 'View all' : 'Manage campaigns'}
        badge={
          dataSource === 'demo' ? (
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200/80">
              Demo
            </span>
          ) : null
        }
      />

      {loading ? (
        <LoadingState rows={3} label="Loading campaigns…" />
      ) : error && dataSource === 'live' ? (
        <ErrorState title="Unable to load campaigns" message={error} />
      ) : !data.length ? (
        <EmptyState
          icon={Megaphone}
          title="No active campaigns"
          description="Create or activate a campaign to track codes and redemptions here."
          action={
            <Button href="/dashboard/campaigns" variant="secondary">
              Open campaigns
            </Button>
          }
        />
      ) : (
        <div className="dash-panel overflow-hidden">
          {/* Mobile cards */}
          <ul className="divide-y divide-[var(--dash-border)] md:hidden" role="list">
            {data.map((row) => (
              <li key={row.id}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className="block px-4 py-3.5 transition-colors hover:bg-[var(--dash-surface-2)]/60"
                  >
                    <CampaignCardMobile row={row} />
                  </Link>
                ) : (
                  <div className="px-4 py-3.5">
                    <CampaignCardMobile row={row} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop / tablet landscape table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.9fr))_auto] gap-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)]/50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
              <span>Campaign</span>
              <span className="text-right">Codes</span>
              <span className="text-right">Redeemed</span>
              <span className="text-right">Remaining</span>
              <span className="text-right">Expiry</span>
              <span className="text-right">Status</span>
            </div>
            <div>
              {data.map((row) => (
                <CampaignRowDesktop key={row.id} row={row} />
              ))}
            </div>
          </div>

          {dataSource === 'demo' ? (
            <p className="border-t border-[var(--dash-border)] px-4 py-2 text-[11px] text-[var(--dash-muted)]">
              {DEMO_ACTIVE_CAMPAIGNS_NOTE}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
