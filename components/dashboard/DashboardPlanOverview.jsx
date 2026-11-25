'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, Crown } from 'lucide-react';
import { hasAdminKey } from '../../lib/api/client';
import * as billingService from '../../lib/api/billingService';
import { messageFromApiResult } from '../../lib/api/errors';
import { formatDate } from '../../lib/format';
import {
  formatMoney,
  formatUsagePair,
  statusLabel,
} from '../../lib/billingDisplay';
import { PERMISSIONS } from '../../lib/permissions';
import { getCurrentUser } from '../../lib/currentUser';
import { createPermissionChecker } from '../../lib/permissions';
import KpiCards from './KpiCards';
import { Button } from './ui';

const METRIC_LABELS = {
  customers: 'Customers',
  vouchers: 'Promo codes',
  emails: 'Emails',
  users: 'Users',
  campaigns: 'Campaigns',
};

const PLAN_TIER = {
  free: {
    label: 'Starter workspace',
    ring: 'ring-slate-200/80',
    badge: 'bg-slate-100 text-slate-700',
    glow: 'from-slate-200/40',
  },
  starter: {
    label: 'Growing team',
    ring: 'ring-sky-200/80',
    badge: 'bg-sky-50 text-sky-800',
    glow: 'from-sky-300/25',
  },
  professional: {
    label: 'Scale promotions',
    ring: 'ring-[var(--dash-navy)]/20',
    badge: 'bg-[var(--dash-accent-soft)] text-[var(--dash-navy)]',
    glow: 'from-[var(--dash-navy)]/20',
  },
  business: {
    label: 'High volume',
    ring: 'ring-amber-200/80',
    badge: 'bg-amber-50 text-amber-900',
    glow: 'from-[var(--dash-gold)]/30',
  },
  enterprise: {
    label: 'Custom contract',
    ring: 'ring-violet-200/80',
    badge: 'bg-violet-50 text-violet-900',
    glow: 'from-violet-300/25',
  },
};

function tierForPlanId(planId) {
  return PLAN_TIER[planId] || PLAN_TIER.professional;
}

function nextUpgradePlan(plans, currentPlanId) {
  if (!plans?.length || !currentPlanId) return null;
  const sorted = [...plans]
    .filter((p) => p.id !== 'enterprise')
    .sort((a, b) => Number(a.priceCents || 0) - Number(b.priceCents || 0));
  const idx = sorted.findIndex((p) => p.id === currentPlanId);
  if (idx < 0 || idx >= sorted.length - 1) return null;
  return sorted[idx + 1];
}

function topUsageAlert(usageReport) {
  if (!usageReport || typeof usageReport !== 'object') return null;
  const entries = Object.entries(usageReport);
  const blocked = entries.find(([, m]) => m?.blocked);
  if (blocked) {
    return { level: 'blocked', metric: blocked[0], data: blocked[1] };
  }
  const warning = entries.find(([, m]) => m?.warning);
  if (warning) {
    return { level: 'warning', metric: warning[0], data: warning[1] };
  }
  return null;
}

function usageHighlights(usageReport, limit = 2) {
  if (!usageReport) return [];
  return Object.entries(usageReport)
    .filter(([, m]) => !m.unlimited && Number(m.limit) > 0)
    .sort((a, b) => Number(b[1].percent || 0) - Number(a[1].percent || 0))
    .slice(0, limit)
    .map(([key, metric]) => ({ key, metric }));
}

function MiniUsageBar({ label, metric }) {
  const pct = Math.min(100, Math.max(0, Number(metric.percent || 0)));
  const barColor = metric.blocked
    ? 'bg-rose-500'
    : metric.warning
      ? 'bg-amber-500'
      : 'bg-[var(--dash-navy)]';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium text-[var(--dash-ink-soft)]">{label}</p>
        <p className="text-[11px] tabular-nums text-[var(--dash-muted)]">
          {formatUsagePair(metric.used, metric.limit)}
        </p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--dash-surface-2)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(pct > 0 ? 4 : 0, pct)}%` }}
        />
      </div>
    </div>
  );
}

function PlanCardShell({ tier, children, className = '' }) {
  return (
    <article
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_1px_2px_rgb(16_24_40/0.04),0_8px_24px_rgb(16_24_40/0.04)] ring-1 ${tier.ring} ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-gradient-to-br ${tier.glow} to-transparent blur-2xl`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--dash-border-strong)] to-transparent"
        aria-hidden
      />
      {children}
    </article>
  );
}

