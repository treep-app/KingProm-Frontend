/**
 * Campaign API service.
 * UI → hooks → campaignService → admin HTTP client → backend.
 *
 * Does not accept tenantId from callers — tenant scope is enforced by the backend.
 */

import {
  adminFetch,
  adminHeaders,
  omitClientTenantOverrides,
} from './client';
import { INVALIDATION_MAP } from './cacheTags';
import { invalidateTags } from './queryCache';

async function withInvalidation(result, tags) {
  if (result?.ok) invalidateTags(tags);
  return result;
}

/** GET /api/admin/campaigns */
export async function listCampaigns({
  status = '',
  q = '',
  limit = 50,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({ status, q, limit, offset });
  const params = new URLSearchParams();
  if (safe.status) params.set('status', safe.status);
  if (safe.q) params.set('q', safe.q);
  params.set('limit', String(safe.limit ?? 50));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(`/api/admin/campaigns?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/campaigns/:id */
export async function getCampaign(id) {
  return adminFetch(`/api/admin/campaigns/${encodeURIComponent(id)}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/campaigns */
export async function createCampaign(payload) {
  const body = omitClientTenantOverrides(payload || {});
  const result = await adminFetch('/api/admin/campaigns', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  return withInvalidation(result, INVALIDATION_MAP.campaignCreate);
}

/** PATCH /api/admin/campaigns/:id */
export async function updateCampaign(id, payload) {
  const body = omitClientTenantOverrides(payload || {});
  const result = await adminFetch(`/api/admin/campaigns/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  return withInvalidation(result, INVALIDATION_MAP.campaignUpdate);
}

/**
 * POST /api/admin/campaigns/:id/promo-codes/generate
 * Codes are generated on the server — never in the browser.
 */
export async function generateCampaignPromoCodes(id, { quantity, prefix } = {}) {
  const body = omitClientTenantOverrides({ quantity, prefix });
  const result = await adminFetch(
    `/api/admin/campaigns/${encodeURIComponent(id)}/promo-codes/generate`,
    {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(body),
    },
  );
  return withInvalidation(result, INVALIDATION_MAP.promoGenerate);
}

/** GET /api/admin/analytics/summary — prefer analyticsService for new call sites */
export { getAnalyticsSummary } from './analyticsService';
