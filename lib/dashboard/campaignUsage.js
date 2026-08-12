/**
 * Campaign usage rules (frontend).
 */

export const USAGE_MODES = [
  { value: 'SINGLE', label: 'Single Use', maxUses: 1 },
  { value: 'MULTIPLE', label: 'Multiple Use', maxUses: null },
  { value: 'UNLIMITED', label: 'Unlimited', maxUses: null },
];

export function validateUsageFields({ usageMode, maxUses }) {
  const errors = {};
  if (!usageMode) {
    errors.usageMode = 'Select a usage rule.';
    return errors;
  }

  if (usageMode === 'SINGLE') {
    return errors;
  }

  if (usageMode === 'UNLIMITED') {
    return errors;
  }

  const n = Number(maxUses);
  if (!Number.isInteger(n) || n < 2) {
    errors.maxUses = 'Enter a maximum of 2 or more uses.';
  }
  return errors;
}

export function resolveMaxUsesForPayload(usageMode, maxUses) {
  if (usageMode === 'SINGLE') return 1;
  if (usageMode === 'UNLIMITED') return null;
  return Number(maxUses);
}