function PlanLoadingCompact() {
  return (
    <div aria-hidden className="animate-pulse rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 xl:hidden">
      <div className="h-4 w-28 rounded bg-[var(--dash-surface-2)]" />
      <div className="mt-3 h-2 w-full rounded-full bg-[var(--dash-surface-2)]" />
    </div>
  );
}

function PlanLoadingSidebar() {
  return (
    <PlanCardShell tier={PLAN_TIER.professional} className="animate-pulse p-5">
      <div className="h-3 w-24 rounded bg-[var(--dash-surface-2)]" />
      <div className="mt-4 h-8 w-36 rounded bg-[var(--dash-surface-2)]" />
      <div className="mt-6 space-y-4">
        <div className="h-2 w-full rounded-full bg-[var(--dash-surface-2)]" />
        <div className="h-2 w-full rounded-full bg-[var(--dash-surface-2)]" />
        <div className="h-10 w-full rounded-xl bg-[var(--dash-surface-2)]" />
      </div>
    </PlanCardShell>
  );
}

function useDashboardBilling() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canManage = useMemo(() => {
    const checker = createPermissionChecker(getCurrentUser());
    return checker.can(PERMISSIONS.BILLING_WRITE);
  }, []);

  const canRead = useMemo(() => {
    const checker = createPermissionChecker(getCurrentUser());
    return checker.can(PERMISSIONS.BILLING_READ);
  }, []);

  const reload = useCallback(async () => {
    if (!hasAdminKey() || !canRead) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    const result = await billingService.getBilling();
    if (!result.ok) {
      setData(null);
      setError(messageFromApiResult(result, 'Unable to load your plan.'));
    } else {
      setData(result.data);
    }
    setLoading(false);
  }, [canRead]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleUpgrade(planId) {
    if (!canManage || !planId) return;
    setBusy(true);
    setError('');
    const currentRank = data?.plan?.rank ?? 0;
    const target = data?.plans?.find((p) => p.id === planId);
    const targetRank = target?.rank ?? 0;
    const isDowngrade = targetRank < currentRank;

    if (isDowngrade) {
      const preview = await billingService.previewDowngrade(planId);
      if (!preview.ok) {
        setError(messageFromApiResult(preview, 'Unable to preview plan change.'));
        setBusy(false);
        return;
      }
      if (preview.data?.allowed === false) {
        setError(preview.data.message || 'Reduce usage before switching plans.');
        setBusy(false);
        return;
      }
    }

    const result = await billingService.changePlan(planId);
    setBusy(false);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to change plan.'));
      return;
    }
    if (result.data?.checkoutRequired) {
      if (result.data?.url) {
        window.location.href = result.data.url;
        return;
      }
      setError(
        data?.stripeConfigured
          ? 'Checkout could not be started. Open Billing to try again.'
          : 'Stripe is not configured on the server yet.',
      );
      return;
    }
    await reload();
  }

  return { data, loading, busy, error, canManage, canRead, handleUpgrade, reload };
}

function buildPlanViewModel(data) {
  const plan = data?.plan;
  const subscription = data?.subscription;
  const upgradePlan = nextUpgradePlan(data?.plans || [], plan?.id);
  const tier = tierForPlanId(plan?.id);
  const usageAlert = topUsageAlert(data?.usageReport);
  const highlights = usageHighlights(data?.usageReport);
  const topMetric = highlights[0];

  const priceLabel =
    plan?.id === 'enterprise'
      ? 'Custom pricing'
      : plan && plan.priceCents > 0
        ? formatMoney(plan.priceCents, plan.currency)
        : '$0';

  const billingCadence =
    plan?.id === 'enterprise' ? '' : `/${plan?.billingInterval || 'mo'}`;

  const renewsLine = subscription?.currentPeriodEnd
    ? `Renews ${formatDate(subscription.currentPeriodEnd)}`
    : null;

  return {
    plan,
    subscription,
    upgradePlan,
    tier,
    usageAlert,
    highlights,
    topMetric,
    priceLabel,
    billingCadence,
    renewsLine,
    billingExempt: data?.billingExempt,
  };
}

