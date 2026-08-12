'use client';

import { useMemo } from 'react';
import * as redemptionService from '../lib/api/redemptionService';
import { CACHE_TAGS } from '../lib/api/cacheTags';
import { messageFromApiResult } from '../lib/api/errors';
import { useAdminQuery } from './useAdminQuery';

/**
 * List redemptions for the authenticated tenant session.
 * Validate/redeem stay uncached (realtime mutations).
 */
export function useRedemptions({
  q = '',
  status = '',
  campaignId = '',
  locationKey = '',
  channel = '',
  customerId = '',
  from = '',
  to = '',
  limit = 25,
  offset = 0,
  enabled = true,
} = {}) {
  const params = useMemo(
    () => ({
      q,
      status,
      campaignId,
      locationKey,
      channel,
      customerId,
      from,
      to,
      limit,
      offset,
    }),
    [q, status, campaignId, locationKey, channel, customerId, from, to, limit, offset],
  );

  const { data, loading, refreshing, error, errorResult, reload } = useAdminQuery({
    resource: 'redemptions:list',
    params,
    tags: [CACHE_TAGS.REDEMPTIONS],
    policy: 'semi',
    enabled,
    queryFn: () => redemptionService.listRedemptions(params),
    mapError: (result) =>
      messageFromApiResult(result, 'Unable to load redemptions. Please try again.', {
        resource: 'redemption',
      }),
  });

  return {
    items: data?.items || [],
    total: data?.total ?? 0,
    loading,
    refreshing,
    error,
    errorResult,
    reload,
    listRedemptionLocations: redemptionService.listRedemptionLocations,
    validateRedemption: redemptionService.validateRedemption,
    redeemVoucher: redemptionService.redeemVoucher,
  };
}

export default useRedemptions;
