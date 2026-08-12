/**
 * Multi-tenant business context (display / branding only).
 *
 * SECURITY:
 * - `NEXT_PUBLIC_TENANT_ID` configures branding for this deploy.
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
  // Deploy-time branding only — never accept runtime query/localStorage overrides.
  return process.env.NEXT_PUBLIC_TENANT_ID || 'blue-top-villa';
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
  const catalog = TENANT_CATALOG[id];
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

  const name = envName || id;
  return {
    id,
    name,
    slug: id,
    product: 'Promo',
    plan: 'Standard',
    branding: {
      displayName: name,
      wordmarkPrimary: name,
      wordmarkAccent: '',
      tagline: 'Promo dashboard',
      guestSiteUrl: '/',
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
