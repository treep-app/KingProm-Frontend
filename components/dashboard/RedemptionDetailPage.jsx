'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Ticket } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useRedemption } from '../../hooks/useRedemption';
import { formatDateTime } from '../../lib/format';
import AuthGate from './AuthGate';
import { ApiErrorBanner } from './AlertBanner';
import {
  Button,
  EmptyState,
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

function channelLabel(channel) {
  const key = String(channel || '').toLowerCase();
  if (key === 'staff') return 'Staff';
  if (key === 'guest') return 'Guest';
  return channel || '—';
}

function RedemptionDetailInner({ redemptionId }) {
  const router = useRouter();
  const { redemption, validationHistory, loading, error, errorResult } =
    useRedemption(redemptionId);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState rows={4} label="Loading redemption…" />
      </PageContainer>
    );
  }

  if (error || !redemption) {
    return (
      <PageContainer>
        <ApiErrorBanner
          result={errorResult}
          message={error}
          fallback="Redemption not found."
        />
        <Button href="/dashboard/redemptions" variant="secondary">
          Back to redemptions
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={
          <span className="font-mono tracking-wide">{redemption.promoCode}</span>
        }
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge status={redemption.status} />
            <span className="text-xs text-[var(--dash-muted)]">
              Redeemed {formatDateTime(redemption.redeemedAt)}
            </span>
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/redemptions" variant="secondary" size="sm">
              All redemptions
            </Button>
            {redemption.ticketId ? (
              <Button
                href={`/dashboard/promo-codes/${encodeURIComponent(redemption.ticketId)}`}
                variant="secondary"
                size="sm"
              >
                <Ticket className="size-3.5" />
                View promo code
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="dash-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Redemption details</h2>
        <dl className="mt-4">
          <InfoRow label="Promo code">
            <span className="font-mono font-semibold">{redemption.promoCode}</span>
          </InfoRow>
          <InfoRow label="Status">
            <StatusBadge status={redemption.status} />
          </InfoRow>
          <InfoRow label="Redeemed at">{formatDateTime(redemption.redeemedAt)}</InfoRow>
          <InfoRow label="Channel">{channelLabel(redemption.channel)}</InfoRow>
          <InfoRow label="Location">
            {redemption.locationLabel || redemption.locationKey || '—'}
          </InfoRow>
          <InfoRow label="Redeemed by">{redemption.redeemedByName || '—'}</InfoRow>
          <InfoRow label="Campaign">
            {redemption.campaignId ? (
              <Link
                href={`/dashboard/campaigns/${encodeURIComponent(redemption.campaignId)}`}
                className="font-medium text-[var(--dash-accent)] hover:underline"
              >
                {redemption.campaignName || redemption.campaignId}
              </Link>
            ) : (
              '—'
            )}
          </InfoRow>
          <InfoRow label="Offer">{redemption.offerTitle || '—'}</InfoRow>
          <InfoRow label="Customer">
            {redemption.customerName || redemption.customerEmail || 'Guest'}
          </InfoRow>
          {redemption.notes ? (
            <InfoRow label="Notes">
              <span className="whitespace-pre-wrap">{redemption.notes}</span>
            </InfoRow>
          ) : null}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Validation history</h2>
        {validationHistory.length === 0 ? (
          <EmptyState
            icon={History}
            title="No validation events"
            description="Scan and validation attempts for this voucher will appear here."
          />
        ) : (
          <div className="dash-panel divide-y divide-[var(--dash-border)]">
            {validationHistory.map((event) => (
              <div key={event.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={event.result} />
                  <span className="text-xs uppercase tracking-wide text-[var(--dash-muted)]">
                    {event.inputType}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--dash-ink)]">
                  {event.operatorName ? `By ${event.operatorName}` : 'System event'}
                </p>
                <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard/redemptions')}
        >
          Back to history
        </Button>
      </div>
    </PageContainer>
  );
}

export default function RedemptionDetailPage({ redemptionId }) {
  return (
    <AuthGate permission={PERMISSIONS.REDEMPTIONS_VIEW}>
      <RedemptionDetailInner redemptionId={redemptionId} />
    </AuthGate>
  );
}
