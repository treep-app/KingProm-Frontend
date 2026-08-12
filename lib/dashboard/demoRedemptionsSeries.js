/**
 * Demo time-series for the dashboard analytics preview.
 * UI-only — never import from lib/api or backend services.
 *
 * Shape matches the live contract expected later:
 *   { date: 'YYYY-MM-DD', redemptions: number }[]
 *
 * Replace by wiring GET analytics series into AnalyticsPreview.
 */

function buildSeries(days = 14) {
  const points = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Deterministic demo curve (not random) so SSR/client match.
  const pattern = [12, 18, 15, 22, 28, 24, 31, 27, 35, 42, 38, 45, 40, 52];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const idx = days - 1 - i;
    points.push({
      date: iso,
      redemptions: pattern[idx % pattern.length],
    });
  }

  return points;
}

export const DEMO_REDEMPTIONS_SERIES = buildSeries(14);

export const DEMO_REDEMPTIONS_NOTE =
  'Demo series for layout — not live production data.';
