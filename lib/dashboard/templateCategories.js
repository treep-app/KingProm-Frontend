/**
 * Voucher template categories — mirrors backend TEMPLATE_CATEGORIES.
 */

export const TEMPLATE_CATEGORIES = [
  'Hotel',
  'Restaurant',
  'Food & Drinks',
  'Event',
  'Spa',
  'Gift Voucher',
  'Discount',
  'Corporate',
  'Wedding',
  'Birthday',
  'General',
];

export const TEMPLATE_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};

export const TEMPLATE_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const TEMPLATE_SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'campaignCount', label: 'Campaign usage' },
];

export function categoryLabel(value) {
  return TEMPLATE_CATEGORIES.includes(value) ? value : value || 'General';
}

export function isValidCategory(value) {
  return TEMPLATE_CATEGORIES.includes(value);
}

export function statusLabel(status) {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ARCHIVED':
      return 'Archived';
    case 'DRAFT':
    default:
      return 'Draft';
  }
}
