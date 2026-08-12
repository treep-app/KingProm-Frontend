'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as redemptionService from '../lib/api/redemptionService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load a single redemption with validation history.
 */
export function useRedemption(redemptionId, { enabled = true } = {}) {
  const [redemption, setRedemption] = useState(null);
  const [validationHistory, setValidationHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && redemptionId));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled || !redemptionId) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setRedemption(null);
      setValidationHistory([]);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await redemptionService.getRedemption(redemptionId);
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load the redemption. Please try again.', {
          resource: 'redemption',
        }),
      );
      setRedemption(null);
      setValidationHistory([]);
    } else {
      setRedemption(result.data.redemption || null);
      setValidationHistory(result.data.validationHistory || []);
    }
    setLoading(false);
  }, [enabled, redemptionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    redemption,
    validationHistory,
    loading,
    error,
    errorResult,
    reload,
  };
}

export default useRedemption;
