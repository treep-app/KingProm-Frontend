/**
 * Workspace branding API service.
 * UI → hooks → brandingService → admin HTTP client → backend.
 */

import {
  adminFetch,
  adminHeaders,
  getAdminKey,
  omitClientTenantOverrides,
} from './client';

/** GET /api/admin/branding */
export async function getBranding() {
  return adminFetch('/api/admin/branding', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** PATCH /api/admin/branding */
export async function updateBranding(payload) {
  const body = omitClientTenantOverrides(payload || {});
  return adminFetch('/api/admin/branding', {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/branding/logo */
export async function uploadBrandingLogo({ image } = {}) {
  const body = omitClientTenantOverrides({ image });
  return adminFetch('/api/admin/branding/logo', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** DELETE /api/admin/branding/logo */
export async function removeBrandingLogo() {
  return adminFetch('/api/admin/branding/logo', {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

/** GET /api/admin/branding/preview */
export async function getBrandingPreview() {
  return adminFetch('/api/admin/branding/preview', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/**
 * Fetch a protected asset and return a blob object URL for use in <img src>.
 * Caller should revoke the URL when done: URL.revokeObjectURL(url).
 * @param {string} assetPath e.g. `/api/admin/assets/abc`
 */
export async function fetchAssetBlobUrl(assetPath) {
  const path = String(assetPath || '').trim();
  if (!path) return null;

  const key = getAdminKey();
  const headers = key ? { Authorization: `Bearer ${key}` } : {};

  try {
    const res = await fetch(path, { headers, cache: 'no-store' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
