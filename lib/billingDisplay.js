/**
 * Shared billing display helpers (frontend only — backend enforces limits).
 */

export function formatMoney(cents, currency = 'USD') {
  const amount = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: String(currency || 'USD').toUpperCase(),
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatLimit(limit) {
  if (limit == null) return 'Unlimited';
  return Number(limit).toLocaleString();
}

export function formatUsagePair(used, limit) {
  if (limit == null) return `${Number(used || 0).toLocaleString()} / Unlimited`;
  return `${Number(used || 0).toLocaleString()} / ${Number(limit).toLocaleString()}`;
}

export function statusLabel(status) {
  const map = {
    trialing: 'Trialing',
    active: 'Active',
    past_due: 'Past due',
    cancelled: 'Cancelled',
    expired: 'Expired',
    suspended: 'Suspended',
    incomplete: 'Incomplete',
  };
  return map[String(status || '').toLowerCase()] || status || 'Unknown';
}

export function invoiceStatusLabel(status) {
  const map = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    open: 'Open',
    draft: 'Draft',
    void: 'Void',
    uncollectible: 'Uncollectible',
  };
  return map[String(status || '').toLowerCase()] || status || 'Unknown';
}

export const PLAN_FEATURE_ROWS = [
  { key: 'customers', label: 'Customers', kind: 'limit' },
  { key: 'vouchers', label: 'Promo codes', kind: 'limit' },
  { key: 'campaigns', label: 'Campaigns', kind: 'limit' },
  { key: 'emails', label: 'Email sending', kind: 'limit' },
  { key: 'users', label: 'Users', kind: 'limit' },
  { key: 'analytics', label: 'Analytics', kind: 'feature' },
  { key: 'advancedReports', label: 'Advanced reports', kind: 'feature' },
  { key: 'emailCampaigns', label: 'Email campaigns', kind: 'feature' },
  { key: 'integrations', label: 'Integrations', kind: 'feature' },
];

export function planCellValue(plan, row) {
  if (!plan) return '—';
  if (row.kind === 'feature') {
    return plan.features?.[row.key] ? 'Yes' : '—';
  }
  const limit = plan.limits?.[row.key];
  return formatLimit(limit);
}
