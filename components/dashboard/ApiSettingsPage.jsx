'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasAdminKey } from '../../lib/api/client';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { PERMISSIONS, createPermissionChecker } from '../../lib/permissions';
import { getCurrentUser } from '../../lib/currentUser';
import { formatDate } from '../../lib/format';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
  Sheet,
} from './ui';

function ApiSettingsInner() {
  const [keys, setKeys] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [secretOnce, setSecretOnce] = useState('');
  const [keyDrawer, setKeyDrawer] = useState(false);
  const [hookDrawer, setHookDrawer] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: '', scopes: [] });
  const [hookForm, setHookForm] = useState({
    name: '',
    endpointUrl: '',
    events: [],
  });
  const [busy, setBusy] = useState(false);

  const canManage = useMemo(
    () => createPermissionChecker(getCurrentUser()).can(PERMISSIONS.INTEGRATIONS_WRITE),
    [],
  );

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    const [keysRes, hooksRes] = await Promise.all([
      integrationsService.listApiKeys(),
      integrationsService.listOutboundWebhooks(),
    ]);
    if (!keysRes.ok) {
      setError(messageFromApiResult(keysRes, 'Unable to load API settings.'));
    } else {
      setKeys(keysRes.data.keys || []);
      setScopes(keysRes.data.scopes || []);
      setError('');
    }
    if (hooksRes.ok) {
      setWebhooks(hooksRes.data.webhooks || []);
      setEvents(hooksRes.data.events || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createKey(event) {
    event.preventDefault();
    setBusy(true);
    const result = await integrationsService.createApiKey(keyForm);
    setBusy(false);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to create API key.'));
      return;
    }
    setSecretOnce(result.data.secret);
    setNotice(result.data.warning);
    setKeyDrawer(false);
    setKeyForm({ name: '', scopes: [] });
    await reload();
  }

  async function revokeKey(id) {
    if (!window.confirm('Revoke this API key?')) return;
    const result = await integrationsService.revokeApiKey(id);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to revoke key.'));
      return;
    }
    setNotice('API key revoked.');
    await reload();
  }

  async function createHook(event) {
    event.preventDefault();
    setBusy(true);
    const result = await integrationsService.createOutboundWebhook(hookForm);
    setBusy(false);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to create webhook.'));
      return;
    }
    setSecretOnce(result.data.secret);
    setNotice(result.data.warning);
    setHookDrawer(false);
    setHookForm({ name: '', endpointUrl: '', events: [] });
    await reload();
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="API & webhooks" description="Developer access for this organization." />
        <LoadingState rows={5} label="Loading API settings…" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="API & webhooks"
        description="Versioned public API keys and outbound event delivery."
        actions={
          <Button href="/dashboard/settings/integrations" variant="secondary">
            Integrations
          </Button>
        }
      />
      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}
      {secretOnce ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Copy this secret now — it will not be shown again.</p>
          <code className="mt-2 block break-all rounded bg-white px-2 py-1 font-mono text-xs">
            {secretOnce}
          </code>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => setSecretOnce('')}>
            I saved it
          </Button>
        </div>
      ) : null}

      <SectionHeader
        title="API keys"
        description="Authenticate against /api/v1 with scoped keys. Raw secrets are never stored."
      />
      <div className="mb-3">
        <Button disabled={!canManage} onClick={() => setKeyDrawer(true)}>
          Create API key
        </Button>
      </div>
      {keys.length === 0 ? (
        <p className="text-sm text-[var(--dash-muted)]">No API keys yet.</p>
      ) : (
        <div className="dash-panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--dash-border)] text-xs uppercase text-[var(--dash-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Prefix</th>
                <th className="px-4 py-3 font-medium">Scopes</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-[var(--dash-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{key.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{key.keyPrefix}…</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {(key.scopes || []).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3">{key.revokedAt ? 'Revoked' : 'Active'}</td>
                  <td className="px-4 py-3">
                    {!key.revokedAt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!canManage}
                        onClick={() => revokeKey(key.id)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionHeader
        title="Outbound webhooks"
        description="KingProm signs deliveries with X-KingProm-Signature (HMAC-SHA256)."
      />
      <div className="mb-3">
        <Button disabled={!canManage} onClick={() => setHookDrawer(true)}>
          Add webhook endpoint
        </Button>
      </div>
      {webhooks.length === 0 ? (
        <p className="text-sm text-[var(--dash-muted)]">No outbound webhooks configured.</p>
      ) : (
        <div className="dash-panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--dash-border)] text-xs uppercase text-[var(--dash-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Events</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((hook) => (
                <tr key={hook.id} className="border-b border-[var(--dash-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{hook.name}</td>
                  <td className="px-4 py-3 break-all text-[var(--dash-muted)]">
                    {hook.endpointUrl}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {(hook.events || []).join(', ')}
                  </td>
                  <td className="px-4 py-3">{hook.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="dash-panel p-4 text-sm text-[var(--dash-muted)]">
        <p className="font-medium text-[var(--dash-ink)]">Documentation foundation</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Base URL: <code>/api/v1</code>
          </li>
          <li>
            Auth header: <code>Authorization: Bearer btp_…</code> or <code>x-api-key</code>
          </li>
          <li>
            Inbound provider webhooks:{' '}
            <code>/api/webhooks/integrations/&#123;organizationId&#125;/&#123;provider&#125;</code>
          </li>
          <li>
            Outbound signature header: <code>X-KingProm-Signature</code>
          </li>
          <li>OpenAPI / developer portal will expand in a later phase.</li>
        </ul>
      </div>

      <Sheet
        open={keyDrawer}
        onClose={() => !busy && setKeyDrawer(false)}
        title="Create API key"
        description="Choose scopes carefully. The secret is shown only once."
        busy={busy}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => setKeyDrawer(false)}>
              Cancel
            </Button>
            <Button form="api-key-form" type="submit" loading={busy}>
              Create key
            </Button>
          </div>
        }
      >
        <form id="api-key-form" className="space-y-4" onSubmit={createKey}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Name</span>
            <input
              required
              value={keyForm.name}
              onChange={(e) => setKeyForm((p) => ({ ...p, name: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-[var(--dash-muted)]">Scopes</legend>
            {scopes.map((scope) => (
              <label key={scope} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={keyForm.scopes.includes(scope)}
                  onChange={(e) => {
                    setKeyForm((p) => ({
                      ...p,
                      scopes: e.target.checked
                        ? [...p.scopes, scope]
                        : p.scopes.filter((s) => s !== scope),
                    }));
                  }}
                />
                {scope}
              </label>
            ))}
          </fieldset>
        </form>
      </Sheet>

      <Sheet
        open={hookDrawer}
        onClose={() => !busy && setHookDrawer(false)}
        title="Add outbound webhook"
        description="HTTPS endpoints only. Signing secret is shown once."
        busy={busy}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => setHookDrawer(false)}>
              Cancel
            </Button>
            <Button form="webhook-form" type="submit" loading={busy}>
              Create webhook
            </Button>
          </div>
        }
      >
        <form id="webhook-form" className="space-y-4" onSubmit={createHook}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Name</span>
            <input
              required
              value={hookForm.name}
              onChange={(e) => setHookForm((p) => ({ ...p, name: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              HTTPS endpoint
            </span>
            <input
              required
              type="url"
              placeholder="https://"
              value={hookForm.endpointUrl}
              onChange={(e) => setHookForm((p) => ({ ...p, endpointUrl: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-[var(--dash-muted)]">Events</legend>
            {events.map((eventName) => (
              <label key={eventName} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hookForm.events.includes(eventName)}
                  onChange={(e) => {
                    setHookForm((p) => ({
                      ...p,
                      events: e.target.checked
                        ? [...p.events, eventName]
                        : p.events.filter((x) => x !== eventName),
                    }));
                  }}
                />
                {eventName}
              </label>
            ))}
          </fieldset>
        </form>
      </Sheet>
    </PageContainer>
  );
}

export default function ApiSettingsPage() {
  return (
    <AuthGate permission={PERMISSIONS.INTEGRATIONS_WRITE}>
      <ApiSettingsInner />
    </AuthGate>
  );
}
