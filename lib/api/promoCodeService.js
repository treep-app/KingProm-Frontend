/**
 * Promo code (ticket) API service.
 * UI → hooks → promoCodeService → admin HTTP client → backend.
 *
 * Does not accept tenantId from callers — tenant scope is enforced by the backend.
 */

import { sanitizeAdminTicket, sanitizeAdminTicketList } from '../sanitize';
import {
  AdminApiNotImplementedError,
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

/** GET /api/admin/tickets */
export async function listPromoCodes({
  status = '',
  q = '',
  campaignId = '',
  purpose = '',
  createdFrom = '',
  createdTo = '',
  expiresFrom = '',
  expiresTo = '',
  limit = 25,
  offset = 0,
} = {}) {
  const safe = omitClientTenantOverrides({
    status,
    q,
    campaignId,
    purpose,
    createdFrom,
    createdTo,
    expiresFrom,
    expiresTo,
    limit,
    offset,
  });

  const params = new URLSearchParams();
  if (safe.status) params.set('status', safe.status);
  if (safe.q) params.set('q', safe.q);
  if (safe.campaignId) params.set('campaignId', safe.campaignId);
  if (safe.purpose) params.set('purpose', safe.purpose);
  if (safe.createdFrom) params.set('createdFrom', safe.createdFrom);
  if (safe.createdTo) params.set('createdTo', safe.createdTo);
  if (safe.expiresFrom) params.set('expiresFrom', safe.expiresFrom);
  if (safe.expiresTo) params.set('expiresTo', safe.expiresTo);
  params.set('limit', String(safe.limit ?? 25));
  params.set('offset', String(safe.offset ?? 0));

  const result = await adminFetch(`/api/admin/tickets?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
  if (result.data?.items) {
    result.data.items = sanitizeAdminTicketList(result.data.items);
  }
  return result;
}

/** Alias — tickets are promo codes in the admin UI. */
export const listTickets = listPromoCodes;

/** GET /api/admin/tickets/:id */
export async function getPromoCode(id) {
  const result = await adminFetch(`/api/admin/tickets/${encodeURIComponent(id)}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
  if (result.data?.ticket) {
    result.data.ticket = sanitizeAdminTicket(result.data.ticket);
  }
  return result;
}

/** Alias */
export const getTicket = getPromoCode;

/**
 * POST /api/scratch-card/send — issue / resend a guest ticket email.
 */
export async function issuePromoCode({
  email,
  name,
  campaignId,
  resend = false,
  refreshExpiry,
  keepExpiry,
} = {}) {
  const body = omitClientTenantOverrides({
    email,
    name,
    campaignId,
    resend,
    refreshExpiry,
    keepExpiry,
  });
  return adminFetch('/api/scratch-card/send', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** Alias used by existing issue-ticket UI */
export const sendTicket = issuePromoCode;

/**
 * Export — backend endpoint not available yet.
 * Required: GET /api/admin/tickets/export?format=csv|xlsx (+ same filters as list)
 * Must enforce tenant + permissions server-side.
 */
export async function exportPromoCodes(_filters = {}, _format = 'csv') {
  omitClientTenantOverrides(_filters);
  throw new AdminApiNotImplementedError(
    'exportPromoCodes',
    'Needs GET /api/admin/tickets/export?format=csv|xlsx with the same filter query params as listPromoCodes. Must enforce tenant scope on the server.',
  );
}

/**
 * Cancel a promo code — POST /api/admin/tickets/:id/cancel
 */
export async function cancelPromoCode(id) {
  if (!id) {
    return {
      ok: false,
      status: 400,
      data: { status: 'INVALID', message: 'Promo code id is required.' },
    };
  }
  const result = await adminFetch(
    `/api/admin/tickets/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      headers: adminHeaders(),
    },
  );
  if (result.data?.ticket) {
    result.data.ticket = sanitizeAdminTicket(result.data.ticket);
  }
  return withInvalidation(result, INVALIDATION_MAP.promoCancel);
}

/**
 * Assign an unused promo code to a customer.
 * POST /api/admin/customers/:customerId/assign-promo
 */
export async function assignPromoCodeCustomer({ ticketId, customerId, campaignId } = {}) {
  if (!ticketId || !customerId) {
    return {
      ok: false,
      status: 400,
      data: { status: 'INVALID', message: 'ticketId and customerId are required.' },
    };
  }
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
