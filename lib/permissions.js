/**
 * Permission helpers for multi-tenant operator access.
 *
 * IMPORTANT: Client-side `can()` checks are UX only (hide/disable controls).
 * They are NOT a security boundary. Every sensitive action must be enforced
 * by the backend using the operator JWT / admin auth middleware.
 *
 * Permission keys use resource:action, e.g. `campaigns:edit`.
 * Existing broad keys (`campaigns:read`, `campaigns:write`, …) remain the
 * role-level grants. Granular actions are implied by those broad keys so we
 * do not invent a new role system in this phase.
 *
 * `*` grants everything (owner/admin). `resource:*` grants all actions on a resource.
 */

export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',

  // Campaigns — broad (role grants)
  CAMPAIGNS_READ: 'campaigns:read',
  CAMPAIGNS_WRITE: 'campaigns:write',
  // Campaigns — granular (UX actions; implied by read/write)
  CAMPAIGNS_VIEW: 'campaigns:view',
  CAMPAIGNS_CREATE: 'campaigns:create',
  CAMPAIGNS_EDIT: 'campaigns:edit',
  CAMPAIGNS_DELETE: 'campaigns:delete',
  CAMPAIGNS_PAUSE: 'campaigns:pause',

  // Promo codes — broad (role grants)
  PROMO_CODES_READ: 'promo-codes:read',
  PROMO_CODES_WRITE: 'promo-codes:write',
  // Promo codes — granular (UX actions; implied by read/write)
  PROMO_CODES_VIEW: 'promo-codes:view',
  PROMO_CODES_GENERATE: 'promo-codes:generate',
  PROMO_CODES_CANCEL: 'promo-codes:cancel',
  PROMO_CODES_EXPORT: 'promo-codes:export',

  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  // Customers — granular (UX actions; implied by read/write)
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_ARCHIVE: 'customers:archive',
  CUSTOMERS_IMPORT: 'customers:import',
  CUSTOMERS_ASSIGN_PROMO: 'customers:assign-promo',
  TEMPLATES_READ: 'templates:read',
  TEMPLATES_WRITE: 'templates:write',
  // Templates — granular (UX actions; implied by read/write)
  TEMPLATES_VIEW: 'templates:view',
  TEMPLATES_CREATE: 'templates:create',
  TEMPLATES_EDIT: 'templates:edit',
  TEMPLATES_DUPLICATE: 'templates:duplicate',
  TEMPLATES_ARCHIVE: 'templates:archive',
  TEMPLATES_SET_DEFAULT: 'templates:set-default',
  EMAIL_CAMPAIGNS_READ: 'email-campaigns:read',
  EMAIL_CAMPAIGNS_WRITE: 'email-campaigns:write',
  // Email campaigns — granular (UX actions; implied by read/write)
  EMAIL_CAMPAIGNS_VIEW: 'email-campaigns:view',
  EMAIL_CAMPAIGNS_CREATE: 'email-campaigns:create',
  EMAIL_CAMPAIGNS_EDIT: 'email-campaigns:edit',
  EMAIL_CAMPAIGNS_DELETE: 'email-campaigns:delete',
  EMAIL_CAMPAIGNS_SEND: 'email-campaigns:send',
  EMAIL_CAMPAIGNS_SCHEDULE: 'email-campaigns:schedule',
  EMAIL_CAMPAIGNS_CANCEL: 'email-campaigns:cancel',
  EMAIL_CAMPAIGNS_ANALYTICS: 'email-campaigns:analytics',
  ANALYTICS_READ: 'analytics:read',
  REDEMPTIONS_READ: 'redemptions:read',
  REDEMPTIONS_WRITE: 'redemptions:write',
  // Redemptions — granular (UX actions; implied by read/write)
  REDEMPTIONS_VIEW: 'redemptions:view',
  REDEMPTIONS_VALIDATE: 'redemptions:validate',
  REDEMPTIONS_REDEEM: 'redemptions:redeem',
  TEAM_READ: 'team:read',
  TEAM_WRITE: 'team:write',
  BRANDING_READ: 'branding:read',
  BRANDING_WRITE: 'branding:write',
  // Branding — granular (UX actions; implied by read/write)
  BRANDING_VIEW: 'branding:view',
  BRANDING_EDIT: 'branding:edit',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
  INTEGRATIONS_READ: 'integrations:read',
  INTEGRATIONS_WRITE: 'integrations:write',
  AUDIT_READ: 'audit:read',
};

