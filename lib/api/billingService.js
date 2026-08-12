import { adminFetch, adminHeaders, omitClientTenantOverrides } from './client';

/** GET /api/admin/billing */
export async function getBilling() {
  return adminFetch('/api/admin/billing', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/billing/usage */
export async function getBillingUsage() {
  return adminFetch('/api/admin/billing/usage', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/billing/invoices */
export async function getInvoices() {
  return adminFetch('/api/admin/billing/invoices', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/billing/plans or public /api/billing/plans */
export async function getPlans({ publicCatalog = false } = {}) {
  const path = publicCatalog ? '/api/billing/plans' : '/api/admin/billing/plans';
  return adminFetch(path, {
    headers: publicCatalog ? {} : adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/billing/checkout */
export async function createCheckout(planId) {
  return adminFetch('/api/admin/billing/checkout', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides({ planId })),
  });
}

/** POST /api/admin/billing/portal */
export async function createPortalSession() {
  return adminFetch('/api/admin/billing/portal', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
}

/** POST /api/admin/billing/cancel */
export async function cancelSubscription({ immediate = false } = {}) {
  return adminFetch('/api/admin/billing/cancel', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ immediate }),
  });
}

/** POST /api/admin/billing/change-plan */
export async function changePlan(planId) {
  return adminFetch('/api/admin/billing/change-plan', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides({ planId })),
  });
}

/** GET /api/admin/billing/downgrade-preview?planId= */
export async function previewDowngrade(planId) {
  return adminFetch(
    `/api/admin/billing/downgrade-preview?planId=${encodeURIComponent(planId)}`,
    {
      headers: adminHeaders(),
      cache: 'no-store',
    },
  );
}

/** GET /api/admin/platform/billing (platform admin) */
export async function getPlatformBilling() {
  return adminFetch('/api/admin/platform/billing', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}
