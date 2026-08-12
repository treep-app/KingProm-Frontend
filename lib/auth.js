/**
 * Client-side session helpers for the dashboard.
 *
 * Security notes:
 * - Operator JWT in sessionStorage is the preferred credential.
 * - Legacy ADMIN_API_KEY in sessionStorage is a temporary escape hatch only —
 *   never put secrets in NEXT_PUBLIC_* env vars or source code.
 * - Clearing UI / hiding nav is NOT authorization. The API must enforce access.
 *
 * Storage keys were renamed BlueTop → KingProm. Old keys are migrated once
 * so existing sessions are not dropped mid-visit.
 */

const TOKEN_KEY = 'kingprom_operator_token';
const OPERATOR_KEY = 'kingprom_operator';
const MEMBERSHIPS_KEY = 'kingprom_memberships';
const LEGACY_KEY = 'kingprom_admin_key';
const AUTH_TYPE_KEY = 'kingprom_auth_type';
export const SESSION_CHANGED_EVENT = 'kingprom:session-changed';

const LEGACY_KEY_MAP = [
  [TOKEN_KEY, 'bluetop_operator_token'],
  [OPERATOR_KEY, 'bluetop_operator'],
  [MEMBERSHIPS_KEY, 'bluetop_memberships'],
  [LEGACY_KEY, 'bluetop_admin_key'],
  [AUTH_TYPE_KEY, 'bluetop_auth_type'],
];

function migrateLegacySessionKeys() {
  if (typeof window === 'undefined') return;
  try {
    for (const [nextKey, oldKey] of LEGACY_KEY_MAP) {
      const existing = window.sessionStorage.getItem(nextKey);
      const legacy = window.sessionStorage.getItem(oldKey);
      if (!existing && legacy) {
        window.sessionStorage.setItem(nextKey, legacy);
      }
      if (legacy) {
        window.sessionStorage.removeItem(oldKey);
      }
    }
  } catch {
    // Ignore storage failures (private mode, etc.)
  }
}

migrateLegacySessionKeys();

function notifySessionChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getOperatorToken() {
  if (typeof window === 'undefined') return '';
  migrateLegacySessionKeys();
  return window.sessionStorage.getItem(TOKEN_KEY) || '';
}

export function getLegacyAdminKey() {
  if (typeof window === 'undefined') return '';
  migrateLegacySessionKeys();
  return window.sessionStorage.getItem(LEGACY_KEY) || '';
}

export function hasLegacyAdminKey() {
  return Boolean(getLegacyAdminKey());
}

/** Prefer operator JWT; fall back to legacy ADMIN_API_KEY for scripts/tools. */
export function getAuthToken() {
  return getOperatorToken() || getLegacyAdminKey();
}

export function hasAuth() {
  return Boolean(getAuthToken());
}

export function hasOperatorSession() {
  return Boolean(getOperatorToken());
}

export function getAuthType() {
  if (typeof window === 'undefined') return '';
  migrateLegacySessionKeys();
  return window.sessionStorage.getItem(AUTH_TYPE_KEY) || '';
}

export function getStoredOperator() {
  if (typeof window === 'undefined') return null;
  migrateLegacySessionKeys();
  try {
    const raw = window.sessionStorage.getItem(OPERATOR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredMemberships() {
  if (typeof window === 'undefined') return [];
  migrateLegacySessionKeys();
  try {
    const raw = window.sessionStorage.getItem(MEMBERSHIPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist JWT + public operator profile from login /me. */
export function setSession({
  token,
  operator,
  memberships = null,
  authType = 'operator',
} = {}) {
  if (typeof window === 'undefined') return;
  if (token) {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
  if (operator) {
    // Never persist secrets if a buggy payload includes them
    const { passwordHash, password, token: _t, ...safe } = operator;
    window.sessionStorage.setItem(OPERATOR_KEY, JSON.stringify(safe));
  }
  if (Array.isArray(memberships)) {
    window.sessionStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
  }
  if (authType) {
    window.sessionStorage.setItem(AUTH_TYPE_KEY, authType);
  }
  notifySessionChanged();
}

/** Refresh public profile from GET /me without rotating the token. */
export function setOperatorProfile(operator, authType) {
  if (typeof window === 'undefined' || !operator) return;
  const { passwordHash, password, token: _t, ...safe } = operator;
  window.sessionStorage.setItem(OPERATOR_KEY, JSON.stringify(safe));
  if (authType) {
    window.sessionStorage.setItem(AUTH_TYPE_KEY, authType);
  }
  notifySessionChanged();
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(OPERATOR_KEY);
  window.sessionStorage.removeItem(MEMBERSHIPS_KEY);
  window.sessionStorage.removeItem(AUTH_TYPE_KEY);
  // Also drop legacy key so "Sign out" fully ends privileged browser access
  window.sessionStorage.removeItem(LEGACY_KEY);
  for (const [, oldKey] of LEGACY_KEY_MAP) {
    window.sessionStorage.removeItem(oldKey);
  }
  notifySessionChanged();
}

/**
 * Optional tooling credential. Prefer operator login.
 * Value is session-scoped only — never commit or put in NEXT_PUBLIC_*.
 */
export function setLegacyAdminKey(key) {
  if (typeof window === 'undefined') return;
  if (key?.trim()) {
    window.sessionStorage.setItem(LEGACY_KEY, key.trim());
    window.sessionStorage.setItem(AUTH_TYPE_KEY, 'api_key');
  } else {
    window.sessionStorage.removeItem(LEGACY_KEY);
    if (!getOperatorToken()) {
      window.sessionStorage.removeItem(AUTH_TYPE_KEY);
    }
  }
  notifySessionChanged();
}

export function clearLegacyAdminKey() {
  setLegacyAdminKey('');
}
