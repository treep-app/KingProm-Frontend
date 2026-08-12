export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Locale-aware integer with grouping (e.g. 5,240). */
export function formatNumber(value, { fallback = '—' } = {}) {
  if (value == null || Number.isNaN(Number(value))) return fallback;
  return Number(value).toLocaleString('en-US');
}

/** Currency display for KPI cards (e.g. $24,850). */
export function formatCurrency(value, { currency = 'USD', fallback = '—' } = {}) {
  if (value == null || Number.isNaN(Number(value))) return fallback;
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
}

/**
 * Percent display. Pass a 0–1 ratio (`ratio: true`) or already-scaled percent.
 * Example: formatPercent(0.599, { ratio: true }) → "59.9%"
 */
export function formatPercent(value, { ratio = false, digits = 1, fallback = '—' } = {}) {
  if (value == null || Number.isNaN(Number(value))) return fallback;
  const pct = ratio ? Number(value) * 100 : Number(value);
  return `${pct.toFixed(digits)}%`;
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative time for activity feeds (e.g. "2h ago"). */
export function formatRelativeTime(value, now = Date.now()) {
  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return '';

  const diffSec = Math.round((ts - now) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (abs < 60) return rtf.format(diffSec, 'second');
  const mins = Math.round(diffSec / 60);
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  const hours = Math.round(diffSec / 3600);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(diffSec / 86400);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(diffSec / 2592000);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(Math.round(diffSec / 31536000), 'year');
}

/**
 * Human-friendly remaining time until expiry.
 */
export function formatTimeRemaining(expiresAt, now = Date.now()) {
  const end = new Date(expiresAt).getTime();
  if (!Number.isFinite(end)) return { label: '', urgent: false, expired: true };

  const ms = end - now;
  if (ms <= 0) {
    return { label: 'Expired', urgent: true, expired: true, ms: 0 };
  }

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const urgent = ms <= 48 * 60 * 60 * 1000;

  let label;
  if (days >= 2) {
    label = `${days} days left`;
  } else if (days === 1) {
    label = hours > 0 ? `1 day ${hours}h left` : '1 day left';
  } else if (hours >= 1) {
    label = `${hours}h ${minutes}m left`;
  } else if (minutes >= 1) {
    label = `${minutes}m ${seconds}s left`;
  } else {
    label = `${seconds}s left`;
  }

  return { label, urgent, expired: false, ms, days, hours, minutes, seconds };
}
