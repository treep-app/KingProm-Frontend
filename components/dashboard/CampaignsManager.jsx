'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus, Search } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useDrawerQueryParam } from '../../hooks/useDrawerQueryParam';
import * as campaignService from '../../lib/api/campaignService';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { buildCampaignTableRows } from '../../lib/dashboard/buildCampaignTableRows';
import { CAMPAIGN_LIST_LIMIT } from '../../lib/dashboard/constants';
import { formatDate, formatNumber } from '../../lib/format';
import CampaignDetailDrawer from './CampaignDetailDrawer';
import CampaignFormModal from './CampaignFormModal';
import CampaignRowActions from './CampaignRowActions';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { useCampaignPermissions, usePromoCodePermissions } from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

const CAMPAIGN_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function formatTableDate(value) {
  if (!value) return '—';
  return formatDate(value) || '—';
}

export default function CampaignsManager() {
  const router = useRouter();
  const toast = useToast();
  const campaignsPerm = useCampaignPermissions();
  const promoPerm = usePromoCodePermissions();

  const [byCampaign, setByCampaign] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const campaignDrawer = useDrawerQueryParam('campaign');

  const {
    items,
    loading,
    error,
    errorResult,
    reload: load,
  } = useCampaigns({
    status,
    q: query,
    limit: CAMPAIGN_LIST_LIMIT,
  });

  useEffect(() => {
    campaignService.getAnalyticsSummary({ days: 90 }).then((analyticsRes) => {
      if (analyticsRes.ok) {
        setByCampaign(analyticsRes.data.byCampaign || []);
      } else {
        setByCampaign([]);
      }
    });
  }, [status, query]);

  const rows = useMemo(
    () => buildCampaignTableRows({ campaigns: items, byCampaign }),
    [items, byCampaign],
  );

  function openEdit(campaign) {
    setEditing(campaign);
    setModalOpen(true);
  }

  async function patchStatus(campaign, nextStatus, successMessage) {
    const result = await campaignService.updateCampaign(campaign.id, {
      status: nextStatus,
    });
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to update the campaign. Please try again.', {
          resource: 'campaign',
        }),
      );
      return false;
    }
    toast.success(successMessage);
    await load();
    return true;
  }

  async function handleDuplicate(campaign) {
    const baseName = campaign.name || 'Campaign';
    const payload = {
      name: `${baseName} (copy)`,
      description: campaign.description || '',
      offerTitle: campaign.offerTitle || 'Offer',
      offerSubtitle: campaign.offerSubtitle || '',
      offerTerms: campaign.offerTerms || '',
      discountType: campaign.discountType || 'CUSTOM',
      discountValue: campaign.discountValue || campaign.offerTitle || 'Offer',
      startsAt: campaign.startsAt || campaign.createdAt || new Date().toISOString(),
      endsAt:
        campaign.endsAt ||
        campaign.expiresAt ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageMode: campaign.usageMode || 'SINGLE',
      maxUses:
        campaign.usageMode === 'UNLIMITED'
          ? null
          : campaign.maxUses != null
            ? campaign.maxUses
            : 1,
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

  function askConfirm(config) {
    setConfirm(config);
  }

  async function runConfirm() {
    if (!confirm?.run) return;
    setConfirmBusy(true);
    try {
      await confirm.run();
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  function actionsFor(row) {
    const actions = [];

    if (campaignsPerm.view) {
      actions.push({
        id: 'view',
        label: 'View',
        onSelect: () => campaignDrawer.openDrawer(row.id),
      });
    }

    if (promoPerm.view) {
      actions.push({
        id: 'promo-codes',
        label: 'Promo codes',
        onSelect: () => {
          router.push(`/dashboard/promo-codes?campaignId=${encodeURIComponent(row.id)}`);
        },
      });
    }

    if (campaignsPerm.edit) {
      actions.push({
        id: 'edit',
        label: 'Edit',
        onSelect: () => openEdit(row),
      });
    }

    if (campaignsPerm.create) {
      actions.push({
        id: 'duplicate',
        label: 'Duplicate',
        onSelect: () => handleDuplicate(row),
      });
    }

    if (campaignsPerm.pause && row.status === 'ACTIVE') {
      actions.push({
        id: 'pause',
        label: 'Pause',
        onSelect: () =>
          askConfirm({
            title: 'Pause campaign?',
            description:
              'Paused campaigns cannot issue new promo codes. Existing guest tickets are unchanged.',
            confirmLabel: 'Pause',
            variant: 'primary',
            run: () => patchStatus(row, 'PAUSED', 'Campaign paused'),
          }),
      });
    }

    if (campaignsPerm.pause && (row.status === 'PAUSED' || row.status === 'DRAFT')) {
      actions.push({
        id: 'resume',
        label: row.status === 'DRAFT' ? 'Activate' : 'Resume',
        onSelect: () =>
          askConfirm({
            title: row.status === 'DRAFT' ? 'Activate campaign?' : 'Resume campaign?',
            description: 'The campaign will become Active and can issue new promo codes.',
            confirmLabel: row.status === 'DRAFT' ? 'Activate' : 'Resume',
            variant: 'primary',
            run: () => patchStatus(row, 'ACTIVE', 'Campaign is active'),
          }),
      });
    }

    if (campaignsPerm.delete && row.status !== 'ARCHIVED') {
      actions.push({
        id: 'cancel',
        label: 'Cancel',
        danger: true,
        onSelect: () =>
          askConfirm({
            title: 'Cancel campaign?',
            description:
              'This archives the campaign (backend has no Cancelled status). New codes cannot be issued. Existing tickets are unchanged.',
            confirmLabel: 'Archive campaign',
            variant: 'danger',
            run: () => patchStatus(row, 'ARCHIVED', 'Campaign archived'),
          }),
      });
    }

    // Hard delete is not implemented by the API (no DELETE route).
    if (campaignsPerm.delete) {
      actions.push({
        id: 'delete',
        label: 'Delete',
        danger: true,
        disabled: true,
        title: 'Not available yet — backend has no delete endpoint. Archive instead.',
        onSelect: () => {},
      });
    }

    return actions;
  }

  const columns = [
    {
      key: 'campaign',
      header: 'Campaign',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[var(--dash-ink)]">{row.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--dash-muted)]">{row.id}</p>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      cell: (row) => (
        <span className="line-clamp-2 text-[var(--dash-ink-soft)]">{row.purpose}</span>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      cell: (row) => (
        <span className="font-medium text-[var(--dash-ink)]">{row.discount}</span>
      ),
    },
    {
      key: 'promoCodes',
      header: 'Promo Codes',
      className: 'tabular-nums',
      cell: (row) => formatNumber(row.promoCodes, { fallback: '0' }),
    },
    {
      key: 'redeemed',
      header: 'Redeemed',
      className: 'tabular-nums',
      cell: (row) => formatNumber(row.redeemed, { fallback: '0' }),
    },
    {
      key: 'remaining',
      header: 'Remaining',
      className: 'tabular-nums',
      cell: (row) => formatNumber(row.remaining, { fallback: '0' }),
    },
    {
      key: 'start',
      header: 'Start Date',
      cell: (row) => formatTableDate(row.startAt),
    },
    {
      key: 'end',
      header: 'End Date',
      cell: (row) => (row.endAt ? formatTableDate(row.endAt) : row.endLabel || '—'),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headerClassName: 'w-12 text-right',
      className: 'text-right',
      cell: (row) => <CampaignRowActions actions={actionsFor(row)} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Campaigns"
        description="Create and manage promotional campaigns, voucher offers, and discount programs."
        actions={
          campaignsPerm.create ? (
            <Button href="/dashboard/campaigns/new">
              <Plus className="size-4" />
              Create Campaign
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5"
          role="group"
          aria-label="Filter by campaign status"
        >
          {CAMPAIGN_STATUS_FILTERS.map((filter) => {
            const active = status === filter.value;
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(filter.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:py-1.5 ${
                  active
                    ? 'bg-[var(--dash-navy)] text-white'
                    : 'bg-[var(--dash-surface-2)] text-[var(--dash-muted)] hover:text-[var(--dash-ink)]'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <form
          className="flex w-full gap-2 sm:max-w-xs"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(searchInput.trim());
          }}
        >
          <label className="sr-only" htmlFor="campaign-search">
            Search campaigns
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--dash-muted)]"
              aria-hidden
            />
            <input
              id="campaign-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or id…"
              className="h-9 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {error ? <ApiErrorBanner result={errorResult} message={error} /> : null}

      {loading ? (
        <LoadingState rows={5} label="Loading campaigns…" />
      ) : rows.length === 0 && !error ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create your first promotional campaign to start generating promo codes."
          action={
            campaignsPerm.create ? (
              <Button href="/dashboard/campaigns/new">Create Campaign</Button>
            ) : null
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          minWidth="1100px"
          onRowClick={(row) => campaignDrawer.openDrawer(row.id)}
          mobileCard={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold tracking-tight text-[var(--dash-ink)]">
                    {row.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--dash-muted)]">{row.discount}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed text-[var(--dash-ink-soft)]">
                {row.purpose}
              </p>
              <dl className="grid grid-cols-3 gap-3 rounded-lg bg-[var(--dash-surface-2)]/60 px-3 py-2.5 text-xs text-[var(--dash-muted)]">
                <div>
                  <dt>Codes</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
                    {formatNumber(row.promoCodes, { fallback: '0' })}
                  </dd>
                </div>
                <div>
                  <dt>Redeemed</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
                    {formatNumber(row.redeemed, { fallback: '0' })}
                  </dd>
                </div>
                <div>
                  <dt>Left</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
                    {formatNumber(row.remaining, { fallback: '0' })}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-col gap-2 border-t border-[var(--dash-border)] pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-[var(--dash-muted)]">
                  {formatTableDate(row.startAt)} →{' '}
                  {row.endAt ? formatTableDate(row.endAt) : row.endLabel}
                </p>
                <CampaignRowActions actions={actionsFor(row)} />
              </div>
            </div>
          )}
          footer={`${formatNumber(rows.length, { fallback: '0' })} campaign${rows.length === 1 ? '' : 's'}`}
        />
      )}

      <CampaignDetailDrawer
        open={campaignDrawer.open}
        campaignId={campaignDrawer.value}
        canWrite={campaignsPerm.edit}
        onClose={campaignDrawer.closeDrawer}
        onEdit={(campaign) => {
          campaignDrawer.closeDrawer();
          openEdit(campaign);
        }}
      />

      <CampaignFormModal
        open={modalOpen}
        campaign={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditing(null);
          load();
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
        onConfirm={runConfirm}
      />
    </PageContainer>
  );
}
