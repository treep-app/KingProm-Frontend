'use client';

import { useEffect, useState } from 'react';
import * as redemptionService from '../../lib/api/redemptionService';
import { messageFromApiResult } from '../../lib/api/errors';
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

function channelLabel(channel) {
  const key = String(channel || '').toLowerCase();
  if (key === 'staff') return 'Staff';
  if (key === 'guest') return 'Guest';
  return channel || '—';
}

export default function RedemptionDetailDrawer({ redemptionId, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [redemption, setRedemption] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !redemptionId) return undefined;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const result = await redemptionService.getRedemption(redemptionId);
      if (cancelled) return;
      if (!result.ok) {
        setError(messageFromApiResult(result, 'Unable to load redemption.'));
        setRedemption(null);
      } else {
        setRedemption(result.data.redemption || result.data);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, redemptionId]);

  return (
    <Sheet
      open={open && Boolean(redemptionId)}
      onClose={onClose}
      title={
        redemption?.promoCode || (loading ? 'Loading…' : 'Redemption')
      }
      description="Redemption details"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button
            href={`/dashboard/redemptions/${encodeURIComponent(redemptionId || '')}`}
            variant="secondary"
            size="sm"
          >
            View full details
          </Button>
          {redemption?.ticketId ? (
            <Button
              href={`/dashboard/promo-codes/${encodeURIComponent(redemption.ticketId)}`}
              size="sm"
            >
              View promo code
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--dash-muted)]">Loading redemption…</p>
      ) : error ? (
        <p className="text-sm text-rose-700">{error}</p>
      ) : redemption ? (
        <dl className="space-y-4">
          <StatusBadge status={redemption.status} />
          <Field label="Customer">
            {redemption.customerName || redemption.customerEmail || '—'}
          </Field>
          <Field label="Campaign">
            {redemption.campaignName || redemption.campaignId || '—'}
          </Field>
          <Field label="Channel">{channelLabel(redemption.channel)}</Field>
          <Field label="Location">
            {redemption.locationLabel || redemption.locationKey || '—'}
          </Field>
          <Field label="Redeemed by">
            {redemption.operatorName || redemption.redeemedBy || '—'}
          </Field>
          <Field label="Redeemed at">
            {formatDateTime(redemption.redeemedAt) || '—'}
          </Field>
        </dl>
      ) : null}
    </Sheet>
  );
}
