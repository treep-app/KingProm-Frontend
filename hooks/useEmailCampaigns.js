'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as emailCampaignService from '../lib/api/emailCampaignService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * List email campaigns for the authenticated tenant session.
 */
export function useEmailCampaigns({
  q = '',
  status = '',
  promotionCampaignId = '',
  sort = 'createdAt',
  sortDir = 'desc',
  limit = 25,
  offset = 0,
  enabled = true,
} = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setItems([]);
      setTotal(0);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await emailCampaignService.listEmailCampaigns({
      q,
      status,
      promotionCampaignId,
      sort,
      sortDir,
      limit,
      offset,
    });
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load email campaigns. Please try again.', {
          resource: 'email campaign',
        }),
      );
      setItems([]);
      setTotal(0);
    } else {
      setItems(result.data.items || []);
      setTotal(result.data.total || 0);
    }
    setLoading(false);
  }, [enabled, q, status, promotionCampaignId, sort, sortDir, limit, offset]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    items,
    total,
    loading,
    error,
    errorResult,
    reload,
    createEmailCampaign: emailCampaignService.createEmailCampaign,
    duplicateEmailCampaign: emailCampaignService.duplicateEmailCampaign,
    deleteEmailCampaign: emailCampaignService.deleteEmailCampaign,
  };
}

export default useEmailCampaigns;
