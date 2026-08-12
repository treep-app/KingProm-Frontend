'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { hasAdminKey } from '../../lib/api/client';
import * as billingService from '../../lib/api/billingService';
import { messageFromApiResult } from '../../lib/api/errors';
import { PERMISSIONS } from '../../lib/permissions';
import { formatDate } from '../../lib/format';
import { formatMoney, invoiceStatusLabel } from '../../lib/billingDisplay';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

function InvoicesInner() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    const result = await billingService.getInvoices();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load invoices.'));
      setInvoices([]);
    } else {
      setInvoices(result.data.invoices || []);
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
        <PageHeader title="Invoices" description="Billing history for this organization." />
        <LoadingState rows={5} label="Loading invoices…" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Billing history for this organization."
        actions={
          <Button href="/dashboard/settings/billing" variant="secondary">
            Back to billing
          </Button>
        }
      />
      {error ? <AlertBanner>{error}</AlertBanner> : null}
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
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[var(--dash-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">
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
                        className="inline-flex items-center gap-1 font-medium underline"
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
    </PageContainer>
  );
}

export default function BillingInvoicesPage() {
  return (
    <AuthGate permission={PERMISSIONS.BILLING_READ}>
      <InvoicesInner />
    </AuthGate>
  );
}
