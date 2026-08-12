/**
 * Customer API service.
 * UI → hooks → customerService → admin HTTP client → backend.
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

/** GET /api/admin/customers/stats */
export async function getCustomerStats() {
  return adminFetch('/api/admin/customers/stats', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/customers */
export async function listCustomers({
  q = '',
  status = '',
  tag = '',
  activity = '',
  promoActivity = '',
  createdFrom = '',
  createdTo = '',
  lastActivityFrom = '',
  lastActivityTo = '',
  sort = 'createdAt',
  sortDir = 'desc',
  limit = 25,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({
    q,
    status,
    tag,
    activity,
    promoActivity,
    createdFrom,
    createdTo,
    lastActivityFrom,
    lastActivityTo,
    sort,
    sortDir,
    limit,
    offset,
  });

  const params = new URLSearchParams();
  if (safe.q) params.set('q', safe.q);
  if (safe.status) params.set('status', safe.status);
  if (safe.tag) params.set('tag', safe.tag);
  if (safe.activity) params.set('activity', safe.activity);
  if (safe.promoActivity) params.set('promoActivity', safe.promoActivity);
  if (safe.createdFrom) params.set('createdFrom', safe.createdFrom);
  if (safe.createdTo) params.set('createdTo', safe.createdTo);
  if (safe.lastActivityFrom) params.set('lastActivityFrom', safe.lastActivityFrom);
  if (safe.lastActivityTo) params.set('lastActivityTo', safe.lastActivityTo);
  if (safe.sort) params.set('sort', safe.sort);
  if (safe.sortDir) params.set('sortDir', safe.sortDir);
  params.set('limit', String(safe.limit ?? 25));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(`/api/admin/customers?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/customers/:id */
export async function getCustomer(id) {
  return adminFetch(`/api/admin/customers/${encodeURIComponent(id)}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/customers */
export async function createCustomer(payload) {
  const body = omitClientTenantOverrides(payload || {});
  const result = await adminFetch('/api/admin/customers', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  return withInvalidation(result, INVALIDATION_MAP.customerCreate);
}

/** PATCH /api/admin/customers/:id */
export async function updateCustomer(id, payload) {
  const body = omitClientTenantOverrides(payload || {});
  const result = await adminFetch(`/api/admin/customers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  return withInvalidation(result, INVALIDATION_MAP.customerUpdate);
}

/** POST /api/admin/customers/:id/archive */
export async function archiveCustomer(id) {
  const result = await adminFetch(
    `/api/admin/customers/${encodeURIComponent(id)}/archive`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
  return withInvalidation(result, INVALIDATION_MAP.customerArchive);
}

/** POST /api/admin/customers/check-duplicates */
export async function checkDuplicates({ email, phone, excludeId } = {}) {
  const body = omitClientTenantOverrides({ email, phone, excludeId });
  return adminFetch('/api/admin/customers/check-duplicates', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** GET /api/admin/customers/:id/activity */
export async function getCustomerActivity(id, { limit = 50, offset = 0 } = {}) {
  const safe = omitClientTenantOverrides({ limit, offset });
  const params = new URLSearchParams();
  params.set('limit', String(safe.limit ?? 50));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(
    `/api/admin/customers/${encodeURIComponent(id)}/activity?${params}`,
    {
      headers: adminHeaders(),
      cache: 'no-store',
    },
  );
}

/** POST /api/admin/customers/:id/notes */
export async function addCustomerNote(id, { note } = {}) {
  const body = omitClientTenantOverrides({ note });
  return adminFetch(`/api/admin/customers/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** GET /api/admin/customers/:id/promo-codes */
export async function getCustomerPromoCodes(id, { limit = 50, offset = 0 } = {}) {
  const safe = omitClientTenantOverrides({ limit, offset });
  const params = new URLSearchParams();
  params.set('limit', String(safe.limit ?? 50));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(
    `/api/admin/customers/${encodeURIComponent(id)}/promo-codes?${params}`,
    {
      headers: adminHeaders(),
      cache: 'no-store',
    },
  );
}

/** POST /api/admin/customers/:id/assign-promo */
export async function assignPromo(customerId, { ticketId, campaignId } = {}) {
  const body = omitClientTenantOverrides({ ticketId, campaignId });
  const result = await adminFetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}/assign-promo`,
    {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(body),
    },
  );
  return withInvalidation(result, INVALIDATION_MAP.promoAssign);
}

/** GET /api/admin/customers/available-promo-codes */
export async function listAvailablePromoCodes({
  campaignId = '',
  limit = 50,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({ campaignId, limit, offset });
  const params = new URLSearchParams();
  if (safe.campaignId) params.set('campaignId', safe.campaignId);
  params.set('limit', String(safe.limit ?? 50));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(`/api/admin/customers/available-promo-codes?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/customers/import/preview */
export async function previewImport({ csvText, mapping } = {}) {
  const body = omitClientTenantOverrides({ csvText, mapping });
  return adminFetch('/api/admin/customers/import/preview', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/customers/import */
export async function commitImport({ csvText, mapping, skipDuplicates = true } = {}) {
  const body = omitClientTenantOverrides({ csvText, mapping, skipDuplicates });
  return adminFetch('/api/admin/customers/import', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}
