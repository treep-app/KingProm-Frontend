'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plug, Workflow, KeyRound } from 'lucide-react';
import { hasAdminKey } from '../../lib/api/client';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { PERMISSIONS, createPermissionChecker } from '../../lib/permissions';
import { getCurrentUser } from '../../lib/currentUser';
import { invalidateTags } from '../../lib/api/queryCache';
import { CACHE_TAGS } from '../../lib/api/cacheTags';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import IntegrationConnectDrawer from './IntegrationConnectDrawer';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
} from './ui';

const STATUS_LABELS = {
  connected: 'Connected',
  disconnected: 'Not connected',
  error: 'Error',
  expired: 'Expired',
  reauth_required: 'Reauthorization required',
  needs_attention: 'Needs attention',
};

function statusTone(status) {
  if (status === 'connected') return 'text-emerald-700 bg-emerald-50';
  if (status === 'error' || status === 'expired' || status === 'reauth_required') {
    return 'text-amber-800 bg-amber-50';
  }
  return 'text-[var(--dash-muted)] bg-[var(--dash-surface-2)]';
}

function IntegrationsInner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [busyId, setBusyId] = useState('');

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
    const result = await integrationsService.getMarketplace();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load integrations.'));
      setData(null);
    } else {
      setData(result.data);
      setError('');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleDisconnect(connectionId) {
    if (!canManage) return;
    if (!window.confirm('Disconnect this integration? Stored secrets will be removed.')) return;
    setBusyId(connectionId);
    const result = await integrationsService.disconnectIntegration(connectionId);
    setBusyId('');
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to disconnect.'));
      return;
    }
    invalidateTags([CACHE_TAGS.INTEGRATIONS]);
    setNotice('Integration disconnected.');
    await reload();
  }

  async function handleTest(connectionId) {
    if (!canManage) return;
    setBusyId(`test-${connectionId}`);
    const result = await integrationsService.testIntegration(connectionId);
    setBusyId('');
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Connection test failed.'));
      await reload();
      return;
    }
    setNotice(result.data?.message || 'Connection successful.');
    await reload();
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Integrations" description="Connect business systems to KingProm." />
        <LoadingState rows={6} label="Loading integrations…" />
      </PageContainer>
    );
  }

  const categories = data?.categories || [];
  const providers = data?.providers || [];
  const connectedCount = data?.connectedCount || 0;

  return (
    <PageContainer>
      <PageHeader
        title="Integrations"
        description="Connect your existing business tools to automate vouchers, campaigns, and customer engagement."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/automations" variant="secondary">
              <Workflow className="mr-1.5 h-4 w-4" />
              Automations
            </Button>
            <Button href="/dashboard/settings/api" variant="secondary">
              <KeyRound className="mr-1.5 h-4 w-4" />
              API & webhooks
            </Button>
            <Button href="/dashboard/settings/integrations/logs" variant="secondary">
              Event logs
            </Button>
          </div>
        }
      />

      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {connectedCount === 0 ? (
        <div className="dash-panel px-5 py-6">
          <div className="flex items-start gap-3">
            <Plug className="mt-0.5 h-5 w-5 text-[var(--dash-muted)]" />
            <div>
              <p className="font-medium text-[var(--dash-ink)]">No integrations connected yet.</p>
              <p className="mt-1 text-sm text-[var(--dash-muted)]">
                Connect your existing business tools to automate vouchers, campaigns, and customer
                engagement. KingProm works fully without integrations.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {categories.map((category) => {
        const items = providers.filter((p) => p.category === category.id);
        if (!items.length) return null;
        return (
          <section key={category.id} className="space-y-3">
            <SectionHeader title={category.label} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((provider) => {
                const status = provider.connection?.status || 'disconnected';
                const architectureOnly = provider.status === 'architecture';
                return (
                  <article key={provider.id} className="dash-panel flex flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--dash-ink)]">
                          {provider.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--dash-muted)]">
                          {category.label}
                        </p>
                      </div>
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-medium ${statusTone(status)}`}
                      >
                        {STATUS_LABELS[status] || status}
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-sm text-[var(--dash-muted)]">
                      {provider.description}
                    </p>
                    {architectureOnly ? (
                      <p className="mt-2 text-xs text-amber-800">
                        Architecture ready — live connection requires provider credentials.
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {provider.connection?.status === 'connected' ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!canManage || Boolean(busyId)}
                            loading={busyId === `test-${provider.connection.id}`}
                            onClick={() => handleTest(provider.connection.id)}
                          >
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!canManage || Boolean(busyId)}
                            loading={busyId === provider.connection.id}
                            onClick={() => handleDisconnect(provider.connection.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!canManage || architectureOnly}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-sm text-[var(--dash-muted)]">
        Manage billing feature access for integrations in{' '}
        <Link href="/dashboard/settings/billing" className="font-medium underline">
          Billing
        </Link>
        . Professional and Enterprise plans include integrations.
      </p>

      <IntegrationConnectDrawer
        provider={selectedProvider}
        open={Boolean(selectedProvider)}
        onClose={() => setSelectedProvider(null)}
        onConnected={async (message) => {
          setSelectedProvider(null);
          setNotice(message || 'Integration connected.');
          invalidateTags([CACHE_TAGS.INTEGRATIONS]);
          await reload();
        }}
      />
    </PageContainer>
  );
}

export default function IntegrationsPage() {
  return (
    <AuthGate permission={PERMISSIONS.INTEGRATIONS_READ}>
      <IntegrationsInner />
    </AuthGate>
  );
}
