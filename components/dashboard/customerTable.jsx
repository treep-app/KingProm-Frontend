import Link from 'next/link';
import StatusBadge from './StatusBadge';
import {
  customerDisplayName,
  customerInitials,
  formatRelativeActivity,
} from '../../lib/dashboard/customerFormat';
import { formatDate, formatNumber } from '../../lib/format';
import CustomerRowActions from './CustomerRowActions';

function TagList({ tags = [] }) {
  if (!tags.length) return <span className="text-[var(--dash-muted)]">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="rounded-md bg-[var(--dash-surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--dash-ink-soft)]"
        >
          {tag}
        </span>
      ))}
      {tags.length > 3 ? (
        <span className="text-[10px] text-[var(--dash-muted)]">+{tags.length - 3}</span>
      ) : null}
    </div>
  );
}

function CustomerAvatar({ customer }) {
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent-soft)] text-xs font-semibold text-[var(--dash-accent)]"
      aria-hidden
    >
      {customerInitials(customer)}
    </div>
  );
}

/**
 * Build DataTable columns for the customers list.
 */
export function buildCustomerTableColumns({ actionsFor }) {
  return [
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <CustomerAvatar customer={row} />
          <div className="min-w-0">
            <p className="font-medium text-[var(--dash-ink)]">{customerDisplayName(row)}</p>
            <p className="mt-0.5 truncate text-xs text-[var(--dash-muted)]">
              {row.email || row.phone || 'No contact info'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      cell: (row) => row.company || '—',
    },
    {
      key: 'tags',
      header: 'Tags',
      cell: (row) => <TagList tags={row.tags} />,
    },
    {
      key: 'promoCodes',
      header: 'Promo codes',
      className: 'tabular-nums',
      cell: (row) => formatNumber(row.promoCodeCount, { fallback: '0' }),
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      className: 'tabular-nums',
      cell: (row) => formatNumber(row.redemptionCount, { fallback: '0' }),
    },
    {
      key: 'lastActivity',
      header: 'Last activity',
      cell: (row) => (
        <span className="text-[var(--dash-ink-soft)]">
          {formatRelativeActivity(row.lastActivityAt)}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (row) => formatDate(row.createdAt) || '—',
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
      cell: (row) => <CustomerRowActions actions={actionsFor(row)} />,
    },
  ];
}

export function CustomerMobileCard({ customer, actions = [] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <CustomerAvatar customer={customer} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-[var(--dash-ink)]">
                {customerDisplayName(customer)}
              </p>
              <p className="mt-0.5 truncate text-sm text-[var(--dash-muted)]">
                {customer.email || customer.phone || 'No contact info'}
              </p>
            </div>
            <StatusBadge status={customer.status} />
          </div>
        </div>
      </div>
      <TagList tags={customer.tags} />
      <dl className="grid grid-cols-3 gap-3 rounded-lg bg-[var(--dash-surface-2)]/60 px-3 py-2.5 text-xs text-[var(--dash-muted)]">
        <div>
          <dt>Codes</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
            {formatNumber(customer.promoCodeCount, { fallback: '0' })}
          </dd>
        </div>
        <div>
          <dt>Redeemed</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
            {formatNumber(customer.redemptionCount, { fallback: '0' })}
          </dd>
        </div>
        <div>
          <dt>Activity</dt>
          <dd className="mt-0.5 text-sm font-semibold text-[var(--dash-ink)]">
            {formatRelativeActivity(customer.lastActivityAt)}
          </dd>
        </div>
      </dl>
      <div className="flex items-center justify-between border-t border-[var(--dash-border)] pt-2">
        <Link
          href={`/dashboard/customers/${encodeURIComponent(customer.id)}`}
          className="text-xs font-medium text-[var(--dash-accent)] hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          View profile
        </Link>
        <CustomerRowActions actions={actions} />
      </div>
    </div>
  );
}
