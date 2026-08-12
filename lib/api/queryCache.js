/**
 * Tenant-scoped client query cache for authenticated dashboard reads.
 *
 * - Deduplicates in-flight identical requests
 * - Stale-while-revalidate for semi-dynamic lists
 * - Never caches mutations (POST/PATCH/DELETE)
 * - Never shares entries across tenants
 * - Private to the browser tab (memory only — not localStorage)
 *
 * Do NOT use for redemption validate/redeem or payment flows.
 */

import { getCurrentUser } from '../currentUser';
import { SESSION_CHANGED_EVENT } from '../auth';

/** @typedef {'stable' | 'semi' | 'realtime'} CachePolicy */

const TTL_MS = {
  stable: 5 * 60 * 1000,
  semi: 30 * 1000,
  realtime: 0,
};

const store = new Map();
const inflight = new Map();
const listeners = new Set();

function tenantScope() {
  const user = getCurrentUser();
  const tenantId = user?.tenantId || user?.organization?.id || 'anon';
  const userId = user?.id || 'anonymous';
  return `${tenantId}:${userId}`;
}

function notify() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      /* ignore subscriber errors */
    }
  }
}

export function subscribeQueryCache(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function buildCacheKey(resource, params = {}) {
  const scope = tenantScope();
  const stableParams = JSON.stringify(params, Object.keys(params).sort());
  return `${scope}|${resource}|${stableParams}`;
}

function isFresh(entry, policy) {
  const ttl = TTL_MS[policy] ?? TTL_MS.semi;
  if (ttl <= 0) return false;
  return Date.now() - entry.cachedAt < ttl;
}

/**
 * @param {object} options
 * @param {string} options.key — from buildCacheKey
 * @param {string[]} [options.tags]
 * @param {CachePolicy} [options.policy]
 * @param {() => Promise<any>} options.fetcher — must return adminFetch-style result
 * @param {boolean} [options.force]
 */
export async function queryCached({
  key,
  tags = [],
  policy = 'semi',
  fetcher,
  force = false,
}) {
  if (policy === 'realtime') {
    return fetcher();
  }

  const existing = store.get(key);
  if (!force && existing && isFresh(existing, policy)) {
    return existing.value;
  }

  if (!force && inflight.has(key)) {
    return inflight.get(key);
  }

  const promise = (async () => {
    const value = await fetcher();
    // Only cache successful authenticated reads
    if (value?.ok) {
      store.set(key, {
        value,
        cachedAt: Date.now(),
        tags: [...tags],
        policy,
        scope: tenantScope(),
      });
      notify();
    }
    return value;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

/** Return cached value without fetching (for SWR UI). */
export function peekCached(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.scope !== tenantScope()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function invalidateTags(tags = []) {
  if (!tags.length) return;
  const tagSet = new Set(tags);
  let removed = 0;
  for (const [key, entry] of store.entries()) {
    if (entry.tags?.some((t) => tagSet.has(t))) {
      store.delete(key);
      removed += 1;
    }
  }
  if (removed) notify();
}

export function invalidateAllForCurrentTenant() {
  const scope = tenantScope();
  let removed = 0;
  for (const [key, entry] of store.entries()) {
    if (entry.scope === scope || key.startsWith(`${scope}|`)) {
      store.delete(key);
      removed += 1;
    }
  }
  if (removed) notify();
}

export function clearQueryCache() {
  store.clear();
  inflight.clear();
  notify();
}

/** Dev-only metrics */
export function getQueryCacheStats() {
  if (process.env.NODE_ENV === 'production') return null;
  return {
    entries: store.size,
    inflight: inflight.size,
    keys: [...store.keys()],
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_CHANGED_EVENT, () => {
    clearQueryCache();
  });
}
