'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as emailCampaignService from '../lib/api/emailCampaignService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load a single email campaign with optional analytics refresh.
 */
export function useEmailCampaign(campaignId, { enabled = true, loadAnalytics = false } = {}) {
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && campaignId));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled || !campaignId) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setCampaign(null);
      setAnalytics(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const [campaignResult, analyticsResult] = await Promise.all([
      emailCampaignService.getEmailCampaign(campaignId),
      loadAnalytics
        ? emailCampaignService.getEmailCampaignAnalytics(campaignId)
        : Promise.resolve(null),
    ]);

    if (!campaignResult.ok) {
      setErrorResult(campaignResult);
      setError(
        messageFromApiResult(campaignResult, 'Unable to load the email campaign. Please try again.', {
          resource: 'email campaign',
        }),
      );
      setCampaign(null);
      setAnalytics(null);
    } else {
      setCampaign(campaignResult.data.campaign);
      if (analyticsResult?.ok) {
        setAnalytics(analyticsResult.data.analytics || null);
      } else if (loadAnalytics) {
        setAnalytics(null);
      }
    }
    setLoading(false);
  }, [enabled, campaignId, loadAnalytics]);

  useEffect(() => {
    reload();
  }, [reload]);

  const refreshAnalytics = useCallback(async () => {
    if (!campaignId) return null;
    const result = await emailCampaignService.getEmailCampaignAnalytics(campaignId);
    if (result.ok) {
      setAnalytics(result.data.analytics || null);
    }
    return result;
  }, [campaignId]);

  return {
    campaign,
    analytics,
    loading,
    error,
    errorResult,
    reload,
    refreshAnalytics,
    updateEmailCampaign: (payload) =>
      emailCampaignService.updateEmailCampaign(campaignId, payload),
    deleteEmailCampaign: () => emailCampaignService.deleteEmailCampaign(campaignId),
    duplicateEmailCampaign: () => emailCampaignService.duplicateEmailCampaign(campaignId),
    validateEmailCampaign: () => emailCampaignService.validateEmailCampaign(campaignId),
    previewEmailCampaign: (payload) =>
      emailCampaignService.previewEmailCampaign(campaignId, payload),
    sendEmailCampaignTest: (payload) =>
      emailCampaignService.sendEmailCampaignTest(campaignId, payload),
    scheduleEmailCampaign: (opts) =>
      emailCampaignService.scheduleEmailCampaign(campaignId, opts),
    sendEmailCampaignNow: (opts) =>
      emailCampaignService.sendEmailCampaignNow(campaignId, opts),
    cancelEmailCampaign: () => emailCampaignService.cancelEmailCampaign(campaignId),
    pauseEmailCampaign: () => emailCampaignService.pauseEmailCampaign(campaignId),
    resumeEmailCampaign: () => emailCampaignService.resumeEmailCampaign(campaignId),
    listRecipients: (opts) =>
      emailCampaignService.listEmailCampaignRecipients(campaignId, opts),
  };
}

export default useEmailCampaign;