/**
 * Granular permission → broad grant that implies it.
 * Keeps current owner/admin/operator/viewer role matrices intact.
 */
const IMPLIED_BY = {
  [PERMISSIONS.CAMPAIGNS_VIEW]: PERMISSIONS.CAMPAIGNS_READ,
  [PERMISSIONS.CAMPAIGNS_CREATE]: PERMISSIONS.CAMPAIGNS_WRITE,
  [PERMISSIONS.CAMPAIGNS_EDIT]: PERMISSIONS.CAMPAIGNS_WRITE,
  [PERMISSIONS.CAMPAIGNS_DELETE]: PERMISSIONS.CAMPAIGNS_WRITE,
  [PERMISSIONS.CAMPAIGNS_PAUSE]: PERMISSIONS.CAMPAIGNS_WRITE,

  [PERMISSIONS.PROMO_CODES_VIEW]: PERMISSIONS.PROMO_CODES_READ,
  [PERMISSIONS.PROMO_CODES_GENERATE]: PERMISSIONS.PROMO_CODES_WRITE,
  [PERMISSIONS.PROMO_CODES_CANCEL]: PERMISSIONS.PROMO_CODES_WRITE,
  [PERMISSIONS.PROMO_CODES_EXPORT]: PERMISSIONS.PROMO_CODES_WRITE,

  [PERMISSIONS.CUSTOMERS_VIEW]: PERMISSIONS.CUSTOMERS_READ,
  [PERMISSIONS.CUSTOMERS_CREATE]: PERMISSIONS.CUSTOMERS_WRITE,
  [PERMISSIONS.CUSTOMERS_EDIT]: PERMISSIONS.CUSTOMERS_WRITE,
  [PERMISSIONS.CUSTOMERS_ARCHIVE]: PERMISSIONS.CUSTOMERS_WRITE,
  [PERMISSIONS.CUSTOMERS_IMPORT]: PERMISSIONS.CUSTOMERS_WRITE,
  [PERMISSIONS.CUSTOMERS_ASSIGN_PROMO]: PERMISSIONS.CUSTOMERS_WRITE,

  [PERMISSIONS.TEMPLATES_VIEW]: PERMISSIONS.TEMPLATES_READ,
  [PERMISSIONS.TEMPLATES_CREATE]: PERMISSIONS.TEMPLATES_WRITE,
  [PERMISSIONS.TEMPLATES_EDIT]: PERMISSIONS.TEMPLATES_WRITE,
  [PERMISSIONS.TEMPLATES_DUPLICATE]: PERMISSIONS.TEMPLATES_WRITE,
  [PERMISSIONS.TEMPLATES_ARCHIVE]: PERMISSIONS.TEMPLATES_WRITE,
  [PERMISSIONS.TEMPLATES_SET_DEFAULT]: PERMISSIONS.TEMPLATES_WRITE,

  [PERMISSIONS.BRANDING_VIEW]: PERMISSIONS.BRANDING_READ,
  [PERMISSIONS.BRANDING_EDIT]: PERMISSIONS.BRANDING_WRITE,

  [PERMISSIONS.EMAIL_CAMPAIGNS_VIEW]: PERMISSIONS.EMAIL_CAMPAIGNS_READ,
  [PERMISSIONS.EMAIL_CAMPAIGNS_CREATE]: PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
  [PERMISSIONS.EMAIL_CAMPAIGNS_EDIT]: PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
  [PERMISSIONS.EMAIL_CAMPAIGNS_DELETE]: PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
  [PERMISSIONS.EMAIL_CAMPAIGNS_SEND]: PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
  [PERMISSIONS.EMAIL_CAMPAIGNS_SCHEDULE]: PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
  [PERMISSIONS.EMAIL_CAMPAIGNS_CANCEL]: PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
  [PERMISSIONS.EMAIL_CAMPAIGNS_ANALYTICS]: PERMISSIONS.EMAIL_CAMPAIGNS_READ,

  [PERMISSIONS.REDEMPTIONS_VIEW]: PERMISSIONS.REDEMPTIONS_READ,
  [PERMISSIONS.REDEMPTIONS_VALIDATE]: PERMISSIONS.REDEMPTIONS_WRITE,
  [PERMISSIONS.REDEMPTIONS_REDEEM]: PERMISSIONS.REDEMPTIONS_WRITE,
};

