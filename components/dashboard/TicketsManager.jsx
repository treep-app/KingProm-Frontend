'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Plus, Ticket } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { usePromoCodes } from '../../hooks/usePromoCodes';
import { AdminApiNotImplementedError } from '../../lib/api/client';
import * as promoCodeService from '../../lib/api/promoCodeService';
import { messageFromCaughtError } from '../../lib/api/errors';
import {
  CAMPAIGN_LIST_LIMIT,
  PROMO_CODE_PAGE_SIZE_OPTIONS,
  TICKET_PAGE_SIZE,
} from '../../lib/dashboard/constants';
import { useDrawerQueryParam } from '../../hooks/useDrawerQueryParam';
import IssueTicketModal from './IssueTicketModal';
import PromoCodeDetailDrawer from './PromoCodeDetailDrawer';
import TicketFiltersBar from './TicketFiltersBar';
import { buildTicketTableColumns, TicketMobileCard } from './ticketTable';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import {
  useCampaignPermissions,
  usePromoCodePermissions,
} from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

function dateToIsoStart(dateStr) {
  if (!dateStr) return '';
  return `${dateStr}T00:00:00.000Z`;
}

function dateToIsoEnd(dateStr) {
  if (!dateStr) return '';
  return `${dateStr}T23:59:59.999Z`;
}

