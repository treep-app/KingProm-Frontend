import { formatRelativeTime } from '../format';

/**
 * Display name for a customer record.
 * @param {{ firstName?: string, lastName?: string, email?: string | null }} customer
 */
export function customerDisplayName(customer) {
  if (!customer) return 'Customer';
  const parts = [customer.firstName, customer.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (customer.email) return customer.email.split('@')[0] || 'Customer';
  return 'Customer';
}

/**
 * Two-letter initials for avatar chips.
 * @param {{ firstName?: string, lastName?: string, email?: string | null }} customer
 */
export function customerInitials(customer) {
  if (!customer) return '?';
  const first = String(customer.firstName || '').trim();
  const last = String(customer.lastName || '').trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();
  const email = String(customer.email || '').trim();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

/**
 * Relative last-activity label for list/detail views.
 * @param {string | null | undefined} value
 */
export function formatRelativeActivity(value) {
  if (!value) return 'No activity';
  const relative = formatRelativeTime(value);
  return relative || 'No activity';
}
