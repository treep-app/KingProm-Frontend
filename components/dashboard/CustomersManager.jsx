'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Upload, Users } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useCustomers } from '../../hooks/useCustomers';
import { useCustomerStats } from '../../hooks/useCustomerStats';
import * as customerService from '../../lib/api/customerService';
import { messageFromApiResult } from '../../lib/api/errors';
import { CUSTOMER_PAGE_SIZE } from '../../lib/dashboard/constants';
import { CUSTOMER_TAG_OPTIONS } from '../../lib/dashboard/customerTags';
import { customerDisplayName } from '../../lib/dashboard/customerFormat';
import { formatNumber } from '../../lib/format';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import { useDrawerQueryParam } from '../../hooks/useDrawerQueryParam';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import CustomerDetailDrawer from './CustomerDetailDrawer';
import CustomerQuickCreateDrawer from './CustomerQuickCreateDrawer';
import { ApiErrorBanner } from './AlertBanner';
import { buildCustomerTableColumns, CustomerMobileCard } from './customerTable';
import KpiCards from './KpiCards';
import { useToast } from './ToastProvider';
import { useCustomerPermissions } from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const ACTIVITY_FILTERS = [
  { value: '', label: 'Any activity' },
  { value: 'active', label: 'Active (30d)' },
  { value: 'inactive', label: 'Inactive' },
];

