'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as brandingService from '../lib/api/brandingService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load and mutate workspace branding from the admin API.
 * (Distinct from WorkspaceProvider.useBranding which is static tenant display context.)
 */
export function useBrandingSettings({ enabled = true } = {}) {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setBranding(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await brandingService.getBranding();
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load branding. Please try again.', {
          resource: 'branding',
        }),
      );
      setBranding(null);
    } else {
      setBranding(result.data.branding);
    }
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    branding,
    loading,
    error,
    errorResult,
    reload,
    updateBranding: brandingService.updateBranding,
    uploadLogo: brandingService.uploadBrandingLogo,
    removeLogo: brandingService.removeBrandingLogo,
    getPreview: brandingService.getBrandingPreview,
  };
}

export default useBrandingSettings;
