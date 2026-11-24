import { adminFetch, adminHeaders, omitClientTenantOverrides, setSession } from './client';

/** GET /api/admin/organization */
export async function getCurrentOrganization() {
  return adminFetch('/api/admin/organization', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** PATCH /api/admin/organization */
export async function updateOrganization(payload = {}) {
  const body = omitClientTenantOverrides(payload);
  return adminFetch('/api/admin/organization', {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** GET /api/admin/organization/usage */
export async function getUsage() {
  return adminFetch('/api/admin/organization/usage', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/organization/plans */
export async function getPlans() {
  return adminFetch('/api/admin/organization/plans', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/auth/switch-organization */
export async function switchOrganization(organizationId) {
  const result = await adminFetch('/api/admin/auth/switch-organization', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ organizationId }),
  });
  if (result.ok && result.data?.token) {
    setSession({
      token: result.data.token,
      operator: result.data.operator,
      memberships: result.data.memberships || [],
      authType: 'operator',
    });
  }
  return result;
}
