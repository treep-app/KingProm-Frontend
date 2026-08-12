/**
 * Analytics + reporting API client.
 * Metrics are computed on the backend — do not recalculate business KPIs in React.
 */

import {
  adminFetch,
  adminHeaders,
  getAdminKey,
  omitClientTenantOverrides,
} from './client';

function buildRangeParams({
  days,
  preset,
  from,
  to,
  campaignId = '',
} = {}) {
  const safe = omitClientTenantOverrides({ days, preset, from, to, campaignId });
  const params = new URLSearchParams();
  if (safe.preset) params.set('preset', String(safe.preset));
  if (safe.days != null && safe.days !== '') params.set('days', String(safe.days));
  if (safe.from) params.set('from', String(safe.from));
  if (safe.to) params.set('to', String(safe.to));
  if (safe.campaignId) params.set('campaignId', String(safe.campaignId));
  return params;
}

/** GET /api/admin/analytics/summary — legacy-compatible overview summary */
export async function getAnalyticsSummary(range = {}) {
  const params = buildRangeParams(range);
  if (!params.has('days') && !params.has('preset')) {
    params.set('days', '30');
  }
  return adminFetch(`/api/admin/analytics/summary?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/analytics/dashboard — full Phase 7 payload */
export async function getDashboardAnalytics(range = {}) {
  const params = buildRangeParams(range);
  if (!params.has('days') && !params.has('preset')) {
    params.set('preset', 'last_30_days');
  }
  return adminFetch(`/api/admin/analytics/dashboard?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** GET /api/admin/analytics/redemptions-series */
export async function getRedemptionsSeries(range = {}) {
  const params = buildRangeParams(range);
  if (!params.has('days') && !params.has('preset')) {
    params.set('days', '30');
  }
  return adminFetch(`/api/admin/analytics/redemptions-series?${params}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/**
 * Download a CSV report. Returns { ok, filename } or error shape.
 * type: campaigns | vouchers | redemptions | customers | email
 */
export async function exportAnalyticsReport(type, range = {}) {
  const params = buildRangeParams(range);
  if (!params.has('days') && !params.has('preset') && !params.has('from')) {
    params.set('preset', 'last_30_days');
  }

  const key = getAdminKey();
  try {
    const res = await fetch(
      `/api/admin/analytics/export/${encodeURIComponent(type)}?${params}`,
      {
        headers: {
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      let message = 'Unable to export report.';
      try {
        const data = await res.json();
        if (data?.message) message = data.message;
      } catch {
        /* ignore */
      }
      return { ok: false, status: res.status, data: { message } };
    }

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = /filename="([^"]+)"/.exec(disposition);
    const filename = match?.[1] || `${type}-report.csv`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return { ok: true, status: res.status, filename };
  } catch {
    return {
      ok: false,
      status: 0,
      networkError: true,
      data: { message: 'Network error while exporting report.' },
    };
  }
}
