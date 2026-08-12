'use client';

import { useState } from 'react';
import { Download, FileBarChart } from 'lucide-react';
import * as analyticsService from '../../lib/api/analyticsService';
import {
  ANALYTICS_REPORT_TYPES,
  DEFAULT_ANALYTICS_PRESET,
} from '../../lib/dashboard/constants';
import AlertBanner from './AlertBanner';
import AnalyticsDateRangeControl from './AnalyticsDateRangeControl';
import {
  Button,
  PageContainer,
  PageHeader,
  SectionHeader,
} from './ui';

export default function ReportsManager() {
  const [preset, setPreset] = useState(DEFAULT_ANALYTICS_PRESET);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busyType, setBusyType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const range =
    preset === 'custom' ? { preset: 'custom', from, to } : { preset };

  const canExport = preset !== 'custom' || (Boolean(from) && Boolean(to));

  async function handleExport(type) {
    if (!canExport) {
      setError('Select both from and to dates for a custom range.');
      return;
    }
    setBusyType(type);
    setError('');
    setSuccess('');
    const result = await analyticsService.exportAnalyticsReport(type, range);
    if (!result.ok) {
      setError(result.data?.message || 'Unable to export report.');
    } else {
      setSuccess(`Downloaded ${result.filename}`);
    }
    setBusyType('');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Generate downloadable business reports for campaigns, vouchers, redemptions, customers, and email."
        actions={
          <AnalyticsDateRangeControl
            idPrefix="reports"
            preset={preset}
            from={from}
            to={to}
            onChange={({ preset: nextPreset, from: nextFrom, to: nextTo }) => {
              setPreset(nextPreset);
              setFrom(nextFrom || '');
              setTo(nextTo || '');
            }}
          />
        }
      />

      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <SectionHeader
        title="Available reports"
        description="CSV exports respect your signed-in session and the selected date range."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {ANALYTICS_REPORT_TYPES.map((report) => {
          const busy = busyType === report.id;
          return (
            <article key={report.id} className="dash-panel flex flex-col p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-surface-2)] text-[var(--dash-ink-soft)] ring-1 ring-[var(--dash-border)]">
                  <FileBarChart className="size-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{report.title}</h2>
                  <p className="mt-1 text-sm text-[var(--dash-muted)]">{report.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy || !canExport}
                  loading={busy}
                  className="w-full sm:w-auto"
                  onClick={() => handleExport(report.id)}
                >
                  <Download className="size-4" />
                  {busy ? 'Generating report…' : 'Export CSV'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-[var(--dash-muted)]">
        PDF and Excel exports are planned. Large historical exports may move to background jobs in a
        later release.
      </p>
    </PageContainer>
  );
}
