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
  ANALYTICS_DAY_OPTIONS,
  DASHBOARD_OVERVIEW_CAMPAIGN_ROWS,
  DEFAULT_ANALYTICS_DAYS,
  RECENT_ACTIVITY_PREVIEW_LIMIT,
} from '../../lib/dashboard/constants';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import AnalyticsPreview from './AnalyticsPreview';
import ActiveCampaignsSection from './ActiveCampaignsSection';
import QuickActionsSection from './QuickActionsSection';
import { RecentActivitySection } from './activity';
import DashboardPlanOverview from './DashboardPlanOverview';
import DashboardTicketLifecycleCompact from './DashboardTicketLifecycleCompact';
import { Button, PageContainer, PageHeader } from './ui';

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

    const summaryPromise = campaignService.getAnalyticsSummary({ days });
    const campaignsPromise = campaignService.listCampaigns({
      status: 'ACTIVE',
      limit: Math.max(DASHBOARD_OVERVIEW_CAMPAIGN_ROWS, 6),
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
    <PageContainer className="space-y-4 sm:space-y-5">
      <PageHeader
        compact
        title="Overview"
        description="Promotions, redemptions, and live campaign health."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="dashboard-range">
              Date range
            </label>
            <select
              id="dashboard-range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={`${DASH_SELECT_COMPACT_CLASS} h-9 w-full sm:w-auto`}
            >
              {ANALYTICS_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button href="/dashboard/promo-codes" size="sm" className="w-full sm:w-auto">
              Promo codes
              <ArrowRight className="size-4" />
            </Button>
          </div>
        }
      />

      <DashboardPlanOverview
        kpis={kpis}
        mobileQuickActions={<QuickActionsSection layout="strip" />}
        analytics={
          <AnalyticsPreview
            days={days}
            series={series}
            source={seriesSource}
            loading={loading}
            error={error}
            compact
          />
        }
        campaigns={
          <ActiveCampaignsSection
            rows={campaignRows}
            source={campaignRows ? 'live' : null}
            loading={loading && activeCampaigns == null}
            error={campaignsError}
            maxRows={DASHBOARD_OVERVIEW_CAMPAIGN_ROWS}
            compact
          />
        }
        railTop={<QuickActionsSection layout="rail" />}
        railMiddle={<DashboardTicketLifecycleCompact />}
        railBottom={
          <RecentActivitySection limit={RECENT_ACTIVITY_PREVIEW_LIMIT} compact />
        }
      />
    </PageContainer>
  );
}