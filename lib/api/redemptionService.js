/**
 * Redemption + QR API service.
 * UI → hooks → redemptionService → admin HTTP client → backend.
 *
 * Never log tokens, validation URLs, or customer emails from this module.
 */

import {
  adminFetch,
  adminHeaders,
  getAdminKey,
  omitClientTenantOverrides,
} from './client';
import { INVALIDATION_MAP } from './cacheTags';
import { invalidateTags } from './queryCache';

/** GET /api/admin/redemptions/locations */
export async function listRedemptionLocations() {
  return adminFetch('/api/admin/redemptions/locations', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/redemptions/validate */
export async function validateRedemption({ token, code, campaignId } = {}) {
  const body = omitClientTenantOverrides({ token, code, campaignId });
  return adminFetch('/api/admin/redemptions/validate', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** POST /api/admin/redemptions/redeem */
export async function redeemVoucher({
  token,
  code,
  campaignId,
  locationKey,
  locationLabel,
  notes,
  confirm = true,
} = {}) {
  const body = omitClientTenantOverrides({
    token,
    code,
    campaignId,
    locationKey,
    locationLabel,
    notes,
    confirm,
  });
  const result = await adminFetch('/api/admin/redemptions/redeem', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  // Invalidate lists after a successful redeem — never cache the mutation itself.
  if (result?.ok) invalidateTags(INVALIDATION_MAP.redemptionCreate);
  return result;
}

/** GET /api/admin/redemptions */
export async function listRedemptions({
  q = '',
  status = '',
  campaignId = '',
  locationKey = '',
  channel = '',
  customerId = '',
  from = '',
  to = '',
  limit = 25,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({
    q,
    status,
    campaignId,
    locationKey,
    channel,
    customerId,
    from,
    to,
    limit,
    offset,
  });

  const params = new URLSearchParams();
  if (safe.q) params.set('q', safe.q);
  if (safe.status) params.set('status', safe.status);
  if (safe.campaignId) params.set('campaignId', safe.campaignId);
  if (safe.locationKey) params.set('locationKey', safe.locationKey);
  if (safe.channel) params.set('channel', safe.channel);
  if (safe.customerId) params.set('customerId', safe.customerId);
  if (safe.from) params.set('from', safe.from);
  if (safe.to) params.set('to', safe.to);
  params.set('limit', String(safe.limit ?? 25));
  params.set('offset', String(safe.offset ?? 0));

  return adminFetch(`/api/admin/redemptions?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/redemptions/:id */
export async function getRedemption(id) {
  return adminFetch(`/api/admin/redemptions/${encodeURIComponent(id)}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/tickets/:id/qr */
export async function getTicketQr(ticketId) {
  return adminFetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}/qr`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/**
 * Fetch a protected QR asset as a blob object URL.
 * Caller should revoke when done: URL.revokeObjectURL(url).
 */
async function fetchQrBlobUrl(path) {
  const key = getAdminKey();
  const headers = key ? { Authorization: `Bearer ${key}` } : {};

  try {
    const res = await fetch(path, { headers, cache: 'no-store' });
    if (!res.ok) return { ok: false, status: res.status, url: null };
    const blob = await res.blob();
    return { ok: true, status: res.status, url: URL.createObjectURL(blob) };
  } catch {
    return { ok: false, status: 0, url: null };
  }
}

/** GET /api/admin/tickets/:id/qr.png — returns blob object URL */
export async function downloadTicketQrPng(ticketId) {
  return fetchQrBlobUrl(
    `/api/admin/tickets/${encodeURIComponent(ticketId)}/qr.png`,
  );
}

/** GET /api/admin/tickets/:id/qr.svg — returns blob object URL */
export async function downloadTicketQrSvg(ticketId) {
  return fetchQrBlobUrl(
    `/api/admin/tickets/${encodeURIComponent(ticketId)}/qr.svg`,
  );
}

/**
 * Trigger a browser download from a blob object URL.
 * @param {string} objectUrl
 * @param {string} filename
 */
export function triggerBlobDownload(objectUrl, filename) {
  if (!objectUrl) return;
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
