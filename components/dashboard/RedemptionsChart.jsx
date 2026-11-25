'use client';

import TimeSeriesChart from './charts/TimeSeriesChart';

/**
 * Backward-compatible wrapper around TimeSeriesChart.
 * Expects series: { date: 'YYYY-MM-DD', redemptions: number }[]
 */
export default function RedemptionsChart({ series = [], size = 'default' }) {
  return (
    <TimeSeriesChart
      series={series}
      valueKey="redemptions"
      unitLabel="redemptions"
      ariaLabel="Voucher redemptions over time"
      emptyLabel="No redemption data for this period"
      size={size}
    />
  );
}