export default function TicketsManager() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const promoDrawer = useDrawerQueryParam('promo');
  const promoPerm = usePromoCodePermissions();
  const campaignsPerm = useCampaignPermissions();

  const [status, setStatus] = useState('');
  const [campaignId, setCampaignId] = useState(searchParams.get('campaignId') || '');
  const [purpose, setPurpose] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [expiresFrom, setExpiresFrom] = useState('');
  const [expiresTo, setExpiresTo] = useState('');
  const [q, setQ] = useState('');
  const [draftQ, setDraftQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(TICKET_PAGE_SIZE);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueEmail, setIssueEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setCampaignId(searchParams.get('campaignId') || '');
    setOffset(0);
  }, [searchParams]);

  const { items: campaigns } = useCampaigns({ limit: CAMPAIGN_LIST_LIMIT });

  const listParams = useMemo(
    () => ({
      status,
      q,
      campaignId,
      purpose,
      createdFrom: dateToIsoStart(createdFrom),
      createdTo: dateToIsoEnd(createdTo),
      expiresFrom: dateToIsoStart(expiresFrom),
      expiresTo: dateToIsoEnd(expiresTo),
      limit: pageSize,
      offset,
    }),
    [
      status,
      q,
      campaignId,
      purpose,
      createdFrom,
      createdTo,
      expiresFrom,
      expiresTo,
      pageSize,
      offset,
    ],
  );

  const {
    items,
    total,
    loading,
    error,
    errorResult,
    reload: load,
  } = usePromoCodes(listParams);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [items]);

  function applySearch(event) {
    event.preventDefault();
    setOffset(0);
    setQ(draftQ.trim());
  }

  function clearFilters() {
    setStatus('');
    setCampaignId('');
    setPurpose('');
    setCreatedFrom('');
    setCreatedTo('');
    setExpiresFrom('');
    setExpiresTo('');
    setDraftQ('');
    setQ('');
    setOffset(0);
  }

  function openIssue(email = '') {
    setIssueEmail(email);
    setIssueOpen(true);
  }

  async function handleCopy(code) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(code);
      toast.success('Copied');
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error('Unable to copy the promo code. Please try again.');
    }
  }

  function handleExport(format) {
    try {
      promoCodeService.exportPromoCodes(listParams, format);
    } catch (err) {
      if (err instanceof AdminApiNotImplementedError) {
        toast.info(
          `Export (${format.toUpperCase()}) is not available yet. A backend export endpoint is required.`,
        );
        return;
      }
      toast.error(
        messageFromCaughtError(err, 'Unable to export promo codes. Please try again.'),
      );
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(checked) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(items.map((t) => t.id)));
  }

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + pageSize, total);
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = items.length > 0 && items.every((t) => selectedIds.has(t.id));
  const someSelected = selectedIds.size > 0;

  const columns = buildTicketTableColumns({
    onCopy: handleCopy,
    onView: (ticket) => promoDrawer.openDrawer(ticket.id),
    selectedIds,
    onToggleSelect: toggleSelect,
    onToggleSelectAll: toggleSelectAll,
    allSelected,
    someSelected,
    showCampaign: true,
  });

  const hasActiveFilters = Boolean(
    status ||
      campaignId ||
      purpose ||
      createdFrom ||
      createdTo ||
      expiresFrom ||
      expiresTo ||
      q,
  );

  return (
    <PageContainer>
      <PageHeader
        title="Promo codes"
        description="Manage promo codes across campaigns. Codes are server-generated identifiers and cannot be edited."
        actions={
          <div className="flex flex-wrap gap-2">
            {promoPerm.export ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleExport('csv')}
                  title="Requires backend export endpoint"
                >
                  <Download className="size-4" />
                  Export CSV
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleExport('xlsx')}
                  title="Requires backend export endpoint"
                >
                  <Download className="size-4" />
                  Export Excel
                </Button>
              </>
            ) : null}
            {promoPerm.generate ? (
              <Button type="button" onClick={() => openIssue()}>
                <Plus className="size-4" />
                Issue ticket
              </Button>
            ) : null}
          </div>
        }
      />

      <TicketFiltersBar
        status={status}
        campaignId={campaignId}
        purpose={purpose}
        createdFrom={createdFrom}
        createdTo={createdTo}
        expiresFrom={expiresFrom}
        expiresTo={expiresTo}
        campaigns={campaigns}
        draftQ={draftQ}
        onStatusChange={(value) => {
          setOffset(0);
          setStatus(value);
        }}
        onCampaignChange={(value) => {
          setOffset(0);
          setCampaignId(value);
        }}
        onPurposeChange={(value) => {
          setOffset(0);
          setPurpose(value);
        }}
        onCreatedFromChange={(value) => {
          setOffset(0);
          setCreatedFrom(value);
        }}
        onCreatedToChange={(value) => {
          setOffset(0);
          setCreatedTo(value);
        }}
        onExpiresFromChange={(value) => {
          setOffset(0);
          setExpiresFrom(value);
        }}
        onExpiresToChange={(value) => {
          setOffset(0);
          setExpiresTo(value);
        }}
        onDraftQChange={setDraftQ}
        onSearchSubmit={applySearch}
        onClearFilters={clearFilters}
      />

      {someSelected ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)]/60 px-4 py-3 text-sm">
          <span className="font-medium text-[var(--dash-ink)]">
            {selectedIds.size} selected
          </span>
          {promoPerm.cancel ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled
              title="Bulk cancel requires a backend cancel endpoint"
            >
              Cancel
            </Button>
          ) : null}
          {promoPerm.generate ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled
                title="Bulk assign requires a backend assign endpoint"
              >
                Assign
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled
                title="Bulk send requires a backend send endpoint"
              >
                Send
              </Button>
            </>
          ) : null}
          {promoPerm.export ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleExport('csv')}
              title="Export still needs GET /api/admin/tickets/export"
            >
              Export
            </Button>
          ) : null}
        </div>
      ) : null}

      {error ? <ApiErrorBanner result={errorResult} message={error} /> : null}

      {loading ? (
        <LoadingState rows={6} label="Loading promo codes…" />
      ) : items.length === 0 && !error ? (
        <EmptyState
          icon={Ticket}
          title="No promo codes found"
          description={
            hasActiveFilters
              ? 'No codes match the current filters. Try clearing filters or searching again.'
              : 'Promo codes will appear here once you create a campaign.'
          }
          action={
            hasActiveFilters ? (
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : campaignsPerm.create ? (
              <Button href="/dashboard/campaigns/new">Create Campaign</Button>
            ) : null
          }
        />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          rows={items}
          minWidth="1100px"
          onRowClick={(ticket) => promoDrawer.openDrawer(ticket.id)}
          mobileCard={(ticket) => (
            <TicketMobileCard
              ticket={ticket}
              onCopy={handleCopy}
              onView={(t) => promoDrawer.openDrawer(t.id)}
            />
          )}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Showing {pageStart}–{pageEnd} of {total}
                  <span className="ml-2 text-[var(--dash-muted)]">
                    · Page {currentPage} of {totalPages}
                  </span>
                </span>
                <label className="inline-flex items-center gap-1.5">
                  <span className="text-[var(--dash-muted)]">Page size</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setOffset(0);
                      setPageSize(Number(e.target.value));
                    }}
                    className="h-8 rounded-md border border-[var(--dash-border)] bg-white px-2 text-xs"
                  >
                    {PROMO_CODE_PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  disabled={offset <= 0}
                  onClick={() => setOffset((v) => Math.max(0, v - pageSize))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  disabled={offset + pageSize >= total}
                  onClick={() => setOffset((v) => v + pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          }
        />
      ) : null}

      {copiedId ? (
        <span className="sr-only" role="status">
          Copied {copiedId}
        </span>
      ) : null}

      <PromoCodeDetailDrawer
        open={promoDrawer.open}
        ticketId={promoDrawer.value}
        onClose={promoDrawer.closeDrawer}
      />

      <IssueTicketModal
        open={issueOpen}
        initialEmail={issueEmail}
        initialCampaignId={campaignId}
        onClose={() => setIssueOpen(false)}
        onSuccess={() => {
          toast.info('Refreshing list…');
          load();
        }}
      />
    </PageContainer>
  );
}
