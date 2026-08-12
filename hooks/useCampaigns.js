'use client';

import { useMemo } from 'react';
import * as campaignService from '../lib/api/campaignService';
import { CACHE_TAGS, INVALIDATION_MAP } from '../lib/api/cacheTags';
import { invalidateTags } from '../lib/api/queryCache';
import { messageFromApiResult } from '../lib/api/errors';
import { useAdminQuery } from './useAdminQuery';

/**
 * List campaigns for the authenticated tenant session.
 */
export function useCampaigns({
  status = '',
  q = '',
  limit = 50,
  offset = 0,
  enabled = true,
} = {}) {
  const params = useMemo(
    () => ({ status, q, limit, offset }),
    [status, q, limit, offset],
  );

  const { data, loading, refreshing, error, errorResult, reload } = useAdminQuery({
    resource: 'campaigns:list',
    params,
    tags: [CACHE_TAGS.CAMPAIGNS],
    policy: 'semi',
    enabled,
    queryFn: () => campaignService.listCampaigns(params),
    mapError: (result) =>
      messageFromApiResult(result, 'Unable to load campaigns. Please try again.', {
        resource: 'campaign',
      }),
  });

  async function createCampaign(payload) {
    const result = await campaignService.createCampaign(payload);
    if (result.ok) invalidateTags(INVALIDATION_MAP.campaignCreate);
    return result;
  }

  async function updateCampaign(id, payload) {
    const result = await campaignService.updateCampaign(id, payload);
    if (result.ok) invalidateTags(INVALIDATION_MAP.campaignUpdate);
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
    createCampaign,
    updateCampaign,
  };
}

export default useCampaigns;
