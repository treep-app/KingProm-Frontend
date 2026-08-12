/**
 * Campaign purpose options for create/edit forms.
 * Stored in campaign.description until the API has a dedicated purpose field.
 */

export const CAMPAIGN_PURPOSE_OPTIONS = [
  'Hotel',
  'Event',
  'Food & Drinks',
  'Restaurant',
  'Spa',
  'Laundry',
  'Room Upgrade',
  'Gift',
  'General Discount',
  'Other',
];

export const CAMPAIGN_PURPOSE_OTHER = 'Other';

/**
 * Map stored description → form purpose fields.
 */
export function parsePurposeFromDescription(description) {
  const value = String(description || '').trim();
  if (!value) {
    return { purpose: '', purposeOther: '' };
  }
  if (CAMPAIGN_PURPOSE_OPTIONS.includes(value) && value !== CAMPAIGN_PURPOSE_OTHER) {
    return { purpose: value, purposeOther: '' };
  }
  if (value === CAMPAIGN_PURPOSE_OTHER) {
    return { purpose: CAMPAIGN_PURPOSE_OTHER, purposeOther: '' };
  }
  return { purpose: CAMPAIGN_PURPOSE_OTHER, purposeOther: value };
}

/**
 * Map form purpose fields → API description string.
 */
export function purposeToDescription(purpose, purposeOther = '') {
  const selected = String(purpose || '').trim();
  if (!selected) return '';
  if (selected === CAMPAIGN_PURPOSE_OTHER) {
    return String(purposeOther || '').trim();
  }
  return selected;
}
