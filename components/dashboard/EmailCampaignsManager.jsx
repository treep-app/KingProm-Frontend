'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Plus, Search } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useEmailCampaigns } from '../../hooks/useEmailCampaigns';
import * as emailCampaignService from '../../lib/api/emailCampaignService';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { audienceSummary } from '../../lib/dashboard/emailCampaignSegments';
import { EMAIL_CAMPAIGN_LIST_LIMIT } from '../../lib/dashboard/constants';
import { formatDate, formatDateTime, formatNumber } from '../../lib/format';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import EmailCampaignRowActions from './EmailCampaignRowActions';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { useEmailCampaignPermissions } from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'SENDING', label: 'Sending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'scheduledAt', label: 'Scheduled' },
  { value: 'recipients', label: 'Recipients' },
  { value: 'name', label: 'Name' },
];

function formatTableDate(value) {
  if (!value) return '—';
  return formatDate(value) || '—';
}

function EmailCampaignsManagerInner() {
  const router = useRouter();
  const toast = useToast();
  const perm = useEmailCampaignPermissions();

  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [offset, setOffset] = useState(0);

  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const {
    items,
    total,
    loading,
    error,
    errorResult,
    reload: load,
  } = useEmailCampaigns({
    status,
    q: query,
    sort,
    sortDir,
    limit: EMAIL_CAMPAIGN_LIST_LIMIT,
    offset,
  });

  useEffect(() => {
    setOffset(0);
  }, [status, query, sort, sortDir]);

  const pageCount = Math.max(1, Math.ceil(total / EMAIL_CAMPAIGN_LIST_LIMIT));
  const currentPage = Math.floor(offset / EMAIL_CAMPAIGN_LIST_LIMIT) + 1;

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

  async function handleDuplicate(row) {
    try {
      const result = await emailCampaignService.duplicateEmailCampaign(row.id);
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to duplicate the email campaign. Please try again.', {
            resource: 'email campaign',
          }),
        );
        return;
      }
      toast.success('Email campaign duplicated as draft');
      router.push(`/dashboard/email-campaigns/${encodeURIComponent(result.data.campaign.id)}`);
    } catch (err) {
      toast.error(
        messageFromCaughtError(err, 'Unable to duplicate the email campaign. Please try again.'),
      );
    }
  }

  function actionsFor(row) {
    const actions = [];
    const rowStatus = String(row.status || '').toUpperCase();

    if (perm.view) {
      actions.push({
        id: 'view',
        label: 'View',
        onSelect: () => router.push(`/dashboard/email-campaigns/${encodeURIComponent(row.id)}`),
      });
    }

    if (perm.edit && ['DRAFT', 'SCHEDULED', 'PAUSED'].includes(rowStatus)) {
      actions.push({
        id: 'edit',
        label: 'Edit',
        onSelect: () =>
          router.push(`/dashboard/email-campaigns/${encodeURIComponent(row.id)}/edit`),
      });
    }

    if (perm.create) {
      actions.push({
        id: 'duplicate',
        label: 'Duplicate',
        onSelect: () => handleDuplicate(row),
      });
    }

    if (perm.delete && rowStatus === 'DRAFT') {
      actions.push({
        id: 'delete',
        label: 'Delete',
        danger: true,
        onSelect: () =>
          askConfirm({
            title: 'Delete draft email campaign?',
            description: 'This removes the draft permanently. Sent campaigns cannot be deleted.',
            confirmLabel: 'Delete',
            run: async () => {
              const result = await emailCampaignService.deleteEmailCampaign(row.id);
              if (!result.ok) {
                toast.error(
                  messageFromApiResult(result, 'Unable to delete the email campaign. Please try again.', {
                    resource: 'email campaign',
                  }),
                );
                return;
              }
              toast.success('Draft deleted');
              await load();
            },
          }),
      });
    }

    if (perm.cancel && ['SCHEDULED', 'SENDING', 'PAUSED'].includes(rowStatus)) {
      actions.push({
        id: 'cancel',
        label: 'Cancel',
        danger: true,
        onSelect: () =>
          askConfirm({
            title: 'Cancel this email campaign?',
            description: 'Pending sends will stop. Already sent messages cannot be recalled.',
            confirmLabel: 'Cancel campaign',
            run: async () => {
              const result = await emailCampaignService.cancelEmailCampaign(row.id);
              if (!result.ok) {
                toast.error(
                  messageFromApiResult(result, 'Unable to cancel the email campaign. Please try again.', {
                    resource: 'email campaign',
                  }),
                );
                return;
              }
              toast.success('Email campaign cancelled');
              await load();
            },
          }),
      });
    }

    return actions;
  }

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Campaign',
        cell: (row) => (
          <div>
            <p className="font-medium text-[var(--dash-ink)]">{row.name || 'Untitled'}</p>
            {row.subject ? (
              <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{row.subject}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: 'audience',
        header: 'Audience',
        cell: (row) => (
          <span className="text-[var(--dash-muted)]">
            {audienceSummary(row.audience)}
          </span>
        ),
      },
      {
        key: 'promotion',
        header: 'Promotion',
        cell: (row) => row.promotionName || '—',
      },
      {
        key: 'recipients',
        header: 'Recipients',
        cell: (row) => formatNumber(row.recipientCount),
        className: 'tabular-nums',
      },
      {
        key: 'sent',
        header: 'Sent',
        cell: (row) => formatNumber(row.sentCount),
        className: 'tabular-nums',
      },
      {
        key: 'delivered',
        header: 'Delivered',
        cell: (row) => formatNumber(row.deliveredCount),
        className: 'tabular-nums',
      },
      {
        key: 'opened',
        header: 'Opened',
        cell: (row) => formatNumber(row.openedCount),
        className: 'tabular-nums',
      },
      {
        key: 'clicked',
        header: 'Clicked',
        cell: (row) => formatNumber(row.clickedCount),
        className: 'tabular-nums',
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'scheduledAt',
        header: 'Scheduled',
        cell: (row) => (row.scheduledAt ? formatDateTime(row.scheduledAt) : '—'),
      },
      {
        key: 'createdAt',
        header: 'Created',
        cell: (row) => formatTableDate(row.createdAt),
      },
      {
        key: 'actions',
        header: '',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => <EmailCampaignRowActions actions={actionsFor(row)} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [perm, router, toast],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Email campaigns"
        description="Create batch marketing sends with voucher previews and delivery tracking."
        actions={
          perm.create ? (
            <Button href="/dashboard/email-campaigns/new">
              <Plus className="size-4" aria-hidden />
              Create campaign
            </Button>
          ) : null
        }
      />

      <div className="dash-panel mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setQuery(searchInput.trim());
            }}
            placeholder="Search campaigns…"
            className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] py-2 pl-10 pr-3 text-sm text-[var(--dash-ink)] placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value || 'all'} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                Sort: {f.label}
              </option>
            ))}
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
          <Button variant="secondary" onClick={() => setQuery(searchInput.trim())}>
            Search
          </Button>
        </div>
      </div>

      {error ? <ApiErrorBanner message={error} result={errorResult} className="mb-4" /> : null}

      {loading ? (
        <LoadingState label="Loading email campaigns…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={query || status ? 'No email campaigns match' : 'No email campaigns yet'}
          description={
            query || status
              ? 'Try adjusting your search or filters.'
              : 'Create your first batch send to reach customers with promo vouchers.'
          }
          action={
            perm.create && !query && !status ? (
              <Button href="/dashboard/email-campaigns/new">Create email campaign</Button>
            ) : null
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          getRowKey={(row) => row.id}
          onRowClick={
            perm.view
              ? (row) => router.push(`/dashboard/email-campaigns/${encodeURIComponent(row.id)}`)
              : null
          }
          minWidth="1100px"
          mobileCard={(row) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--dash-ink)]">{row.name || 'Untitled'}</p>
                  <p className="text-xs text-[var(--dash-muted)]">{audienceSummary(row.audience)}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--dash-muted)]">
                <span>Sent {formatNumber(row.sentCount)}</span>
                <span>Opened {formatNumber(row.openedCount)}</span>
                <span>{formatTableDate(row.createdAt)}</span>
              </div>
            </div>
          )}
          footer={
            total > EMAIL_CAMPAIGN_LIST_LIMIT ? (
              <div className="flex items-center justify-between border-t border-[var(--dash-border)] px-4 py-3 text-sm">
                <span className="text-[var(--dash-muted)]">
                  {formatNumber(total)} total · page {currentPage} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - EMAIL_CAMPAIGN_LIST_LIMIT))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={offset + EMAIL_CAMPAIGN_LIST_LIMIT >= total}
                    onClick={() => setOffset(offset + EMAIL_CAMPAIGN_LIST_LIMIT)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        busy={confirmBusy}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </PageContainer>
  );
}

export default function EmailCampaignsManager() {
  return (
    <AuthGate permission={PERMISSIONS.EMAIL_CAMPAIGNS_VIEW}>
      <EmailCampaignsManagerInner />
    </AuthGate>
  );
}
