'use client';

import { Copy } from 'lucide-react';
import { formatDate } from '../../lib/format';
import {
  customerLabel,
  formatUsageDisplay,
  resolvePromoDisplayStatus,
} from '../../lib/dashboard/promoCodeStatus';
import StatusBadge from './StatusBadge';

/**
 * Global promo-code table columns (#21).
 */
export function buildTicketTableColumns({
  onCopy,
  onView,
  selectedIds = null,
  onToggleSelect = null,
  onToggleSelectAll = null,
  allSelected = false,
  someSelected = false,
  showCampaign = true,
}) {
  const columns = [];

  if (onToggleSelect) {
    columns.push({
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected;
          }}
          onChange={(e) => onToggleSelectAll?.(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all on page"
          className="size-3.5 rounded border-[var(--dash-border-strong)]"
        />
      ),
      className: 'w-10',
      cell: (ticket) => (
        <input
          type="checkbox"
          checked={selectedIds?.has(ticket.id) || false}
          onChange={() => onToggleSelect?.(ticket.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${ticket.promoCode || ticket.code}`}
          className="size-3.5 rounded border-[var(--dash-border-strong)]"
        />
      ),
    });
  }

  columns.push(
    {
      key: 'promo',
      header: 'Promo Code',
      className: 'font-mono text-[13px] font-semibold tracking-wide',
      cell: (ticket) => ticket.code || ticket.promoCode,
    },
  );

  if (showCampaign) {
    columns.push({
      key: 'campaign',
      header: 'Campaign',
      cell: (ticket) => (
        <span className="text-[var(--dash-ink)]">
          {ticket.campaignName || ticket.campaignId || '—'}
        </span>
      ),
    });
  }

  columns.push(
    {
      key: 'customer',
      header: 'Customer',
      cell: (ticket) => (
        <span className={ticket.email ? 'text-[var(--dash-ink)]' : 'text-[var(--dash-muted)]'}>
          {customerLabel(ticket)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (ticket) => <StatusBadge status={resolvePromoDisplayStatus(ticket)} />,
    },
    {
      key: 'usage',
      header: 'Usage',
      className: 'tabular-nums text-[var(--dash-ink-soft)]',
      cell: (ticket) => formatUsageDisplay(ticket),
    },
    {
      key: 'expires',
      header: 'Expiry',
      className: 'text-[var(--dash-ink-soft)]',
      cell: (ticket) => formatDate(ticket.expiresAt),
    },
    {
      key: 'created',
      header: 'Created',
      className: 'text-[var(--dash-ink-soft)]',
      cell: (ticket) => formatDate(ticket.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (ticket) => (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dash-accent)] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onCopy?.(ticket.code || ticket.promoCode);
            }}
          >
            <Copy className="size-3" aria-hidden />
            Copy
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-[var(--dash-ink-soft)] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(ticket);
            }}
          >
            View
          </button>
        </div>
      ),
    },
  );

  return columns;
}

/**
 * Campaign-detail promo codes table (#19).
 */
export function buildCampaignPromoColumns({ onCopy, onView }) {
  return [
    {
      key: 'promo',
      header: 'Promo Code',
      className: 'font-mono text-[13px] font-semibold tracking-wide',
      cell: (ticket) => ticket.code || ticket.promoCode,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (ticket) => <StatusBadge status={resolvePromoDisplayStatus(ticket)} />,
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (ticket) => (
        <span className={ticket.email ? 'text-[var(--dash-ink)]' : 'text-[var(--dash-muted)]'}>
          {customerLabel(ticket)}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      className: 'text-[var(--dash-ink-soft)]',
      cell: (ticket) => formatDate(ticket.createdAt),
    },
    {
      key: 'expires',
      header: 'Expires',
      className: 'text-[var(--dash-ink-soft)]',
      cell: (ticket) => formatDate(ticket.expiresAt),
    },
    {
      key: 'uses',
      header: 'Uses',
      className: 'tabular-nums text-[var(--dash-ink-soft)]',
      cell: (ticket) => formatUsageDisplay(ticket),
    },
    {
      key: 'redeemed',
      header: 'Last Redeemed',
      className: 'text-[var(--dash-ink-soft)]',
      cell: (ticket) => (ticket.redeemedAt ? formatDate(ticket.redeemedAt) : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (ticket) => (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dash-accent)] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onCopy?.(ticket.code || ticket.promoCode);
            }}
          >
            <Copy className="size-3" aria-hidden />
            Copy
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-[var(--dash-ink-soft)] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(ticket);
            }}
          >
            View
          </button>
        </div>
      ),
    },
  ];
}

export function TicketMobileCard({ ticket, onCopy, onView, showCampaign = true }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold tracking-wide text-[var(--dash-ink)]">
            {ticket.code || ticket.promoCode}
          </p>
          {showCampaign ? (
            <p className="mt-0.5 truncate text-xs text-[var(--dash-muted)]">
              {ticket.campaignName || ticket.campaignId || '—'}
            </p>
          ) : null}
        </div>
        <StatusBadge status={resolvePromoDisplayStatus(ticket)} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--dash-muted)]">
        <span>{customerLabel(ticket)}</span>
        <span>{formatUsageDisplay(ticket)}</span>
        <span>Expires {formatDate(ticket.expiresAt)}</span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="text-xs font-semibold text-[var(--dash-accent)]"
          onClick={(e) => {
            e.stopPropagation();
            onCopy?.(ticket.code || ticket.promoCode);
          }}
        >
          Copy
        </button>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--dash-ink-soft)]"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(ticket);
          }}
        >
          View
        </button>
      </div>
    </div>
  );
}
