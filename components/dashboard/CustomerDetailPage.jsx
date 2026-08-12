'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, BadgeCheck, Ticket } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useCustomer } from '../../hooks/useCustomer';
import { useRedemptions } from '../../hooks/useRedemptions';
import * as customerService from '../../lib/api/customerService';
import { messageFromApiResult } from '../../lib/api/errors';
import {
  customerDisplayName,
  customerInitials,
  formatRelativeActivity,
} from '../../lib/dashboard/customerFormat';
import { formatDate, formatDateTime, formatNumber } from '../../lib/format';
import { DASH_INPUT_CLASS } from '../../lib/dashboard/styles';
import AssignPromoModal from './AssignPromoModal';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { useCustomerPermissions } from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

function SummaryCard({ label, value }) {
  return (
    <div className="dash-panel p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">{value}</p>
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

function CustomerDetailInner({ customerId }) {
  const router = useRouter();
  const toast = useToast();
  const customersPerm = useCustomerPermissions();

  const {
    customer,
    loading,
    error,
    errorResult,
    reload: reloadCustomer,
    archiveCustomer,
    addNote,
  } = useCustomer(customerId);

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [promoItems, setPromoItems] = useState([]);
  const [campaignHistory, setCampaignHistory] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteBusy, setNoteBusy] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);

  const {
    items: redemptionItems,
    total: redemptionTotal,
    loading: redemptionsLoading,
  } = useRedemptions({
    customerId,
    limit: 25,
    offset: 0,
    enabled: Boolean(customerId),
  });

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    const result = await customerService.getCustomerActivity(customerId, { limit: 50 });
    if (result.ok) {
      setActivity(result.data.items || []);
    } else {
      setActivity([]);
    }
    setActivityLoading(false);
  }, [customerId]);

  const loadPromos = useCallback(async () => {
    setPromosLoading(true);
    const result = await customerService.getCustomerPromoCodes(customerId, { limit: 100 });
    if (result.ok) {
      setPromoItems(result.data.items || []);
      setCampaignHistory(result.data.campaigns || []);
    } else {
      setPromoItems([]);
      setCampaignHistory([]);
    }
    setPromosLoading(false);
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      loadActivity();
      loadPromos();
    }
  }, [customerId, loadActivity, loadPromos]);

  async function handleArchive() {
    setArchiveBusy(true);
    const result = await archiveCustomer();
    setArchiveBusy(false);
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to archive the customer. Please try again.', {
          resource: 'customer',
        }),
      );
      return;
    }
    toast.success('Customer archived');
    setArchiveConfirm(false);
    await reloadCustomer();
  }

  async function handleAddNote() {
    const note = noteText.trim();
    if (!note) return;
    setNoteBusy(true);
    const result = await addNote(note);
    setNoteBusy(false);
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to add the note. Please try again.', {
          resource: 'customer',
        }),
      );
      return;
    }
    toast.success('Internal note added');
    setNoteText('');
    setNoteOpen(false);
    await reloadCustomer();
    await loadActivity();
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState rows={4} label="Loading customer…" />
      </PageContainer>
    );
  }

  if (error || !customer) {
    return (
      <PageContainer>
        <ApiErrorBanner
          result={errorResult}
          message={error}
          fallback="Customer not found."
        />
        <Button href="/dashboard/customers" variant="secondary">
          Back to customers
        </Button>
      </PageContainer>
    );
  }

  const promoColumns = [
    {
      key: 'code',
      header: 'Promo code',
      cell: (row) => (
        <Link
          href={`/dashboard/promo-codes/${encodeURIComponent(row.id)}`}
          className="font-mono text-sm font-medium text-[var(--dash-accent)] hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {row.promoCode}
        </Link>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      cell: (row) => row.campaignName || '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'issued',
      header: 'Issued',
      cell: (row) => formatDate(row.issuedAt) || '—',
    },
    {
      key: 'expires',
      header: 'Expires',
      cell: (row) => formatDate(row.expiresAt) || '—',
    },
    {
      key: 'uses',
      header: 'Uses',
      className: 'tabular-nums',
      cell: (row) =>
        row.usageLimit != null ? `${row.uses}/${row.usageLimit}` : String(row.uses ?? 0),
    },
  ];

  const campaignColumns = [
    {
      key: 'campaign',
      header: 'Campaign',
      cell: (row) => (
        <Link
          href={`/dashboard/campaigns/${encodeURIComponent(row.campaignId)}`}
          className="font-medium text-[var(--dash-accent)] hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {row.campaignName || row.campaignId}
        </Link>
      ),
    },
    {
      key: 'code',
      header: 'Latest code',
      cell: (row) => (
        <span className="font-mono text-xs">{row.promoCode || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'date',
      header: 'Last activity',
      cell: (row) => formatDate(row.date) || '—',
    },
    {
      key: 'redeemed',
      header: 'Redeemed',
      cell: (row) => (row.redeemed ? 'Yes' : 'No'),
    },
  ];

  const redemptionColumns = [
    {
      key: 'promoCode',
      header: 'Promo code',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold">{row.promoCode}</span>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      cell: (row) => row.campaignName || '—',
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
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-full bg-[var(--dash-accent-soft)] text-sm font-semibold text-[var(--dash-accent)]"
              aria-hidden
            >
              {customerInitials(customer)}
            </span>
            {customerDisplayName(customer)}
          </span>
        }
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge status={customer.status} />
            <span className="text-xs text-[var(--dash-muted)]">
              Last activity: {formatRelativeActivity(customer.lastActivityAt)}
            </span>
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/customers" variant="secondary" size="sm">
              All customers
            </Button>
            {customersPerm.edit && customer.status !== 'ARCHIVED' ? (
              <Button
                href={`/dashboard/customers/${encodeURIComponent(customerId)}/edit`}
                size="sm"
              >
                Edit
              </Button>
            ) : null}
            {customersPerm.assignPromo && customer.status !== 'ARCHIVED' ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
                Assign promo
              </Button>
            ) : null}
            {customersPerm.edit && customer.status !== 'ARCHIVED' ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => setNoteOpen(true)}>
                Add note
              </Button>
            ) : null}
            {customersPerm.archive && customer.status !== 'ARCHIVED' ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setArchiveConfirm(true)}
              >
                Archive
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Promo codes"
          value={formatNumber(customer.promoCodeCount, { fallback: '0' })}
        />
        <SummaryCard
          label="Redemptions"
          value={formatNumber(customer.redemptionCount, { fallback: '0' })}
        />
        <SummaryCard label="Created" value={formatDate(customer.createdAt) || '—'} />
        <SummaryCard label="Updated" value={formatDate(customer.updatedAt) || '—'} />
      </div>

      <section className="dash-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Contact</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Email">{customer.email || '—'}</InfoRow>
          <InfoRow label="Phone">{customer.phone || '—'}</InfoRow>
          <InfoRow label="Company">{customer.company || '—'}</InfoRow>
          <InfoRow label="Tags">
            {customer.tags?.length ? (
              <div className="flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--dash-surface-2)] px-1.5 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              '—'
            )}
          </InfoRow>
        </dl>
      </section>

      {customer.notes ? (
        <section className="dash-panel p-5">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Internal notes</h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">Operator-only — not visible to guests.</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--dash-ink-soft)]">
            {customer.notes}
          </pre>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Activity</h2>
        {activityLoading ? (
          <LoadingState rows={3} label="Loading activity…" />
        ) : activity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Profile changes, notes, and promo events will appear here."
          />
        ) : (
          <div className="dash-panel divide-y divide-[var(--dash-border)]">
            {activity.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm text-[var(--dash-ink)]">{item.summary}</p>
                <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                  {formatDateTime(item.createdAt)}
                  {item.eventType ? ` · ${item.eventType}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Promo codes</h2>
        {promosLoading ? (
          <LoadingState rows={4} label="Loading promo codes…" />
        ) : promoItems.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No promo codes"
            description="Assign an unused code from a campaign to link it to this customer."
            action={
              customersPerm.assignPromo ? (
                <Button type="button" onClick={() => setAssignOpen(true)}>
                  Assign promo
                </Button>
              ) : null
            }
          />
        ) : (
          <DataTable
            columns={promoColumns}
            rows={promoItems}
            minWidth="800px"
            onRowClick={(row) =>
              router.push(`/dashboard/promo-codes/${encodeURIComponent(row.id)}`)
            }
            footer={`${formatNumber(promoItems.length)} code${promoItems.length === 1 ? '' : 's'}`}
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Redemptions</h2>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Vouchers claimed by this customer
              {redemptionTotal ? ` · ${formatNumber(redemptionTotal)} total` : ''}
            </p>
          </div>
          <Button href="/dashboard/redemptions" variant="secondary" size="sm">
            All redemptions
          </Button>
        </div>
        {redemptionsLoading ? (
          <LoadingState rows={3} label="Loading redemptions…" />
        ) : redemptionItems.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="No redemptions"
            description="Redemptions will appear here when this customer claims a voucher."
          />
        ) : (
          <DataTable
            columns={redemptionColumns}
            rows={redemptionItems}
            minWidth="720px"
            onRowClick={(row) =>
              router.push(`/dashboard/redemptions/${encodeURIComponent(row.id)}`)
            }
            footer={`${formatNumber(redemptionItems.length)} shown`}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Campaign history</h2>
        {promosLoading ? (
          <LoadingState rows={3} label="Loading campaigns…" />
        ) : campaignHistory.length === 0 ? (
          <p className="text-sm text-[var(--dash-muted)]">No campaigns linked yet.</p>
        ) : (
          <DataTable
            columns={campaignColumns}
            rows={campaignHistory}
            minWidth="720px"
            onRowClick={(row) =>
              router.push(`/dashboard/campaigns/${encodeURIComponent(row.campaignId)}`)
            }
          />
        )}
      </section>

      <AssignPromoModal
        open={assignOpen}
        customerId={customerId}
        onClose={() => setAssignOpen(false)}
        onSuccess={() => {
          reloadCustomer();
          loadPromos();
          loadActivity();
        }}
      />

      {noteOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Dismiss"
            disabled={noteBusy}
            onClick={() => {
              if (!noteBusy) setNoteOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-[var(--dash-ink)]">Add internal note</h2>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Notes are visible to operators only.
            </p>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={4}
              className={`${DASH_INPUT_CLASS} mt-4 min-h-[6rem] py-2`}
              placeholder="Add context for your team…"
            />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={noteBusy}
                onClick={() => setNoteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" disabled={noteBusy || !noteText.trim()} onClick={handleAddNote}>
                {noteBusy ? 'Saving…' : 'Save note'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={archiveConfirm}
        title="Archive customer?"
        description="Archived customers are hidden from active lists. Promo history and notes are preserved."
        confirmLabel="Archive"
        variant="danger"
        busy={archiveBusy}
        onCancel={() => {
          if (!archiveBusy) setArchiveConfirm(false);
        }}
        onConfirm={handleArchive}
      />
    </PageContainer>
  );
}

export default function CustomerDetailPage({ customerId }) {
  return (
    <AuthGate permission={PERMISSIONS.CUSTOMERS_READ}>
      <CustomerDetailInner customerId={customerId} />
    </AuthGate>
  );
}
