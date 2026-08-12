/**
 * Email campaign API service.
 * UI → hooks → emailCampaignService → admin HTTP client → backend.
 *
 * Does not accept tenantId from callers — tenant scope is enforced by the backend.
 * Never log email addresses in this module.
 */

import {
  adminFetch,
  adminHeaders,
  omitClientTenantOverrides,
} from './client';

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') qs.set(key, String(value));
  });
  return qs.toString();
}

/** GET /api/admin/email-campaigns/meta */
export async function getEmailCampaignMeta() {
  return adminFetch('/api/admin/email-campaigns/meta', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/email-campaigns */
export async function listEmailCampaigns({
  q = '',
  status = '',
  promotionCampaignId = '',
  sort = 'createdAt',
  sortDir = 'desc',
  limit = 25,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({
    q,
    status,
    promotionCampaignId,
    sort,
    sortDir,
    limit,
    offset,
  });
  const query = buildQuery({
    q: safe.q,
    status: safe.status,
    promotionCampaignId: safe.promotionCampaignId,
    sort: safe.sort ?? 'createdAt',
    sortDir: safe.sortDir ?? 'desc',
    limit: safe.limit ?? 25,
    offset: safe.offset ?? 0,
  });
  return adminFetch(`/api/admin/email-campaigns?${query}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/email-campaigns/:id */
export async function getEmailCampaign(id) {
  return adminFetch(`/api/admin/email-campaigns/${encodeURIComponent(id)}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/email-campaigns */
export async function createEmailCampaign(payload) {
  const body = omitClientTenantOverrides(payload || {});
  return adminFetch('/api/admin/email-campaigns', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** PATCH /api/admin/email-campaigns/:id */
export async function updateEmailCampaign(id, payload) {
  const body = omitClientTenantOverrides(payload || {});
  return adminFetch(`/api/admin/email-campaigns/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** DELETE /api/admin/email-campaigns/:id (draft only) */
export async function deleteEmailCampaign(id) {
  return adminFetch(`/api/admin/email-campaigns/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

/** POST /api/admin/email-campaigns/:id/duplicate */
export async function duplicateEmailCampaign(id) {
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/duplicate`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
}

/** POST /api/admin/email-campaigns/audience/preview */
export async function previewEmailCampaignAudience({ audience } = {}) {
  const body = omitClientTenantOverrides({ audience });
  return adminFetch('/api/admin/email-campaigns/audience/preview', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/email-campaigns/:id/validate */
export async function validateEmailCampaign(id) {
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/validate`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
}

/** POST /api/admin/email-campaigns/preview or /:id/preview */
export async function previewEmailCampaign(idOrPayload, maybePayload) {
  if (typeof idOrPayload === 'string' && idOrPayload) {
    const body = omitClientTenantOverrides(maybePayload || {});
    return adminFetch(
      `/api/admin/email-campaigns/${encodeURIComponent(idOrPayload)}/preview`,
      {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(body),
      },
    );
  }
  const body = omitClientTenantOverrides(idOrPayload || {});
  return adminFetch('/api/admin/email-campaigns/preview', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/email-campaigns/test or /:id/test */
export async function sendEmailCampaignTest(idOrPayload, maybePayload) {
  if (typeof idOrPayload === 'string' && idOrPayload) {
    const body = omitClientTenantOverrides(maybePayload || {});
    return adminFetch(
      `/api/admin/email-campaigns/${encodeURIComponent(idOrPayload)}/test`,
      {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(body),
      },
    );
  }
  const body = omitClientTenantOverrides(idOrPayload || {});
  return adminFetch('/api/admin/email-campaigns/test', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/email-campaigns/:id/schedule */
export async function scheduleEmailCampaign(id, { scheduledAt, timezone } = {}) {
  const body = omitClientTenantOverrides({ scheduledAt, timezone });
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/schedule`,
    {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(body),
    },
  );
}

/** POST /api/admin/email-campaigns/:id/send */
export async function sendEmailCampaignNow(id, { idempotencyKey } = {}) {
  const body = omitClientTenantOverrides({ idempotencyKey });
  const headers = adminHeaders(
    idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  );
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/send`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
  );
}

/** POST /api/admin/email-campaigns/:id/cancel */
export async function cancelEmailCampaign(id) {
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
}

/** POST /api/admin/email-campaigns/:id/pause */
export async function pauseEmailCampaign(id) {
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/pause`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
}

/** POST /api/admin/email-campaigns/:id/resume */
export async function resumeEmailCampaign(id) {
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/resume`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
}

/** GET /api/admin/email-campaigns/:id/recipients */
export async function listEmailCampaignRecipients(
  id,
  { status = '', limit = 25, offset = 0 } = {},
) {
  const safe = omitClientTenantOverrides({ status, limit, offset });
  const query = buildQuery({
    status: safe.status,
    limit: safe.limit ?? 25,
    offset: safe.offset ?? 0,
  });
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/recipients?${query}`,
    {
      headers: adminHeaders(),
      cache: 'no-store',
    },
  );
}

/** GET /api/admin/email-campaigns/:id/analytics */
export async function getEmailCampaignAnalytics(id) {
  return adminFetch(
    `/api/admin/email-campaigns/${encodeURIComponent(id)}/analytics`,
    {
      headers: adminHeaders(),
      cache: 'no-store',
    },
  );
}

/** POST /api/admin/email-campaigns/process */
export async function processEmailCampaignJobs({
  batchSize = 15,
  maxCampaigns = 5,
} = {}) {
  const body = omitClientTenantOverrides({ batchSize, maxCampaigns });
  return adminFetch('/api/admin/email-campaigns/process', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}
