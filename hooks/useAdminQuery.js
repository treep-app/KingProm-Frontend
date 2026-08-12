'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import {
  buildCacheKey,
  peekCached,
  queryCached,
  subscribeQueryCache,
} from '../lib/api/queryCache';

/**
 * Stale-while-revalidate admin query hook.
 * Shows cached data immediately, then refreshes in the background.
 */
export function useAdminQuery({
  resource,
  params = {},
  tags = [],
  policy = 'semi',
  enabled = true,
  queryFn,
  mapError,
} = {}) {
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const tagsKey = useMemo(() => JSON.stringify(tags), [tags]);
  const cacheKey = useMemo(
    () => buildCacheKey(resource, JSON.parse(paramsKey)),
    [resource, paramsKey],
  );

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const mapErrorRef = useRef(mapError);
  mapErrorRef.current = mapError;
  const tagsRef = useRef(tags);
  tagsRef.current = tags;
  const policyRef = useRef(policy);
  policyRef.current = policy;

  const [data, setData] = useState(() => {
    const cached = peekCached(cacheKey);
    return cached?.ok ? cached.data : null;
  });
  const [loading, setLoading] = useState(() => {
    if (!enabled) return false;
    return !peekCached(cacheKey)?.ok;
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const applyResult = useCallback(
    (result) => {
      if (!result.ok) {
        setErrorResult(result);
        setError(
          mapErrorRef.current
            ? mapErrorRef.current(result)
            : result.data?.message || 'Unable to load data.',
        );
        if (!peekCached(cacheKey)?.ok) setData(null);
        return;
      }
      setError('');
      setErrorResult(null);
      setData(result.data);
    },
    [cacheKey],
  );

  const reload = useCallback(
    async ({ force = true } = {}) => {
      if (!enabled) return null;
      if (!hasAdminKey()) {
        setLoading(false);
        setRefreshing(false);
        setData(null);
        setError('Your session expired. Please sign in again.');
        setErrorResult({ status: 401, ok: false });
        return null;
      }

      const hasCache = Boolean(peekCached(cacheKey)?.ok);
      if (hasCache) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await queryCached({
          key: cacheKey,
          tags: tagsRef.current,
          policy: policyRef.current,
          force,
          fetcher: () => queryFnRef.current(),
        });
        applyResult(result);
        return result;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, cacheKey, applyResult],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const warm = peekCached(cacheKey);
    if (warm?.ok) {
      setData(warm.data);
      setLoading(false);
      void reload({ force: false });
    } else {
      void reload({ force: true });
    }

    return subscribeQueryCache(() => {
      const next = peekCached(cacheKey);
      if (next?.ok) setData(next.data);
    });
    // tagsKey kept so tag identity changes still re-subscribe cleanly
  }, [enabled, cacheKey, tagsKey, reload]);

  return {
    data,
    loading,
    refreshing,
    error,
    errorResult,
    reload: () => reload({ force: true }),
    cacheKey,
  };
}

export default useAdminQuery;
