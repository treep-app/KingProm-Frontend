/**
 * Demo active campaigns for UI when the campaigns API is unavailable.
 * Keep UI-only — never import from lib/api or backend services.
 *
 * Display contract (same as live mapper output):
 * {
 *   id, name, purpose, codes, redeemed, remaining,
 *   expiresLabel, expiresAt, status, href?
 * }
 */

export const DEMO_ACTIVE_CAMPAIGNS = [
  {
    id: 'demo_christmas',
    name: 'Christmas Offer',
    purpose: 'Hotel',
    codes: 500,
    redeemed: 312,
    remaining: 188,
    expiresLabel: '31 Dec',
    expiresAt: '2026-12-31T23:59:59.000Z',
    status: 'ACTIVE',
    href: '/dashboard/campaigns',
  },
  {
    id: 'demo_weekend',
    name: 'Weekend Escape',
    purpose: 'Spa & dining',
    codes: 240,
    redeemed: 96,
    remaining: 144,
    expiresLabel: '15 Sep',
    expiresAt: '2026-09-15T23:59:59.000Z',
    status: 'ACTIVE',
    href: '/dashboard/campaigns',
  },
  {
    id: 'demo_loyalty',
    name: 'Loyalty Rewards',
    purpose: 'Returning guests',
    codes: 1200,
    redeemed: 840,
    remaining: 360,
    expiresLabel: '30 Nov',
    expiresAt: '2026-11-30T23:59:59.000Z',
    status: 'ACTIVE',
    href: '/dashboard/campaigns',
  },
];

export const DEMO_ACTIVE_CAMPAIGNS_NOTE =
  'Demo campaigns for layout — not live production data.';
