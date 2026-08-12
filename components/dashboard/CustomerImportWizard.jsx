'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import * as customerService from '../../lib/api/customerService';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import { formatNumber } from '../../lib/format';
import AuthGate from './AuthGate';
import FormSection from './FormSection';
import { useToast } from './ToastProvider';
import { Button, LoadingState, PageContainer, PageHeader } from './ui';

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'map', label: 'Map fields' },
  { id: 'preview', label: 'Preview' },
  { id: 'import', label: 'Import' },
];

const FIELD_OPTIONS = [
  { key: '', label: 'Skip column' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'tags', label: 'Tags (comma-separated)' },
  { key: 'notes', label: 'Internal notes' },
];

function guessMapping(headers) {
  const mapping = {};
  const rules = [
    { keys: ['first name', 'firstname', 'first'], field: 'firstName' },
    { keys: ['last name', 'lastname', 'last', 'surname'], field: 'lastName' },
    { keys: ['email', 'e-mail'], field: 'email' },
    { keys: ['phone', 'mobile', 'tel'], field: 'phone' },
    { keys: ['company', 'organization', 'org'], field: 'company' },
    { keys: ['tags', 'tag', 'labels'], field: 'tags' },
    { keys: ['notes', 'note', 'comments'], field: 'notes' },
  ];

  for (const header of headers) {
    const lower = String(header).trim().toLowerCase();
    const match = rules.find((rule) => rule.keys.some((k) => lower.includes(k)));
    mapping[header] = match?.field || '';
  }
  return mapping;
}

