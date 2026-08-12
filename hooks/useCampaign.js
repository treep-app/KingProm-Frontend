'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as campaignService from '../lib/api/campaignService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load a single campaign (+ stats when provided by the API).
 */
export function useCampaign(campaignId, { enabled = true } = {}) {
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && campaignId));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled || !campaignId) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setCampaign(null);
      setStats(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await campaignService.getCampaign(campaignId);
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load the campaign. Please try again.', {
          resource: 'campaign',
        }),
      );
      setCampaign(null);
      setStats(null);
    } else {
      setCampaign(result.data.campaign);
      setStats(result.data.stats || null);
    }
    setLoading(false);
  }, [enabled, campaignId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    campaign,
    stats,
    loading,
    error,
    errorResult,
    reload,
    updateCampaign: (payload) => campaignService.updateCampaign(campaignId, payload),
    generatePromoCodes: (opts) =>
      campaignService.generateCampaignPromoCodes(campaignId, opts),
    createCampaign: campaignService.createCampaign,
  };
}

export default useCampaign;
