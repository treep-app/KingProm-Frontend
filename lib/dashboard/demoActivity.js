/**
 * Demo activity / audit records for UI development.
 * Keep UI-only — never import from lib/api or backend services.
 *
 * Contract (stable for live audit API later):
 * {
 *   id: string,
 *   type: keyof ACTIVITY_TYPES,
 *   message: string,
 *   actor: { name: string, kind?: 'user' | 'system' } | null,
 *   createdAt: ISO string,
 *   meta?: Record<string, unknown>,
 * }
 */

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const DEMO_ACTIVITY_ITEMS = [
  {
    id: 'act_demo_1',
    type: 'PROMO_CODES_CREATED',
    message: 'John created 500 promo codes',
    actor: { name: 'John', kind: 'user' },
    createdAt: hoursAgo(1),
    meta: { count: 500 },
  },
  {
    id: 'act_demo_2',
    type: 'VOUCHER_REDEEMED',
    message: 'Sarah redeemed a voucher',
    actor: { name: 'Sarah', kind: 'user' },
    createdAt: hoursAgo(3),
    meta: {},
  },
  {
    id: 'act_demo_3',
    type: 'CAMPAIGN_CREATED',
    message: 'Admin created a new campaign',
    actor: { name: 'Admin', kind: 'user' },
    createdAt: hoursAgo(6),
    meta: { campaignName: 'Summer Golden Ticket' },
  },
  {
    id: 'act_demo_4',
    type: 'EMAIL_CAMPAIGN_SCHEDULED',
    message: 'Marketing scheduled an email campaign',
    actor: { name: 'Marketing', kind: 'user' },
    createdAt: hoursAgo(12),
    meta: {},
  },
  {
    id: 'act_demo_5',
    type: 'CAMPAIGN_EXPIRED',
    message: 'A campaign expired',
    actor: { name: 'System', kind: 'system' },
    createdAt: hoursAgo(26),
    meta: {},
  },
  {
    id: 'act_demo_6',
    type: 'SETTINGS_UPDATED',
    message: 'Admin updated workspace settings',
    actor: { name: 'Admin', kind: 'user' },
    createdAt: hoursAgo(40),
    meta: {},
  },
  {
    id: 'act_demo_7',
    type: 'TEAM_MEMBER_ADDED',
    message: 'Admin added a team member',
    actor: { name: 'Admin', kind: 'user' },
    createdAt: hoursAgo(52),
    meta: {},
  },
];

export const DEMO_ACTIVITY_NOTE =
  'Demo activity for layout — not live audit data.';
