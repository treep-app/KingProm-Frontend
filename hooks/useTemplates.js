'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as templateService from '../lib/api/templateService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * List voucher templates for the authenticated tenant session.
 */
export function useTemplates({
  q = '',
  category = '',
  status = '',
  sort = 'updatedAt',
  sortDir = 'desc',
  limit = 50,
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

    const result = await templateService.listTemplates({
      q,
      category,
      status,
      sort,
      sortDir,
      limit,
      offset,
    });

    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load templates. Please try again.', {
          resource: 'template',
        }),
      );
      setItems([]);
      setTotal(0);
    } else {
      setItems(result.data.items || []);
      setTotal(result.data.total || 0);
    }
    setLoading(false);
  }, [enabled, q, category, status, sort, sortDir, limit, offset]);

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
    duplicateTemplate: templateService.duplicateTemplate,
    archiveTemplate: templateService.archiveTemplate,
    setDefaultTemplate: templateService.setDefaultTemplate,
  };
}

export default useTemplates;
