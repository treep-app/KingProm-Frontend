'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as analyticsService from '../lib/api/analyticsService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load the full Phase 7 analytics dashboard payload from the backend.
 */
export function useAnalyticsDashboard(range = {}, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const rangeKey = JSON.stringify({
    preset: range.preset || null,
    days: range.days ?? null,
    from: range.from || null,
    to: range.to || null,
    campaignId: range.campaignId || '',
  });

  const reload = useCallback(async () => {
    if (!enabled) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setData(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await analyticsService.getDashboardAnalytics(range);
    if (!result.ok) {
      setErrorResult(result);
      setError(messageFromApiResult(result, 'Unable to load analytics.'));
      setData(null);
    } else {
      setData(result.data);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rangeKey captures filter identity
  }, [enabled, rangeKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    loading,
    error,
    errorResult,
    reload,
  };
}

export default useAnalyticsDashboard;
