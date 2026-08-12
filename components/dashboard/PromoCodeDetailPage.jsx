'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ExternalLink } from 'lucide-react';
import { usePromoCode } from '../../hooks/usePromoCode';
import { messageFromApiResult, messageFromCaughtError } from '../../lib/api/errors';
import { formatDiscountDisplay } from '../../lib/dashboard/campaignDiscount';
import {
  customerLabel,
  formatUsageDisplay,
  resolvePromoDisplayStatus,
} from '../../lib/dashboard/promoCodeStatus';
import { formatDate, formatDateTime } from '../../lib/format';
import { ApiErrorBanner } from './AlertBanner';
import AssignPromoModal from './AssignPromoModal';
import ConfirmDialog from './ConfirmDialog';
import PromoQrPanel from './PromoQrPanel';
import { useToast } from './ToastProvider';
import {
  useCampaignPermissions,
  useCustomerPermissions,
  usePromoCodePermissions,
} from './WorkspaceProvider';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

function InfoRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-[var(--dash-border)] py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:items-start sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </dt>
      <dd className="text-sm text-[var(--dash-ink)]">{children}</dd>
    </div>
  );
}

export default function PromoCodeDetailPage({ ticketId }) {
  const router = useRouter();
  const toast = useToast();
  const promoPerm = usePromoCodePermissions();
  const campaignsPerm = useCampaignPermissions();
  const customersPerm = useCustomerPermissions();

  const {
    ticket,
    campaign,
    loading,
    error,
    errorResult,
    reload,
    cancelPromoCode,
  } = usePromoCode(ticketId);
  const [copied, setCopied] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  async function handleCopy() {
    const code = ticket?.code || ticket?.promoCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copied');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Unable to copy the promo code. Please try again.');
    }
  }

  async function handleConfirmCancel() {
    setCancelBusy(true);
    try {
      const result = await cancelPromoCode();
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to cancel the promo code. Please try again.', {
            resource: 'promo',
          }),
        );
        return;
      }
      toast.success(
        result.data?.alreadyCancelled
          ? 'Promo code was already cancelled'
          : 'Promo code cancelled',
      );
      setCancelOpen(false);
      await reload();
    } catch (err) {
      toast.error(
        messageFromCaughtError(err, 'Unable to cancel the promo code. Please try again.'),
      );
    } finally {
      setCancelBusy(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState rows={4} label="Loading promo code…" />
      </PageContainer>
    );
  }

  if (error || !ticket) {
    return (
      <PageContainer>
        <ApiErrorBanner
          result={errorResult}
          message={error}
          fallback="Promo code not found."
        />
        <Button href="/dashboard/promo-codes" variant="secondary">
          Back to promo codes
        </Button>
      </PageContainer>
    );
  }

  const code = ticket.code || ticket.promoCode;
  const displayStatus = resolvePromoDisplayStatus(ticket);
  const purpose =
    campaign?.purpose ||
    campaign?.description ||
    ticket.campaignPurpose ||
    '—';
  const discount = formatDiscountDisplay(
    campaign?.discountType || ticket.discountType,
    campaign?.discountValue || ticket.discountValue,
    '—',
  );
  const canAssign =
    customersPerm.assignPromo &&
    displayStatus === 'UNUSED' &&
    Boolean(ticket.campaignId);
  const canCancel =
    promoPerm.cancel &&
    displayStatus !== 'REDEEMED' &&
    displayStatus !== 'CANCELLED';

  return (
    <PageContainer>
      <PageHeader
        title={code}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge status={displayStatus} />
            <span className="font-mono text-xs text-[var(--dash-muted)]">{ticket.id}</span>
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/promo-codes" variant="secondary" size="sm">
              All promo codes
            </Button>
            <Button type="button" size="sm" onClick={handleCopy}>
              <Copy className="size-3.5" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {ticket.campaignId && campaignsPerm.view ? (
              <Button
                href={`/dashboard/campaigns/${encodeURIComponent(ticket.campaignId)}`}
                variant="secondary"
                size="sm"
              >
                <ExternalLink className="size-3.5" />
                View Campaign
              </Button>
            ) : null}
            {canAssign ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setAssignOpen(true)}
              >
                Assign Customer
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Code
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="dash-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Promo code details</h2>
        <p className="mt-1 text-xs text-[var(--dash-muted)]">
          The promo code itself cannot be edited. To change a code, generate a new one.
        </p>
        <dl className="mt-4">
          <InfoRow label="Promo Code">
            <span className="font-mono text-base font-semibold tracking-wide">{code}</span>
          </InfoRow>
          <InfoRow label="Status">
            <StatusBadge status={displayStatus} />
          </InfoRow>
          <InfoRow label="Campaign">
            {ticket.campaignId ? (
              <button
                type="button"
                className="font-medium text-[var(--dash-accent)] hover:underline"
                onClick={() =>
                  router.push(
                    `/dashboard/campaigns/${encodeURIComponent(ticket.campaignId)}`,
                  )
                }
              >
                {campaign?.name || ticket.campaignName || ticket.campaignId}
              </button>
            ) : (
              '—'
            )}
          </InfoRow>
          <InfoRow label="Purpose">{purpose || '—'}</InfoRow>
          <InfoRow label="Discount">{discount}</InfoRow>
          <InfoRow label="Customer">{customerLabel(ticket)}</InfoRow>
          <InfoRow label="Created">{formatDateTime(ticket.createdAt)}</InfoRow>
          <InfoRow label="Expires">{formatDate(ticket.expiresAt)}</InfoRow>
          <InfoRow label="Usage">{formatUsageDisplay(ticket)}</InfoRow>
          <InfoRow label="Last Redeemed">
            {ticket.redeemedAt ? formatDateTime(ticket.redeemedAt) : '—'}
          </InfoRow>
        </dl>
      </section>

      <PromoQrPanel ticketId={ticket.id} />

      <AssignPromoModal
        open={assignOpen}
        ticketId={ticket.id}
        promoCode={code}
        campaignId={ticket.campaignId || ''}
        onClose={() => setAssignOpen(false)}
        onSuccess={() => {
          reload();
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this promo code?"
        description="Cancelled codes cannot be redeemed or assigned. This cannot be undone."
        confirmLabel="Cancel code"
        cancelLabel="Keep code"
        variant="danger"
        busy={cancelBusy}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          if (!cancelBusy) setCancelOpen(false);
        }}
      />
    </PageContainer>
  );
}
