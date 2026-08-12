/** Catalog of customer tags — use these options in filters and forms. */
export const CUSTOMER_TAG_OPTIONS = [
  'VIP',
  'Corporate',
  'Birthday',
  'Wedding',
  'Repeat Guest',
  'New Customer',
];

/**
 * Normalize tag list: trim, dedupe, cap length.
 * @param {unknown} tags
 * @returns {string[]}
 */
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [
    ...new Set(
      tags
        .map((t) => String(t || '').trim())
        .filter(Boolean)
        .slice(0, 20),
    ),
  ];
}

/**
 * Merge selected tags with any custom values already on the customer.
 * @param {string[]} selected
 * @param {string[]} existing
 */
export function mergeCustomerTags(selected = [], existing = []) {
  return normalizeTags([...selected, ...existing]);
}
