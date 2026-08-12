'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Plus, Search } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useRedemptions } from '../../hooks/useRedemptions';
import * as redemptionService from '../../lib/api/redemptionService';
import * as campaignService from '../../lib/api/campaignService';
import { REDEMPTION_LIST_LIMIT } from '../../lib/dashboard/constants';
import { DASH_INPUT_SEARCH_CLASS, DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import { formatDateTime, formatNumber } from '../../lib/format';
import { useDrawerQueryParam } from '../../hooks/useDrawerQueryParam';
import AuthGate from './AuthGate';
import { ApiErrorBanner } from './AlertBanner';
import RedemptionDetailDrawer from './RedemptionDetailDrawer';
import { useRedemptionPermissions } from './WorkspaceProvider';
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
  { value: '', label: 'All statuses' },
  { value: 'REDEEMED', label: 'Redeemed' },
];

const DATE_PRESETS = [
  { value: '', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

function dateRangeFromPreset(preset) {
  const days = Number(preset);
  if (!days) return { from: '', to: '' };
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

function channelLabel(channel) {
  const key = String(channel || '').toLowerCase();
  if (key === 'staff') return 'Staff';
  if (key === 'guest') return 'Guest';
  return channel || '—';
}

function RedemptionsHistoryManagerInner() {
  const redemptionDrawer = useDrawerQueryParam('redemption');
  const perm = useRedemptionPermissions();

  const [status, setStatus] = useState('');
  const [datePreset, setDatePreset] = useState('30');
  const [campaignId, setCampaignId] = useState('');
  const [locationKey, setLocationKey] = useState('');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [offset, setOffset] = useState(0);
  const [locations, setLocations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const { from, to } = useMemo(() => dateRangeFromPreset(datePreset), [datePreset]);

  const {
    items,
    total,
    loading,
    error,
    errorResult,
    reload,
  } = useRedemptions({
    q: query,
    status,
    campaignId,
    locationKey,
    from,
    to,
    limit: REDEMPTION_LIST_LIMIT,
    offset,
  });

  useEffect(() => {
    setOffset(0);
  }, [status, datePreset, campaignId, locationKey, query]);

  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      const [locResult, campResult] = await Promise.all([
        redemptionService.listRedemptionLocations(),
        campaignService.listCampaigns({ limit: 100, offset: 0 }),
      ]);
      if (cancelled) return;
      if (locResult.ok) setLocations(locResult.data.locations || []);
      if (campResult.ok) setCampaigns(campResult.data.items || campResult.data.campaigns || []);
    }
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / REDEMPTION_LIST_LIMIT));
  const currentPage = Math.floor(offset / REDEMPTION_LIST_LIMIT) + 1;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + REDEMPTION_LIST_LIMIT, total);

  const columns = [
    {
      key: 'promoCode',
      header: 'Promo code',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold tracking-wide">{row.promoCode}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => row.customerName || row.customerEmail || 'Guest',
    },
    {
      key: 'campaign',
      header: 'Campaign',
      cell: (row) => row.campaignName || '—',
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row) => row.locationLabel || row.locationKey || '—',
    },
    {
      key: 'channel',
      header: 'Channel',
      cell: (row) => channelLabel(row.channel),
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
    {
      key: 'redeemedBy',
      header: 'By',
      cell: (row) => row.redeemedByName || '—',
    },
  ];

  return (
    <PageContainer wide>
      <PageHeader
        title="Redemptions"
        description="Staff and guest redemption history for venue operations."
        actions={
          <div className="flex flex-wrap gap-2">
            {perm.redeem ? (
              <Button href="/dashboard/redeem" size="sm">
                <Plus className="size-3.5" />
                Redeem voucher
              </Button>
            ) : null}
          </div>
        }
      />

      {error ? <ApiErrorBanner result={errorResult} message={error} /> : null}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form
          className="relative max-w-md flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(searchInput.trim());
          }}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search promo code, customer, campaign…"
            className={DASH_INPUT_SEARCH_CLASS}
            aria-label="Search redemptions"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={DASH_SELECT_COMPACT_CLASS}
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={datePreset}
            onChange={(event) => setDatePreset(event.target.value)}
            className={DASH_SELECT_COMPACT_CLASS}
            aria-label="Filter by date"
          >
            {DATE_PRESETS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
            className={DASH_SELECT_COMPACT_CLASS}
            aria-label="Filter by campaign"
          >
            <option value="">All campaigns</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </select>
          <select
            value={locationKey}
            onChange={(event) => setLocationKey(event.target.value)}
            className={DASH_SELECT_COMPACT_CLASS}
            aria-label="Filter by location"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.key} value={loc.key}>
                {loc.label}
              </option>
            ))}
          </select>
          <Button type="button" variant="secondary" size="sm" onClick={() => reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState rows={6} label="Loading redemptions…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="No redemptions yet"
          description={
            query || status || campaignId || locationKey || datePreset
              ? 'Try adjusting your filters or search terms.'
              : 'Redemptions will appear here when staff or guests claim vouchers.'
          }
          action={
            perm.redeem ? (
              <Button href="/dashboard/redeem">Redeem a voucher</Button>
            ) : null
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          minWidth="1080px"
          onRowClick={(row) => redemptionDrawer.openDrawer(row.id)}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {pageStart}–{pageEnd} of {formatNumber(total)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={offset <= 0}
                  onClick={() => setOffset((v) => Math.max(0, v - REDEMPTION_LIST_LIMIT))}
                >
                  Previous
                </Button>
                <span className="text-xs text-[var(--dash-muted)]">
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={offset + REDEMPTION_LIST_LIMIT >= total}
                  onClick={() => setOffset((v) => v + REDEMPTION_LIST_LIMIT)}
                >
                  Next
                </Button>
              </div>
            </div>
          }
        />
      )}

      <RedemptionDetailDrawer
        open={redemptionDrawer.open}
        redemptionId={redemptionDrawer.value}
        onClose={redemptionDrawer.closeDrawer}
      />
    </PageContainer>
  );
}

export default function RedemptionsHistoryManager() {
  return (
    <AuthGate permission={PERMISSIONS.REDEMPTIONS_VIEW}>
      <RedemptionsHistoryManagerInner />
    </AuthGate>
  );
}
