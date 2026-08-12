'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as customerService from '../lib/api/customerService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load a single customer profile.
 */
export function useCustomer(customerId, { enabled = true } = {}) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && customerId));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled || !customerId) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setCustomer(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await customerService.getCustomer(customerId);
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load the customer. Please try again.', {
          resource: 'customer',
        }),
      );
      setCustomer(null);
    } else {
      setCustomer(result.data.customer);
    }
    setLoading(false);
  }, [enabled, customerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    customer,
    loading,
    error,
    errorResult,
    reload,
    updateCustomer: (payload) => customerService.updateCustomer(customerId, payload),
    archiveCustomer: () => customerService.archiveCustomer(customerId),
    addNote: (note) => customerService.addCustomerNote(customerId, { note }),
    assignPromo: (opts) => customerService.assignPromo(customerId, opts),
  };
}

export default useCustomer;
