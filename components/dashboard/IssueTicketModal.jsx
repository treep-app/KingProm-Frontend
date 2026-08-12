'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import * as campaignService from '../../lib/api/campaignService';
import * as promoCodeService from '../../lib/api/promoCodeService';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { useToast } from './ToastProvider';

export default function IssueTicketModal({
  open,
  onClose,
  onSuccess,
  initialEmail = '',
  initialCampaignId = '',
}) {
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState('');
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [campaigns, setCampaigns] = useState([]);
  const [resend, setResend] = useState(Boolean(initialEmail));
  const [refreshExpiry, setRefreshExpiry] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(initialEmail || '');
    setName('');
    setCampaignId(initialCampaignId || '');
    setResend(Boolean(initialEmail));
    setRefreshExpiry(true);

    campaignService.listCampaigns({ status: 'ACTIVE', limit: 50 }).then(({ ok, data }) => {
      if (!ok) return;
      const items = data.items || [];
      setCampaigns(items);
      if (!initialCampaignId) {
        const def = items.find((c) => c.isDefault) || items[0];
        if (def) setCampaignId(def.id);
      }
    });
  }, [open, initialEmail, initialCampaignId]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { ok, status, data } = await promoCodeService.issuePromoCode({
        email: email.trim(),
        name: name.trim() || undefined,
        campaignId: campaignId || undefined,
        resend,
        refreshExpiry: resend ? refreshExpiry : undefined,
        keepExpiry: resend && !refreshExpiry,
      });

      const result = { ok, status, data };
      if (!ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to issue the ticket. Please try again.', {
            resource: 'ticket',
          }),
        );
        return;
      }

      if (data.alreadyExists && !data.emailed && !resend) {
        toast.info(
          'Ticket already exists for this email in this campaign. Enable resend to email again.'
        );
        setResend(true);
        return;
      }

      toast.success(
        data.created
          ? `Ticket issued to ${data.email}`
          : data.emailed
            ? `Email resent to ${data.email}`
            : data.emailSkipped
              ? `Ticket ready (email skipped — EMAIL_ENABLED off)`
              : `Updated ticket for ${data.email}`
      );
      onSuccess?.(data);
      onClose();
    } catch (error) {
      toast.error(
        messageFromCaughtError(error, 'Unable to issue the ticket. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-ticket-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--dash-border)] bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="issue-ticket-title" className="text-lg font-semibold text-[var(--dash-ink)]">
              {initialEmail ? 'Resend ticket' : 'Issue ticket'}
            </h2>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              One email per campaign · guest flow unchanged
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Campaign
            </span>
            <select
              required
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            >
              {campaigns.length === 0 ? <option value="">Loading…</option> : null}
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isDefault ? ' (default)' : ''} — {c.offerTitle}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
              placeholder="guest@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Guest name (optional)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
              placeholder="Kevin"
            />
          </label>

          <label className="flex items-start gap-2.5 text-sm text-[var(--dash-ink-soft)]">
            <input
              type="checkbox"
              checked={resend}
              onChange={(e) => setResend(e.target.checked)}
              className="mt-1"
            />
            <span>
              Resend if a ticket already exists for this email + campaign
              <span className="mt-0.5 block text-xs text-[var(--dash-muted)]">
                Same email can hold tickets in different campaigns
              </span>
            </span>
          </label>

          {resend ? (
            <label className="flex items-start gap-2.5 text-sm text-[var(--dash-ink-soft)]">
              <input
                type="checkbox"
                checked={refreshExpiry}
                onChange={(e) => setRefreshExpiry(e.target.checked)}
                className="mt-1"
              />
              <span>Refresh expiry from campaign settings</span>
            </label>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="dash-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="dash-btn-primary disabled:opacity-50">
              {submitting ? 'Sending…' : resend ? 'Send email' : 'Issue ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
