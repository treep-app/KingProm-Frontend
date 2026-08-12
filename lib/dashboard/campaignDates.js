/**
 * Campaign validity dates.
 *
 * Backend stores TIMESTAMPTZ in UTC. The form uses calendar dates (YYYY-MM-DD).
 * We send:
 *   startsAt → YYYY-MM-DDT00:00:00.000Z
 *   endsAt   → YYYY-MM-DDT23:59:59.999Z
 * so the selected calendar day is preserved in UTC without local-offset drift.
 */

export function toDateInputValue(isoOrDate) {
  if (!isoOrDate) return '';
  const raw = String(isoOrDate);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function dateInputToStartIso(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  return `${dateStr}T00:00:00.000Z`;
}

export function dateInputToEndIso(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  return `${dateStr}T23:59:59.999Z`;
}

export function validateValidityFields({ startDate, endDate }) {
  const errors = {};
  if (!startDate) {
    errors.startDate = 'Start date is required.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    errors.startDate = 'Start date must be a valid date.';
  }

  if (!endDate) {
    errors.endDate = 'End date is required.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    errors.endDate = 'End date must be a valid date.';
  }

  if (!errors.startDate && !errors.endDate && endDate < startDate) {
    errors.endDate = 'End date cannot be before start date.';
  }

  return errors;
}