function PlanCompactStrip({ vm, busy, error, canManage, onUpgrade }) {
  const { plan, upgradePlan, tier, topMetric, usageAlert, billingExempt } = vm;
  const showUpgrade = upgradePlan && canManage && !billingExempt;

  return (
    <section aria-label="Current plan" className="xl:hidden">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-gradient-to-r from-[var(--dash-surface)] via-white to-[color-mix(in_srgb,var(--dash-accent-soft)_55%,white)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tier.badge}`}
            >
              <Crown className="size-3" aria-hidden />
              {plan?.name || 'Free'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--dash-ink)]">{tier.label}</p>
              {topMetric ? (
                <p className="truncate text-xs text-[var(--dash-muted)]">
                  {METRIC_LABELS[topMetric.key] || topMetric.key}:{' '}
                  {formatUsagePair(topMetric.metric.used, topMetric.metric.limit)}
                </p>
              ) : (
                <p className="text-xs text-[var(--dash-muted)]">Usage within plan limits</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {showUpgrade ? (
              <Button
                size="sm"
                loading={busy}
                disabled={busy}
                onClick={() => onUpgrade(upgradePlan.id)}
                className="w-full sm:w-auto"
              >
                Upgrade
                <ArrowUpRight className="size-4" />
              </Button>
            ) : (
              <Button href="/dashboard/settings/billing" variant="secondary" size="sm" className="w-full sm:w-auto">
                Billing
              </Button>
            )}
          </div>
        </div>

        {usageAlert ? (
          <p
            className={`mt-3 text-xs leading-relaxed ${
              usageAlert.level === 'blocked' ? 'text-rose-700' : 'text-amber-800'
            }`}
          >
            {usageAlert.level === 'blocked' ? 'Limit reached' : 'Approaching limit'} on{' '}
            {METRIC_LABELS[usageAlert.metric] || usageAlert.metric}.{' '}
            <Link href="/dashboard/settings/billing" className="font-medium underline">
              Details
            </Link>
          </p>
        ) : null}

        {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
      </div>
    </section>
  );
}

function PlanSidebarCard({ vm, busy, error, canManage, onUpgrade }) {
  const {
    plan,
    subscription,
    upgradePlan,
    tier,
    highlights,
    priceLabel,
    billingCadence,
    renewsLine,
    billingExempt,
    usageAlert,
  } = vm;

  const status = subscription?.status ? statusLabel(subscription.status) : 'Active';
  const showUpgrade = upgradePlan && canManage && !billingExempt;

  return (
    <div className="h-full">
      <PlanCardShell tier={tier} className="h-full p-4 xl:p-5">
        <div className="relative flex h-full min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dash-muted)]">
              Workspace plan
            </p>
            {billingExempt ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                Complimentary
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p className="text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">
              {plan?.name || 'Free'}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--dash-muted)]">
            <span className="font-medium tabular-nums text-[var(--dash-ink-soft)]">
              {priceLabel}
              <span className="font-normal text-[var(--dash-muted)]">{billingCadence}</span>
            </span>
            <span className="hidden text-[var(--dash-border-strong)] sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
              <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden />
              {status}
            </span>
          </div>

          {(renewsLine || subscription?.cancelAtPeriodEnd) && (
            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              {subscription?.cancelAtPeriodEnd ? 'Cancels at period end' : renewsLine}
            </p>
          )}

          {usageAlert ? (
            <div
              className={`mt-4 rounded-xl px-3 py-2 text-xs leading-relaxed ${
                usageAlert.level === 'blocked'
                  ? 'bg-rose-50 text-rose-900 ring-1 ring-rose-100'
                  : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'
              }`}
            >
              {usageAlert.level === 'blocked' ? 'Plan limit reached' : 'Approaching plan limit'} on{' '}
              {METRIC_LABELS[usageAlert.metric] || usageAlert.metric}.
            </div>
          ) : null}

          <div className="mt-4 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dash-muted)]">
              Usage
            </p>
            {highlights.length > 0 ? (
              highlights.map(({ key, metric }) => (
                <MiniUsageBar
                  key={key}
                  label={METRIC_LABELS[key] || key}
                  metric={metric}
                />
              ))
            ) : (
              <p className="text-sm text-[var(--dash-muted)]">Generous limits on your current plan.</p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-1.5 pt-4">
            {showUpgrade ? (
              <Button
                className="w-full"
                loading={busy}
                disabled={busy}
                onClick={() => onUpgrade(upgradePlan.id)}
              >
                Upgrade to {upgradePlan.name}
                <ArrowUpRight className="size-4" />
              </Button>
            ) : plan?.id !== 'enterprise' && canManage && !billingExempt ? (
              <Button href="/dashboard/settings/billing" className="w-full">
                Change plan
                <ArrowRight className="size-4" />
              </Button>
            ) : null}

            <Link
              href="/dashboard/settings/billing"
              className="group inline-flex items-center justify-center gap-1 py-1 text-center text-sm font-medium text-[var(--dash-muted)] transition hover:text-[var(--dash-ink)]"
            >
              Manage billing &amp; invoices
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>

          </div>

          {error ? <p className="mt-3 text-xs text-rose-700">{error}</p> : null}
        </div>
      </PlanCardShell>
    </div>
  );
}

function PlanSidebarSlot({ showPlan, loading, planProps, vm }) {
  if (!showPlan) return null;
  return (
    <div className="hidden min-h-0 min-w-0 xl:col-span-4 xl:row-span-2 xl:block xl:self-stretch">
      {loading ? (
        <PlanLoadingSidebar />
      ) : vm ? (
        <PlanSidebarCard {...planProps} vm={vm} />
      ) : null}
    </div>
  );
}

/**
 * Unified overview bento: KPIs + plan (2-row rail) + main column + sidebar — no dead gap before Redemptions.
 */
export default function DashboardPlanOverview({
  kpis = [],
  analytics = null,
  campaigns = null,
  railTop = null,
  railMiddle = null,
  railBottom = null,
  mobileQuickActions = null,
}) {
  const { data, loading, busy, error, canManage, canRead, handleUpgrade } = useDashboardBilling();

  const showPlan = canRead && (loading || data || error);
  const vm = data ? buildPlanViewModel(data) : null;
  const planProps = { vm, busy, error, canManage, onUpgrade: handleUpgrade };
  const kpiSpan = showPlan ? 'xl:col-span-8' : 'xl:col-span-12';
  const mainSpan = showPlan ? 'xl:col-span-8' : 'xl:col-span-8';

  return (
    <section
      aria-label="Dashboard overview"
      className="grid grid-cols-1 gap-3 xl:grid-cols-12 xl:items-start xl:gap-4"
    >
      {showPlan ? (
        <div className="xl:col-span-12">
          {loading ? (
            <PlanLoadingCompact />
          ) : vm ? (
            <PlanCompactStrip {...planProps} vm={vm} />
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 xl:hidden">
              {error}{' '}
              <Link href="/dashboard/settings/billing" className="font-medium underline">
                Open billing
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {mobileQuickActions ? (
        <div className="xl:col-span-12 xl:hidden">{mobileQuickActions}</div>
      ) : null}

      <div className={`min-w-0 ${kpiSpan}`}>
        <KpiCards items={kpis} />
      </div>

      <PlanSidebarSlot showPlan={showPlan} loading={loading} planProps={planProps} vm={vm} />

      {analytics ? <div className={`min-w-0 ${mainSpan}`}>{analytics}</div> : null}

      {campaigns ? <div className={`min-w-0 ${mainSpan}`}>{campaigns}</div> : null}

      {railTop ? (
        <div className="hidden min-w-0 xl:col-span-4 xl:block">{railTop}</div>
      ) : null}

      {railBottom ? (
        <div className="min-w-0 order-2 xl:order-none xl:col-span-4 xl:self-start">
          {railBottom}
        </div>
      ) : null}

      {railMiddle ? (
        <div className={`min-w-0 order-3 xl:order-none ${mainSpan}`}>{railMiddle}</div>
      ) : null}
    </section>
  );
}