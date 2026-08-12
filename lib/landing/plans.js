/**
 * Marketing plan catalog — single source of truth for the landing page.
 * Mirrors Phase 9 `subscription_plans` (migration 013). Backend remains authoritative
 * at checkout; this file must stay in sync with those limits/prices.
 *
 * Billing interval: monthly only (no annual Stripe prices yet).
 */

export const BILLING_INTERVAL = 'month';
export const ANNUAL_BILLING_AVAILABLE = false;

/** Demo metrics for product visuals only — not live tenant data. */
export const DEMO_METRICS = {
  revenueLabel: '$48,200',
  revenueHint: 'Tracked offer value (demo)',
  activeCampaigns: 12,
  promoCodes: '8,420',
  redemptions: '6,104',
  customers: '3,891',
  redemptionRate: '72.5%',
  campaignName: 'Holiday Stay Offer',
  campaignVouchers: '2,500',
  campaignRedeemed: '1,840',
  campaignRate: '73.6%',
};

export const MARKETING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    currency: 'USD',
    interval: 'month',
    trialDays: 0,
    highlight: false,
    description: 'For testing and getting started with core promo tools.',
    ctaLabel: 'Start Free',
    ctaHref: '/signup',
    limits: {
      customers: 100,
      vouchers: 500,
      emails: 500,
      users: 1,
      campaigns: 3,
    },
    features: {
      analytics: true,
      emailCampaigns: false,
      advancedReports: false,
      integrations: false,
      sso: false,
    },
    bullets: [
      '3 campaigns',
      '500 promo codes',
      '100 customers',
      '1 user seat',
      'QR redemption',
      'Basic analytics',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    priceCents: 4900,
    currency: 'USD',
    interval: 'month',
    trialDays: 14,
    highlight: false,
    description: 'For small hospitality businesses.',
    ctaLabel: 'Start Starter',
    ctaHref: '/signup',
    limits: {
      customers: 5000,
      vouchers: 10000,
      emails: 10000,
      users: 5,
      campaigns: 25,
    },
    features: {
      analytics: true,
      emailCampaigns: true,
      advancedReports: false,
      integrations: false,
      sso: false,
    },
    bullets: [
      '25 campaigns',
      '10,000 promo codes / month',
      '5,000 customers',
      '5 user seats',
      'Email campaigns',
      'QR redemption',
      'Analytics',
      '14-day trial',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    priceCents: 14900,
    currency: 'USD',
    interval: 'month',
    trialDays: 14,
    highlight: true,
    badge: 'Most Popular',
    description: 'For growing venues that need advanced analytics and integrations.',
    ctaLabel: 'Start Professional',
    ctaHref: '/signup',
    limits: {
      customers: null,
      vouchers: 100000,
      emails: 100000,
      users: 25,
      campaigns: null,
    },
    features: {
      analytics: true,
      emailCampaigns: true,
      advancedReports: true,
      integrations: true,
      sso: false,
    },
    bullets: [
      'Unlimited campaigns',
      '100,000 promo codes / month',
      'Unlimited customers',
      '25 user seats',
      'Advanced analytics',
      'Email campaigns',
      'Integrations & automations',
      'API keys & webhooks',
      '14-day trial',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 0,
    currency: 'USD',
    interval: 'month',
    trialDays: 0,
    highlight: false,
    customPrice: true,
    description: 'Custom limits, dedicated support, and enterprise controls.',
    ctaLabel: 'Contact Sales',
    ctaHref: 'mailto:hello@kingprom.com?subject=KingProm%20Enterprise',
    limits: {
      customers: null,
      vouchers: null,
      emails: null,
      users: null,
      campaigns: null,
    },
    features: {
      analytics: true,
      emailCampaigns: true,
      advancedReports: true,
      integrations: true,
      sso: true,
    },
    bullets: [
      'Custom voucher & email limits',
      'Negotiated seats & capacity',
      'Advanced integrations',
      'SSO-ready controls',
      'Dedicated support',
      'Custom onboarding',
    ],
  },
];

export const COMPARISON_ROWS = [
  { key: 'campaigns', label: 'Campaigns', kind: 'limit' },
  { key: 'vouchers', label: 'Promo codes', kind: 'limit' },
  { key: 'customers', label: 'Customers', kind: 'limit' },
  { key: 'users', label: 'Team seats', kind: 'limit' },
  { key: 'emails', label: 'Email sending', kind: 'limit' },
  { key: 'analytics', label: 'Analytics', kind: 'feature' },
  { key: 'emailCampaigns', label: 'Email campaigns', kind: 'feature' },
  { key: 'advancedReports', label: 'Advanced analytics', kind: 'feature' },
  { key: 'integrations', label: 'Integrations & automation', kind: 'feature' },
  { key: 'sso', label: 'SSO', kind: 'feature' },
];
