'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CreditCard, ExternalLink } from 'lucide-react';
import { hasAdminKey } from '../../lib/api/client';
import * as billingService from '../../lib/api/billingService';
import { messageFromApiResult } from '../../lib/api/errors';
import { PERMISSIONS } from '../../lib/permissions';
import { formatDate } from '../../lib/format';
import {
  formatMoney,
  statusLabel,
  invoiceStatusLabel,
} from '../../lib/billingDisplay';
import { getCurrentUser } from '../../lib/currentUser';
import { createPermissionChecker } from '../../lib/permissions';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import UsageMeters from './UsageMeters';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
} from './ui';

function BillingSettingsInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [downgradeBlockers, setDowngradeBlockers] = useState(null);

  const checker = useMemo(
    () => createPermissionChecker(getCurrentUser()),
    [],
  );
  const canManage = checker.can(PERMISSIONS.BILLING_WRITE);

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await billingService.getBilling();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load billing.'));
      setData(null);
    } else {
      setData(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const checkout = searchParams?.get('checkout');
    if (checkout === 'success') {
      setNotice(
        'Checkout completed. Your subscription activates after Stripe confirms payment (usually within a few seconds).',
      );
    } else if (checkout === 'cancelled') {
      setNotice('Checkout was cancelled. No charges were made.');
    }
  }, [searchParams]);

  async function startCheckout(planId) {
    if (!canManage) return;
    setBusy(planId);
    setError('');
    setDowngradeBlockers(null);

    const preview = await billingService.previewDowngrade(planId);
    if (preview.ok && preview.data?.allowed === false) {
      setDowngradeBlockers(preview.data.blockers || []);
      setError(preview.data.message || 'Reduce usage before switching to this plan.');
      setBusy('');
      return;
    }

    const result = await billingService.changePlan(planId);
    setBusy('');
    if (!result.ok) {
      if (result.data?.blockers) setDowngradeBlockers(result.data.blockers);
      setError(messageFromApiResult(result, 'Unable to change plan.'));
      return;
    }
    if (result.data?.checkoutRequired && result.data?.url) {
      window.location.href = result.data.url;
      return;
    }
    setNotice(`Plan updated to ${planId}.`);
    await reload();
  }

  async function openPortal() {
    if (!canManage) return;
    setBusy('portal');
    setError('');
    const result = await billingService.createPortalSession();
    setBusy('');
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to open billing portal.'));
      return;
    }
    if (result.data?.url) window.location.href = result.data.url;
  }

  async function cancelAtPeriodEnd() {
    if (!canManage) return;
    if (!window.confirm('Cancel at the end of the current billing period?')) return;
    setBusy('cancel');
    setError('');
    const result = await billingService.cancelSubscription({ immediate: false });
    setBusy('');
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to cancel subscription.'));
      return;
    }
    setNotice('Cancellation scheduled for the end of the billing period.');
    await reload();
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Billing" description="Subscription, usage, and invoices." />
        <LoadingState rows={6} label="Loading billing…" />
      </PageContainer>
    );
  }

  const subscription = data?.subscription;
  const plan = data?.plan;
  const plans = data?.plans || [];
  const invoices = data?.invoices || [];

  return (
    <PageContainer>
      <PageHeader
        title="Billing"
        description="Manage your subscription, usage limits, and invoices."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/pricing" variant="secondary">
              Compare plans
            </Button>
            <Button href="/dashboard/settings/billing/invoices" variant="secondary">
              All invoices
            </Button>
          </div>
        }
      />

      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {downgradeBlockers?.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Downgrade blocked by current usage</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {downgradeBlockers.map((b) => (
              <li key={b.metric}>{b.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="dash-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
              Current plan
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--dash-ink)]">
              {plan?.name || 'Free'}
            </h2>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Status: {statusLabel(subscription?.status)}
              {subscription?.currentPeriodEnd
                ? ` · Renews ${formatDate(subscription.currentPeriodEnd)}`
                : ''}
              {subscription?.cancelAtPeriodEnd ? ' · Cancels at period end' : ''}
            </p>
            {data?.billingExempt ? (
              <p className="mt-2 text-sm text-emerald-700">
                Internal plan — billing exempt (seed tenant workspace).
              </p>
            ) : null}
            {!data?.stripeConfigured && !data?.billingExempt ? (
              <p className="mt-2 text-sm text-amber-800">
                Stripe is not configured on the server yet. Plans and usage still apply;
                checkout will be available once billing keys are set.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canManage && !data?.billingExempt && subscription?.stripeCustomerId ? (
              <Button
                variant="secondary"
                onClick={openPortal}
                disabled={busy === 'portal'}
                loading={busy === 'portal'}
              >
                <CreditCard className="mr-1.5 h-4 w-4" />
                Manage payment method
              </Button>
            ) : null}
            {canManage && !data?.billingExempt && subscription?.planId !== 'free' ? (
              <Button
                variant="ghost"
                onClick={cancelAtPeriodEnd}
                disabled={Boolean(busy)}
              >
                Cancel at period end
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <SectionHeader
        title="Usage"
        description="Limits are enforced on the server. Warnings appear at 80% and 100%."
      />
      <UsageMeters usageReport={data?.usageReport} />

      <SectionHeader title="Available plans" description="Upgrade or change your subscription." />
      {!plans.length ? (
        <p className="text-sm text-[var(--dash-muted)]">
          Choose a plan to unlock more features.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const isCurrent = plan?.id === p.id;
            const priceLabel =
              p.id === 'enterprise'
                ? 'Contact sales'
                : p.priceCents > 0
                  ? `${formatMoney(p.priceCents, p.currency)}/${p.billingInterval || 'month'}`
                  : '$0/month';
            return (
              <article key={p.id} className="dash-panel flex flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--dash-ink)]">{p.name}</h3>
                  {isCurrent ? (
                    <span className="text-[11px] font-semibold uppercase text-emerald-700">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-lg font-semibold tabular-nums text-[var(--dash-ink)]">
                  {priceLabel}
                </p>
                <p className="mt-1 flex-1 text-sm text-[var(--dash-muted)]">{p.description}</p>
                <div className="mt-4">
                  {p.id === 'enterprise' ? (
                    <Button href="mailto:hello@kingprom.com?subject=Enterprise%20plan" variant="secondary">
                      Contact sales
                    </Button>
                  ) : isCurrent || data?.billingExempt ? (
                    <Button variant="secondary" disabled>
                      {isCurrent ? 'Current plan' : 'Managed internally'}
                    </Button>
                  ) : canManage ? (
                    <Button
                      onClick={() => startCheckout(p.id)}
                      disabled={Boolean(busy)}
                      loading={busy === p.id}
                    >
                      {p.priceCents > 0 ? 'Upgrade' : 'Switch'} to {p.name}
                    </Button>
                  ) : (
                    <p className="text-xs text-[var(--dash-muted)]">
                      Ask an owner or admin to change plans.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <SectionHeader title="Recent invoices" description="Paid and pending invoices from Stripe." />
      {invoices.length === 0 ? (
        <p className="text-sm text-[var(--dash-muted)]">Your invoices will appear here.</p>
      ) : (
        <div className="dash-panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--dash-border)] text-xs uppercase text-[var(--dash-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="border-b border-[var(--dash-border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--dash-ink)]">
                    {inv.invoiceNumber || inv.stripeInvoiceId}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {formatDate(inv.paidAt || inv.createdAt)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoney(inv.amountPaidCents || inv.amountDueCents, inv.currency)}
                  </td>
                  <td className="px-4 py-3">{invoiceStatusLabel(inv.status)}</td>
                  <td className="px-4 py-3">
                    {inv.invoicePdfUrl || inv.hostedInvoiceUrl ? (
                      <a
                        href={inv.invoicePdfUrl || inv.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[var(--dash-ink)] underline"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-[var(--dash-muted)]">
        Business profile lives in{' '}
        <Link href="/dashboard/settings/business" className="font-medium text-[var(--dash-ink)] underline">
          Business settings
        </Link>
        .
      </p>
    </PageContainer>
  );
}

export default function BillingSettingsPage() {
  return (
    <AuthGate permission={PERMISSIONS.BILLING_READ}>
      <BillingSettingsInner />
    </AuthGate>
  );
}
