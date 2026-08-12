import {
  Ticket,
  CircleDot,
  BadgeCheck,
  TimerOff,
  DollarSign,
  Percent,
  CalendarCheck2,
  Megaphone,
} from 'lucide-react';
import { formatNumber, formatPercent } from '../format';

/**
 * Build the dashboard home KPI list.
 *
 * Live metrics come from analytics/campaigns APIs.
 * Revenue stays empty until a real revenue source is configured.
 *
 * @param {{
 *   summary?: object | null,
 *   activeCampaignCount?: number | null,
 *   loading?: boolean,
 *   error?: string | null,
 * }} opts
 */
export function buildDashboardKpis({
  summary = null,
  activeCampaignCount = null,
  loading = false,
  error = null,
} = {}) {
  const totals = summary?.totals;
  const funnel = summary?.funnel;
  const hasLive = Boolean(totals);

  const liveMetric = (raw, format, { description } = {}) => {
    if (error && !hasLive) {
      return {
        display: '—',
        source: 'live',
        status: 'error',
        errorMessage: error,
        trend: null,
        description: null,
      };
    }
    if (loading && !hasLive) {
      return {
        display: '—',
        source: 'live',
        status: 'loading',
        trend: null,
        description: null,
      };
    }
    if (!hasLive || raw == null) {
      return {
        display: '—',
        source: 'live',
        status: 'empty',
        trend: null,
        description: description || 'No data for this period',
      };
    }
    return {
      display: format(raw),
      source: 'live',
      status: 'ready',
      trend: null,
      description,
    };
  };

  const activeCodes =
    hasLive && totals
      ? totals.active != null
        ? totals.active
        : (totals.issued || 0) + (totals.revealed || 0)
      : null;

  const campaignsMetric = (() => {
    if (error && activeCampaignCount == null && !loading) {
      return {
        display: '—',
        source: 'live',
        status: 'error',
        errorMessage: error,
        trend: null,
        description: null,
      };
    }
    if (loading && activeCampaignCount == null) {
      return {
        display: '—',
        source: 'live',
        status: 'loading',
        trend: null,
        description: null,
      };
    }
    if (activeCampaignCount == null) {
      return {
        display: '—',
        source: 'live',
        status: 'empty',
        trend: null,
        description: 'No campaign data',
      };
    }
    if (activeCampaignCount === 0) {
      return {
        display: formatNumber(0),
        source: 'live',
        status: 'empty',
        trend: null,
        description: 'No active campaigns',
      };
    }
    return {
      display: formatNumber(activeCampaignCount),
      source: 'live',
      status: 'ready',
      trend: null,
      description: 'Campaigns with ACTIVE status',
    };
  })();

  const total = liveMetric(totals?.total, formatNumber, {
    description: totals
      ? `${formatNumber(totals.createdInRange)} created in selected range`
      : undefined,
  });
  const active = liveMetric(activeCodes, formatNumber, {
    description: hasLive ? 'Issued or revealed, still valid' : undefined,
  });
  const redeemed = liveMetric(totals?.redeemed, formatNumber, {
    description: totals
      ? `${formatNumber(totals.redeemedInRange)} in selected range`
      : undefined,
  });
  const expired = liveMetric(totals?.expired, formatNumber, {
    description: hasLive ? 'Includes lazy-expired open tickets' : undefined,
  });
  const rate = liveMetric(funnel?.redeemRate, (v) => formatPercent(v, { ratio: true, digits: 1 }), {
    description: hasLive ? 'Redeemed ÷ total issued' : undefined,
  });

  const revenueConfigured = summary?.revenue?.configured === true;
  const revenue = revenueConfigured
    ? liveMetric(summary.revenue.total, formatNumber)
    : {
        display: '—',
        source: 'live',
        status: 'empty',
        trend: null,
        description: 'Revenue tracking is not configured yet.',
      };

  const todayRaw =
    summary?.todaysRedemptions != null ? summary.todaysRedemptions : null;
  const today = liveMetric(todayRaw, formatNumber, {
    description: hasLive ? 'Redeemed today (business timezone)' : undefined,
  });

  return [
    {
      id: 'totalPromoCodes',
      label: 'Total Promo Codes',
      icon: Ticket,
      ...total,
    },
    {
      id: 'activeCodes',
      label: 'Active Codes',
      icon: CircleDot,
      ...active,
    },
    {
      id: 'redeemed',
      label: 'Redeemed',
      icon: BadgeCheck,
      ...redeemed,
    },
    {
      id: 'expired',
      label: 'Expired',
      icon: TimerOff,
      ...expired,
    },
    {
      id: 'revenueGenerated',
      label: 'Revenue Generated',
      icon: DollarSign,
      ...revenue,
    },
    {
      id: 'redemptionRate',
      label: 'Redemption Rate',
      icon: Percent,
      ...rate,
    },
    {
      id: 'todaysRedemptions',
      label: "Today's Redemptions",
      icon: CalendarCheck2,
      ...today,
    },
    {
      id: 'campaignsRunning',
      label: 'Campaigns Running',
      icon: Megaphone,
      ...campaignsMetric,
    },
  ];
}
