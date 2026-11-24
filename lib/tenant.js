/**
 * Multi-tenant business context (display / branding only).
 *
 * SECURITY:
 * - Optional `NEXT_PUBLIC_TENANT_*` overrides catalog branding for demos only.
 *   Authenticated dashboard branding comes from the signed-in organization (JWT).
 * - It is NOT an authorization credential and MUST NOT be sent to the API
 *   as a selectable tenant scope.
 * - Operators must never pass an arbitrary tenantId from the browser to
 *   access another business's data.
 * - Backend row-level tenant isolation is a required security control before
 *   hosting multiple businesses on one database (see backend/src/security/tenantIsolation.js).
 *
 * Do not hardcode venue-specific copy inside UI components; read from here
 * (or WorkspaceProvider) instead.
 */

import { PLATFORM } from './platform';

const TENANT_CATALOG = {
  'blue-top-villa': {
    id: 'blue-top-villa',
    name: 'Blue Top Villa',
    slug: 'blue-top-villa',
    product: 'KingProm',
    plan: 'Professional',
    branding: {
      displayName: 'Blue Top Villa',
      wordmarkPrimary: 'Blue Top',
      wordmarkAccent: 'Villa',
      tagline: 'Promo dashboard',
      guestSiteUrl: 'https://www.bluetopvilla.com/',
    },
  },
};

function resolveTenantId() {
  // Optional demo override — default is platform workspace until JWT org is loaded.
  return process.env.NEXT_PUBLIC_TENANT_ID?.trim() || '';
}

/**
 * @returns {{
 *   id: string,
 *   name: string,
 *   slug: string,
 *   product: string,
 *   plan: string,
 *   branding: {
 *     displayName: string,
 *     wordmarkPrimary: string,
 *     wordmarkAccent: string,
 *     tagline: string,
 *     guestSiteUrl: string,
 *   },
 * }}
 */
export function getCurrentTenant() {
  const id = resolveTenantId();
  const catalog = id ? TENANT_CATALOG[id] : null;
  const envName = process.env.NEXT_PUBLIC_TENANT_NAME || process.env.NEXT_PUBLIC_BRAND_NAME;

  if (catalog) {
    return {
      ...catalog,
      name: envName || catalog.name,
      branding: {
        ...catalog.branding,
        displayName: envName || catalog.branding.displayName,
      },
    };
  }

  const name = envName || PLATFORM.branding.displayName;
  return {
    id: id || 'workspace',
    name,
    slug: id || 'workspace',
    product: PLATFORM.name,
    plan: 'Free',
    branding: {
      displayName: name,
      wordmarkPrimary: PLATFORM.branding.wordmarkPrimary,
      wordmarkAccent: PLATFORM.branding.wordmarkAccent,
      tagline: PLATFORM.branding.tagline,
      guestSiteUrl: PLATFORM.branding.guestSiteUrl,
    },
  };
}

export function getTenantBranding(tenant = getCurrentTenant()) {
  return tenant.branding;
}

/**
 * Resolve a two-tone wordmark from an organization display name.
 * Preserves curated catalog splits (e.g. "Blue Top" + "Villa") when the
 * live org name still matches the seeded brand.
 */
export function resolveWordmark(displayName, catalogBranding = {}) {
  const name = String(displayName || '').trim();
  const catalogPrimary = String(catalogBranding.wordmarkPrimary || '').trim();
  const catalogAccent = String(catalogBranding.wordmarkAccent || '').trim();
  const catalogDisplay = String(catalogBranding.displayName || '').trim();
  const catalogFull = [catalogPrimary, catalogAccent].filter(Boolean).join(' ');

  const lower = name.toLowerCase();
  if (
    name &&
    ((catalogFull && lower === catalogFull.toLowerCase()) ||
      (catalogDisplay && lower === catalogDisplay.toLowerCase()))
  ) {
    return {
      wordmarkPrimary: catalogPrimary || name,
      wordmarkAccent: catalogAccent,
    };
  }

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      wordmarkPrimary: parts.slice(0, -1).join(' '),
      wordmarkAccent: parts[parts.length - 1],
    };
  }

  return {
    wordmarkPrimary: name || catalogPrimary || 'Workspace',
    wordmarkAccent: '',
  };
}

/**
 * True when the frontend is only providing branding context (current state).
 * Data isolation must be enforced by the authenticated backend session.
 */
export function isTenantBrandingOnly() {
  return true;
}

/** @deprecated use getCurrentTenant() */
export const WORKSPACE = {
  get name() {
    return getCurrentTenant().name;
  },
  get product() {
    return getCurrentTenant().product;
  },
  get plan() {
    return getCurrentTenant().plan;
  },
};
