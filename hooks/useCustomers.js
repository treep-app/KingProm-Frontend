'use client';

import { useMemo } from 'react';
import * as customerService from '../lib/api/customerService';
import { CACHE_TAGS, INVALIDATION_MAP } from '../lib/api/cacheTags';
import { invalidateTags } from '../lib/api/queryCache';
import { messageFromApiResult } from '../lib/api/errors';
import { useAdminQuery } from './useAdminQuery';

export function useCustomers({
  q = '',
  status = '',
  tag = '',
  activity = '',
  promoActivity = '',
  sort = 'createdAt',
  sortDir = 'desc',
  createdFrom = '',
  lastActivityFrom = '',
  limit = 25,
  offset = 0,
  enabled = true,
} = {}) {
  const params = useMemo(
    () => ({
      q,
      status,
      tag,
      activity,
      promoActivity,
      sort,
      sortDir,
      createdFrom,
      lastActivityFrom,
      limit,
      offset,
    }),
    [
      q,
      status,
      tag,
      activity,
      promoActivity,
      sort,
      sortDir,
      createdFrom,
      lastActivityFrom,
      limit,
      offset,
    ],
  );

  const { data, loading, refreshing, error, errorResult, reload } = useAdminQuery({
    resource: 'customers:list',
    params,
    tags: [CACHE_TAGS.CUSTOMERS],
    policy: 'semi',
    enabled,
    queryFn: () => customerService.listCustomers(params),
    mapError: (result) =>
      messageFromApiResult(result, 'Unable to load customers. Please try again.', {
        resource: 'customer',
      }),
  });

  async function createCustomer(payload) {
    const result = await customerService.createCustomer(payload);
    if (result.ok) invalidateTags(INVALIDATION_MAP.customerCreate);
    return result;
  }

  async function updateCustomer(id, payload) {
    const result = await customerService.updateCustomer(id, payload);
    if (result.ok) invalidateTags(INVALIDATION_MAP.customerUpdate);
    return result;
  }

  return {
    items: data?.items || [],
    total: data?.total || 0,
    loading,
    refreshing,
    error,
    errorResult,
    reload,
    createCustomer,
    updateCustomer,
  };
}

export default useCustomers;
