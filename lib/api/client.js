/**
 * Shared admin HTTP client.
 * Components must not call fetch() directly — use campaignService / promoCodeService / auth helpers.
 *
 * Tenant isolation: never send a client-chosen tenantId. Scope comes from the
 * authenticated session (backend) and deploy branding context (frontend display only).
 */

import {
  getAuthToken,
  clearSession,
  setSession,
  getLegacyAdminKey,
} from '../auth';

const CLIENT_TENANT_KEYS = [
  'tenantId',
  'tenant_id',
  'tenant',
  'businessId',
  'business_id',
  'organizationId',
  'organization_id',
];

export class AdminApiNotImplementedError extends Error {
  constructor(method, note) {
    super(
      `[admin API] ${method} is not implemented yet.${note ? ` ${note}` : ''} ` +
        'Backend endpoint does not exist — define the contract before wiring UI data.',
    );
    this.name = 'AdminApiNotImplementedError';
    this.code = 'NOT_IMPLEMENTED';
    this.method = method;
  }
}

export function getAdminKey() {
  return getAuthToken();
}

export function hasAdminKey() {
  return Boolean(getAuthToken());
}

/**
 * Drop any client-supplied tenant override fields.
 * Callers must not be able to pivot into another business via query/body.
 */
export function omitClientTenantOverrides(input) {
  if (!input || typeof input !== 'object') return input;
  const next = { ...input };
  for (const key of CLIENT_TENANT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(next, key)) {
      delete next[key];
    }
  }
  return next;
}

export function adminHeaders(extra = {}) {
  const key = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
    ...extra,
  };
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function finalizeAuth(res, data) {
  if (res.status === 401) {
    clearSession();
  }
  return { ok: res.ok, status: res.status, data, networkError: false };
}

/**
 * Fetch wrapper that never throws for network failures.
 */
export async function adminFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await parseJson(res);
    return finalizeAuth(res, data);
  } catch {
    return {
      ok: false,
      status: 0,
      networkError: true,
      data: {
        status: 'NETWORK_ERROR',
        message: 'Network error. Check your connection and try again.',
      },
    };
  }
}

export { setSession, getLegacyAdminKey };
