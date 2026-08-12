/**
 * Promo-code generation config for campaign create/edit.
 * Generation always runs on the backend — never Math.random() in the browser.
 */

export const CODE_QUANTITY_PRESETS = [
  { value: 1, label: '1' },
  { value: 10, label: '10' },
  { value: 100, label: '100' },
  { value: 500, label: '500' },
  { value: 1000, label: '1,000' },
  { value: 5000, label: '5,000' },
  { value: 'custom', label: 'Custom' },
];

export const MAX_GENERATE_QUANTITY = 5000;
export const MIN_GENERATE_QUANTITY = 1;

const PURPOSE_PREFIX_MAP = {
  Hotel: 'HOTEL',
  Event: 'EVENT',
  'Food & Drinks': 'FOOD',
  Restaurant: 'REST',
  Spa: 'SPA',
  Laundry: 'LAUN',
  'Room Upgrade': 'UPGR',
  Gift: 'GIFT',
  'General Discount': 'DISC',
  Other: 'PROMO',
};

export function suggestPrefixFromPurpose(purpose, purposeOther = '', name = '') {
  if (purpose && PURPOSE_PREFIX_MAP[purpose] && purpose !== 'Other') {
    return PURPOSE_PREFIX_MAP[purpose];
  }
  const source = purpose === 'Other' ? purposeOther || name : purpose || name;
  const cleaned = String(source || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 6);
  return cleaned || 'PROMO';
}

export function normalizeCodePrefix(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 12);
}

/**
 * Resolve numeric quantity from preset / custom UI state.
 * Returns null when generation is disabled (quantity 0).
 */
export function resolveGenerateQuantity({ quantityPreset, customQuantity, generateEnabled }) {
  if (!generateEnabled) return 0;
  if (quantityPreset === 'custom') {
    const n = Number(customQuantity);
    return Number.isInteger(n) ? n : NaN;
  }
  return Number(quantityPreset);
}

export function validateCodeGenerationFields({
  generateEnabled,
  quantityPreset,
  customQuantity,
  codePrefix,
}) {
  const errors = {};
  if (!generateEnabled) return errors;

  const quantity = resolveGenerateQuantity({
    quantityPreset,
    customQuantity,
    generateEnabled: true,
  });

  if (!Number.isInteger(quantity) || quantity < MIN_GENERATE_QUANTITY) {
    errors.quantity =
      quantityPreset === 'custom'
        ? 'Enter a valid custom quantity.'
        : 'Select a quantity.';
  } else if (quantity > MAX_GENERATE_QUANTITY) {
    errors.quantity = `Maximum ${MAX_GENERATE_QUANTITY.toLocaleString('en-US')} codes per request.`;
  }

  const prefix = normalizeCodePrefix(codePrefix);
  if (!prefix || prefix.length < 2) {
    errors.codePrefix = 'Prefix must be at least 2 characters (A–Z, 0–9).';
  }

  return errors;
}

/** Example code preview only — not used for production generation. */
export function formatCodeExample(prefix) {
  const safe = normalizeCodePrefix(prefix) || 'PROMO';
  return `${safe}-XXXXXX`;
}
