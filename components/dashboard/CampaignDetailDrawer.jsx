'use client';

import { useEffect, useState } from 'react';
import * as campaignService from '../../lib/api/campaignService';
import { messageFromApiResult } from '../../lib/api/errors';
import { formatDiscountDisplay } from '../../lib/dashboard/campaignDiscount';
import { formatDate, formatDateTime } from '../../lib/format';
import StatusBadge from './StatusBadge';
import { Button, Sheet } from './ui';

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--dash-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{children}</dd>
    </div>
  );
}

/**
 * Campaign details drawer — keeps the user on the campaigns list.
 */
export default function CampaignDetailDrawer({
  campaignId,
  open,
  onClose,
  onEdit,
  canWrite = false,
}) {
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !campaignId) return undefined;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const result = await campaignService.getCampaign(campaignId);
      if (cancelled) return;
      if (!result.ok) {
        setError(messageFromApiResult(result, 'Unable to load campaign.'));
        setCampaign(null);
      } else {
        setCampaign(result.data.campaign);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, campaignId]);

  return (
    <Sheet
      open={open && Boolean(campaignId)}
      onClose={onClose}
      title={campaign?.name || (loading ? 'Loading…' : 'Campaign')}
      description="Campaign details"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button
            href={`/dashboard/campaigns/${encodeURIComponent(campaignId || '')}`}
            variant="secondary"
            size="sm"
          >
            View full page
          </Button>
          <Button
            href={`/dashboard/promo-codes?campaignId=${encodeURIComponent(campaignId || '')}`}
            variant="secondary"
            size="sm"
          >
            Promo codes
          </Button>
          {canWrite ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (campaign) onEdit?.(campaign);
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--dash-muted)]">Loading campaign…</p>
      ) : error ? (
        <p className="text-sm text-rose-700">{error}</p>
      ) : campaign ? (
        <dl className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={campaign.status} />
            {campaign.isDefault ? (
              <span className="rounded-md bg-[var(--dash-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-accent)]">
                Default
              </span>
            ) : null}
          </div>
          <Field label="Purpose">{campaign.description || '—'}</Field>
          <Field label="Discount">
            {formatDiscountDisplay(
              campaign.discountType,
              campaign.discountValue,
              campaign.offerTitle || '—',
            )}
          </Field>
          <Field label="Validity">
            {campaign.startsAt || campaign.endsAt
              ? `${formatDate(campaign.startsAt) || '—'} → ${formatDate(campaign.endsAt) || '—'}`
              : '—'}
          </Field>
          <Field label="Usage">
            {campaign.usageMode
              ? `${String(campaign.usageMode).replaceAll('_', ' ')}${
                  campaign.usageMode === 'UNLIMITED'
                    ? ''
                    : ` · max ${campaign.maxUses ?? '—'}`
                }`
              : '—'}
          </Field>
          <Field label="Promo codes issued">{campaign.ticketCount ?? 0}</Field>
          <Field label="Created">{formatDateTime(campaign.createdAt) || '—'}</Field>
          <Field label="Updated">{formatDateTime(campaign.updatedAt) || '—'}</Field>
        </dl>
      ) : null}
    </Sheet>
  );
}
