'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink, RefreshCw, X } from 'lucide-react';
import * as promoCodeService from '../../lib/api/promoCodeService';
import { messageFromApiResult } from '../../lib/api/errors';
import { formatDateTime } from '../../lib/format';
import StatusBadge from './StatusBadge';
import { useToast } from './ToastProvider';

export default function TicketDetailDrawer({ ticketId, onClose, onResend }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketId) return undefined;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const result = await promoCodeService.getPromoCode(ticketId);
      if (cancelled) return;
      if (!result.ok) {
        setError(
          messageFromApiResult(result, 'Unable to load the promo code. Please try again.', {
            resource: 'promo',
          }),
        );
        setTicket(null);
      } else {
        setTicket(result.data.ticket);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Unable to copy. Please try again.');
    }
  }

  if (!ticketId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[var(--dash-border)] bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-[var(--dash-border)] px-4">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Ticket detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? (
            <p className="text-sm text-[var(--dash-muted)]">Loading…</p>
          ) : error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : ticket ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[var(--dash-ink)]">
                    {ticket.email || 'Unassigned'}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--dash-muted)]">{ticket.id}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="dash-panel px-3 py-2.5">
                  <dt className="text-xs text-[var(--dash-muted)]">Unique code</dt>
                  <dd className="mt-0.5 font-semibold tracking-wide">
                    {ticket.code || ticket.promoCode}
                  </dd>
                </div>
                <div className="dash-panel px-3 py-2.5">
                  <dt className="text-xs text-[var(--dash-muted)]">Campaign</dt>
                  <dd className="mt-0.5 truncate font-medium">{ticket.campaignId}</dd>
                </div>
                <div className="dash-panel px-3 py-2.5">
                  <dt className="text-xs text-[var(--dash-muted)]">Created</dt>
                  <dd className="mt-0.5 font-medium">{formatDateTime(ticket.createdAt)}</dd>
                </div>
                <div className="dash-panel px-3 py-2.5">
                  <dt className="text-xs text-[var(--dash-muted)]">Expires</dt>
                  <dd className="mt-0.5 font-medium">{formatDateTime(ticket.expiresAt)}</dd>
                </div>
                <div className="dash-panel px-3 py-2.5">
                  <dt className="text-xs text-[var(--dash-muted)]">Usage limit</dt>
                  <dd className="mt-0.5 font-medium">
                    {ticket.usageMode === 'UNLIMITED'
                      ? 'Unlimited'
                      : ticket.usageLimit != null
                        ? `${ticket.timesRedeemed ?? 0} / ${ticket.usageLimit}`
                        : '—'}
                  </dd>
                </div>
                <div className="dash-panel px-3 py-2.5">
                  <dt className="text-xs text-[var(--dash-muted)]">Status</dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={ticket.status} />
                  </dd>
                </div>
                {ticket.redeemedAt ? (
                  <div className="dash-panel col-span-2 px-3 py-2.5">
                    <dt className="text-xs text-[var(--dash-muted)]">Redeemed</dt>
                    <dd className="mt-0.5 font-medium">{formatDateTime(ticket.redeemedAt)}</dd>
                  </div>
                ) : null}
              </dl>

              <div>
                <p className="mb-1.5 text-xs font-medium text-[var(--dash-muted)]">Scratch URL</p>
                <div className="dash-panel flex items-center gap-2 p-2.5">
                  <code className="min-w-0 flex-1 truncate text-xs text-[var(--dash-ink-soft)]">
                    {ticket.scratchUrl}
                  </code>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
                    onClick={() => copy(ticket.scratchUrl, 'Link')}
                    aria-label="Copy link"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <a
                    href={ticket.scratchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
                    aria-label="Open ticket"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {ticket ? (
          <div className="border-t border-[var(--dash-border)] p-4">
            <button
              type="button"
              className="dash-btn-primary w-full"
              onClick={() => onResend?.(ticket)}
            >
              <RefreshCw className="size-3.5" />
              Resend email
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
