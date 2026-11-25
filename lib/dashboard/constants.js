/**
 * Shared dashboard constants — avoid magic numbers / duplicated option lists.
 */

export const TICKET_PAGE_SIZE = 25;
export const CUSTOMER_PAGE_SIZE = 25;
export const CAMPAIGN_LIST_LIMIT = 50;
export const EMAIL_CAMPAIGN_LIST_LIMIT = 25;
export const REDEMPTION_LIST_LIMIT = 25;
export const ACTIVE_CAMPAIGN_LIST_LIMIT = 20;
/** Rows shown on the main dashboard (full list lives on Campaigns). */
export const DASHBOARD_OVERVIEW_CAMPAIGN_ROWS = 4;
export const RECENT_ACTIVITY_PREVIEW_LIMIT = 4;
export const DEFAULT_ANALYTICS_DAYS = 30;
export const DEFAULT_ANALYTICS_PRESET = 'last_30_days';

/** Global analytics date-range presets (backend-normalized via business timezone). */
export const ANALYTICS_RANGE_OPTIONS = [
  { value: 'today', label: 'Today', days: 1 },
  { value: 'yesterday', label: 'Yesterday', days: 1 },
  { value: 'last_7_days', label: 'Last 7 days', days: 7 },
  { value: 'last_30_days', label: 'Last 30 days', days: 30 },
  { value: 'last_90_days', label: 'Last 90 days', days: 90 },
  { value: 'this_year', label: 'This year', days: null },
  { value: 'custom', label: 'Custom range', days: null },
];

/** Legacy numeric day options still used by Overview until it migrates to presets. */
export const ANALYTICS_DAY_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

export const ANALYTICS_REPORT_TYPES = [
  {
    id: 'campaigns',
    title: 'Campaign Report',
    description: 'Generated codes, emails sent, redemptions, and conversion by campaign.',
  },
  {
    id: 'vouchers',
    title: 'Voucher Report',
    description: 'Promo-code volumes by lifecycle status and voucher type.',
  },
  {
    id: 'redemptions',
    title: 'Redemption Report',
    description: 'Daily redemptions plus breakdowns by location and staff.',
  },
  {
    id: 'customers',
    title: 'Customer Report',
    description: 'Top customers by vouchers and redemptions.',
  },
  {
    id: 'email',
    title: 'Email Campaign Report',
    description: 'Delivery, open, and click performance by email campaign.',
  },
];

/** Product lifecycle filters for global promo-code management. */
export const TICKET_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'UNUSED', label: 'Unused' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'REDEEMED', label: 'Redeemed' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PROMO_CODE_PAGE_SIZE_OPTIONS = [25, 50, 100];

export const TICKET_LIFECYCLE_STEPS = [
  { status: 'ISSUED', label: 'Created & emailed' },
  { status: 'REVEALED', label: 'Guest scratched' },
  { status: 'REDEEMED', label: 'Claimed at venue' },
  { status: 'EXPIRED', label: 'Past validity' },
];
