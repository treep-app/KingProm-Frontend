'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../../lib/api/client';
import * as billingService from '../../lib/api/billingService';
import { messageFromApiResult } from '../../lib/api/errors';
import { formatMoney, statusLabel } from '../../lib/billingDisplay';
import { formatNumber } from '../../lib/format';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import {
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
} from './ui';

function PlatformBillingInner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    const result = await billingService.getPlatformBilling();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load platform billing.'));
      setData(null);
    } else {
      setData(result.data);
      setError('');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Platform billing" description="Internal SaaS revenue overview." />
        <LoadingState rows={5} label="Loading platform billing…" />
      </PageContainer>
    );
  }

  const revenue = data?.revenue || {};
  const subscriptions = data?.subscriptions || [];

  return (
    <PageContainer>
      <PageHeader
        title="Platform billing"
        description="Internal view of subscriptions and revenue foundation metrics."
      />
      {error ? <AlertBanner>{error}</AlertBanner> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active', revenue.activeSubscriptions],
          ['Trialing', revenue.trialingSubscriptions],
          ['Past due', revenue.pastDueSubscriptions],
          ['MRR estimate', formatMoney(revenue.mrrEstimateCents || 0)],
        ].map(([label, value]) => (
          <div key={label} className="dash-panel px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
              {label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
          </div>
        ))}
      </div>

      <SectionHeader title="Organizations" description="Subscription status across tenants." />
      <div className="dash-panel overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--dash-border)] text-xs uppercase text-[var(--dash-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Exempt</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-[var(--dash-border)] last:border-0">
                <td className="px-4 py-3 font-medium">
                  {sub.organizationName}
                  <span className="ml-2 text-xs text-[var(--dash-muted)]">
                    {sub.organizationSlug}
                  </span>
                </td>
                <td className="px-4 py-3">{sub.planId}</td>
                <td className="px-4 py-3">{statusLabel(sub.status)}</td>
                <td className="px-4 py-3">{sub.billingExempt ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

export default function PlatformBillingPage() {
  return (
    <AuthGate>
      <PlatformBillingInner />
    </AuthGate>
  );
}
