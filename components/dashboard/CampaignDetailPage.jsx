'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ticket, BadgeCheck } from 'lucide-react';
import { useCampaign } from '../../hooks/useCampaign';
import { usePromoCodes } from '../../hooks/usePromoCodes';
import { useRedemptions } from '../../hooks/useRedemptions';
import { useActiveTemplates } from '../../hooks/useActiveTemplates';
import * as campaignService from '../../lib/api/campaignService';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { formatDiscountDisplay } from '../../lib/dashboard/campaignDiscount';
import { TICKET_PAGE_SIZE } from '../../lib/dashboard/constants';
import { formatDate, formatDateTime, formatNumber, formatPercent } from '../../lib/format';
import CampaignFormModal from './CampaignFormModal';
import AssignPromoModal from './AssignPromoModal';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import { buildCampaignPromoColumns, TicketMobileCard } from './ticketTable';
import { useToast } from './ToastProvider';
import {
  useCampaignPermissions,
  usePromoCodePermissions,
  useCustomerPermissions,
} from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

function SummaryCard({ label, value, hint }) {
  return (
    <div className="dash-panel p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{hint}</p> : null}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-[var(--dash-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{children}</dd>
    </div>
  );
}

function usageRulesLabel(campaign) {
  if (!campaign?.usageMode) return '—';
  if (campaign.usageMode === 'UNLIMITED') return 'Unlimited';
  if (campaign.usageMode === 'SINGLE') return 'Single Use';
  return `Multiple Use · max ${campaign.maxUses ?? '—'}`;
}

