'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { hasAdminKey } from '../../lib/api/client';
import * as analyticsService from '../../lib/api/analyticsService';
import * as campaignService from '../../lib/api/campaignService';
import { messageFromApiResult } from '../../lib/api/errors';
import { buildDashboardKpis } from '../../lib/dashboard/buildDashboardKpis';
import { buildActiveCampaignRows } from '../../lib/dashboard/buildActiveCampaignRows';
import {
  ACTIVE_CAMPAIGN_LIST_LIMIT,
  ANALYTICS_DAY_OPTIONS,
  DEFAULT_ANALYTICS_DAYS,
  RECENT_ACTIVITY_PREVIEW_LIMIT,
  TICKET_LIFECYCLE_STEPS,
} from '../../lib/dashboard/constants';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import KpiCards from './KpiCards';
import AnalyticsPreview from './AnalyticsPreview';
import ActiveCampaignsSection from './ActiveCampaignsSection';
import QuickActionsSection from './QuickActionsSection';
import WorkspaceModulesSection from './WorkspaceModulesSection';
import { RecentActivitySection } from './activity';
import {
  Button,
  PageContainer,
  PageHeader,
  SectionHeader,
  StatusBadge,
} from './ui';

export default function OverviewDashboard() {
  const [days, setDays] = useState(DEFAULT_ANALYTICS_DAYS);
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState(null);
  const [seriesSource, setSeriesSource] = useState(null);
  const [activeCampaigns, setActiveCampaigns] = useState(null);
  const [activeCampaignCount, setActiveCampaignCount] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      setActiveCampaigns(null);
      setSeries(null);
      setSeriesSource(null);
      return;
    }
    setLoading(true);
    setError(null);
    setCampaignsError(null);

    // Parallel independent fetches — KPI cards can settle before the series chart.
    const summaryPromise = campaignService.getAnalyticsSummary({ days });
    const campaignsPromise = campaignService.listCampaigns({
      status: 'ACTIVE',
      limit: ACTIVE_CAMPAIGN_LIST_LIMIT,
    });
    const seriesPromise = analyticsService.getRedemptionsSeries({ days });

    const [summaryRes, campaignsRes] = await Promise.all([
      summaryPromise,
      campaignsPromise,
    ]);

    if (summaryRes.ok) {
      setSummary(summaryRes.data);
    } else {
      setSummary(null);
      setError(messageFromApiResult(summaryRes, 'Unable to load analytics.'));
    }

    if (campaignsRes.ok) {
      setActiveCampaigns(campaignsRes.data?.items || []);
      setActiveCampaignCount(
        typeof campaignsRes.data?.total === 'number' ? campaignsRes.data.total : null,
      );
    } else {
      setActiveCampaigns(null);
      setActiveCampaignCount(null);
      setCampaignsError(messageFromApiResult(campaignsRes, 'Unable to load campaigns.'));
    }

    // Unblock KPI + campaigns UI while series continues.
    setLoading(false);

    const seriesRes = await seriesPromise;
    if (seriesRes.ok) {
      setSeries(seriesRes.data?.series || []);
      setSeriesSource('live');
    } else {
      setSeries(null);
      setSeriesSource(null);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = buildDashboardKpis({
    summary,
    activeCampaignCount,
    loading,
    error,
  });

  const campaignRows =
    activeCampaigns == null
      ? null
      : buildActiveCampaignRows({
          campaigns: activeCampaigns,
          byCampaign: summary?.byCampaign || [],
        });

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your promotions, vouchers, redemptions and campaign performance."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <label className="sr-only" htmlFor="dashboard-range">
              Date range
            </label>
            <select
              id="dashboard-range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={`${DASH_SELECT_COMPACT_CLASS} h-11 w-full sm:h-9 sm:w-auto`}
            >
              {ANALYTICS_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button href="/dashboard/promo-codes" className="w-full sm:w-auto">
              Manage promo codes
              <ArrowRight className="size-4" />
            </Button>
          </div>
        }
      />

      <KpiCards items={kpis} />
      <QuickActionsSection />
      <AnalyticsPreview
        days={days}
        series={series}
        source={seriesSource}
        loading={loading}
        error={error}
      />
      <ActiveCampaignsSection
        rows={campaignRows}
        source={campaignRows ? 'live' : null}
        loading={loading && activeCampaigns == null}
        error={campaignsError}
      />

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
        <RecentActivitySection limit={RECENT_ACTIVITY_PREVIEW_LIMIT} />
        <div className="space-y-3">
          <SectionHeader title="Ticket lifecycle" />
          <div className="dash-panel divide-y divide-[var(--dash-border)]">
            {TICKET_LIFECYCLE_STEPS.map((step) => (
              <div key={step.status} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <StatusBadge status={step.status} />
                <p className="text-sm text-[var(--dash-muted)]">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WorkspaceModulesSection />
    </PageContainer>
  );
}
