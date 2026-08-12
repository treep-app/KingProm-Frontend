'use client';

import { useEffect, useState } from 'react';
import * as customerService from '../../lib/api/customerService';
import { messageFromApiResult } from '../../lib/api/errors';
import {
  customerDisplayName,
  formatRelativeActivity,
} from '../../lib/dashboard/customerFormat';
import { formatDateTime } from '../../lib/format';
import StatusBadge from './StatusBadge';
import { Button, Sheet } from './ui';

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--dash-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{children ?? '—'}</dd>
    </div>
  );
}

export default function CustomerDetailDrawer({
  customerId,
  open,
  onClose,
  onEdit,
  canEdit = false,
}) {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !customerId) return undefined;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const result = await customerService.getCustomer(customerId);
      if (cancelled) return;
      if (!result.ok) {
        setError(messageFromApiResult(result, 'Unable to load customer.'));
        setCustomer(null);
      } else {
        setCustomer(result.data.customer);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, customerId]);

  const name = customer ? customerDisplayName(customer) : loading ? 'Loading…' : 'Customer';

  return (
    <Sheet
      open={open && Boolean(customerId)}
      onClose={onClose}
      title={name}
      description="Customer profile summary"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button
            href={`/dashboard/customers/${encodeURIComponent(customerId || '')}`}
            variant="secondary"
            size="sm"
          >
            View full profile
          </Button>
          {canEdit && customer?.status !== 'ARCHIVED' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (customer) onEdit?.(customer);
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--dash-muted)]">Loading customer…</p>
      ) : error ? (
        <p className="text-sm text-rose-700">{error}</p>
      ) : customer ? (
        <dl className="space-y-4">
          <StatusBadge status={customer.status} />
          <Field label="Email">{customer.email}</Field>
          <Field label="Phone">{customer.phone}</Field>
          <Field label="Company">{customer.company}</Field>
          <Field label="Tags">
            {Array.isArray(customer.tags) && customer.tags.length
              ? customer.tags.join(', ')
              : '—'}
          </Field>
          <Field label="Last activity">
            {formatRelativeActivity(customer.lastActivityAt) ||
              formatDateTime(customer.lastActivityAt) ||
              '—'}
          </Field>
          <Field label="Promo codes">{customer.promoCodeCount ?? '—'}</Field>
          <Field label="Redemptions">{customer.redemptionCount ?? '—'}</Field>
        </dl>
      ) : null}
    </Sheet>
  );
}
