/**
 * Promo-code lifecycle labels for the admin UI.
 * Maps ticket inventory/assignment + DB status → product statuses.
 */

export const PROMO_LIFECYCLE = {
  UNUSED: 'UNUSED',
  ASSIGNED: 'ASSIGNED',
  REDEEMED: 'REDEEMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

/**
 * Prefer API displayStatus when present; otherwise derive from ticket fields.
 */
export function resolvePromoDisplayStatus(ticket) {
  if (!ticket) return '';
  if (ticket.displayStatus) return String(ticket.displayStatus).toUpperCase();
  const status = String(ticket.status || '').toUpperCase();
  if (
    status === PROMO_LIFECYCLE.UNUSED ||
    status === PROMO_LIFECYCLE.ASSIGNED ||
    status === PROMO_LIFECYCLE.REDEEMED ||
    status === PROMO_LIFECYCLE.EXPIRED ||
    status === PROMO_LIFECYCLE.CANCELLED
  ) {
    return status;
  }
  if (status === 'REDEEMED') return PROMO_LIFECYCLE.REDEEMED;
  if (status === 'EXPIRED') return PROMO_LIFECYCLE.EXPIRED;
  if (!ticket.email) return PROMO_LIFECYCLE.UNUSED;
  return PROMO_LIFECYCLE.ASSIGNED;
}

export function formatUsageDisplay(ticket) {
  const used = Number(ticket?.timesRedeemed) || 0;
  if (ticket?.usageMode === 'UNLIMITED' || ticket?.usageLimit == null) {
    return `${used} / ∞`;
  }
  return `${used} / ${ticket.usageLimit}`;
}

export function customerLabel(ticket) {
  return ticket?.email ? ticket.email : 'Unassigned';
}
