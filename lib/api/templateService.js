/**
 * Voucher template API service.
 * UI → hooks → templateService → admin HTTP client → backend.
 */

import {
  adminFetch,
  adminHeaders,
  omitClientTenantOverrides,
} from './client';

export { fetchAssetBlobUrl } from './brandingService';

/** GET /api/admin/templates/meta */
export async function getTemplateMeta() {
  return adminFetch('/api/admin/templates/meta', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/templates */
export async function listTemplates({
  q = '',
  category = '',
  status = '',
  sort = 'updatedAt',
  sortDir = 'desc',
  limit = 50,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({
    q,
    category,
    status,
    sort,
    sortDir,
    limit,
    offset,
  });

  const params = new URLSearchParams();
  if (safe.q) params.set('q', safe.q);
  if (safe.category) params.set('category', safe.category);
  if (safe.status) params.set('status', safe.status);
  if (safe.sort) params.set('sort', safe.sort);
  if (safe.sortDir) params.set('sortDir', safe.sortDir);
  params.set('limit', String(safe.limit ?? 50));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(`/api/admin/templates?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/templates/active */
export async function listActiveTemplates() {
  return adminFetch('/api/admin/templates/active', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/templates/:id */
export async function getTemplate(id) {
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/templates */
export async function createTemplate(payload) {
  const body = omitClientTenantOverrides(payload || {});
  return adminFetch('/api/admin/templates', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** PATCH /api/admin/templates/:id */
export async function updateTemplate(id, payload) {
  const body = omitClientTenantOverrides(payload || {});
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/templates/:id/duplicate */
export async function duplicateTemplate(id) {
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
    headers: adminHeaders(),
  });
}

/** POST /api/admin/templates/:id/archive */
export async function archiveTemplate(id) {
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}/archive`, {
    method: 'POST',
    headers: adminHeaders(),
  });
}

/** POST /api/admin/templates/:id/set-default */
export async function setDefaultTemplate(id) {
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}/set-default`, {
    method: 'POST',
    headers: adminHeaders(),
  });
}

/** POST /api/admin/templates/:id/logo */
export async function uploadTemplateLogo(id, { image } = {}) {
  const body = omitClientTenantOverrides({ image });
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}/logo`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/templates/:id/background */
export async function uploadTemplateBackground(id, { image } = {}) {
  const body = omitClientTenantOverrides({ image });
  return adminFetch(`/api/admin/templates/${encodeURIComponent(id)}/background`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/templates/preview */
export async function previewTemplateConfig(config) {
  const body = omitClientTenantOverrides({ config });
  return adminFetch('/api/admin/templates/preview', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}
