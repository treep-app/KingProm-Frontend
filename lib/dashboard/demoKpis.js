/**
 * Demo/placeholder KPI values for metrics the backend does not yet expose.
 * Keep this file UI-only — never import from lib/api or backend services.
 *
 * Replace by wiring live fields in buildDashboardKpis.js once APIs exist.
 */
export const DEMO_KPI_VALUES = {
  revenueGenerated: 24850,
  todaysRedemptions: 89,
};

/** Period-over-period trends for demo metrics only (not production). */
export const DEMO_KPI_TRENDS = {
  revenueGenerated: { direction: 'up', percent: 8.4 },
  todaysRedemptions: { direction: 'up', percent: 12.5 },
};

export const DEMO_KPI_DESCRIPTION = 'vs previous period · demo data';