export default function CampaignDetailPage({ campaignId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const campaignsPerm = useCampaignPermissions();
  const promoPerm = usePromoCodePermissions();
  const customersPerm = useCustomerPermissions();

  const [editOpen, setEditOpen] = useState(false);
  const [assignPromoOpen, setAssignPromoOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [promoOffset, setPromoOffset] = useState(0);

  const {
    campaign,
    stats,
    loading,
    error,
    errorResult,
    reload: load,
  } = useCampaign(campaignId);

  const { items: activeTemplates } = useActiveTemplates({ enabled: Boolean(campaign) });

  const templateName = campaign?.templateId
    ? activeTemplates.find((t) => t.id === campaign.templateId)?.name || campaign.templateId
    : 'Default template';

  const {
    items: promoItems,
    total: promoTotal,
    loading: promoLoading,
    reload: loadPromos,
  } = usePromoCodes(
    {
      campaignId,
      limit: TICKET_PAGE_SIZE,
      offset: promoOffset,
    },
    { enabled: Boolean(campaignId) },
  );

  const {
    items: redemptionItems,
    total: redemptionTotal,
    loading: redemptionsLoading,
  } = useRedemptions({
    campaignId,
    limit: 10,
    offset: 0,
    enabled: Boolean(campaignId),
  });

  // Deferred / post-create generation (no async job queue on backend yet)
  useEffect(() => {
    const qty = Number(searchParams.get('generateQty'));
    const prefix = searchParams.get('prefix') || '';
    const alreadyGenerated = searchParams.get('generated');
    const genError = searchParams.get('genError');

    if (alreadyGenerated) {
      toast.success(
        `${alreadyGenerated} promo code${alreadyGenerated === '1' ? '' : 's'} generated`,
      );
      router.replace(`/dashboard/campaigns/${encodeURIComponent(campaignId)}`);
      return;
    }
    if (genError) {
      toast.error(
        'Campaign created, but promo code generation failed. Please try again.',
      );
      router.replace(`/dashboard/campaigns/${encodeURIComponent(campaignId)}`);
      return;
    }
    if (!qty || qty < 1 || !campaignId || generating) return;

    let cancelled = false;
    async function run() {
      setGenerating(true);
      toast.success(`Generating ${qty} promo codes on the server…`);
      const result = await campaignService.generateCampaignPromoCodes(campaignId, {
        quantity: qty,
        prefix: prefix || undefined,
      });
      if (cancelled) return;
      if (!result.ok) {
        toast.error(
          messageFromApiResult(
            result,
            'Unable to generate promo codes. Please try again.',
            { resource: 'campaign' },
          ),
        );
      } else {
        toast.success(
          `Generated ${result.data.generated} code${result.data.generated === 1 ? '' : 's'}`,
        );
        await load();
        await loadPromos();
      }
      router.replace(`/dashboard/campaigns/${encodeURIComponent(campaignId)}`);
      setGenerating(false);
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, searchParams]);

  async function patchStatus(nextStatus, successMessage) {
    const result = await campaignService.updateCampaign(campaignId, {
      status: nextStatus,
    });
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to update the campaign. Please try again.', {
          resource: 'campaign',
        }),
      );
      return;
    }
    toast.success(successMessage);
    await load();
  }

  async function handleDuplicate() {
    if (!campaign) return;
    const payload = {
      name: `${campaign.name} (copy)`,
      description: campaign.description || '',
      offerTitle: campaign.offerTitle || 'Offer',
      offerSubtitle: campaign.offerSubtitle || '',
      offerTerms: campaign.offerTerms || '',
      discountType: campaign.discountType || 'CUSTOM',
      discountValue: campaign.discountValue || campaign.offerTitle || 'Offer',
      startsAt: campaign.startsAt || new Date().toISOString(),
      endsAt:
        campaign.endsAt ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageMode: campaign.usageMode || 'SINGLE',
      maxUses:
        campaign.usageMode === 'UNLIMITED'
          ? null
          : campaign.maxUses != null
            ? campaign.maxUses
            : 1,
      codePrefix: campaign.codePrefix || null,
      status: 'DRAFT',
      expiryMode: campaign.expiryMode || 'weekly',
      expiresIn: campaign.expiresIn || null,
      expiresAt: campaign.expiresAt || null,
      eventName: campaign.eventName || null,
      eventDate: campaign.eventDate || null,
      isDefault: false,
    };
    try {
      const result = await campaignService.createCampaign(payload);
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to duplicate the campaign. Please try again.', {
            resource: 'campaign',
          }),
        );
        return;
      }
      toast.success('Campaign duplicated as draft');
      router.push(`/dashboard/campaigns/${encodeURIComponent(result.data.campaign.id)}`);
    } catch (error) {
      toast.error(
        messageFromCaughtError(error, 'Unable to duplicate the campaign. Please try again.'),
      );
    }
  }

  async function handleCopy(code) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied');
    } catch {
      toast.error('Unable to copy the promo code. Please try again.');
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState rows={4} label="Loading campaign…" />
      </PageContainer>
    );
  }

  if (error || !campaign) {
    return (
      <PageContainer>
        <ApiErrorBanner
          result={errorResult}
          message={error}
          fallback="Campaign not found."
        />
        <Button href="/dashboard/campaigns" variant="secondary">
          Back to campaigns
        </Button>
      </PageContainer>
    );
  }

  const redemptionRate =
    stats?.redemptionRate != null
      ? formatPercent(stats.redemptionRate, { ratio: true, digits: 1 })
      : '—';

  const promoPageStart = promoTotal === 0 ? 0 : promoOffset + 1;
  const promoPageEnd = Math.min(promoOffset + TICKET_PAGE_SIZE, promoTotal);
  const promoColumns = buildCampaignPromoColumns({
    onCopy: handleCopy,
    onView: (ticket) =>
      router.push(`/dashboard/promo-codes/${encodeURIComponent(ticket.id)}`),
  });

  const redemptionColumns = [
    {
      key: 'promoCode',
      header: 'Promo code',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold">{row.promoCode}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => row.customerName || row.customerEmail || 'Guest',
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row) => row.locationLabel || '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'redeemedAt',
      header: 'Redeemed',
      cell: (row) => formatDateTime(row.redeemedAt) || '—',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={campaign.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge status={campaign.status} />
            <span className="font-mono text-xs text-[var(--dash-muted)]">{campaign.id}</span>
            {generating ? (
              <span className="text-xs font-medium text-[var(--dash-accent)]">
                Generating codes…
              </span>
            ) : null}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/campaigns" variant="secondary" size="sm">
              All campaigns
            </Button>
            {promoPerm.view ? (
              <Button
                href={`/dashboard/promo-codes?campaignId=${encodeURIComponent(campaign.id)}`}
                variant="secondary"
                size="sm"
              >
                All promo codes
              </Button>
            ) : null}
            {customersPerm.assignPromo ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setAssignPromoOpen(true)}
              >
                Assign promo
              </Button>
            ) : null}
            {campaignsPerm.edit ? (
              <Button type="button" size="sm" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            ) : null}
            {campaignsPerm.pause && campaign.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setConfirm({
                    title: 'Pause campaign?',
                    description:
                      'Paused campaigns cannot issue new promo codes. Existing tickets are unchanged.',
                    confirmLabel: 'Pause',
                    variant: 'primary',
                    run: () => patchStatus('PAUSED', 'Campaign paused'),
                  })
                }
              >
                Pause
              </Button>
            ) : null}
            {campaignsPerm.pause &&
            (campaign.status === 'PAUSED' || campaign.status === 'DRAFT') ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setConfirm({
                    title:
                      campaign.status === 'DRAFT'
                        ? 'Activate campaign?'
                        : 'Resume campaign?',
                    description: 'The campaign will become Active and can issue new codes.',
                    confirmLabel: campaign.status === 'DRAFT' ? 'Activate' : 'Resume',
                    variant: 'primary',
                    run: () => patchStatus('ACTIVE', 'Campaign is active'),
                  })
                }
              >
                {campaign.status === 'DRAFT' ? 'Activate' : 'Resume'}
              </Button>
            ) : null}
            {campaignsPerm.create ? (
              <Button type="button" variant="secondary" size="sm" onClick={handleDuplicate}>
                Duplicate
              </Button>
            ) : null}
            {campaignsPerm.delete ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled
                title="Not available yet — backend has no delete endpoint. Archive from the list instead."
              >
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="Total Codes"
          value={formatNumber(stats?.totalCodes, { fallback: '0' })}
        />
        <SummaryCard
          label="Active"
          value={formatNumber(stats?.active, { fallback: '0' })}
          hint="Issued or revealed, not expired"
        />
        <SummaryCard
          label="Redeemed"
          value={formatNumber(stats?.redeemed, { fallback: '0' })}
        />
        <SummaryCard
          label="Expired"
          value={formatNumber(stats?.expired, { fallback: '0' })}
        />
        <SummaryCard label="Redemption Rate" value={redemptionRate} />
      </div>

      <section className="dash-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Campaign information</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Purpose">{campaign.description || '—'}</InfoRow>
          <InfoRow label="Discount">
            {formatDiscountDisplay(
              campaign.discountType,
              campaign.discountValue,
              campaign.offerTitle || '—',
            )}
          </InfoRow>
          <InfoRow label="Validity">
            {campaign.startsAt || campaign.endsAt
              ? `${formatDate(campaign.startsAt) || '—'} → ${formatDate(campaign.endsAt) || '—'}`
              : '—'}
          </InfoRow>
          <InfoRow label="Usage rules">{usageRulesLabel(campaign)}</InfoRow>
          <InfoRow label="Created by">—</InfoRow>
          <InfoRow label="Created date">
            {formatDateTime(campaign.createdAt) || '—'}
          </InfoRow>
          <InfoRow label="Last updated">
            {formatDateTime(campaign.updatedAt) || '—'}
          </InfoRow>
          <InfoRow label="Description">
            {campaign.offerSubtitle || campaign.offerTerms || campaign.description || '—'}
          </InfoRow>
          <InfoRow label="Code prefix">
            <span className="font-mono">{campaign.codePrefix || '—'}</span>
          </InfoRow>
          <InfoRow label="Voucher template">{templateName}</InfoRow>
        </dl>
        <p className="mt-3 text-xs text-[var(--dash-muted)]">
          Created by is unavailable until the API stores campaign authorship.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Promo Codes</h2>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Codes generated for this campaign
              {promoTotal ? ` · ${formatNumber(promoTotal)} total` : ''}
            </p>
          </div>
          {promoPerm.view ? (
            <Button
              href={`/dashboard/promo-codes?campaignId=${encodeURIComponent(campaign.id)}`}
              variant="secondary"
              size="sm"
            >
              Open in Promo Codes
            </Button>
          ) : null}
        </div>

        {promoLoading ? (
          <LoadingState rows={4} label="Loading promo codes…" />
        ) : promoItems.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No promo codes found"
            description="Promo codes will appear here once you generate them for this campaign."
            action={
              campaignsPerm.create ? (
                <Button href="/dashboard/campaigns/new" variant="secondary">
                  Create another campaign
                </Button>
              ) : null
            }
          />
        ) : (
          <DataTable
            columns={promoColumns}
            rows={promoItems}
            minWidth="960px"
            onRowClick={(ticket) =>
              router.push(`/dashboard/promo-codes/${encodeURIComponent(ticket.id)}`)
            }
            mobileCard={(ticket) => (
              <TicketMobileCard
                ticket={ticket}
                showCampaign={false}
                onCopy={handleCopy}
                onView={(t) =>
                  router.push(`/dashboard/promo-codes/${encodeURIComponent(t.id)}`)
                }
              />
            )}
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {promoPageStart}–{promoPageEnd} of {promoTotal}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={promoOffset <= 0}
                    onClick={() =>
                      setPromoOffset((v) => Math.max(0, v - TICKET_PAGE_SIZE))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={promoOffset + TICKET_PAGE_SIZE >= promoTotal}
                    onClick={() => setPromoOffset((v) => v + TICKET_PAGE_SIZE)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            }
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Recent redemptions</h2>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Latest vouchers redeemed for this campaign
              {redemptionTotal ? ` · ${formatNumber(redemptionTotal)} total` : ''}
            </p>
          </div>
          <Button
            href={`/dashboard/redemptions?campaignId=${encodeURIComponent(campaign.id)}`}
            variant="secondary"
            size="sm"
          >
            View all
          </Button>
        </div>

        {redemptionsLoading ? (
          <LoadingState rows={3} label="Loading redemptions…" />
        ) : redemptionItems.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="No redemptions yet"
            description="Redemptions will appear here when vouchers from this campaign are claimed."
            action={
              <Button href="/dashboard/redeem" variant="secondary">
                Redeem a voucher
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={redemptionColumns}
            rows={redemptionItems}
            minWidth="880px"
            onRowClick={(row) =>
              router.push(`/dashboard/redemptions/${encodeURIComponent(row.id)}`)
            }
            footer={`Showing latest ${formatNumber(redemptionItems.length)} of ${formatNumber(redemptionTotal)}`}
          />
        )}
      </section>

      <CampaignFormModal
        open={editOpen}
        campaign={campaign}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          load();
        }}
      />

      <AssignPromoModal
        open={assignPromoOpen}
        campaignId={campaign.id}
        onClose={() => setAssignPromoOpen(false)}
        onSuccess={() => {
          loadPromos();
        }}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant || 'danger'}
        busy={confirmBusy}
        onCancel={() => {
          if (!confirmBusy) setConfirm(null);
        }}
        onConfirm={async () => {
          if (!confirm?.run) return;
          setConfirmBusy(true);
          try {
            await confirm.run();
            setConfirm(null);
          } finally {
            setConfirmBusy(false);
          }
        }}
      />
    </PageContainer>
  );
}
