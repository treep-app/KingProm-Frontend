'use client';

import * as customerService from '../lib/api/customerService';
import { CACHE_TAGS } from '../lib/api/cacheTags';
import { messageFromApiResult } from '../lib/api/errors';
import { useAdminQuery } from './useAdminQuery';

/**
 * Load customer KPI stats from GET /customers/stats.
 */
export function useCustomerStats({ enabled = true } = {}) {
  const { data, loading, refreshing, error, errorResult, reload } = useAdminQuery({
    resource: 'customers:stats',
    params: {},
    tags: [CACHE_TAGS.CUSTOMER_STATS],
    policy: 'semi',
    enabled,
    queryFn: () => customerService.getCustomerStats(),
    mapError: (result) =>
      messageFromApiResult(result, 'Unable to load customer stats. Please try again.', {
        resource: 'customer',
      }),
  });

  return {
    stats: data?.stats || null,
    loading,
    refreshing,
    error,
    errorResult,
    reload,
  };
}

export default useCustomerStats;
