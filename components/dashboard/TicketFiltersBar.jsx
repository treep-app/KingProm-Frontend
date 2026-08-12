'use client';

import { Search } from 'lucide-react';
import { TICKET_STATUS_FILTERS } from '../../lib/dashboard/constants';
import { CAMPAIGN_PURPOSE_OPTIONS } from '../../lib/dashboard/campaignPurposes';
import {
  DASH_INPUT_CLASS,
  DASH_INPUT_SEARCH_CLASS,
  DASH_SELECT_CLASS,
} from '../../lib/dashboard/styles';
import { Button } from './ui';

function DateFilterFields({
  createdFrom,
  createdTo,
  expiresFrom,
  expiresTo,
  onCreatedFromChange,
  onCreatedToChange,
  onExpiresFromChange,
  onExpiresToChange,
}) {
  return (
    <>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
          Created from
        </span>
        <input
          type="date"
          value={createdFrom}
          onChange={(e) => onCreatedFromChange(e.target.value)}
          className={DASH_INPUT_CLASS}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
          Created to
        </span>
        <input
          type="date"
          value={createdTo}
          onChange={(e) => onCreatedToChange(e.target.value)}
          className={DASH_INPUT_CLASS}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
          Expires from
        </span>
        <input
          type="date"
          value={expiresFrom}
          onChange={(e) => onExpiresFromChange(e.target.value)}
          className={DASH_INPUT_CLASS}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
          Expires to
        </span>
        <input
          type="date"
          value={expiresTo}
          onChange={(e) => onExpiresToChange(e.target.value)}
          className={DASH_INPUT_CLASS}
        />
      </label>
    </>
  );
}

/**
 * Promo-code list filters: status, campaign, purpose, dates, search.
 * Mobile: primary filters first; date ranges tucked into a details panel.
 */
export default function TicketFiltersBar({
  status,
  campaignId,
  purpose,
  createdFrom,
  createdTo,
  expiresFrom,
  expiresTo,
  campaigns = [],
  draftQ,
  onStatusChange,
  onCampaignChange,
  onPurposeChange,
  onCreatedFromChange,
  onCreatedToChange,
  onExpiresFromChange,
  onExpiresToChange,
  onDraftQChange,
  onSearchSubmit,
  onClearFilters,
}) {
  const hasDateFilters = Boolean(createdFrom || createdTo || expiresFrom || expiresTo);

  return (
    <div className="dash-panel p-3 sm:p-4">
      <div className="flex flex-col gap-3">
        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter by status"
        >
          {TICKET_STATUS_FILTERS.map((filter) => {
            const active = status === filter.value;
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={active}
                onClick={() => onStatusChange(filter.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 sm:py-1.5 ${
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
          onSubmit={onSearchSubmit}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
          role="search"
        >
          <label className="relative min-w-0 flex-1 sm:max-w-md">
            <span className="sr-only">Search promo codes</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--dash-muted)]"
              aria-hidden
            />
            <input
              value={draftQ}
              onChange={(e) => onDraftQChange(e.target.value)}
              placeholder="Search promo codes..."
              className={DASH_INPUT_SEARCH_CLASS}
            />
          </label>
          <Button type="submit" variant="secondary" className="h-11 sm:h-9">
            Search
          </Button>
        </form>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
              Campaign
            </span>
            <select
              value={campaignId}
              onChange={(e) => onCampaignChange(e.target.value)}
              className={DASH_SELECT_CLASS}
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
              Purpose
            </span>
            <select
              value={purpose}
              onChange={(e) => onPurposeChange(e.target.value)}
              className={DASH_SELECT_CLASS}
            >
              <option value="">All purposes</option>
              {CAMPAIGN_PURPOSE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <details className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)]/40 sm:hidden">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-[var(--dash-ink-soft)] [&::-webkit-details-marker]:hidden">
            Date filters{hasDateFilters ? ' · active' : ''}
          </summary>
          <div className="grid gap-2 border-t border-[var(--dash-border)] p-3">
            <DateFilterFields
              createdFrom={createdFrom}
              createdTo={createdTo}
              expiresFrom={expiresFrom}
              expiresTo={expiresTo}
              onCreatedFromChange={onCreatedFromChange}
              onCreatedToChange={onCreatedToChange}
              onExpiresFromChange={onExpiresFromChange}
              onExpiresToChange={onExpiresToChange}
            />
          </div>
        </details>

        <div className="hidden gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          <DateFilterFields
            createdFrom={createdFrom}
            createdTo={createdTo}
            expiresFrom={expiresFrom}
            expiresTo={expiresTo}
            onCreatedFromChange={onCreatedFromChange}
            onCreatedToChange={onCreatedToChange}
            onExpiresFromChange={onExpiresFromChange}
            onExpiresToChange={onExpiresToChange}
          />
        </div>

        {onClearFilters ? (
          <div>
            <Button type="button" variant="ghost" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
