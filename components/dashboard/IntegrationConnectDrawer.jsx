'use client';

import { useMemo, useState } from 'react';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { Sheet, Button } from './ui';

export default function IntegrationConnectDrawer({
  provider,
  open,
  onClose,
  onConnected,
}) {
  const fields = provider?.fields || [];
  const [values, setValues] = useState({});
  const [syncDirection, setSyncDirection] = useState('import');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(
    () => (provider ? `Connect ${provider.name}` : 'Connect integration'),
    [provider],
  );

  async function handleConnect(event) {
    event.preventDefault();
    if (!provider) return;
    setBusy(true);
    setError('');

    const secrets = {};
    const config = {};
    for (const field of fields) {
      const value = String(values[field.key] || '').trim();
      if (field.required && !value) {
        setBusy(false);
        setError(`${field.label} is required.`);
        return;
      }
      if (field.type === 'password' || /key|token|secret/i.test(field.key)) {
        secrets[field.key] = value;
      } else {
        config[field.key] = value;
      }
    }

    const result = await integrationsService.connectIntegration({
      providerId: provider.id,
      config,
      secrets,
      syncDirection,
      setDefault: provider.category === 'communication',
    });
    setBusy(false);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to connect.'));
      return;
    }
    setValues({});
    onConnected?.(result.data?.message);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        if (!busy) {
          setError('');
          onClose?.();
        }
      }}
      title={title}
      description={provider?.description}
      busy={busy}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="integration-connect-form"
            type="submit"
            loading={busy}
            disabled={busy || provider?.status === 'architecture'}
          >
            Connect
          </Button>
        </div>
      }
    >
      {!provider ? null : (
        <form id="integration-connect-form" className="space-y-4" onSubmit={handleConnect}>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="rounded-lg bg-[var(--dash-surface-2)] px-3 py-2 text-sm text-[var(--dash-muted)]">
            <p className="font-medium text-[var(--dash-ink)]">Required permissions</p>
            <p className="mt-1">
              Auth: {provider.authType.replace('_', ' ')}. Credentials are encrypted and never
              returned to the browser after connect.
            </p>
            {provider.docsUrl ? (
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-medium underline"
              >
                Provider documentation
              </a>
            ) : null}
          </div>

          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                {field.label}
                {field.required ? ' *' : ''}
              </span>
              <input
                type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : 'text'}
                required={field.required}
                autoComplete="off"
                value={values[field.key] || ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
              />
            </label>
          ))}

          {(provider.capabilities || []).some((c) => c.startsWith('crm') || c.includes('sync')) ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Sync direction
              </span>
              <select
                value={syncDirection}
                onChange={(e) => setSyncDirection(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
              >
                <option value="import">Import only</option>
                <option value="export">Export only</option>
                <option value="two_way">Two-way sync</option>
              </select>
            </label>
          ) : null}

          {provider.authType === 'webhook' ? (
            <p className="text-xs text-[var(--dash-muted)]">
              After connecting, send signed events to{' '}
              <code className="rounded bg-[var(--dash-surface-2)] px-1">
                /api/webhooks/integrations/&#123;orgId&#125;/{provider.id}
              </code>{' '}
              with header <code>X-KingProm-Signature</code>.
            </p>
          ) : null}
        </form>
      )}
    </Sheet>
  );
}