const ROLE_PERMISSIONS = {
  owner: ['*'],
  admin: [
    '*',
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_WRITE,
  ],
  marketing: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.CAMPAIGNS_READ,
    PERMISSIONS.CAMPAIGNS_WRITE,
    PERMISSIONS.PROMO_CODES_READ,
    PERMISSIONS.PROMO_CODES_WRITE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.EMAIL_CAMPAIGNS_READ,
    PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
    PERMISSIONS.TEMPLATES_READ,
    PERMISSIONS.TEMPLATES_WRITE,
    PERMISSIONS.BRANDING_READ,
    PERMISSIONS.BRANDING_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.INTEGRATIONS_READ,
  ],
  manager: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.CAMPAIGNS_READ,
    PERMISSIONS.PROMO_CODES_READ,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.EMAIL_CAMPAIGNS_READ,
    PERMISSIONS.TEMPLATES_READ,
    PERMISSIONS.REDEMPTIONS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.INTEGRATIONS_READ,
  ],
  reception: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.REDEMPTIONS_READ,
    PERMISSIONS.REDEMPTIONS_WRITE,
    PERMISSIONS.PROMO_CODES_READ,
  ],
  finance: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.CAMPAIGNS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.BILLING_READ,
  ],
  operator: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.CAMPAIGNS_READ,
    PERMISSIONS.CAMPAIGNS_WRITE,
    PERMISSIONS.PROMO_CODES_READ,
    PERMISSIONS.PROMO_CODES_WRITE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REDEMPTIONS_READ,
    PERMISSIONS.REDEMPTIONS_WRITE,
    PERMISSIONS.EMAIL_CAMPAIGNS_READ,
    PERMISSIONS.EMAIL_CAMPAIGNS_WRITE,
    PERMISSIONS.TEMPLATES_READ,
    PERMISSIONS.TEMPLATES_WRITE,
    PERMISSIONS.BRANDING_READ,
    PERMISSIONS.BRANDING_WRITE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.INTEGRATIONS_READ,
  ],
  viewer: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.CAMPAIGNS_READ,
    PERMISSIONS.PROMO_CODES_READ,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REDEMPTIONS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.AUDIT_READ,
  ],
  anonymous: [],
};

export const ORG_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'manager', label: 'Manager' },
  { value: 'reception', label: 'Reception' },
  { value: 'finance', label: 'Finance' },
  { value: 'operator', label: 'Operator' },
  { value: 'viewer', label: 'Viewer' },
];

