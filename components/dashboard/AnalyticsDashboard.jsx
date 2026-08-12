'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  CircleDot,
  DollarSign,
  MailOpen,
  Megaphone,
  Percent,
  Ticket,
  Users,
} from 'lucide-react';
import { useAnalyticsDashboard } from '../../hooks/useAnalyticsDashboard';
import {
  CAMPAIGN_LIST_LIMIT,
  DEFAULT_ANALYTICS_PRESET,
} from '../../lib/dashboard/constants';
import { formatDate, formatNumber, formatPercent } from '../../lib/format';
import { hasAdminKey } from '../../lib/api/client';
import * as campaignService from '../../lib/api/campaignService';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import AlertBanner from './AlertBanner';
import AnalyticsDateRangeControl from './AnalyticsDateRangeControl';
import FunnelChart from './charts/FunnelChart';
import HorizontalBarChart from './charts/HorizontalBarChart';
import TimeSeriesChart from './charts/TimeSeriesChart';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
  StatCard,
} from './ui';

function KpiGrid({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      label: 'Total Promo Codes',
      value: formatNumber(kpis.totalPromoCodes),
      hint: kpis.createdInRange != null ? `${formatNumber(kpis.createdInRange)} in range` : null,
      icon: Ticket,
    },
    {
      label: 'Active Promo Codes',
      value: formatNumber(kpis.activePromoCodes),
      hint: 'Issued or revealed, still valid',
      icon: CircleDot,
    },
    {
      label: 'Redeemed Vouchers',
      value: formatNumber(kpis.redeemedVouchers),
      hint:
        kpis.redeemedInRange != null ? `${formatNumber(kpis.redeemedInRange)} in range` : null,
      icon: BadgeCheck,
    },
    {
      label: 'Redemption Rate',
      value: formatPercent(kpis.redemptionRate, { ratio: true, digits: 1 }),
      hint: 'Redeemed ÷ total codes',
      icon: Percent,
    },
    {
      label: 'Revenue Generated',
      value: '—',
      hint: 'Revenue tracking is not configured yet.',
      icon: DollarSign,
    },
    {
      label: 'Active Campaigns',
      value: formatNumber(kpis.activeCampaigns),
      icon: Megaphone,
    },
    {
      label: 'Email Open Rate',
      value: formatPercent(kpis.emailOpenRate, { ratio: true, digits: 0 }),
      hint: 'Opened ÷ delivered (or sent)',
      icon: MailOpen,
    },
    {
      label: 'Customer Engagement',
      value: formatPercent(kpis.customerEngagement, { ratio: true, digits: 0 }),
      hint: 'Customers with at least one redemption',
      icon: Users,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Analytics KPIs">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          hint={card.hint}
          icon={card.icon}
        />
      ))}
    </section>
  );
}

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState(DEFAULT_ANALYTICS_PRESET);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  const range = useMemo(() => {
    if (preset === 'custom') {
      return { preset: 'custom', from, to, campaignId };
    }
    return { preset, campaignId };
  }, [preset, from, to, campaignId]);

  const canLoadCustom = preset !== 'custom' || (Boolean(from) && Boolean(to));
  const { data, loading, error, reload } = useAnalyticsDashboard(range, {
    enabled: canLoadCustom,
  });

  useEffect(() => {
    if (!hasAdminKey()) return;
    campaignService.listCampaigns({ limit: CAMPAIGN_LIST_LIMIT }).then(({ ok, data: d }) => {
      if (ok) setCampaigns(d.items || []);
    });
  }, []);

  const campaignColumns = [
    {
      key: 'name',
      header: 'Campaign',
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/dashboard/campaigns/${encodeURIComponent(row.id)}`}
            className="font-medium text-[var(--dash-ink)] hover:underline"
          >
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (row) => (
        <span className="text-[var(--dash-muted)]">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'generated',
      header: 'Generated',
      cell: (row) => formatNumber(row.generatedCodes),
      className: 'tabular-nums',
    },
    {
      key: 'sent',
      header: 'Sent',
      cell: (row) => formatNumber(row.sent),
      className: 'tabular-nums',
    },
    {
      key: 'redeemed',
      header: 'Redeemed',
      cell: (row) => formatNumber(row.redeemed),
      className: 'tabular-nums',
    },
    {
      key: 'rate',
      header: 'Redemption rate',
      cell: (row) => formatPercent(row.redemptionRate, { ratio: true, digits: 1 }),
      className: 'tabular-nums',
    },
    {
      key: 'revenue',
      header: 'Revenue',
      cell: () => (
        <span className="text-[var(--dash-muted)]" title="Revenue tracking is not configured yet.">
          —
        </span>
      ),
    },
  ];

  const topCustomerColumns = [
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/dashboard/customers/${encodeURIComponent(row.id)}`}
            className="font-medium text-[var(--dash-ink)] hover:underline"
          >
            {row.name}
          </Link>
          {row.email ? (
            <p className="truncate text-xs text-[var(--dash-muted)]">{row.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'vouchers',
      header: 'Vouchers',
      cell: (row) => formatNumber(row.vouchers),
      className: 'tabular-nums',
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      cell: (row) => formatNumber(row.redemptions),
      className: 'tabular-nums',
    },
    {
      key: 'revenue',
      header: 'Revenue',
      cell: () => <span className="text-[var(--dash-muted)]">—</span>,
    },
    {
      key: 'activity',
      header: 'Last activity',
      cell: (row) => (
        <span className="text-[var(--dash-muted)]">
          {row.lastActivityAt ? formatDate(row.lastActivityAt) : '—'}
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Understand your promotions, customers, and voucher performance."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <AnalyticsDateRangeControl
              preset={preset}
              from={from}
              to={to}
              onChange={({ preset: nextPreset, from: nextFrom, to: nextTo }) => {
                setPreset(nextPreset);
                setFrom(nextFrom || '');
                setTo(nextTo || '');
              }}
            />
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="analytics-campaign">
                Campaign
              </label>
              <select
                id="analytics-campaign"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className={`${DASH_SELECT_COMPACT_CLASS} h-11 w-full sm:h-9 sm:w-auto`}
              >
                <option value="">All campaigns</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button href="/dashboard/reports" variant="secondary" className="w-full sm:w-auto">
                Reports
              </Button>
            </div>
          </div>
        }
      />

      {data?.range?.timezone ? (
        <p className="text-xs text-[var(--dash-muted)]">
          Dates normalized to business timezone{' '}
          <span className="font-medium text-[var(--dash-ink-soft)]">{data.range.timezone}</span>
          {data.range.label ? ` · ${data.range.label}` : null}
        </p>
      ) : null}

      {error ? (
        <AlertBanner href="/dashboard/login" linkLabel="Sign in">
          {error}
        </AlertBanner>
      ) : null}

      {preset === 'custom' && !canLoadCustom ? (
        <EmptyState
          title="Choose a custom range"
          description="Select both a from date and a to date to load analytics for that window."
        />
      ) : null}

      {loading ? <LoadingState rows={6} label="Loading analytics…" /> : null}

      {!loading && data ? (
        <div className="space-y-8">
          <KpiGrid kpis={data.kpis} />

          <section className="space-y-3">
            <SectionHeader
              title="Campaign Performance"
              description="Codes generated, emails sent, and redemptions by campaign"
            />
            {(data.campaignPerformance || []).length === 0 ? (
              <EmptyState
                title="No campaign data available yet."
                description="Create a campaign and generate promo codes to see performance."
              />
            ) : (
              <DataTable
                columns={campaignColumns}
                rows={data.campaignPerformance}
                minWidth="880px"
                mobileCard={(row) => (
                  <div>
                    <p className="font-medium text-[var(--dash-ink)]">{row.name}</p>
                    <p className="mt-1 text-xs text-[var(--dash-muted)]">
                      {formatNumber(row.generatedCodes)} generated · {formatNumber(row.redeemed)}{' '}
                      redeemed · {formatPercent(row.redemptionRate, { ratio: true, digits: 0 })}
                    </p>
                  </div>
                )}
              />
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="dash-panel space-y-3 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Redemption trend</h2>
              <TimeSeriesChart
                series={data.redemptions?.series || []}
                valueKey="redemptions"
                unitLabel="redemptions"
                ariaLabel="Redemptions over time"
                emptyLabel="Redemption analytics will appear after vouchers are used."
              />
            </div>
            <div className="dash-panel space-y-3 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Campaign comparison</h2>
              <HorizontalBarChart
                items={(data.campaignComparison || []).map((row) => ({
                  id: row.id,
                  label: row.name,
                  value: row.redeemed,
                }))}
                emptyLabel="No campaign data available yet."
                ariaLabel="Redeemed count by campaign"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="dash-panel space-y-3 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Conversion funnel</h2>
              <FunnelChart
                steps={data.funnel?.steps || []}
                emptyLabel="No campaign data available yet."
              />
            </div>
            <div className="dash-panel space-y-4 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Voucher performance</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['Generated', data.vouchers?.generated],
                  ['Active', data.vouchers?.active],
                  ['Used', data.vouchers?.used],
                  ['Expired', data.vouchers?.expired],
                  ['Cancelled', data.vouchers?.cancelled],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--dash-ink)]">
                      {formatNumber(value)}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                  Most redeemed voucher types
                </h3>
                <HorizontalBarChart
                  items={(data.vouchers?.byType || []).map((row) => ({
                    id: row.type,
                    label: row.type.replace(/_/g, ' '),
                    value: row.redeemed,
                  }))}
                  emptyLabel="Voucher analytics will appear after codes are generated."
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Redemption Insights"
              description="Where and when vouchers are claimed"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Total redemptions"
                value={formatNumber(data.redemptions?.totalInRange)}
                hint="In selected range"
              />
              <StatCard
                label="Redemption rate"
                value={formatPercent(data.redemptions?.redemptionRate, {
                  ratio: true,
                  digits: 1,
                })}
              />
              <StatCard
                label="Avg. time to redeem"
                value={data.redemptions?.averageTimeToRedeemLabel || '—'}
                hint="From code creation to redemption"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="dash-panel space-y-3 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[var(--dash-ink)]">By location</h3>
                <HorizontalBarChart
                  items={(data.redemptions?.byLocation || []).map((row) => ({
                    id: row.key,
                    label: row.label,
                    value: row.count,
                  }))}
                  emptyLabel="Redemption analytics will appear after vouchers are used."
                />
              </div>
              <div className="dash-panel space-y-3 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[var(--dash-ink)]">By staff</h3>
                <HorizontalBarChart
                  items={(data.redemptions?.byStaff || []).map((row) => ({
                    id: row.name,
                    label: row.name,
                    value: row.count,
                  }))}
                  emptyLabel="Staff redemption counts appear after staff scans."
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Email Performance"
              description="Delivery and engagement for marketing sends"
            />
            {(data.email?.emailsSent || 0) === 0 && (data.email?.campaignsSent || 0) === 0 ? (
              <EmptyState
                title="Email performance will appear after campaigns are sent."
                description="Create and send an email campaign to unlock open and click rates."
              />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Campaigns sent"
                    value={formatNumber(data.email.campaignsSent)}
                  />
                  <StatCard
                    label="Emails delivered"
                    value={formatNumber(data.email.emailsDelivered)}
                    hint={`Delivery ${formatPercent(data.email.deliveryRate, { ratio: true, digits: 0 })}`}
                  />
                  <StatCard
                    label="Open rate"
                    value={formatPercent(data.email.openRate, { ratio: true, digits: 0 })}
                    hint={`${formatNumber(data.email.opens)} opens`}
                  />
                  <StatCard
                    label="Click rate"
                    value={formatPercent(data.email.clickRate, { ratio: true, digits: 0 })}
                    hint={`Bounce ${formatPercent(data.email.bounceRate, { ratio: true, digits: 0 })}`}
                  />
                </div>
                <div className="dash-panel overflow-hidden">
                  <div className="border-b border-[var(--dash-border)] px-4 py-3 sm:px-5">
                    <h3 className="text-sm font-semibold text-[var(--dash-ink)]">
                      Campaign comparison
                    </h3>
                  </div>
                  <div className="divide-y divide-[var(--dash-border)]">
                    {(data.email.comparison || []).map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--dash-ink)]">{row.name}</p>
                          <p className="text-xs text-[var(--dash-muted)]">
                            {formatNumber(row.sent)} sent · {formatNumber(row.delivered)} delivered
                          </p>
                        </div>
                        <div className="text-right text-xs text-[var(--dash-muted)]">
                          <p>
                            Open{' '}
                            <span className="font-semibold text-[var(--dash-ink)]">
                              {formatPercent(row.openRate, { ratio: true, digits: 0 })}
                            </span>
                          </p>
                          <p>
                            Click{' '}
                            <span className="font-semibold text-[var(--dash-ink)]">
                              {formatPercent(row.clickRate, { ratio: true, digits: 0 })}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Customer Analytics"
              description="Growth, segments, and repeat engagement"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                label="Total customers"
                value={formatNumber(data.customers?.totalCustomers)}
              />
              <StatCard
                label="New customers"
                value={formatNumber(data.customers?.newCustomers)}
                hint="In selected range"
              />
              <StatCard
                label="Returning"
                value={formatNumber(data.customers?.returningCustomers)}
              />
              <StatCard label="VIP" value={formatNumber(data.customers?.vipCustomers)} />
              <StatCard
                label="With redemptions"
                value={formatNumber(data.customers?.customersWithRedemptions)}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="dash-panel space-y-3 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[var(--dash-ink)]">Customer growth</h3>
                <TimeSeriesChart
                  series={data.customers?.growth || []}
                  valueKey="count"
                  unitLabel="new customers"
                  ariaLabel="Customer growth over time"
                  emptyLabel="Customer growth appears after CRM records are created."
                />
              </div>
              <div className="dash-panel space-y-3 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[var(--dash-ink)]">Customer segments</h3>
                <HorizontalBarChart
                  items={(data.customers?.segments || []).map((row) => ({
                    id: row.segment,
                    label: row.segment,
                    value: row.count,
                  }))}
                  emptyLabel="Tag customers to build segments."
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="Top Customers" description="Highest voucher and redemption volume" />
            {(data.customers?.topCustomers || []).length === 0 ? (
              <EmptyState
                title="No customer analytics yet."
                description="Add customers and assign vouchers to populate this table."
              />
            ) : (
              <DataTable
                columns={topCustomerColumns}
                rows={data.customers.topCustomers}
                minWidth="760px"
                mobileCard={(row) => (
                  <div>
                    <p className="font-medium text-[var(--dash-ink)]">{row.name}</p>
                    <p className="mt-1 text-xs text-[var(--dash-muted)]">
                      {formatNumber(row.vouchers)} vouchers · {formatNumber(row.redemptions)}{' '}
                      redemptions
                    </p>
                  </div>
                )}
              />
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader title="Revenue" description="Commercial impact of promotions" />
            <div className="dash-panel p-5">
              <p className="text-sm font-medium text-[var(--dash-ink)]">
                Revenue tracking is not configured yet.
              </p>
              <p className="mt-1 text-sm text-[var(--dash-muted)]">
                KingProm does not store order totals on vouchers or redemptions. Configure a revenue
                source in a future release to unlock revenue KPIs and charts.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="Popular Promotions" description="Highest converting offers" />
            {(data.popularOffers || []).length === 0 ? (
              <EmptyState
                title="No campaign data available yet."
                description="Popular promotions appear after campaigns generate and redeem codes."
              />
            ) : (
              <div className="dash-panel divide-y divide-[var(--dash-border)]">
                {data.popularOffers.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--dash-ink)]">{row.offer}</p>
                      <p className="text-xs text-[var(--dash-muted)]">
                        {formatNumber(row.generated)} generated · {formatNumber(row.redeemed)}{' '}
                        redeemed
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
                      {formatPercent(row.conversion, { ratio: true, digits: 0 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => reload()}>
              Refresh
            </Button>
            <Button href="/dashboard/reports" variant="secondary">
              Export reports
            </Button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
