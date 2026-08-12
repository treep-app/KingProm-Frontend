'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as templateService from '../lib/api/templateService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Active templates for select lists (campaigns, branding default).
 */
export function useActiveTemplates({ enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setItems([]);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await templateService.listActiveTemplates();
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load templates. Please try again.', {
          resource: 'template',
        }),
      );
      setItems([]);
    } else {
      setItems(result.data.items || []);
    }
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, errorResult, reload };
}

export default useActiveTemplates;