export const INDUSTRY_OPTIONS = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'event', label: 'Event' },
  { value: 'spa', label: 'Spa' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

/**
 * Map nav href → required permission for UX filtering.
 * Missing entry = visible to any authenticated operator.
 */
export const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.DASHBOARD_READ,
  '/dashboard/campaigns': PERMISSIONS.CAMPAIGNS_VIEW,
  '/dashboard/campaigns/new': PERMISSIONS.CAMPAIGNS_CREATE,
  '/dashboard/promo-codes': PERMISSIONS.PROMO_CODES_VIEW,
  '/dashboard/tickets': PERMISSIONS.PROMO_CODES_VIEW,
  '/dashboard/redemptions': PERMISSIONS.REDEMPTIONS_VIEW,
  '/dashboard/redeem': PERMISSIONS.REDEMPTIONS_REDEEM,
  '/dashboard/customers': PERMISSIONS.CUSTOMERS_VIEW,
  '/dashboard/customers/new': PERMISSIONS.CUSTOMERS_CREATE,
  '/dashboard/customers/import': PERMISSIONS.CUSTOMERS_IMPORT,
  '/dashboard/email-campaigns': PERMISSIONS.EMAIL_CAMPAIGNS_VIEW,
  '/dashboard/email-campaigns/new': PERMISSIONS.EMAIL_CAMPAIGNS_CREATE,
  '/dashboard/templates': PERMISSIONS.TEMPLATES_VIEW,
  '/dashboard/templates/new': PERMISSIONS.TEMPLATES_CREATE,
  '/dashboard/analytics': PERMISSIONS.ANALYTICS_READ,
  '/dashboard/reports': PERMISSIONS.ANALYTICS_READ,
  '/dashboard/branding': PERMISSIONS.BRANDING_VIEW,
  '/dashboard/team': PERMISSIONS.TEAM_READ,
  '/dashboard/settings/users': PERMISSIONS.TEAM_READ,
  '/dashboard/settings/business': PERMISSIONS.SETTINGS_READ,
  '/dashboard/settings/billing': PERMISSIONS.BILLING_READ,
  '/dashboard/settings/integrations': PERMISSIONS.INTEGRATIONS_READ,
  '/dashboard/automations': PERMISSIONS.INTEGRATIONS_READ,
  '/dashboard/settings/api': PERMISSIONS.INTEGRATIONS_WRITE,
  '/dashboard/audit-log': PERMISSIONS.AUDIT_READ,
  '/dashboard/settings': PERMISSIONS.SETTINGS_READ,
};

/**
 * @param {{ role?: string } | null} user
 * @returns {string[]}
 */
export function getPermissionsForUser(user) {
  const role = String(user?.role || 'anonymous').toLowerCase();
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.anonymous;
}

/**
 * @param {string[]} granted
 * @param {string} permission
 */
export function hasPermission(granted, permission) {
  if (!permission) return true;
  if (!Array.isArray(granted) || granted.length === 0) return false;
  if (granted.includes('*')) return true;
  if (granted.includes(permission)) return true;

  const [resource] = String(permission).split(':');
  if (resource && granted.includes(`${resource}:*`)) return true;

  // Broad role grants imply granular actions (no new role system required)
  const broad = IMPLIED_BY[permission];
  if (broad && granted.includes(broad)) return true;

  return false;
}

/**
 * Convenience bundle for campaign action UX.
 * @param {(permission: string) => boolean} can
 */
export function campaignCapabilities(can) {
  return {
    view: can(PERMISSIONS.CAMPAIGNS_VIEW),
    create: can(PERMISSIONS.CAMPAIGNS_CREATE),
    edit: can(PERMISSIONS.CAMPAIGNS_EDIT),
    delete: can(PERMISSIONS.CAMPAIGNS_DELETE),
    pause: can(PERMISSIONS.CAMPAIGNS_PAUSE),
  };
}

/**
 * Convenience bundle for promo-code action UX.
 * @param {(permission: string) => boolean} can
 */
export function promoCodeCapabilities(can) {
  return {
    view: can(PERMISSIONS.PROMO_CODES_VIEW),
    generate: can(PERMISSIONS.PROMO_CODES_GENERATE),
    cancel: can(PERMISSIONS.PROMO_CODES_CANCEL),
    export: can(PERMISSIONS.PROMO_CODES_EXPORT),
  };
}

/**
 * Convenience bundle for customer action UX.
 * @param {(permission: string) => boolean} can
 */
