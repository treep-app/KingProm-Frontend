'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import * as promoCodeService from '../../lib/api/promoCodeService';
import { messageFromApiResult } from '../../lib/api/errors';
import {
  customerLabel,
  resolvePromoDisplayStatus,
} from '../../lib/dashboard/promoCodeStatus';
import { formatDate, formatDateTime } from '../../lib/format';
import StatusBadge from './StatusBadge';
import { useToast } from './ToastProvider';
import { Button, Sheet } from './ui';

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--dash-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{children ?? '—'}</dd>
    </div>
  );
}

export default function PromoCodeDetailDrawer({ ticketId, open, onClose }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !ticketId) return undefined;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const result = await promoCodeService.getPromoCode(ticketId);
      if (cancelled) return;
      if (!result.ok) {
        setError(messageFromApiResult(result, 'Unable to load promo code.'));
        setTicket(null);
        setCampaign(null);
      } else {
        setTicket(result.data.ticket);
        setCampaign(result.data.campaign || null);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, ticketId]);

  const code = ticket?.code || ticket?.promoCode;
  const status = ticket ? resolvePromoDisplayStatus(ticket) : '';

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied');
    } catch {
      toast.error('Unable to copy.');
    }
  }

  return (
    <Sheet
      open={open && Boolean(ticketId)}
      onClose={onClose}
      title={code || (loading ? 'Loading…' : 'Promo code')}
      description="Promo code details"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
            <Copy className="size-3.5" />
            Copy code
          </Button>
          <Button
            href={`/dashboard/promo-codes/${encodeURIComponent(ticketId || '')}`}
            size="sm"
          >
            View full details
          </Button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--dash-muted)]">Loading promo code…</p>
      ) : error ? (
        <p className="text-sm text-rose-700">{error}</p>
      ) : ticket ? (
        <dl className="space-y-4">
          <StatusBadge status={status} />
          <Field label="Campaign">
            {campaign?.name || ticket.campaignName || ticket.campaignId || '—'}
          </Field>
          <Field label="Customer">{customerLabel(ticket)}</Field>
          <Field label="Expires">{formatDate(ticket.expiresAt)}</Field>
          <Field label="Created">{formatDateTime(ticket.createdAt)}</Field>
          <Field label="Redeemed">
            {ticket.redeemedAt ? formatDateTime(ticket.redeemedAt) : '—'}
          </Field>
        </dl>
      ) : null}
    </Sheet>
  );
}