function CustomerImportWizardInner() {
  const toast = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const step = STEPS[stepIndex];

  const mappingValid = useMemo(
    () => Object.values(mapping).some((v) => v === 'firstName'),
    [mapping],
  );

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file.');
      return;
    }
    try {
      const text = await file.text();
      setCsvText(text);
      setFileName(file.name);
      setPreview(null);
      setImportResult(null);
      setStepIndex(0);
    } catch {
      toast.error('Unable to read the file. Please try again.');
    }
  }

  async function runPreview() {
    if (!csvText) {
      toast.error('Upload a CSV file first.');
      return;
    }
    setBusy(true);
    try {
      const result = await customerService.previewImport({ csvText, mapping });
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to preview the import. Please try again.', {
            resource: 'customer',
          }),
        );
        setBusy(false);
        return;
      }
      setPreview(result.data);
      if (!headers.length && result.data.headers?.length) {
        setHeaders(result.data.headers);
        if (!Object.keys(mapping).length) {
          setMapping(guessMapping(result.data.headers));
        }
      }
      setStepIndex(2);
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Unable to preview the import.'));
    }
    setBusy(false);
  }

  async function runImport() {
    setBusy(true);
    try {
      const result = await customerService.commitImport({
        csvText,
        mapping,
        skipDuplicates,
      });
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Import failed. Please try again.', {
            resource: 'customer',
          }),
        );
        setBusy(false);
        return;
      }
      setImportResult(result.data);
      setStepIndex(3);
      toast.success(`Imported ${result.data.createdCount} customer(s)`);
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Import failed.'));
    }
    setBusy(false);
  }

  function goToMap() {
    if (!csvText) {
      toast.error('Upload a CSV file first.');
      return;
    }
    const firstLine = csvText.split(/\r?\n/)[0] || '';
    const guessedHeaders = firstLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    if (guessedHeaders.length) {
      setHeaders(guessedHeaders);
      setMapping(guessMapping(guessedHeaders));
    }
    setStepIndex(1);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Import customers"
        description="Upload a CSV, map columns, preview rows, then import."
        actions={
          <Button href="/dashboard/customers" variant="secondary" size="sm">
            Back to customers
          </Button>
        }
      />

      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, index) => {
          const done = index < stepIndex;
          const active = index === stepIndex;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                active
                  ? 'bg-[var(--dash-navy)] text-white'
                  : done
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-[var(--dash-surface-2)] text-[var(--dash-muted)]'
              }`}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : null}
              {index + 1}. {s.label}
            </li>
          );
        })}
      </ol>

      {step.id === 'upload' ? (
        <FormSection title="Upload CSV" description="Comma-separated values with a header row.">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--dash-border)] bg-[var(--dash-surface-2)]/40 px-6 py-10 text-center transition hover:border-[var(--dash-accent)]">
            <Upload className="size-8 text-[var(--dash-muted)]" aria-hidden />
            <span className="mt-3 text-sm font-medium text-[var(--dash-ink)]">
              {fileName || 'Choose a CSV file'}
            </span>
            <span className="mt-1 text-xs text-[var(--dash-muted)]">CSV only · read locally in your browser</span>
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
          </label>
          <div className="flex justify-end">
            <Button type="button" disabled={!csvText} onClick={goToMap}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </FormSection>
      ) : null}

      {step.id === 'map' ? (
        <FormSection
          title="Map fields"
          description="Match CSV columns to customer fields. First name is required."
        >
          <div className="space-y-3">
            {headers.map((header) => (
              <div
                key={header}
                className="grid gap-2 sm:grid-cols-2 sm:items-center"
              >
                <span className="truncate font-mono text-sm text-[var(--dash-ink-soft)]">
                  {header}
                </span>
                <select
                  value={mapping[header] || ''}
                  onChange={(event) =>
                    setMapping((prev) => ({ ...prev, [header]: event.target.value }))
                  }
                  className={DASH_SELECT_CLASS}
                >
                  {FIELD_OPTIONS.map((opt) => (
                    <option key={opt.key || 'skip'} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={() => setStepIndex(0)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="button" disabled={!mappingValid || busy} onClick={runPreview}>
              {busy ? 'Previewing…' : 'Preview import'}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </FormSection>
      ) : null}

      {step.id === 'preview' ? (
        <FormSection title="Preview" description="Review counts before importing.">
          {busy ? (
            <LoadingState rows={4} label="Generating preview…" />
          ) : preview ? (
            <>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="dash-panel p-3">
                  <dt className="text-xs text-[var(--dash-muted)]">Total rows</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">
                    {formatNumber(preview.totalRows, { fallback: '0' })}
                  </dd>
                </div>
                <div className="dash-panel p-3">
                  <dt className="text-xs text-[var(--dash-muted)]">Valid</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-emerald-700">
                    {formatNumber(preview.valid, { fallback: '0' })}
                  </dd>
                </div>
                <div className="dash-panel p-3">
                  <dt className="text-xs text-[var(--dash-muted)]">Duplicates</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-amber-700">
                    {formatNumber(preview.duplicates, { fallback: '0' })}
                  </dd>
                </div>
                <div className="dash-panel p-3">
                  <dt className="text-xs text-[var(--dash-muted)]">Invalid</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-rose-700">
                    {formatNumber(preview.invalid, { fallback: '0' })}
                  </dd>
                </div>
              </dl>

              <label className="mt-4 flex items-center gap-2 text-sm text-[var(--dash-ink-soft)]">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(event) => setSkipDuplicates(event.target.checked)}
                  className="size-4 rounded border-[var(--dash-border)]"
                />
                Skip duplicate rows (recommended)
              </label>

              <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-[var(--dash-border)]">
                <table className="min-w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[var(--dash-surface-2)]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Line</th>
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(preview.rows || []).slice(0, 50).map((row) => (
                      <tr key={row.line} className="border-t border-[var(--dash-border)]">
                        <td className="px-3 py-2 tabular-nums">{row.line}</td>
                        <td className="px-3 py-2">
                          {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="px-3 py-2 capitalize">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(preview.rows || []).length > 50 ? (
                <p className="mt-2 text-xs text-[var(--dash-muted)]">
                  Showing first 50 of {preview.previewCount} preview rows.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={() => setStepIndex(1)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="button" disabled={busy || !preview} onClick={runImport}>
              {busy ? 'Importing…' : 'Confirm import'}
            </Button>
          </div>
        </FormSection>
      ) : null}

      {step.id === 'import' && importResult ? (
        <FormSection title="Import complete">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="dash-panel p-4">
              <dt className="text-xs text-[var(--dash-muted)]">Created</dt>
              <dd className="mt-1 text-2xl font-semibold text-emerald-700">
                {formatNumber(importResult.createdCount, { fallback: '0' })}
              </dd>
            </div>
            <div className="dash-panel p-4">
              <dt className="text-xs text-[var(--dash-muted)]">Skipped</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {formatNumber(importResult.skippedCount, { fallback: '0' })}
              </dd>
            </div>
            <div className="dash-panel p-4">
              <dt className="text-xs text-[var(--dash-muted)]">Failed</dt>
              <dd className="mt-1 text-2xl font-semibold text-rose-700">
                {formatNumber(importResult.failedCount, { fallback: '0' })}
              </dd>
            </div>
          </dl>
          {importResult.truncated ? (
            <p className="mt-3 text-sm text-amber-800">
              Import was truncated at {importResult.maxRows} rows. Split larger files and import in
              batches.
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button href="/dashboard/customers">View customers</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStepIndex(0);
                setCsvText('');
                setFileName('');
                setPreview(null);
                setImportResult(null);
              }}
            >
              Import another file
            </Button>
          </div>
        </FormSection>
      ) : null}
    </PageContainer>
  );
}

export default function CustomerImportWizard() {
  return (
    <AuthGate permission={PERMISSIONS.CUSTOMERS_IMPORT}>
      <CustomerImportWizardInner />
    </AuthGate>
  );
}