export function customerCapabilities(can) {
  return {
    view: can(PERMISSIONS.CUSTOMERS_VIEW),
    create: can(PERMISSIONS.CUSTOMERS_CREATE),
    edit: can(PERMISSIONS.CUSTOMERS_EDIT),
    archive: can(PERMISSIONS.CUSTOMERS_ARCHIVE),
    import: can(PERMISSIONS.CUSTOMERS_IMPORT),
    assignPromo: can(PERMISSIONS.CUSTOMERS_ASSIGN_PROMO),
  };
}

/**
 * Convenience bundle for template action UX.
 * @param {(permission: string) => boolean} can
 */
export function templateCapabilities(can) {
  return {
    view: can(PERMISSIONS.TEMPLATES_VIEW),
    create: can(PERMISSIONS.TEMPLATES_CREATE),
    edit: can(PERMISSIONS.TEMPLATES_EDIT),
    duplicate: can(PERMISSIONS.TEMPLATES_DUPLICATE),
    archive: can(PERMISSIONS.TEMPLATES_ARCHIVE),
    setDefault: can(PERMISSIONS.TEMPLATES_SET_DEFAULT),
  };
}

/**
 * Convenience bundle for branding action UX.
 * @param {(permission: string) => boolean} can
 */
export function brandingCapabilities(can) {
  return {
    view: can(PERMISSIONS.BRANDING_VIEW),
    edit: can(PERMISSIONS.BRANDING_EDIT),
  };
}

/**
 * Convenience bundle for redemption action UX.
 * @param {(permission: string) => boolean} can
 */
export function redemptionCapabilities(can) {
  return {
    view: can(PERMISSIONS.REDEMPTIONS_VIEW),
    validate: can(PERMISSIONS.REDEMPTIONS_VALIDATE),
    redeem: can(PERMISSIONS.REDEMPTIONS_REDEEM),
  };
}

/**
 * Convenience bundle for email-campaign action UX.
 * @param {(permission: string) => boolean} can
 */
export function emailCampaignCapabilities(can) {
  return {
    view: can(PERMISSIONS.EMAIL_CAMPAIGNS_VIEW),
    create: can(PERMISSIONS.EMAIL_CAMPAIGNS_CREATE),
    edit: can(PERMISSIONS.EMAIL_CAMPAIGNS_EDIT),
    delete: can(PERMISSIONS.EMAIL_CAMPAIGNS_DELETE),
    send: can(PERMISSIONS.EMAIL_CAMPAIGNS_SEND),
    schedule: can(PERMISSIONS.EMAIL_CAMPAIGNS_SCHEDULE),
    cancel: can(PERMISSIONS.EMAIL_CAMPAIGNS_CANCEL),
    analytics: can(PERMISSIONS.EMAIL_CAMPAIGNS_ANALYTICS),
  };
}

/**
 * Factory used by WorkspaceProvider.
 * @param {{ role?: string } | null} user
 */
export function createPermissionChecker(user) {
  const granted = getPermissionsForUser(user);
  return {
    list: granted,
    /** UX helper only — backend must still authorize. */
    can(permission) {
      return hasPermission(granted, permission);
    },
    canAccessRoute(pathname) {
      const match = Object.keys(ROUTE_PERMISSIONS)
        .sort((a, b) => b.length - a.length)
        .find(
          (href) =>
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(`${href}/`)),
        );
      if (!match) return true;
      return hasPermission(granted, ROUTE_PERMISSIONS[match]);
    },
    campaigns: campaignCapabilities((p) => hasPermission(granted, p)),
    promoCodes: promoCodeCapabilities((p) => hasPermission(granted, p)),
    customers: customerCapabilities((p) => hasPermission(granted, p)),
    templates: templateCapabilities((p) => hasPermission(granted, p)),
    branding: brandingCapabilities((p) => hasPermission(granted, p)),
    emailCampaigns: emailCampaignCapabilities((p) => hasPermission(granted, p)),
    redemptions: redemptionCapabilities((p) => hasPermission(granted, p)),
  };
}
