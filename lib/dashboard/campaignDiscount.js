/**
 * Campaign discount configuration (frontend).
 * Persisted via discountType / discountValue on the campaigns API.
 */

export const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage', valueLabel: 'Percentage', placeholder: '20', suffix: '%' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount', valueLabel: 'Amount', placeholder: '50', prefix: '$' },
  { value: 'FREE_ITEM', label: 'Free Item', valueLabel: 'Item', placeholder: 'Breakfast' },
  { value: 'FREE_STAY', label: 'Free Stay', valueLabel: 'Stay length', placeholder: '1 night' },
  { value: 'FREE_DRINK', label: 'Free Drink', valueLabel: 'Drink', placeholder: 'Welcome cocktail' },
  { value: 'ROOM_UPGRADE', label: 'Room Upgrade', valueLabel: 'Upgrade', placeholder: 'Ocean view' },
  { value: 'CUSTOM', label: 'Custom', valueLabel: 'Offer value', placeholder: 'Describe the offer' },
];

export function getDiscountTypeMeta(type) {
  return DISCOUNT_TYPES.find((item) => item.value === type) || null;
}

export function formatDiscountDisplay(discountType, discountValue, fallback = '—') {
  const value = String(discountValue || '').trim();
  if (!discountType && !value) return fallback;

  switch (String(discountType || '').toUpperCase()) {
    case 'PERCENTAGE':
      return value ? `${value}%` : fallback;
    case 'FIXED_AMOUNT':
      return value ? `$${value}` : fallback;
    case 'FREE_STAY':
      return value || 'Free Stay';
    case 'FREE_ITEM':
      return value || 'Free Item';
    case 'FREE_DRINK':
      return value || 'Free Drink';
    case 'ROOM_UPGRADE':
      return value || 'Room Upgrade';
    case 'CUSTOM':
      return value || fallback;
    default:
      return value || fallback;
  }
}

/**
 * Client-side discount validation (UX). Server re-validates.
 */
export function validateDiscountFields({ discountType, discountValue }) {
  const errors = {};
  if (!discountType) {
    errors.discountType = 'Select a discount type.';
    return errors;
  }

  const raw = String(discountValue || '').trim();

  if (discountType === 'PERCENTAGE') {
    if (!raw) {
      errors.discountValue = 'Enter a percentage.';
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) {
        errors.discountValue = 'Percentage must be greater than 0.';
      } else if (n > 100) {
        errors.discountValue = 'Percentage must not exceed 100.';
      }
    }
    return errors;
  }

  if (discountType === 'FIXED_AMOUNT') {
    if (!raw) {
      errors.discountValue = 'Enter an amount.';
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) {
        errors.discountValue = 'Amount must be a valid positive number.';
      }
    }
    return errors;
  }

  if (!raw) {
    errors.discountValue = 'Enter a discount value.';
  }
  return errors;
}

export function buildOfferTitleFromDiscount(discountType, discountValue) {
  const value = String(discountValue || '').trim();
  switch (discountType) {
    case 'PERCENTAGE':
      return value ? `${value}% OFF` : 'Special offer';
    case 'FIXED_AMOUNT':
      return value ? `$${value} OFF` : 'Special offer';
    case 'FREE_STAY':
      return value ? `Free Stay — ${value}` : 'Free Stay';
    case 'FREE_ITEM':
      return value ? `Free ${value}` : 'Free Item';
    case 'FREE_DRINK':
      return value ? `Free Drink — ${value}` : 'Free Drink';
    case 'ROOM_UPGRADE':
      return value ? `Room Upgrade — ${value}` : 'Room Upgrade';
    case 'CUSTOM':
    default:
      return value || 'Special offer';
  }
}
