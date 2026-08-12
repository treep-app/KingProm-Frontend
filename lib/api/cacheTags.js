/**
 * Central cache-tag map for Phase 10A invalidation.
 * Mutations should invalidate only the tags they affect.
 *
 * Cache keys are always scoped by tenant at the query-cache layer.
 * Tags themselves are resource-level (tenant prefix is applied separately).
 */

export const CACHE_TAGS = {
  SESSION: 'session',
  DASHBOARD_SUMMARY: 'dashboard:summary',
  DASHBOARD_SERIES: 'dashboard:series',
  CAMPAIGNS: 'campaigns',
  CAMPAIGN: 'campaign',
  CUSTOMERS: 'customers',
  CUSTOMER: 'customer',
  CUSTOMER_STATS: 'customers:stats',
  PROMO_CODES: 'promo-codes',
  PROMO_CODE: 'promo-code',
  REDEMPTIONS: 'redemptions',
  REDEMPTION: 'redemption',
  TEMPLATES: 'templates',
  TEMPLATE: 'template',
  BRANDING: 'branding',
  ANALYTICS: 'analytics',
  EMAIL_CAMPAIGNS: 'email-campaigns',
  INTEGRATIONS: 'integrations',
  AUTOMATIONS: 'automations',
  API_KEYS: 'api-keys',
};

/** Which tags to invalidate after a successful mutation. */
export const INVALIDATION_MAP = {
  campaignCreate: [
    CACHE_TAGS.CAMPAIGNS,
    CACHE_TAGS.DASHBOARD_SUMMARY,
    CACHE_TAGS.ANALYTICS,
  ],
  campaignUpdate: [
    CACHE_TAGS.CAMPAIGNS,
    CACHE_TAGS.CAMPAIGN,
    CACHE_TAGS.DASHBOARD_SUMMARY,
    CACHE_TAGS.ANALYTICS,
  ],
  customerCreate: [CACHE_TAGS.CUSTOMERS, CACHE_TAGS.CUSTOMER_STATS],
  customerUpdate: [
    CACHE_TAGS.CUSTOMERS,
    CACHE_TAGS.CUSTOMER,
    CACHE_TAGS.CUSTOMER_STATS,
  ],
  customerArchive: [
    CACHE_TAGS.CUSTOMERS,
    CACHE_TAGS.CUSTOMER,
    CACHE_TAGS.CUSTOMER_STATS,
  ],
  promoAssign: [
    CACHE_TAGS.PROMO_CODES,
    CACHE_TAGS.PROMO_CODE,
    CACHE_TAGS.CUSTOMER,
    CACHE_TAGS.CUSTOMERS,
    CACHE_TAGS.CAMPAIGN,
    CACHE_TAGS.DASHBOARD_SUMMARY,
  ],
  promoCancel: [
    CACHE_TAGS.PROMO_CODES,
    CACHE_TAGS.PROMO_CODE,
    CACHE_TAGS.CAMPAIGN,
    CACHE_TAGS.DASHBOARD_SUMMARY,
  ],
  promoGenerate: [
    CACHE_TAGS.PROMO_CODES,
    CACHE_TAGS.CAMPAIGN,
    CACHE_TAGS.CAMPAIGNS,
    CACHE_TAGS.DASHBOARD_SUMMARY,
    CACHE_TAGS.ANALYTICS,
  ],
  redemptionCreate: [
    CACHE_TAGS.REDEMPTIONS,
    CACHE_TAGS.REDEMPTION,
    CACHE_TAGS.PROMO_CODE,
    CACHE_TAGS.PROMO_CODES,
    CACHE_TAGS.CAMPAIGN,
    CACHE_TAGS.DASHBOARD_SUMMARY,
    CACHE_TAGS.DASHBOARD_SERIES,
    CACHE_TAGS.ANALYTICS,
  ],
  templateMutation: [CACHE_TAGS.TEMPLATES, CACHE_TAGS.TEMPLATE],
  brandingMutation: [CACHE_TAGS.BRANDING],
  integrationMutation: [CACHE_TAGS.INTEGRATIONS],
  automationMutation: [CACHE_TAGS.AUTOMATIONS],
  apiKeyMutation: [CACHE_TAGS.API_KEYS],
};
