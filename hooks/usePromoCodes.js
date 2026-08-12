'use client';

import { useMemo } from 'react';
import * as promoCodeService from '../lib/api/promoCodeService';
import { CACHE_TAGS, INVALIDATION_MAP } from '../lib/api/cacheTags';
import { invalidateTags } from '../lib/api/queryCache';
import { messageFromApiResult } from '../lib/api/errors';
import { useAdminQuery } from './useAdminQuery';

/**
 * Paginated promo-code list for the authenticated tenant session.
 */
export function usePromoCodes(filters = {}, { enabled = true } = {}) {
  const {
    status = '',
    q = '',
    campaignId = '',
    purpose = '',
    createdFrom = '',
    createdTo = '',
    expiresFrom = '',
    expiresTo = '',
    limit = 25,
    offset = 0,
  } = filters;

  const params = useMemo(
    () => ({
      status,
      q,
      campaignId,
      purpose,
      createdFrom,
      createdTo,
      expiresFrom,
      expiresTo,
      limit,
      offset,
    }),
    [
      status,
      q,
      campaignId,
      purpose,
      createdFrom,
      createdTo,
      expiresFrom,
      expiresTo,
      limit,
      offset,
    ],
  );

  const { data, loading, refreshing, error, errorResult, reload } = useAdminQuery({
    resource: 'promo-codes:list',
    params,
    tags: [CACHE_TAGS.PROMO_CODES],
    policy: 'semi',
    enabled,
    queryFn: () => promoCodeService.listPromoCodes(params),
    mapError: (result) =>
      messageFromApiResult(result, 'Unable to load promo codes. Please try again.', {
        resource: 'promo',
      }),
  });

  async function issuePromoCode(payload) {
    const result = await promoCodeService.issuePromoCode(payload);
    if (result.ok) invalidateTags(INVALIDATION_MAP.promoGenerate);
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
    exportPromoCodes: promoCodeService.exportPromoCodes,
    issuePromoCode,
  };
}

export default usePromoCodes;
