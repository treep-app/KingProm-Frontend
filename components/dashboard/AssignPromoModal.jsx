'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import * as customerService from '../../lib/api/customerService';
import { messageFromApiResult } from '../../lib/api/errors';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import { customerDisplayName } from '../../lib/dashboard/customerFormat';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useCustomers } from '../../hooks/useCustomers';
import { useToast } from './ToastProvider';
import { Button } from './ui';

/**
 * Assign an unused promo code to a customer.
 * Opens with optional customerId, campaignId, and/or a fixed ticketId (promo detail).
 */
export default function AssignPromoModal({
  open,
  onClose,
  customerId: initialCustomerId = '',
  campaignId: initialCampaignId = '',
  ticketId: initialTicketId = '',
  promoCode: initialPromoCode = '',
  onSuccess,
}) {
  const toast = useToast();
  const lockedTicket = Boolean(initialTicketId);

  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [ticketId, setTicketId] = useState(initialTicketId || '');
  const [availableCodes, setAvailableCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { items: campaigns, loading: campaignsLoading } = useCampaigns({
    status: 'ACTIVE',
    limit: 100,
    enabled: open && !lockedTicket,
  });

  const { items: customerResults, loading: customersLoading } = useCustomers({
    q: customerQuery,
    limit: 8,
    enabled: open && !initialCustomerId && customerQuery.length >= 2,
  });

  useEffect(() => {
    if (!open) return;
    setCustomerId(initialCustomerId || '');
    setCampaignId(initialCampaignId || '');
    setTicketId(initialTicketId || '');
    setCustomerSearch('');
    setCustomerQuery('');
    setAvailableCodes([]);
  }, [open, initialCustomerId, initialCampaignId, initialTicketId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCustomerQuery(customerSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [customerSearch]);

  const loadAvailableCodes = useCallback(async () => {
    if (lockedTicket || !campaignId) {
      setAvailableCodes([]);
      return;
    }
    setCodesLoading(true);
    const result = await customerService.listAvailablePromoCodes({
      campaignId,
      limit: 100,
    });
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to load available promo codes.', {
          resource: 'promo',
        }),
      );
      setAvailableCodes([]);
    } else {
      setAvailableCodes(result.data.items || []);
    }
    setCodesLoading(false);
  }, [campaignId, lockedTicket, toast]);

  useEffect(() => {
    if (open && campaignId && !lockedTicket) loadAvailableCodes();
  }, [open, campaignId, lockedTicket, loadAvailableCodes]);

  if (!open) return null;

  async function handleAssign() {
    if (!customerId || !ticketId) {
      toast.error('Select a customer and promo code.');
      return;
    }
    setSubmitting(true);
    const result = await customerService.assignPromo(customerId, {
      ticketId,
      campaignId: campaignId || undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to assign the promo code. Please try again.', {
          resource: 'customer',
        }),
      );
      return;
    }

    toast.success(
      result.data.alreadyAssigned
        ? 'Promo code was already assigned to this customer'
        : 'Promo code assigned',
    );
    onSuccess?.(result.data);
    onClose?.();
  }

  const showCustomerPicker = !initialCustomerId;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Dismiss"
        disabled={submitting}
        onClick={() => {
          if (!submitting) onClose?.();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-promo-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="assign-promo-title" className="text-lg font-semibold text-[var(--dash-ink)]">
              Assign promo code
            </h2>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              {lockedTicket
                ? `Assign ${initialPromoCode || 'this code'} to a customer profile.`
                : 'Link an unused inventory code to a customer profile.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!submitting) onClose?.();
            }}
            className="rounded-lg p-1 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
          >
            <X className="size-4" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {showCustomerPicker ? (
            <div>
              <label htmlFor="assign-customer-search" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Customer
              </label>
              <input
                id="assign-customer-search"
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Search by name or email…"
                className={DASH_INPUT_CLASS}
              />
              {customerId ? (
                <p className="mt-1.5 text-xs text-[var(--dash-ink-soft)]">
                  Selected:{' '}
                  {customerDisplayName(
                    customerResults.find((c) => c.id === customerId) || { id: customerId },
                  )}
                </p>
              ) : null}
              {customerQuery.length >= 2 ? (
                <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[var(--dash-border)]">
                  {customersLoading ? (
                    <li className="px-3 py-2 text-sm text-[var(--dash-muted)]">Searching…</li>
                  ) : customerResults.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-[var(--dash-muted)]">No matches</li>
                  ) : (
                    customerResults.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerId(c.id);
                            setCustomerSearch(customerDisplayName(c));
                          }}
                          className={`flex w-full px-3 py-2 text-left text-sm hover:bg-[var(--dash-surface-2)] ${
                            customerId === c.id ? 'bg-[var(--dash-accent-soft)]' : ''
                          }`}
                        >
                          <span className="font-medium text-[var(--dash-ink)]">
                            {customerDisplayName(c)}
                          </span>
                          {c.email ? (
                            <span className="ml-2 truncate text-xs text-[var(--dash-muted)]">
                              {c.email}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </div>
          ) : null}

          {lockedTicket ? (
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--dash-muted)]">Promo code</p>
              <p className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-3 py-2 font-mono text-sm font-semibold text-[var(--dash-ink)]">
                {initialPromoCode || ticketId}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="assign-campaign" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                  Campaign
                </label>
                <select
                  id="assign-campaign"
                  value={campaignId}
                  onChange={(event) => {
                    setCampaignId(event.target.value);
                    setTicketId('');
                  }}
                  className={DASH_SELECT_CLASS}
                  disabled={campaignsLoading}
                >
                  <option value="">Select campaign…</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assign-code" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                  Available promo code
                </label>
                <select
                  id="assign-code"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
                  className={DASH_SELECT_CLASS}
                  disabled={!campaignId || codesLoading}
                >
                  <option value="">
                    {!campaignId
                      ? 'Select a campaign first'
                      : codesLoading
                        ? 'Loading codes…'
                        : availableCodes.length
                          ? 'Select code…'
                          : 'No unused codes for this campaign'}
                  </option>
                  {availableCodes.map((code) => (
                    <option key={code.id} value={code.id}>
                      {code.promoCode}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting || !customerId || !ticketId}
            onClick={handleAssign}
            className="w-full sm:w-auto"
          >
            {submitting ? 'Assigning…' : 'Assign promo code'}
          </Button>
        </div>
      </div>
    </div>
  );
}
