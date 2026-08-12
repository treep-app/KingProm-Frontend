import {
  getAuthType,
  getLegacyAdminKey,
  getStoredMemberships,
  getStoredOperator,
  hasAuth,
} from './auth';

/**
 * Normalized current-user view for the dashboard.
 * Prefer role from GET /api/admin/auth/me (synced by AuthGate) over local guesses.
 */

/**
 * @returns {{
 *   id: string | null,
 *   email: string,
 *   name: string,
 *   role: string,
 *   tenantId: string | null,
 *   organization: object | null,
 *   memberships: object[],
 *   authType: 'operator' | 'legacy' | 'anonymous',
 *   isAuthenticated: boolean,
 * }}
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return {
      id: null,
      email: '',
      name: 'Guest',
      role: 'anonymous',
      tenantId: null,
      organization: null,
      memberships: [],
      authType: 'anonymous',
      isAuthenticated: false,
    };
  }

  const storedAuthType = getAuthType();
  const operator = getStoredOperator();
  const memberships = getStoredMemberships();
  if (operator) {
    return {
      id: operator.id || null,
      email: operator.email || '',
      name: operator.name || operator.email || 'Operator',
      role: String(operator.orgRole || operator.role || 'admin').toLowerCase(),
      tenantId: operator.tenantId || operator.organization?.id || null,
      organization: operator.organization || null,
      memberships,
      authType:
        storedAuthType === 'api_key' || storedAuthType === 'legacy'
          ? 'legacy'
          : 'operator',
      isAuthenticated: true,
    };
  }

  if (getLegacyAdminKey()) {
    return {
      id: null,
      email: '',
      name: 'Legacy admin',
      role: 'admin',
      tenantId: null,
      organization: null,
      memberships: [],
      authType: 'legacy',
      isAuthenticated: true,
    };
  }

  if (hasAuth()) {
    return {
      id: null,
      email: '',
      name: 'Operator',
      role: 'admin',
      tenantId: null,
      organization: null,
      memberships: [],
      authType: 'operator',
      isAuthenticated: true,
    };
  }

  return {
    id: null,
    email: '',
    name: 'Guest',
    role: 'anonymous',
    tenantId: null,
    organization: null,
    memberships: [],
    authType: 'anonymous',
    isAuthenticated: false,
  };
}
