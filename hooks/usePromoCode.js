'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as promoCodeService from '../lib/api/promoCodeService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load a single promo code (+ campaign summary when provided).
 */
export function usePromoCode(ticketId, { enabled = true } = {}) {
  const [ticket, setTicket] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && ticketId));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled || !ticketId) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setTicket(null);
      setCampaign(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await promoCodeService.getPromoCode(ticketId);
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load the promo code. Please try again.', {
          resource: 'promo',
        }),
      );
      setTicket(null);
      setCampaign(null);
    } else {
      setTicket(result.data.ticket);
      setCampaign(result.data.campaign || null);
    }
    setLoading(false);
  }, [enabled, ticketId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    ticket,
    campaign,
    loading,
    error,
    errorResult,
    reload,
    cancelPromoCode: () => promoCodeService.cancelPromoCode(ticketId),
    assignCustomer: ({ customerId, campaignId } = {}) =>
      promoCodeService.assignPromoCodeCustomer({ ticketId, customerId, campaignId }),
  };
}

export default usePromoCode;