const PROMO_FILTERS = [
  { value: '', label: 'Any promo history' },
  { value: 'has_codes', label: 'Has promo codes' },
  { value: 'has_redeemed', label: 'Has redeemed' },
  { value: 'never_redeemed', label: 'Never redeemed' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created date' },
  { value: 'name', label: 'Name' },
  { value: 'lastActivity', label: 'Last activity' },
  { value: 'promoCodes', label: 'Promo codes' },
  { value: 'redemptions', label: 'Redemptions' },
];

function CustomersManagerInner() {
  const router = useRouter();
  const toast = useToast();
  const customersPerm = useCustomerPermissions();

  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [activity, setActivity] = useState('');
  const [promoActivity, setPromoActivity] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [createdFrom, setCreatedFrom] = useState('');
  const [lastActivityFrom, setLastActivityFrom] = useState('');
  const [offset, setOffset] = useState(0);

  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const customerDrawer = useDrawerQueryParam('customer');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    errorResult: statsErrorResult,
  } = useCustomerStats();

  const {
    items,
    total,
    loading,
    error,
    errorResult,
    reload: load,
  } = useCustomers({
    q: query,
    status,
    tag,
    activity,
    promoActivity,
    createdFrom: createdFrom ? new Date(`${createdFrom}T00:00:00.000Z`).toISOString() : '',
    lastActivityFrom: lastActivityFrom
      ? new Date(`${lastActivityFrom}T00:00:00.000Z`).toISOString()
      : '',
    sort,
    sortDir,
    limit: CUSTOMER_PAGE_SIZE,
    offset,
  });

  const kpiItems = useMemo(
    () => [
      {
        id: 'total',
        label: 'Total customers',
        display: statsLoading ? '…' : formatNumber(stats?.totalCustomers, { fallback: '0' }),
        description: 'All profiles',
        status: statsLoading ? 'loading' : 'ready',
        icon: Users,
        errorMessage: statsError || null,
      },
      {
        id: 'new',
        label: 'New (30 days)',
        display: statsLoading ? '…' : formatNumber(stats?.newCustomers, { fallback: '0' }),
        description: 'Recently added',
        status: statsLoading ? 'loading' : 'ready',
      },
      {
        id: 'active',
        label: 'Active (30 days)',
        display: statsLoading ? '…' : formatNumber(stats?.activeCustomers, { fallback: '0' }),
        description: 'Recent activity',
        status: statsLoading ? 'loading' : 'ready',
      },
      {
        id: 'repeat',
        label: 'Repeat guests',
        display: statsLoading ? '…' : formatNumber(stats?.repeatCustomers, { fallback: '0' }),
        description: '2+ redemptions',
        status: statsLoading ? 'loading' : 'ready',
      },
    ],
    [stats, statsLoading, statsError],
  );

  async function handleArchive(customer) {
    const result = await customerService.archiveCustomer(customer.id);
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to archive the customer. Please try again.', {
          resource: 'customer',
        }),
      );
      return false;
    }
    toast.success(`${customerDisplayName(customer)} archived`);
    await load();
    return true;
  }

  function actionsFor(row) {
    const actions = [];

    if (customersPerm.view) {
      actions.push({
        id: 'view',
        label: 'View',
        onSelect: () => customerDrawer.openDrawer(row.id),
      });
    }

    if (customersPerm.edit && row.status !== 'ARCHIVED') {
      actions.push({
        id: 'edit',
        label: 'Edit',
        onSelect: () =>
          router.push(`/dashboard/customers/${encodeURIComponent(row.id)}/edit`),
      });
    }

    if (customersPerm.archive && row.status !== 'ARCHIVED') {
      actions.push({
        id: 'archive',
        label: 'Archive',
        danger: true,
        onSelect: () =>
          setConfirm({
            title: 'Archive customer?',
            description:
              'Archived customers stay in the system but are hidden from active lists. Promo history is preserved.',
            confirmLabel: 'Archive',
            variant: 'danger',
            run: () => handleArchive(row),
          }),
      });
    }

    return actions;
  }

  const columns = useMemo(
    () => buildCustomerTableColumns({ actionsFor }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customersPerm.view, customersPerm.edit, customersPerm.archive],
  );

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + CUSTOMER_PAGE_SIZE, total);

  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        description="Manage customers, contacts, promo assignments, and customer activity."
        actions={
          <div className="flex flex-wrap gap-2">
            {customersPerm.import ? (
              <Button href="/dashboard/customers/import" variant="secondary">
                <Upload className="size-4" />
                Import Customers
              </Button>
            ) : null}
            {customersPerm.create ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Add Customer
              </Button>
            ) : null}
          </div>
        }
      />

      <KpiCards items={kpiItems} />
      {statsError ? (
        <div className="mt-3">
          <ApiErrorBanner result={statsErrorResult} message={statsError} />
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--dash-muted)]"
              aria-hidden
            />
            <label className="sr-only" htmlFor="customer-search">
              Search customers
            </label>
            <input
              id="customer-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customers..."
              className="h-9 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setOffset(0);
              }}
              className={DASH_SELECT_COMPACT_CLASS}
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={tag}
              onChange={(event) => {
                setTag(event.target.value);
                setOffset(0);
              }}
              className={DASH_SELECT_COMPACT_CLASS}
              aria-label="Filter by tag"
            >
              <option value="">All tags</option>
              {CUSTOMER_TAG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={activity}
              onChange={(event) => {
                setActivity(event.target.value);
                setOffset(0);
              }}
              className={DASH_SELECT_COMPACT_CLASS}
              aria-label="Filter by activity"
            >
              {ACTIVITY_FILTERS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={promoActivity}
              onChange={(event) => {
                setPromoActivity(event.target.value);
                setOffset(0);
              }}
              className={DASH_SELECT_COMPACT_CLASS}
              aria-label="Filter by promo activity"
            >
              {PROMO_FILTERS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={DASH_SELECT_COMPACT_CLASS}
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  Sort: {f.label}
                </option>
              ))}
            </select>
            <select
              value={sortDir}
              onChange={(event) => setSortDir(event.target.value)}
              className={DASH_SELECT_COMPACT_CLASS}
              aria-label="Sort direction"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)]">
              Created from
              <input
                type="date"
                value={createdFrom}
                onChange={(event) => {
                  setCreatedFrom(event.target.value);
                  setOffset(0);
                }}
                className={DASH_SELECT_COMPACT_CLASS}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)]">
              Active from
              <input
                type="date"
                value={lastActivityFrom}
                onChange={(event) => {
                  setLastActivityFrom(event.target.value);
                  setOffset(0);
                }}
                className={DASH_SELECT_COMPACT_CLASS}
              />
            </label>
          </div>
        </div>

        {error ? <ApiErrorBanner result={errorResult} message={error} /> : null}

        {loading ? (
          <LoadingState rows={5} label="Loading customers…" />
        ) : items.length === 0 && !error ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer or import an existing customer list."
            action={
              customersPerm.create ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="button" onClick={() => setCreateOpen(true)}>
                    Add Customer
                  </Button>
                  {customersPerm.import ? (
                    <Button href="/dashboard/customers/import" variant="secondary">
                      Import Customers
                    </Button>
                  ) : null}
                </div>
              ) : null
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            minWidth="1000px"
            onRowClick={(row) => customerDrawer.openDrawer(row.id)}
            mobileCard={(row) => (
              <CustomerMobileCard customer={row} actions={actionsFor(row)} />
            )}
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {pageStart}–{pageEnd} of {formatNumber(total, { fallback: '0' })}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={offset <= 0}
                    onClick={() => setOffset((v) => Math.max(0, v - CUSTOMER_PAGE_SIZE))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={offset + CUSTOMER_PAGE_SIZE >= total}
                    onClick={() => setOffset((v) => v + CUSTOMER_PAGE_SIZE)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            }
          />
        )}
      </div>

      <CustomerDetailDrawer
        open={customerDrawer.open}
        customerId={customerDrawer.value}
        canEdit={customersPerm.edit}
        onClose={customerDrawer.closeDrawer}
        onEdit={(customer) => {
          customerDrawer.closeDrawer();
          router.push(`/dashboard/customers/${encodeURIComponent(customer.id)}/edit`);
        }}
      />

      <CustomerQuickCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
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

export default function CustomersManager() {
  return (
    <AuthGate permission={PERMISSIONS.CUSTOMERS_READ}>
      <CustomersManagerInner />
    </AuthGate>
  );
}
